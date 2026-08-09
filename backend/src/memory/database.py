import json
import logging
import sqlite3
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger("agent.memory.database")


class Database:
    """SQLite database manager for Jana Seva caller memory."""

    def __init__(self, db_path: Optional[str | Path] = None) -> None:
        if db_path is None:
            # Default to backend/data/jana_seva.db
            base_dir = Path(__file__).resolve().parent.parent.parent
            data_dir = base_dir / "data"
            data_dir.mkdir(parents=True, exist_ok=True)
            self.db_path = data_dir / "jana_seva.db"
        else:
            self.db_path = Path(db_path)
            self.db_path.parent.mkdir(parents=True, exist_ok=True)

        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        """Create users table if it does not exist."""
        try:
            with closing(self._get_connection()) as conn, conn:
                conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS users (
                        user_id TEXT PRIMARY KEY,
                        name TEXT,
                        language_preference TEXT,
                        facts_json TEXT,
                        last_interaction TEXT,
                        created_at TEXT,
                        updated_at TEXT
                    )
                    """
                )
            logger.info(f"[MEMORY] SQLite database initialized at {self.db_path}")
        except Exception as e:
            logger.error(f"[MEMORY] Error initializing database schema: {e}")

    def get_user(self, user_id: str) -> Optional[dict[str, Any]]:
        """Retrieve user record by user_id."""
        logger.info(f"[MEMORY] Looking up caller: {user_id}")
        try:
            with closing(self._get_connection()) as conn:
                cursor = conn.execute(
                    "SELECT user_id, name, language_preference, facts_json, last_interaction, created_at, updated_at FROM users WHERE user_id = ?",
                    (user_id,),
                )
                row = cursor.fetchone()
                if row:
                    logger.info(f"[MEMORY] Existing caller found: {user_id}")
                    facts = {}
                    if row["facts_json"]:
                        try:
                            facts = json.loads(row["facts_json"])
                        except json.JSONDecodeError:
                            logger.warning(
                                f"[MEMORY] Failed to parse facts_json for user {user_id}"
                            )
                    return {
                        "user_id": row["user_id"],
                        "name": row["name"] or "",
                        "language_preference": row["language_preference"] or "",
                        "facts": facts,
                        "last_interaction": row["last_interaction"] or "",
                        "created_at": row["created_at"] or "",
                        "updated_at": row["updated_at"] or "",
                    }
                else:
                    logger.info(f"[MEMORY] New caller: {user_id}")
                    return None
        except Exception as e:
            logger.error(f"[MEMORY] Database lookup failed for user {user_id}: {e}")
            return None

    def upsert_user(
        self,
        user_id: str,
        name: Optional[str] = None,
        language_preference: Optional[str] = None,
        facts: Optional[dict[str, Any]] = None,
    ) -> bool:
        """Insert or update user record while preserving existing unedited fields/facts."""
        try:
            now_iso = datetime.now(timezone.utc).isoformat()
            existing = self.get_user(user_id)

            if existing:
                # Merge fields
                final_name = (
                    name
                    if (name is not None and name != "")
                    else existing.get("name", "")
                )
                final_lang = (
                    language_preference
                    if (language_preference is not None and language_preference != "")
                    else existing.get("language_preference", "")
                )

                # Merge facts dict
                existing_facts = existing.get("facts", {})
                merged_facts = {**existing_facts, **facts} if facts else existing_facts
                facts_json = json.dumps(merged_facts)

                with closing(self._get_connection()) as conn, conn:
                    conn.execute(
                        """
                        UPDATE users
                        SET name = ?, language_preference = ?, facts_json = ?, last_interaction = ?, updated_at = ?
                        WHERE user_id = ?
                        """,
                        (
                            final_name,
                            final_lang,
                            facts_json,
                            now_iso,
                            now_iso,
                            user_id,
                        ),
                    )
                logger.info(f"[MEMORY] Caller memory updated: {user_id}")
            else:
                # New user insertion
                final_name = name or ""
                final_lang = language_preference or ""
                final_facts = facts or {}
                facts_json = json.dumps(final_facts)

                with closing(self._get_connection()) as conn, conn:
                    conn.execute(
                        """
                        INSERT INTO users (user_id, name, language_preference, facts_json, last_interaction, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            user_id,
                            final_name,
                            final_lang,
                            facts_json,
                            now_iso,
                            now_iso,
                            now_iso,
                        ),
                    )
                logger.info(f"[MEMORY] Caller memory saved: {user_id}")
            return True
        except Exception as e:
            logger.error(f"[MEMORY] Database save failed for user {user_id}: {e}")
            return False
