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
