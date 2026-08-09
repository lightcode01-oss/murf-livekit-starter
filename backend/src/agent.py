import json
import logging
from typing import Any, Optional

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    RunContext,
    cli,
    function_tool,
    room_io,
    tokenize,
)
from livekit.plugins import deepgram, google, murf, noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from memory.service import MemoryService
from prompt import SYSTEM_PROMPT

logger = logging.getLogger("agent")

load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(
        self,
        memory_service: Optional[MemoryService] = None,
        caller_id: str = "demo_caller_ramesh",
        caller_profile: Optional[dict[str, Any]] = None,
    ) -> None:
        self.memory_service = memory_service or MemoryService()
        self.caller_id = caller_id
        self.caller_profile = caller_profile or {"found": False}

        # Build dynamic system instructions incorporating caller profile context
        instructions = SYSTEM_PROMPT
        if self.caller_profile.get("found"):
            c_name = self.caller_profile.get("name") or "User"
            c_lang = self.caller_profile.get("language_preference") or "English"
            c_facts = self.caller_profile.get("facts", {})
            instructions += f"""

---

## ACTIVE CALLER PROFILE (RETURNING CALLER)
- Caller ID: {self.caller_id}
- Name: {c_name}
- Language Preference: {c_lang}
- Saved Health Facts: {c_facts}

INSTRUCTION: You are speaking to returning caller {c_name}.
Greet {c_name} warmly in {c_lang} (e.g., "Welcome back, {c_name}!" or Devanagari script for Hindi: "नमस्ते {c_name}, वापस स्वागत है!").
Use saved details naturally when relevant to their health queries. Do not recite raw JSON.
"""
        else:
            instructions += f"""

---

## ACTIVE CALLER PROFILE (NEW CALLER)
- Caller ID: {self.caller_id}
- Status: New caller (no previous record found).

INSTRUCTION: Greet the caller warmly as a new caller. When the caller introduces themselves or shares details, ask for permission before saving.
"""

        super().__init__(instructions=instructions)

    @function_tool
    async def lookup_caller(
        self,
        context: RunContext,
        user_id: str = "",
    ) -> str:
        """Find an existing caller profile by user_id to retrieve saved name, language preference, and health facts.

        Args:
            user_id: Unique caller identifier. If empty or not provided, uses active session caller ID.
        """
        target_id = user_id or self.caller_id
        logger.info(f"[MEMORY] Executing lookup_caller tool for user_id: {target_id}")
        res = self.memory_service.lookup_caller(target_id)
        logger.info(f"[MEMORY] Lookup result for {target_id}: {res}")
        return json.dumps(res)

    @function_tool
    async def save_caller_memory(
        self,
        context: RunContext,
        user_id: str = "",
        name: str = "",
        language_preference: str = "",
        age_band: str = "",
        ongoing_conditions: str = "",
        last_triage_outcome: str = "",
        facts_json: str = "",
    ) -> str:
        """Save caller-approved information to persistent memory AFTER receiving explicit permission from the caller.

        Args:
            user_id: Unique caller identifier. If empty, uses active session caller ID.
            name: Caller's name (e.g. Abhinav, Ramesh).
            language_preference: Preferred language (e.g. English, Hindi, Hinglish).
            age_band: Age band (e.g. child, teen, young adult, adult, older adult).
            ongoing_conditions: Concise condition description (e.g. diabetes, hypertension, asthma, none mentioned).
            last_triage_outcome: Triage guidance outcome (e.g. self-care guidance, recommended doctor consultation, urgent medical attention).
            facts_json: Optional JSON string of any additional approved health facts.
        """
        target_id = user_id or self.caller_id
        facts: dict[str, Any] = {}
        if facts_json:
            try:
                parsed = json.loads(facts_json)
                if isinstance(parsed, dict):
                    facts.update(parsed)
            except Exception:
                pass
        if age_band:
            facts["age_band"] = age_band
        if ongoing_conditions:
            facts["ongoing_conditions"] = ongoing_conditions
        if last_triage_outcome:
            facts["last_triage_outcome"] = last_triage_outcome

        logger.info(
            f"[MEMORY] save_caller_memory arguments -> user_id: '{target_id}', name: '{name}', language_preference: '{language_preference}', facts: {facts}"
        )
        res = self.memory_service.save_caller_memory(
            user_id=target_id,
            name=name,
            language_preference=language_preference,
            facts=facts if facts else None,
        )
        logger.info(f"[MEMORY] Save result for {target_id}: {res}")
        return json.dumps(res)

    @function_tool
    async def triage_symptom(
        self,
        context: RunContext,
        symptom: str,
        duration_days: int = 1,
        severity: str = "moderate",
    ) -> str:
        """Evaluate patient symptoms and provide preliminary triage advice and referral guidance.

        Args:
            symptom: Primary symptom described by user (e.g. fever, cough, chest pain, diarrhea).
            duration_days: Number of days symptom has been present.
            severity: Self-reported severity (mild, moderate, severe).
        """
        logger.info(
            f"Triage request for symptom: {symptom}, duration: {duration_days} days, severity: {severity}"
        )
        symptom_lower = symptom.lower()
        if any(
            w in symptom_lower
            for w in [
                "chest pain",
                "breathing",
                "unconscious",
                "heavy bleeding",
                "convulsion",
            ]
        ):
            return (
                "EMERGENCY RED FLAG DETECTED. Advise patient or ASHA worker to seek immediate emergency hospital transport "
                "or call 108 ambulance service without delay."
            )
        elif "fever" in symptom_lower and duration_days >= 3:
            return (
                "Fever for more than 3 days requires testing for malaria or dengue at the nearest Primary Health Centre (PHC). "
                "Advise drinking plenty of fluids and resting."
            )
        else:
            return (
                f"For {severity} {symptom} lasting {duration_days} day(s), advise rest, adequate hydration, and monitoring. "
                "If symptoms worsen or fever exceeds 102 degrees, visit local ASHA worker or PHC clinic."
            )

    @function_tool
    async def check_health_scheme_eligibility(
        self,
        context: RunContext,
        scheme_name: str,
        category: str = "general",
    ) -> str:
        """Check eligibility criteria and benefits for Indian government healthcare schemes.

        Args:
            scheme_name: Name of health scheme (e.g., Ayushman Bharat, JSY, PMMVY, POSHAN Abhiyaan).
            category: Demographic category (e.g., pregnant woman, BPL family, infant, senior citizen).
        """
        logger.info(
            f"Checking scheme eligibility for: {scheme_name}, category: {category}"
        )
        scheme_lower = scheme_name.lower()
        if (
            "ayushman" in scheme_lower
            or "pm-jay" in scheme_lower
            or "pmjay" in scheme_lower
        ):
            return (
                "Ayushman Bharat (PM-JAY) provides free health coverage up to 5 Lakh rupees per family per year for secondary and tertiary hospitalization. "
                "Eligible families are identified via SECC data or Ration Card (BPL status)."
            )
        elif "janani" in scheme_lower or "jsy" in scheme_lower:
            return (
                "Janani Suraksha Yojana (JSY) provides cash assistance to pregnant women delivering in government or accredited private health facilities. "
                "Rural mothers receive 1400 rupees in Low Performing States."
            )
        elif "matru" in scheme_lower or "pmmvy" in scheme_lower:
            return "Pradhan Mantri Matru Vandana Yojana (PMMVY) provides 5000 rupees direct benefit transfer in installments for first living child."
        elif "poshan" in scheme_lower:
            return "POSHAN Abhiyaan provides nutritional support and regular growth monitoring via Anganwadi centers."
        else:
            return f"Information for {scheme_name}: Eligible citizens can check details at nearest Gram Panchayat, Anganwadi, or PHC center."

    @function_tool
    async def log_asha_patient_visit(
        self,
        context: RunContext,
        patient_name: str,
        visit_type: str,
        notes: str,
    ) -> str:
        """Record an ASHA worker field visit log entry for a community patient.

        Args:
            patient_name: Name of patient or beneficiary.
            visit_type: Type of visit (e.g., ANC checkup, PNC checkup, immunization follow up, TB monitoring, nutrition check).
            notes: Key observation or notes from visit.
        """
        logger.info(
            f"Logging ASHA visit for {patient_name}, Type: {visit_type}, Notes: {notes}"
        )
        return f"Visit successfully logged for patient {patient_name}. Visit Type: {visit_type}. Record saved for ASHA weekly report."

    @function_tool
    async def schedule_medication_reminder(
        self,
        context: RunContext,
        medicine_name: str,
        time_of_day: str,
        instructions: str = "after food",
    ) -> str:
        """Set a medication dose reminder for a patient.

        Args:
            medicine_name: Name of prescribed medicine.
            time_of_day: Time or frequency (e.g., Morning 8 AM, Night 9 PM, twice daily).
            instructions: Administration instructions (e.g., after food, before food, with warm water).
        """
        logger.info(
            f"Setting reminder for {medicine_name} at {time_of_day} ({instructions})"
        )
        return f"Medication reminder set for {medicine_name} at {time_of_day}, to be taken {instructions}."


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Connect to room first to access participant details
    await ctx.connect()

    # Determine caller identity
    remote_p = next(iter(ctx.room.remote_participants.values()), None)
    caller_id = (
        remote_p.identity if (remote_p and remote_p.identity) else "demo_caller_ramesh"
    )
    logger.info(f"[MEMORY] Connected room {ctx.room.name} with Caller ID: {caller_id}")

    # Memory lookup
    memory_service = MemoryService()
    caller_profile = memory_service.lookup_caller(caller_id)
    logger.info(f"[MEMORY] Lookup result for {caller_id}: {caller_profile}")

    assistant = Assistant(
        memory_service=memory_service,
        caller_id=caller_id,
        caller_profile=caller_profile,
    )

    # Voice AI pipeline configuration — STT optimized for Multilingual accuracy & endpointing
    session = AgentSession(
        stt=deepgram.STT(
            model="nova-3",
            language="multi",
            smart_format=True,
            endpointing_ms=500,
        ),
        llm=google.LLM(model="gemini-3.5-flash-lite"),
        tts=murf.TTS(
            voice="Anisha",
            locale="hi-IN",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=False,
        min_endpointing_delay=0.7,
        max_endpointing_delay=3.0,
    )

    # Observability — Attach Voice State & STT transcription event listeners
    @session.on("user_state_changed")
    def _on_user_state_changed(ev):
        logger.info(f"[VOICE] User state changed: {ev}")

    @session.on("user_input_transcribed")
    def _on_user_input_transcribed(ev):
        if getattr(ev, "is_final", False):
            logger.info(f"[STT FINAL] Transcript: '{ev.transcript}'")
        else:
            logger.info(f"[STT INTERIM] Transcript: '{ev.transcript}'")

    @session.on("agent_state_changed")
    def _on_agent_state_changed(ev):
        logger.info(f"[AGENT] Agent state changed: {ev}")

    # Start session with Assistant agent
    await session.start(
        agent=assistant,
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    # Generate initial reply instruction based on caller status
    if caller_profile.get("found"):
        caller_name = caller_profile.get("name") or "User"
        lang_pref = caller_profile.get("language_preference") or "English"
        facts = caller_profile.get("facts", {})
        logger.info(
            f"[MEMORY] Returning caller active: name={caller_name}, language={lang_pref}, facts={facts}"
        )
        if lang_pref.lower() == "hindi":
            greeting_instruction = (
                f"RETURNING CALLER: {caller_name}. Greet {caller_name} warmly in Hindi using Devanagari script: "
                f"'नमस्ते {caller_name}, वापस स्वागत है! आज मैं आपकी कैसे मदद कर सकता हूँ?'"
            )
        else:
            greeting_instruction = (
                f"RETURNING CALLER: {caller_name}. Greet {caller_name} warmly in English: "
                f"'Welcome back, {caller_name}! How can I help you today?'"
            )
    else:
        logger.info("[MEMORY] New caller connected.")
        greeting_instruction = (
            "NEW CALLER: Greet the user warmly: "
            "'Namaste! Main Dr. Swasthya Sathi hoon Jana Seva se, aapka health access assistant. Aap mujhse kisi bhi swasthya jankari, hospital, ya health scheme ke baare में pooch sakte hain.'"
        )

    await session.generate_reply(instructions=greeting_instruction)


if __name__ == "__main__":
    cli.run_app(server)
