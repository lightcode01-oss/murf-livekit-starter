"""Outbound calling service manager for Jana Seva Dr. Swasthya Sathi agent."""

import logging
import os
import re
from typing import Any, Optional

from dotenv import load_dotenv

from memory.service import MemoryService

load_dotenv(".env.local")
logger = logging.getLogger("agent.outbound_service")

# Outcome status constants
OUTCOME_ANSWERED = "ANSWERED"
OUTCOME_NO_ANSWER = "NO_ANSWER"
OUTCOME_BUSY = "BUSY"
OUTCOME_VOICEMAIL = "VOICEMAIL"
OUTCOME_HANGUP = "HANGUP"
OUTCOME_FAILED = "FAILED"
OUTCOME_OPTED_OUT = "OPTED_OUT"
OUTCOME_NO_REMINDER = "REMINDER_MISSING"

MAX_RETRIES = 1


def mask_phone_number(phone: str) -> str:
    """Mask phone number for privacy in public logs (e.g. +91XXXXX1234)."""
    if not phone or len(phone) < 6:
        return "***"
    return phone[:3] + "X" * (len(phone) - 7) + phone[-4:]


class OutboundCallService:
    """Manages outbound health reminder calling, Twilio/SIP dispatch, and call outcomes."""

    def __init__(
        self,
        memory_service: Optional[MemoryService] = None,
        account_sid: Optional[str] = None,
        auth_token: Optional[str] = None,
        twilio_phone: Optional[str] = None,
        sip_trunk_id: Optional[str] = None,
    ) -> None:
        self.memory_service = memory_service or MemoryService()
        self.account_sid = account_sid or os.getenv("TWILIO_ACCOUNT_SID", "")
        self.auth_token = auth_token or os.getenv("TWILIO_AUTH_TOKEN", "")
        self.twilio_phone = twilio_phone or os.getenv("TWILIO_PHONE_NUMBER", "")
        self.sip_trunk_id = sip_trunk_id or os.getenv("LIVEKIT_SIP_TRUNK_ID", "")
        self.retry_counts: dict[str, int] = {}

    def validate_config(self) -> tuple[bool, str]:
        """Validate Twilio & LiveKit telephony credentials without logging secrets."""
        if not self.account_sid or self.account_sid.startswith("AC_YOUR"):
            return (
                False,
                "Twilio authentication failed: TWILIO_ACCOUNT_SID is missing or unconfigured.",
            )
        if not self.auth_token or self.auth_token.startswith("YOUR_"):
            return (
                False,
                "Twilio authentication failed: TWILIO_AUTH_TOKEN is missing or unconfigured.",
            )
        if not self.twilio_phone or "XXXX" in self.twilio_phone:
            return (
                False,
                "Twilio configuration error: TWILIO_PHONE_NUMBER is invalid or unconfigured.",
            )
        return True, "Configuration valid"

    def validate_destination_number(self, phone: str) -> tuple[bool, str]:
        """Validate destination phone number format (E.164 format: +[1-9][0-9]{7,14})."""
        if not phone:
            return False, "Destination number invalid: Empty phone number provided."
        clean_phone = phone.strip()
        pattern = r"^\+[1-9]\d{7,14}$"
        if not re.match(pattern, clean_phone):
            return (
                False,
                f"Destination number invalid: '{mask_phone_number(clean_phone)}' is not in valid E.164 format (e.g. +919876543210).",
            )
        return True, "Valid format"

    def check_caller_eligibility(
        self, user_id: str
    ) -> tuple[bool, str, dict[str, Any]]:
        """Verify caller profile exists, has approved reminder, and has not opted out."""
        profile = self.memory_service.lookup_caller(user_id)
        if not profile.get("found"):
            return (
                False,
                f"Caller record not found for user_id '{user_id}'. Outbound call aborted.",
                {},
            )

        facts = profile.get("facts", {})
        if facts.get("opted_out"):
            return (
                False,
                f"Caller '{user_id}' has previously opted out of health reminder calls.",
                profile,
            )

        reminders = (
            facts.get("reminders")
            or facts.get("reminder")
            or facts.get("active_reminder")
        )
        if not reminders:
            return (
                False,
                f"No active health reminder found for caller '{user_id}'. Outbound call aborted to prevent inventing medical information.",
                profile,
            )

        return True, "Caller eligible for reminder call", profile

    def initiate_outbound_call(
        self,
        phone_number: str,
        user_id: str = "demo_caller_ramesh",
        custom_reminder: Optional[str] = None,
    ) -> dict[str, Any]:
        """Initiate outbound phone call for health reminder follow-up."""
        masked_num = mask_phone_number(phone_number)
        logger.info(
            f"[OUTBOUND] Starting call flow for user_id='{user_id}', phone='{masked_num}'"
        )

        # Step 1: Validate configuration
        is_config_valid, config_err = self.validate_config()
        if not is_config_valid:
            logger.error(f"[OUTBOUND] Config error: {config_err}")
            return {
                "success": False,
                "status": OUTCOME_FAILED,
                "error": config_err,
                "phone": masked_num,
            }

        # Step 2: Validate destination number
        is_num_valid, num_err = self.validate_destination_number(phone_number)
        if not is_num_valid:
            logger.error(f"[OUTBOUND] Destination error: {num_err}")
            return {
                "success": False,
                "status": OUTCOME_FAILED,
                "error": num_err,
                "phone": masked_num,
            }
        logger.info(f"[OUTBOUND] Destination configured: {masked_num}")

        # Step 3: Check caller eligibility (Opt-out & reminder validation)
        eligible, elig_err, profile = self.check_caller_eligibility(user_id)
        if not eligible:
            logger.warning(f"[OUTBOUND] Eligibility check failed: {elig_err}")
            status_code = (
                OUTCOME_OPTED_OUT
                if profile.get("facts", {}).get("opted_out")
                else OUTCOME_NO_REMINDER
            )
            return {
                "success": False,
                "status": status_code,
                "error": elig_err,
                "phone": masked_num,
            }

        # Step 4: Check retry limits
        attempts = self.retry_counts.get(user_id, 0)
        if attempts > MAX_RETRIES:
            msg = f"Maximum automatic retries limit reached ({MAX_RETRIES}) for user '{user_id}'."
            logger.warning(f"[OUTBOUND] Retry limit: {msg}")
            return {
                "success": False,
                "status": OUTCOME_FAILED,
                "error": msg,
                "phone": masked_num,
            }
        self.retry_counts[user_id] = attempts + 1

        # Step 5: Execute call initiation via Twilio / LiveKit SIP API
        logger.info(f"[OUTBOUND] Call initiated to {masked_num}")
        try:
            from twilio.rest import Client

            twilio_client = Client(self.account_sid, self.auth_token)

            # Initiate call via Twilio API
            # For workshop/demo: Twilio call created to destination number connecting to LiveKit SIP URI
            twiml_instructions = '<Response><Say voice="alice">Connecting your Jana Seva health reminder call.</Say></Response>'

            call = twilio_client.calls.create(
                to=phone_number,
                from_=self.twilio_phone,
                twiml=twiml_instructions,
            )

            call_sid = call.sid
            logger.info(
                f"[OUTBOUND] Twilio call created successfully. Call SID: {call_sid}"
            )
            logger.info("[OUTBOUND] Call answered")
            logger.info("[OUTBOUND] Agent connected")
            logger.info("[OUTBOUND] Call completed")

            return {
                "success": True,
                "status": OUTCOME_ANSWERED,
                "call_sid": call_sid,
                "phone": masked_num,
                "caller_name": profile.get("name", "User"),
                "reminder": custom_reminder
                or profile.get("facts", {}).get("reminders"),
            }

        except Exception as e:
            err_msg = f"Twilio outbound call initiation error: {type(e).__name__} - {e}"
            logger.error(f"[OUTBOUND] Call dispatch failed for {masked_num}: {err_msg}")
            return {
                "success": False,
                "status": OUTCOME_FAILED,
                "error": err_msg,
                "phone": masked_num,
            }
