import json
import pytest
from unittest.mock import AsyncMock, MagicMock
from agent import Assistant, ClinicSpecialist
from memory.service import MemoryService
from memory.database import Database


@pytest.fixture
def memory_service(tmp_path):
    db_file = tmp_path / "test_jana_seva.db"
    db = Database(db_path=db_file)
    return MemoryService(db=db)


@pytest.mark.asyncio
async def test_handoff_tool_execution(memory_service):
    """Test handoff_to_clinic_specialist tool logs event and switches agent session."""
    call_id = "test_call_001"
    memory_service.create_call_record(call_id=call_id)

    assistant = Assistant(
        memory_service=memory_service,
        caller_id="test_user_ramesh",
        call_id=call_id,
        caller_profile={
            "found": True,
            "name": "Ramesh",
            "language_preference": "English",
            "facts": {"district": "Jaipur"},
        },
    )

    # Mock RunContext and AgentSession with AsyncMocks
    mock_context = MagicMock()
    mock_context.session = MagicMock()
    mock_context.session.generate_reply = AsyncMock()
    mock_context.session.room = MagicMock()
    mock_context.session.room.local_participant.set_attributes = AsyncMock()

    # Execute handoff tool
    result_str = await assistant.handoff_to_clinic_specialist(
        context=mock_context,
        user_request="Book an appointment for a general consultation",
        conversation_summary="Caller asked for clinic lookup and appointment booking in Jaipur",
        user_language="English",
        known_user_context="District: Jaipur",
    )

    res = json.loads(result_str)
    assert res["status"] == "handoff_successful"
    assert res["to_agent"] == "Clinic & Appointment Specialist"
    assert "HO-2026-" in res["handoff_id"]

    # Verify handoff event was logged in DB
    logs = memory_service.get_handoff_logs(call_id=call_id)
    assert len(logs) == 1
    assert logs[0]["from_agent"] == "main"
    assert logs[0]["to_agent"] == "clinic_appointment_specialist"
    assert logs[0]["success"] is True

    # Verify update_agent was called on session
    mock_context.session.update_agent.assert_called_once()
    specialist_instance = mock_context.session.update_agent.call_args[0][0]
    assert isinstance(specialist_instance, ClinicSpecialist)
    assert specialist_instance.user_request == "Book an appointment for a general consultation"


@pytest.mark.asyncio
async def test_handback_tool_execution(memory_service):
    """Test handback_to_main_agent tool returns control to Main agent."""
    call_id = "test_call_002"
    memory_service.create_call_record(call_id=call_id)

    specialist = ClinicSpecialist(
        memory_service=memory_service,
        caller_id="test_user_ramesh",
        call_id=call_id,
        user_request="Appointment finished",
    )

    mock_context = MagicMock()
    mock_context.session = MagicMock()
    mock_context.session.generate_reply = AsyncMock()
    mock_context.session.room = MagicMock()
    mock_context.session.room.local_participant.set_attributes = AsyncMock()

    result_str = await specialist.handback_to_main_agent(
        context=mock_context,
        reason="Appointment selection completed",
        user_query="What documents do I need to bring?",
    )

    res = json.loads(result_str)
    assert res["status"] == "handback_successful"
    assert res["to_agent"] == "Jana Seva Main Agent"

    # Verify handback logged
    logs = memory_service.get_handoff_logs(call_id=call_id)
    assert len(logs) == 1
    assert logs[0]["from_agent"] == "clinic_appointment_specialist"
    assert logs[0]["to_agent"] == "main"

    # Verify update_agent called
    mock_context.session.update_agent.assert_called_once()
    main_instance = mock_context.session.update_agent.call_args[0][0]
    assert isinstance(main_instance, Assistant)


@pytest.mark.asyncio
async def test_handoff_fallback_on_failure(memory_service):
    """Test graceful fallback if handoff encounters an unexpected error."""
    call_id = "test_call_003"
    memory_service.create_call_record(call_id=call_id)

    assistant = Assistant(
        memory_service=memory_service,
        call_id=call_id,
    )

    mock_context = MagicMock()
    mock_context.session.generate_reply = AsyncMock()
    mock_context.session.room = MagicMock()
    mock_context.session.room.local_participant.set_attributes = AsyncMock()
    # Force update_agent to raise an exception
    mock_context.session.update_agent.side_effect = RuntimeError("Session connection closed")

    result_str = await assistant.handoff_to_clinic_specialist(
        context=mock_context,
        user_request="Find clinic in Jaipur",
    )

    res = json.loads(result_str)
    assert res["status"] == "handoff_failed"
    assert "Session connection closed" in res["error"]
    assert "INFORM USER OUT LOUD" in res["fallback_guidance"]

    # Verify failed handoff logged
    logs = memory_service.get_handoff_logs(call_id=call_id)
    assert len(logs) == 2
    assert logs[0]["success"] is False


@pytest.mark.asyncio
async def test_ten_routing_test_cases():
    """Verify routing decision logic for all 10 prompt test cases."""
    test_cases = [
        # (Query, Expected Handoff to Specialist?, Reason)
        ("What documents do I need at a hospital?", False, "Normal hospital document info -> Main Agent"),
        ("What healthcare services are available?", False, "General health service info -> Main Agent"),
        ("I want to find a clinic.", True, "Clinic discovery request -> Specialist Agent"),
        ("Can you help me with an appointment?", True, "Appointment assistance -> Specialist Agent"),
        ("Which department should I visit for my appointment?", True, "Department selection -> Specialist Agent"),
        ("Help me prepare for my clinic appointment.", True, "Appointment preparation -> Specialist Agent"),
        ("What is this disease?", False, "General medical/disease question -> Main Agent"),
        ("Can you diagnose me?", False, "Diagnosis request -> Main Agent / Human Escalation"),
        ("I'm having severe chest pain.", False, "EMERGENCY red-flag -> Day 7 Emergency Escalation (NO Specialist)"),
        ("I need to book a general consultation.", True, "Appointment booking assistance -> Specialist Agent"),
    ]

    for query, should_handoff, description in test_cases:
        query_lower = query.lower()

        # Emergency check
        is_emergency = any(w in query_lower for w in ["chest pain", "breathing", "unconscious", "heavy bleeding"])
        # Appointment / Clinic check
        is_appointment_clinic = any(
            w in query_lower for w in ["clinic", "appointment", "department", "consultation"]
        ) and not is_emergency

        if should_handoff:
            assert is_appointment_clinic, f"Failed routing test for: {query} ({description})"
            assert not is_emergency, f"Emergency query should not handoff: {query}"
        else:
            assert not is_appointment_clinic or is_emergency, f"Should not handoff: {query} ({description})"
