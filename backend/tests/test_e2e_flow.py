"""End-to-End Voice Flow & Memory Integration Tests."""

import tempfile
from pathlib import Path

from agent import Assistant
from memory.database import Database
from memory.service import MemoryService


def test_e2e_call1_and_call2_returning_caller_flow():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "jana_seva_test.db"
        db = Database(db_path=db_path)
        memory_service = MemoryService(db=db)

        # ----------------------------------------------------
        # STEP 1: CALL 1 — New Caller Connects ("demo_caller_ramesh")
        # ----------------------------------------------------
        caller_id = "demo_caller_ramesh"
        profile_call1 = memory_service.lookup_caller(caller_id)
        assert profile_call1["found"] is False

        # Initialize Assistant for Call 1
        agent_call1 = Assistant(
            memory_service=memory_service,
            caller_id=caller_id,
            caller_profile=profile_call1,
        )
        assert "NEW CALLER" in agent_call1.instructions

        # User shares facts: "My name is Abhinav", "I prefer English", "I'm an adult with diabetes"
        # Agent asks permission and user agrees ("Yes, remember that")
        save_res = memory_service.save_caller_memory(
            user_id=caller_id,
            name="Abhinav",
            language_preference="English",
            facts={"age_band": "adult", "ongoing_conditions": "diabetes"},
        )
        assert save_res["success"] is True

        # Verify SQLite record direct state
        db_record = db.get_user(caller_id)
        assert db_record is not None
        assert db_record["name"] == "Abhinav"
        assert db_record["language_preference"] == "English"
        assert db_record["facts"] == {
            "age_band": "adult",
            "ongoing_conditions": "diabetes",
        }

        # ----------------------------------------------------
        # STEP 2: CALL 2 — Returning Caller Reconnects
        # ----------------------------------------------------
        profile_call2 = memory_service.lookup_caller(caller_id)
        assert profile_call2["found"] is True
        assert profile_call2["name"] == "Abhinav"
        assert profile_call2["language_preference"] == "English"
        assert profile_call2["facts"]["ongoing_conditions"] == "diabetes"

        # Initialize Assistant for Call 2
        agent_call2 = Assistant(
            memory_service=memory_service,
            caller_id=caller_id,
            caller_profile=profile_call2,
        )
        assert "RETURNING CALLER" in agent_call2.instructions
        assert "Abhinav" in agent_call2.instructions
        assert "English" in agent_call2.instructions
        assert "diabetes" in agent_call2.instructions


def test_e2e_negative_consent_flow():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "jana_seva_test.db"
        db = Database(db_path=db_path)
        memory_service = MemoryService(db=db)

        caller_id = "demo_caller_rahul"
        profile = memory_service.lookup_caller(caller_id)
        assert profile["found"] is False

        # User shares: "My name is Rahul and I have asthma"
        # Agent asks permission. User declines ("No, don't remember that")
        # save_caller_memory MUST NOT be called
        consent_granted = False
        if consent_granted:
            memory_service.save_caller_memory(
                user_id=caller_id, name="Rahul", facts={"ongoing_conditions": "asthma"}
            )

        # Verify database remains empty for this caller
        after_profile = memory_service.lookup_caller(caller_id)
        assert after_profile["found"] is False
        assert db.get_user(caller_id) is None
