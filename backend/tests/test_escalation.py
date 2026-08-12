"""Unit and integration tests for Day 7 Human Help Escalation System."""

import asyncio
import json
import sys
from pathlib import Path

import pytest

# Ensure backend src is on python path
src_dir = Path(__file__).resolve().parent.parent / "src"
sys.path.insert(0, str(src_dir))

from agent import Assistant  # noqa: E402
from memory.database import Database  # noqa: E402
from memory.service import MemoryService  # noqa: E402
from sanitizer import sanitize_text  # noqa: E402


@pytest.fixture
def temp_db(tmp_path):
    """Fixture providing a temporary clean SQLite database."""
    db_file = tmp_path / "test_jana_seva.db"
    db = Database(db_path=db_file)
    service = MemoryService(db=db)
    return service, db


def test_permission_safety_guard_rejection(temp_db):
    """Test 2 & Safety Guard: create_escalation must reject execution if permission_confirmed is False."""
    service, _ = temp_db
    assistant = Assistant(memory_service=service, caller_id="test_caller_1")

    res_json_str = asyncio.run(
        assistant.create_escalation(
            context=None,
            reason="Red-flag symptoms",
            urgency="emergency",
            user_name="Test User",
            summary="Caller reported severe chest pain",
            agent_checked="Emergency red flags detected",
            language="English",
            preferred_followup="Phone",
            permission_confirmed=False,  # Unconfirmed permission!
        )
    )

    res = json.loads(res_json_str)
    assert res["status"] == "aborted"
    assert "permission_confirmed must be True" in res["error"]

    # Verify database has 0 escalations stored
    escalations = service.get_escalations()
    assert len(escalations) == 0


def test_red_flag_symptoms_escalation_created(temp_db):
    """Test 1: Red-flag symptoms + YES permission -> Escalation created with emergency urgency."""
    service, _ = temp_db
    assistant = Assistant(memory_service=service, caller_id="test_caller_2")

    res_json_str = asyncio.run(
        assistant.create_escalation(
            context=None,
            reason="Red-flag symptoms",
            urgency="emergency",
            user_name="Ramesh Kumar",
            summary="Caller reported severe chest pain and difficulty breathing.",
            agent_checked="Red flag symptoms identified. Advised emergency transport.",
            language="English",
            preferred_followup="Phone",
            permission_confirmed=True,  # Explicit YES permission
        )
    )

    res = json.loads(res_json_str)
    assert res["status"] == "created"
    assert res["reference_id"].startswith("JS-2026-")
    assert res["urgency"] == "emergency"

    # Verify record in DB
    record = service.get_escalation_by_ref(res["reference_id"])
    assert record is not None
    assert record["reason"] == "Red-flag symptoms"
    assert record["urgency"] == "emergency"
    assert record["status"] == "open"
    assert record["permission_confirmed"] is True


def test_diagnosis_request_escalation(temp_db):
    """Test 3: Diagnosis request + YES permission -> Escalation created with high urgency."""
    service, _ = temp_db
    assistant = Assistant(memory_service=service, caller_id="test_caller_3")

    res_json_str = asyncio.run(
        assistant.create_escalation(
            context=None,
            reason="Diagnosis request",
            urgency="high",
            user_name="Priya Sharma",
            summary="Caller asked for definitive diagnosis of skin lesions.",
            agent_checked="Explained Jana Seva cannot diagnose diseases. Offered escalation.",
            language="Hindi",
            preferred_followup="SMS",
            permission_confirmed=True,
        )
    )

    res = json.loads(res_json_str)
    assert res["status"] == "created"
    assert res["urgency"] == "high"

    records = service.get_escalations(urgency="high")
    assert len(records) == 1
    assert records[0]["reference_id"] == res["reference_id"]


def test_sanitization_layer():
    """Test 6: Sensitive information (passwords, OTPs, PINs, bank accounts, card numbers, API keys) must be sanitized."""
    raw_text = (
        "Caller shared password: SecretPass123 and OTP is 987654. "
        "Bank account number 123456789012 and credit card 4532-1111-2222-3333. "
        "API key sk-abcdef123456789012345678."
    )

    clean_text = sanitize_text(raw_text)

    assert "SecretPass123" not in clean_text
    assert "987654" not in clean_text
    assert "123456789012" not in clean_text
    assert "4532-1111-2222-3333" not in clean_text
    assert "sk-abcdef123456789012345678" not in clean_text

    assert "[REDACTED_CREDENTIAL]" in clean_text or "[REDACTED_PIN]" in clean_text
    assert "[REDACTED_CARD_NUMBER]" in clean_text
    assert "[REDACTED_BANK_ACCOUNT]" in clean_text


def test_reference_id_format_and_uniqueness(temp_db):
    """Test 7: Every escalation receives a unique reference ID matching JS-2026-XXXX format."""
    service, _ = temp_db
    assistant = Assistant(memory_service=service, caller_id="test_caller_4")

    ref_ids = set()
    for i in range(5):
        res_str = asyncio.run(
            assistant.create_escalation(
                context=None,
                reason="Red-flag symptoms",
                urgency="emergency",
                user_name=f"Caller {i}",
                summary=f"Summary {i}",
                agent_checked="Checked",
                permission_confirmed=True,
            )
        )
        data = json.loads(res_str)
        ref_id = data["reference_id"]
        assert ref_id.startswith("JS-2026-")
        assert len(ref_id) == 12  # JS-2026-1234 -> length 12
        ref_ids.add(ref_id)

    # Verify all 5 generated IDs are unique
    assert len(ref_ids) == 5


def test_status_updates(temp_db):
    """Test status transition open -> in_progress -> resolved."""
    service, _ = temp_db
    assistant = Assistant(memory_service=service)

    res_str = asyncio.run(
        assistant.create_escalation(
            context=None,
            reason="Test Escalation",
            urgency="medium",
            permission_confirmed=True,
        )
    )
    ref_id = json.loads(res_str)["reference_id"]

    # Initial status
    rec = service.get_escalation_by_ref(ref_id)
    assert rec["status"] == "open"

    # Move to in_progress
    assert service.update_escalation_status(ref_id, "in_progress") is True
    rec = service.get_escalation_by_ref(ref_id)
    assert rec["status"] == "in_progress"

    # Move to resolved
    assert service.update_escalation_status(ref_id, "resolved") is True
    rec = service.get_escalation_by_ref(ref_id)
    assert rec["status"] == "resolved"
