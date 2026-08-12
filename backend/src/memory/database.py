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
                conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS escalations (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        reference_id TEXT UNIQUE NOT NULL,
                        reason TEXT NOT NULL,
                        urgency TEXT NOT NULL,
                        user_name TEXT,
                        summary TEXT NOT NULL,
                        agent_checked TEXT NOT NULL,
                        language TEXT NOT NULL,
                        preferred_followup TEXT NOT NULL,
                        permission_confirmed INTEGER NOT NULL DEFAULT 1,
                        status TEXT NOT NULL DEFAULT 'open',
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL
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
        """Insert a new escalation record into the database."""
        now_iso = datetime.now(timezone.utc).isoformat()
        perm_int = 1 if permission_confirmed else 0
        try:
            with closing(self._get_connection()) as conn, conn:
                cursor = conn.execute(
                    """
                    INSERT INTO escalations (
                        reference_id, reason, urgency, user_name, summary, agent_checked,
                        language, preferred_followup, permission_confirmed, status, created_at, updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        reference_id,
                        reason,
                        urgency.lower(),
                        user_name or "Caller",
                        summary,
                        agent_checked,
                        language or "English",
                        preferred_followup or "Phone",
                        perm_int,
                        status.lower(),
                        now_iso,
                        now_iso,
                    ),
                )
                rec_id = cursor.lastrowid
            logger.info(
                f"[ESCALATION] Created escalation {reference_id} (ID: {rec_id})"
            )
            return self.get_escalation_by_ref(reference_id)
        except Exception as e:
            logger.error(f"[ESCALATION] Error creating escalation {reference_id}: {e}")
            return None

    def get_escalations(
        self,
        urgency: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        """Fetch list of escalations matching filters."""
        query = "SELECT * FROM escalations WHERE 1=1"
        params: list[Any] = []

        if urgency and urgency.lower() != "all":
            query += " AND LOWER(urgency) = ?"
            params.append(urgency.lower())

        if status and status.lower() != "all":
            query += " AND LOWER(status) = ?"
            params.append(status.lower())

        if search:
            query += " AND (reference_id LIKE ? OR user_name LIKE ? OR summary LIKE ? OR reason LIKE ?)"
            s_param = f"%{search}%"
            params.extend([s_param, s_param, s_param, s_param])

        query += " ORDER BY id DESC"

        try:
            with closing(self._get_connection()) as conn:
                cursor = conn.execute(query, params)
                rows = cursor.fetchall()
                results = []
                for row in rows:
                    results.append(
                        {
                            "id": row["id"],
                            "reference_id": row["reference_id"],
                            "reason": row["reason"],
                            "urgency": row["urgency"],
                            "user_name": row["user_name"],
                            "summary": row["summary"],
                            "agent_checked": row["agent_checked"],
                            "language": row["language"],
                            "preferred_followup": row["preferred_followup"],
                            "permission_confirmed": bool(row["permission_confirmed"]),
                            "status": row["status"],
                            "created_at": row["created_at"],
                            "updated_at": row["updated_at"],
                        }
                    )
                return results
        except Exception as e:
            logger.error(f"[ESCALATION] Error fetching escalations: {e}")
            return []

    def get_escalation_by_ref(self, reference_id: str) -> Optional[dict[str, Any]]:
        """Fetch single escalation by reference_id."""
        try:
            with closing(self._get_connection()) as conn:
                cursor = conn.execute(
                    "SELECT * FROM escalations WHERE reference_id = ?", (reference_id,)
                )
                row = cursor.fetchone()
                if row:
                    return {
                        "id": row["id"],
                        "reference_id": row["reference_id"],
                        "reason": row["reason"],
                        "urgency": row["urgency"],
                        "user_name": row["user_name"],
                        "summary": row["summary"],
                        "agent_checked": row["agent_checked"],
                        "language": row["language"],
                        "preferred_followup": row["preferred_followup"],
                        "permission_confirmed": bool(row["permission_confirmed"]),
                        "status": row["status"],
                        "created_at": row["created_at"],
                        "updated_at": row["updated_at"],
                    }
                return None
        except Exception as e:
            logger.error(f"[ESCALATION] Error fetching escalation {reference_id}: {e}")
            return None

    def update_escalation_status(self, reference_id: str, status: str) -> bool:
        """Update the status of an escalation record."""
        valid_statuses = ["open", "in_progress", "resolved"]
        st = status.lower()
        if st not in valid_statuses:
            logger.warning(f"[ESCALATION] Invalid status update: {status}")
            return False

        now_iso = datetime.now(timezone.utc).isoformat()
        try:
            with closing(self._get_connection()) as conn, conn:
                cursor = conn.execute(
                    "UPDATE escalations SET status = ?, updated_at = ? WHERE reference_id = ?",
                    (st, now_iso, reference_id),
                )
                if cursor.rowcount > 0:
                    logger.info(
                        f"[ESCALATION] Updated status of {reference_id} to '{st}'"
                    )
                    return True
                return False
        except Exception as e:
            logger.error(
                f"[ESCALATION] Failed to update status for {reference_id}: {e}"
            )
            return False

    def seed_demo_escalations(self) -> list[dict[str, Any]]:
        """Populate database with sample escalations for Day 7 demonstration if empty or requested."""
        sample_records = [
            {
                "reference_id": "JS-2026-0042",
                "reason": "Red-flag symptoms",
                "urgency": "emergency",
                "user_name": "Ramesh Kumar",
                "summary": "Caller reported severe chest pain and difficulty breathing lasting 30 minutes.",
                "agent_checked": "Identified emergency red-flag symptoms. Advised 108 ambulance transport immediately. No diagnosis provided.",
                "language": "English",
                "preferred_followup": "Phone",
                "permission_confirmed": True,
                "status": "open",
            },
            {
                "reference_id": "JS-2026-0038",
                "reason": "Diagnosis request",
                "urgency": "high",
                "user_name": "Priya Sharma",
                "summary": "Caller asked for definitive diagnosis of recurring skin rash and joint swelling with prescription advice.",
                "agent_checked": "Explained Jana Seva cannot diagnose diseases or prescribe medication. Escalated for clinical review.",
                "language": "Hindi",
                "preferred_followup": "SMS",
                "permission_confirmed": True,
                "status": "in_progress",
            },
            {
                "reference_id": "JS-2026-0015",
                "reason": "Red-flag symptoms",
                "urgency": "emergency",
                "user_name": "Sunita Devi",
                "summary": "Elderly patient experienced sudden severe confusion and weakness on left side of body.",
                "agent_checked": "Stroke-like red flag symptoms detected. 108 emergency protocol initiated.",
                "language": "Hinglish",
                "preferred_followup": "Phone",
                "permission_confirmed": True,
                "status": "resolved",
            },
        ]
        created = []
        for item in sample_records:
            existing = self.get_escalation_by_ref(item["reference_id"])
            if not existing:
                res = self.create_escalation(**item)
                if res:
                    created.append(res)
        return created
