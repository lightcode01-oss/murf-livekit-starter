"""Unit and integration tests for Day 8 Call Analytics Dashboard System."""

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


@pytest.fixture
def temp_db(tmp_path):
    """Fixture providing a temporary clean SQLite database."""
    db_file = tmp_path / "test_analytics_jana_seva.db"
    db = Database(db_path=db_file)
    service = MemoryService(db=db)
    return service, db


def test_4_empty_database(temp_db):
    """Test 4: Empty database should yield 0 total, 0 successful, 0 failed, 0% rate."""
    service, _ = temp_db
    summary = service.get_analytics_summary()
    assert summary["total_calls"] == 0
    assert summary["successful_calls"] == 0
    assert summary["failed_calls"] == 0
    assert summary["success_rate"] == 0.0


def test_1_successful_call(temp_db):
    """Test 1: Creating and completing a successful call increases total and successful counters."""
    service, _ = temp_db
    call_id = "test-call-success-1"

    # Start call
    service.create_call_record(call_id=call_id, channel="browser")

    # Complete call successfully
    service.update_call_record(
        call_id=call_id,
        outcome="successful",
        ended_at="2026-08-13T17:44:00Z",
        duration_seconds=120,
    )

    summary = service.get_analytics_summary()
    assert summary["total_calls"] == 1
    assert summary["successful_calls"] == 1
    assert summary["failed_calls"] == 0
    assert summary["success_rate"] == 100.0

    call_rec = service.get_call_by_id(call_id)
    assert call_rec is not None
    assert call_rec["outcome"] == "successful"
    assert call_rec["channel"] == "browser"


def test_2_failed_call(temp_db):
    """Test 2: Creating and completing a failed call increases total and failed counters."""
    service, _ = temp_db
    call_id = "test-call-failed-1"

    # Start call
    service.create_call_record(call_id=call_id, channel="browser")

    # Complete call with failure
    service.update_call_record(
        call_id=call_id,
        outcome="failed",
        failure_reason="user_hangup",
        duration_seconds=15,
    )

    summary = service.get_analytics_summary()
    assert summary["total_calls"] == 1
    assert summary["successful_calls"] == 0
    assert summary["failed_calls"] == 1
    assert summary["success_rate"] == 0.0

    call_rec = service.get_call_by_id(call_id)
    assert call_rec is not None
    assert call_rec["outcome"] == "failed"
    assert call_rec["failure_reason"] == "user_hangup"


def test_3_dashboard_calculations(temp_db):
    """Test 3: Given 5 successful and 2 failed calls -> Total=7, Success=5, Failed=2, Rate=71.4%."""
    service, _ = temp_db

    # Create 5 successful calls
    for i in range(1, 6):
        cid = f"call-succ-{i}"
        service.create_call_record(call_id=cid, channel="browser")
        service.update_call_record(call_id=cid, outcome="successful", duration_seconds=60 * i)

    # Create 2 failed calls
    for j in range(1, 3):
        cid = f"call-fail-{j}"
        service.create_call_record(call_id=cid, channel="sip")
        service.update_call_record(
            call_id=cid, outcome="failed", failure_reason="incomplete_task", duration_seconds=10 * j
        )

    summary = service.get_analytics_summary()
    assert summary["total_calls"] == 7
    assert summary["successful_calls"] == 5
    assert summary["failed_calls"] == 2
    assert summary["success_rate"] == 71.4  # (5/7 * 100) = 71.428... -> 71.4%

    # Verify filter queries
    all_calls = service.get_calls()
    assert len(all_calls) == 7

    succ_calls = service.get_calls(outcome="successful")
    assert len(succ_calls) == 5

    fail_calls = service.get_calls(outcome="failed")
    assert len(fail_calls) == 2

    sip_calls = service.get_calls(channel="sip")
    assert len(sip_calls) == 2


def test_5_day_7_escalation_success(temp_db):
    """Test 5: Day 7 escalation workflow when completed with permission marks call as successful."""
    service, _ = temp_db
    call_id = "test-call-escalation-success"
    call_tracker = {"outcome": "in_progress", "failure_reason": None}

    service.create_call_record(call_id=call_id, channel="browser")

    assistant = Assistant(
        memory_service=service,
        caller_id="test_caller_esc",
        call_id=call_id,
        call_tracker=call_tracker,
    )

    res_json = asyncio.run(
        assistant.create_escalation(
            context=None,
            reason="Red-flag symptoms",
            urgency="emergency",
            user_name="Ramesh Kumar",
            summary="Patient has severe chest pain",
            agent_checked="Identified emergency red flag",
            language="English",
            preferred_followup="Phone",
            permission_confirmed=True,
        )
    )

    res = json.loads(res_json)
    assert res["status"] == "created"
    assert call_tracker["outcome"] == "successful"

    record = service.get_call_by_id(call_id)
    assert record is not None
    assert record["outcome"] == "successful"


def test_6_escalation_tool_failure(temp_db):
    """Test 6: If escalation creation fails due to backend/database tool error, outcome = failed, failure_reason = tool_failure."""
    service, db = temp_db
    call_id = "test-call-escalation-fail"
    call_tracker = {"outcome": "in_progress", "failure_reason": None}

    service.create_call_record(call_id=call_id, channel="browser")

    assistant = Assistant(
        memory_service=service,
        caller_id="test_caller_esc_fail",
        call_id=call_id,
        call_tracker=call_tracker,
    )

    # Monkeypatch create_escalation on database to return None (simulating DB failure)
    db.create_escalation = lambda **kwargs: None

    res_json = asyncio.run(
        assistant.create_escalation(
            context=None,
            reason="Red-flag symptoms",
            urgency="emergency",
            user_name="Ramesh Kumar",
            summary="Patient has severe chest pain",
            agent_checked="Identified emergency red flag",
            language="English",
            preferred_followup="Phone",
            permission_confirmed=True,
        )
    )

    res = json.loads(res_json)
    assert res["status"] == "error"
    assert call_tracker["outcome"] == "failed"
    assert call_tracker["failure_reason"] == "tool_failure"

    record = service.get_call_by_id(call_id)
    assert record is not None
    assert record["outcome"] == "failed"
    assert record["failure_reason"] == "tool_failure"
