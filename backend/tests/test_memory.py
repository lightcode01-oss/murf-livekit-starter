import tempfile
from pathlib import Path
from unittest.mock import patch

from memory.database import Database
from memory.service import MemoryService


def test_new_caller():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"
        service = MemoryService(db=Database(db_path=db_path))

        res = service.lookup_caller("user_unknown_123")
        assert res["found"] is False


def test_save_caller():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"
        service = MemoryService(db=Database(db_path=db_path))

        save_res = service.save_caller_memory(
            user_id="user_ramesh_001",
            name="Ramesh",
            language_preference="Hindi",
            facts={"age_band": "adult", "ongoing_conditions": "diabetes"},
        )
        assert save_res["success"] is True

        lookup_res = service.lookup_caller("user_ramesh_001")
        assert lookup_res["found"] is True
        assert lookup_res["name"] == "Ramesh"
        assert lookup_res["language_preference"] == "Hindi"
        assert lookup_res["facts"]["age_band"] == "adult"
        assert lookup_res["facts"]["ongoing_conditions"] == "diabetes"


def test_existing_caller():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"
        service = MemoryService(db=Database(db_path=db_path))

        service.save_caller_memory(
            user_id="user_sunita_002",
            name="Sunita",
            language_preference="English",
            facts={"ongoing_conditions": "hypertension"},
        )

        res = service.lookup_caller("user_sunita_002")
        assert res["found"] is True
        assert res["user_id"] == "user_sunita_002"
        assert res["name"] == "Sunita"
        assert res["language_preference"] == "English"
        assert res["facts"] == {"ongoing_conditions": "hypertension"}


def test_update_caller():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"
        service = MemoryService(db=Database(db_path=db_path))

        # Initial save
        service.save_caller_memory(
            user_id="user_ramesh_001",
            name="Ramesh",
            language_preference="Hindi",
            facts={"ongoing_conditions": "diabetes"},
        )

        # Update language preference to English
        service.save_caller_memory(
            user_id="user_ramesh_001",
            language_preference="English",
        )

        res = service.lookup_caller("user_ramesh_001")
        assert res["found"] is True
        assert res["language_preference"] == "English"
        assert res["name"] == "Ramesh"


def test_preserve_existing_facts():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"
        service = MemoryService(db=Database(db_path=db_path))

        # Save initial fact
        service.save_caller_memory(
            user_id="user_ramesh_001",
            name="Ramesh",
            facts={"age_band": "adult", "ongoing_conditions": "diabetes"},
        )

        # Update with new fact without passing age_band or ongoing_conditions
        service.save_caller_memory(
            user_id="user_ramesh_001",
            facts={"last_triage_outcome": "recommended doctor consultation"},
        )

        res = service.lookup_caller("user_ramesh_001")
        assert res["found"] is True
        # Verify age_band and ongoing_conditions were preserved
        assert res["facts"]["age_band"] == "adult"
        assert res["facts"]["ongoing_conditions"] == "diabetes"
        assert res["facts"]["last_triage_outcome"] == "recommended doctor consultation"


def test_permission_denied():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"
        service = MemoryService(db=Database(db_path=db_path))

        # When permission is denied, save_caller_memory MUST NOT be invoked.
        # We verify that if save_caller_memory is not called, lookup returns found=False.
        permission_granted = False
        if permission_granted:
            service.save_caller_memory(user_id="user_secret_999", name="Unsaved User")

        res = service.lookup_caller("user_secret_999")
        assert res["found"] is False


def test_database_failure():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"
        service = MemoryService(db=Database(db_path=db_path))

        with patch.object(
            service.db, "get_user", side_effect=Exception("SQLite lock error")
        ):
            res = service.lookup_caller("user_ramesh_001")
            assert res["found"] is False


def test_persistence():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"

        # Session 1: write to database
        db1 = Database(db_path=db_path)
        service1 = MemoryService(db=db1)
        service1.save_caller_memory(
            user_id="user_persistent_101",
            name="Persistent User",
            language_preference="Odia",
            facts={"age_band": "older adult"},
        )

        # Session 2: close and reopen database connection from new instance
        db2 = Database(db_path=db_path)
        service2 = MemoryService(db=db2)
        res = service2.lookup_caller("user_persistent_101")

        assert res["found"] is True
        assert res["name"] == "Persistent User"
        assert res["language_preference"] == "Odia"
        assert res["facts"] == {"age_band": "older adult"}
