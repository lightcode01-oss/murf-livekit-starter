import logging
from typing import Any, Optional

from .database import Database

logger = logging.getLogger("agent.memory.service")


class MemoryService:
    """Service layer exposing memory operations for Jana Seva callers."""

    def __init__(self, db: Optional[Database] = None) -> None:
        self.db = db or Database()

    def lookup_caller(self, user_id: str) -> dict[str, Any]:
        """Look up caller profile by user_id."""
        if not user_id:
            logger.warning("[MEMORY] lookup_caller called with empty user_id")
            return {"found": False}

        try:
            record = self.db.get_user(user_id)
            if record:
                return {
                    "found": True,
                    "user_id": record["user_id"],
                    "name": record["name"],
                    "language_preference": record["language_preference"],
                    "facts": record["facts"],
                    "last_interaction": record["last_interaction"],
                }
            return {"found": False}
        except Exception as e:
            logger.error(f"[MEMORY] Service lookup_caller error for {user_id}: {e}")
            return {"found": False}

    def save_caller_memory(
        self,
        user_id: str,
        name: str = "",
        language_preference: str = "",
        facts: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """Save caller-approved information to memory."""
        if not user_id:
            logger.warning("[MEMORY] save_caller_memory called with empty user_id")
            return {"success": False, "message": "No valid user_id provided."}

        try:
            success = self.db.upsert_user(
                user_id=user_id,
                name=name,
                language_preference=language_preference,
                facts=facts,
            )
            if success:
                logger.info(
                    f"[MEMORY] Save permission granted & memory saved for {user_id}"
                )
                return {
                    "success": True,
                    "message": f"Caller memory saved for user {user_id}.",
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to update database record.",
                }
        except Exception as e:
            logger.error(
                f"[MEMORY] Service save_caller_memory error for {user_id}: {e}"
            )
            return {
                "success": False,
                "message": "Memory service error during save operation.",
            }

    def opt_out_caller(
        self, user_id: str, reason: str = "Caller requested opt-out"
    ) -> dict[str, Any]:
        """Record caller opt-out preference in persistent memory so future outbound calls are prevented."""
        if not user_id:
            logger.warning("[MEMORY] opt_out_caller called with empty user_id")
            return {"success": False, "message": "No valid user_id provided."}

        logger.info(f"[MEMORY] Opt-out requested for caller {user_id}: '{reason}'")
        facts = {"opted_out": True, "opt_out_reason": reason}
        return self.save_caller_memory(user_id=user_id, facts=facts)

    def create_escalation(
        self,
        reference_id: str,
        reason: str,
        urgency: str,
        user_name: str,
        summary: str,
        agent_checked: str,
        language: str,
        preferred_followup: str,
        permission_confirmed: bool = True,
        status: str = "open",
    ) -> Optional[dict[str, Any]]:
        """Create a human support escalation record."""
        return self.db.create_escalation(
            reference_id=reference_id,
            reason=reason,
            urgency=urgency,
            user_name=user_name,
            summary=summary,
            agent_checked=agent_checked,
            language=language,
            preferred_followup=preferred_followup,
            permission_confirmed=permission_confirmed,
            status=status,
        )

    def get_escalations(
        self,
        urgency: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        """Fetch escalation records."""
        return self.db.get_escalations(urgency=urgency, status=status, search=search)

    def get_escalation_by_ref(self, reference_id: str) -> Optional[dict[str, Any]]:
        """Fetch single escalation by reference_id."""
        return self.db.get_escalation_by_ref(reference_id)

    def update_escalation_status(self, reference_id: str, status: str) -> bool:
        """Update status of an escalation."""
        return self.db.update_escalation_status(reference_id, status)

    def seed_demo_escalations(self) -> list[dict[str, Any]]:
        """Seed sample escalation records for Day 7 demonstration."""
        return self.db.seed_demo_escalations()
