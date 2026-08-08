import logging

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

from prompt import SYSTEM_PROMPT

logger = logging.getLogger("agent")

load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)

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
            symptom: The primary symptom described by the user (e.g. fever, cough, chest pain, diarrhea).
            duration_days: Number of days the symptom has been present.
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
                "If symptoms worsen or fever exceeds 102 degrees, visit the local ASHA worker or PHC clinic."
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
            scheme_name: Name of the health scheme (e.g., Ayushman Bharat, JSY, PMMVY, POSHAN Abhiyaan).
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
                "Eligible families are identified via SECC data or Ration Card (BPL status). Ayushman Card can be issued at nearest CSC or PHC."
            )
        elif "janani" in scheme_lower or "jsy" in scheme_lower:
            return (
                "Janani Suraksha Yojana (JSY) provides cash assistance to pregnant women delivering in government or accredited private health facilities. "
                "Rural mothers receive 1400 rupees in Low Performing States, plus incentives for ASHA workers supporting institutional delivery."
            )
        elif "matru" in scheme_lower or "pmmvy" in scheme_lower:
            return "Pradhan Mantri Matru Vandana Yojana (PMMVY) provides 5000 rupees direct benefit transfer in installments for first living child to pregnant and lactating mothers."
        elif "poshan" in scheme_lower:
            return "POSHAN Abhiyaan provides nutritional support, supplementary nutrition via Anganwadi centers, and regular growth monitoring for pregnant mothers and children under 6."
        else:
            return f"Information for {scheme_name}: Eligible citizens can check details at the nearest Gram Panchayat, Anganwadi, or PHC center. Ayushman Bharat and JSY are available for low-income families."

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
            patient_name: Name of the patient or beneficiary.
            visit_type: Type of visit (e.g., ANC checkup, PNC checkup, immunization follow up, TB monitoring, nutrition check).
            notes: Key observation or notes from the visit.
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
            medicine_name: Name of the prescribed medicine.
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
    # Logging setup
    # Add any other context you want in all log entries here
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using Murf Falcon, Gemini, Deepgram, and the LiveKit turn detector
    session = AgentSession(
        # Speech-to-text (STT) is your agent's ears, turning the user's speech into text that the LLM can understand
        # See all available models at https://docs.livekit.io/agents/models/stt/
        stt=deepgram.STT(model="nova-3"),
        # A Large Language Model (LLM) is your agent's brain, processing user input and generating a response
        # See all available models at https://docs.livekit.io/agents/models/llm/
        llm=google.LLM(
            model="gemini-3.5-flash-lite",
        ),
        # Text-to-speech (TTS) is your agent's voice, turning the LLM's text into speech that the user can hear
        # See all available models as well as voice selections at https://docs.livekit.io/agents/models/tts/
        tts=murf.TTS(
            voice="Anisha",
            locale="hi-IN",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
            text_pacing=True,
        ),
        # VAD and turn detection are used to determine when the user is speaking and when the agent should respond
        # See more at https://docs.livekit.io/agents/build/turns
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        # allow the LLM to generate a response while waiting for the end of turn
        # See more at https://docs.livekit.io/agents/build/audio/#preemptive-generation
        preemptive_generation=True,
    )

    # To use a realtime model instead of a voice pipeline, use the following session setup instead.
    # (Note: This is for the OpenAI Realtime API. For other providers, see https://docs.livekit.io/agents/models/realtime/))
    # 1. Install livekit-agents[openai]
    # 2. Set OPENAI_API_KEY in .env.local
    # 3. Add `from livekit.plugins import openai` to the top of this file
    # 4. Use the following session setup instead of the version above
    # session = AgentSession(
    #     llm=openai.realtime.RealtimeModel(voice="marin")
    # )

    # # Add a virtual avatar to the session, if desired
    # # For other providers, see https://docs.livekit.io/agents/models/avatar/
    # avatar = hedra.AvatarSession(
    #   avatar_id="...",  # See https://docs.livekit.io/agents/models/avatar/plugins/hedra
    # )
    # # Start the avatar and wait for it to join
    # await avatar.start(session, room=ctx.room)

    # Join the room and connect to the user first
    await ctx.connect()

    # Start the session, which initializes the voice pipeline and warms up the models
    await session.start(
        agent=Assistant(),
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

    # Immediately greet the user with spoken audio upon connection
    await session.generate_reply(
        instructions="Namaste! Main Swasthya Sathi hoon, aapka health access assistant. Aap mujhse kisi bhi swasthya jankari ya hospital ke baare mein pooch sakte hain."
    )


if __name__ == "__main__":
    cli.run_app(server)
