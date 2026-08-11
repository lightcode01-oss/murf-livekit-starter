"""Automated test suite for Day 6 Outbound Calling non-telephony logic."""

import json

import pytest

from agent import Assistant
from memory.service import MemoryService
from outbound_service import (
    OUTCOME_ANSWERED,
    OUTCOME_BUSY,
    OUTCOME_FAILED,
    OUTCOME_HANGUP,
    OUTCOME_NO_ANSWER,
    OUTCOME_NO_REMINDER,
    OUTCOME_OPTED_OUT,
    OUTCOME_VOICEMAIL,
    OutboundCallService,
    mask_phone_number,
)


def test_mask_phone_number() -> None:
    """Test privacy masking of phone numbers in public logs."""
    assert mask_phone_number("+919876543210") == "+91XXXXXX3210"
    assert mask_phone_number("+14155552671") == "+14XXXX4671" or mask_phone_number(
        "+14155552671"
    ).startswith("+14X")
    assert mask_phone_number("123") == "***"


def test_outbound_config_validation_missing() -> None:
    """Test configuration validation when Twilio credentials are missing."""
    service = OutboundCallService(account_sid="", auth_token="", twilio_phone="")
    is_valid, err = service.validate_config()

    assert is_valid is False
    assert "TWILIO_ACCOUNT_SID" in err


def test_outbound_config_validation_placeholder() -> None:
    """Test configuration validation when credentials contain placeholders."""
    service = OutboundCallService(
        account_sid="AC_YOUR_TWILIO_ACCOUNT_SID",
        auth_token="YOUR_TWILIO_AUTH_TOKEN",
        twilio_phone="+15005550006",
    )
    is_valid, err = service.validate_config()

    assert is_valid is False
    assert "unconfigured" in err


def test_invalid_destination_number() -> None:
    """Test invalid destination phone number validation."""
    service = OutboundCallService(
        account_sid="AC_TEST_ACCOUNT_SID_00000",
        auth_token="secret_auth_token_123456",
        twilio_phone="+15005550006",
    )

    is_valid1, err1 = service.validate_destination_number("12345")
    assert is_valid1 is False
    assert "E.164 format" in err1

    is_valid2, _err2 = service.validate_destination_number("invalid-phone")
    assert is_valid2 is False

    is_valid3, _err3 = service.validate_destination_number("+919876543210")
    assert is_valid3 is True


def test_reminder_data_missing_handling(tmp_path) -> None:
    """Test that caller with missing reminder data refuses outbound call to prevent inventing facts."""
    db_file = tmp_path / "test_no_reminder.db"
    mem_service = MemoryService()
    mem_service.db.db_path = db_file
    mem_service.db._init_db()

    # Save caller without reminder
    mem_service.save_caller_memory(
        user_id="user_without_reminder",
        name="Sunita",
        language_preference="English",
        facts={"district": "Patna"},
    )

    outbound_service = OutboundCallService(
        memory_service=mem_service,
        account_sid="AC_TEST_ACCOUNT_SID_00000",
        auth_token="secret_auth_token_123456",
        twilio_phone="+15005550006",
    )

    res = outbound_service.initiate_outbound_call(
        phone_number="+919876543210", user_id="user_without_reminder"
    )

    assert res["success"] is False
    assert res["status"] == OUTCOME_NO_REMINDER
    assert "No active health reminder" in res["error"]


def test_opt_out_handling(tmp_path) -> None:
    """Test caller opt-out registration in persistent memory."""
    db_file = tmp_path / "test_optout.db"
    mem_service = MemoryService()
    mem_service.db.db_path = db_file
    mem_service.db._init_db()

    # Save initial caller profile
    mem_service.save_caller_memory(
        user_id="user_optout",
        name="Ramesh",
        language_preference="Hindi",
        facts={"reminders": "Vaccination follow-up"},
    )

    # Opt out caller
    opt_res = mem_service.opt_out_caller(
        user_id="user_optout", reason="Don't call me again"
    )
    assert opt_res["success"] is True

    # Check caller eligibility
    outbound_service = OutboundCallService(
        memory_service=mem_service,
        account_sid="AC_TEST_ACCOUNT_SID_00000",
        auth_token="secret_auth_token_123456",
        twilio_phone="+15005550006",
    )

    res = outbound_service.initiate_outbound_call(
        phone_number="+919876543210", user_id="user_optout"
    )

    assert res["success"] is False
    assert res["status"] == OUTCOME_OPTED_OUT
    assert "opted out" in res["error"]


@pytest.mark.asyncio
async def test_opt_out_tool_execution() -> None:
    """Test execution of opt_out_caller function tool on Assistant agent."""
    assistant = Assistant(caller_id="test_optout_agent_caller")
    tool_res_str = await assistant.opt_out_caller(
        context=None, reason="Stop sending reminders"
    )
    tool_res = json.loads(tool_res_str)

    assert tool_res["success"] is True


def test_retry_limit_enforcement(tmp_path) -> None:
    """Test conservative retry limit enforcement (max 1 retry)."""
    db_file = tmp_path / "test_retry.db"
    mem_service = MemoryService()
    mem_service.db.db_path = db_file
    mem_service.db._init_db()

    mem_service.save_caller_memory(
        user_id="retry_user",
        name="Test User",
        facts={"reminders": "PMMVY checkup follow-up"},
    )

    outbound_service = OutboundCallService(
        memory_service=mem_service,
        account_sid="AC_TEST_ACCOUNT_SID_00000",
        auth_token="secret_auth_token_123456",
        twilio_phone="+15005550006",
    )

    # Set retry count to max
    outbound_service.retry_counts["retry_user"] = 2

    res = outbound_service.initiate_outbound_call(
        phone_number="+919876543210", user_id="retry_user"
    )

    assert res["success"] is False
    assert res["status"] == OUTCOME_FAILED
    assert "Maximum automatic retries limit reached" in res["error"]


def test_call_outcomes_classification() -> None:
    """Verify call outcome classification constants."""
    assert OUTCOME_ANSWERED == "ANSWERED"
    assert OUTCOME_NO_ANSWER == "NO_ANSWER"
    assert OUTCOME_BUSY == "BUSY"
    assert OUTCOME_VOICEMAIL == "VOICEMAIL"
    assert OUTCOME_HANGUP == "HANGUP"
    assert OUTCOME_FAILED == "FAILED"
