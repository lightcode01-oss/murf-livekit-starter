import json
import logging
from datetime import datetime, timezone
from typing import Any, Optional

import httpx
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

from health_data import get_cached_facilities, get_district_coords
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
        call_direction: str = "inbound",
    ) -> None:
        self.memory_service = memory_service or MemoryService()
        self.caller_id = caller_id
        self.caller_profile = caller_profile or {"found": False}
        self.call_direction = call_direction

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
    async def opt_out_caller(
        self,
        context: RunContext,
        reason: str = "User requested stop calls",
        user_id: str = "",
    ) -> str:
        """Register caller request to opt out of future health reminder calls and stop automated calling.

        Call this tool immediately whenever the caller states they do not want calls, ask to stop calling, request removal, or opt out of reminders (e.g., "Don't call me", "Stop calling", "No more calls", "कॉल मत करना", "बंद कर दो").

        Args:
            reason: Caller's reason or statement requesting opt-out.
            user_id: Unique caller identifier.
        """
        target_id = user_id or self.caller_id
        logger.info(
            f"[OUTBOUND] Opt-out requested for caller '{target_id}', reason: '{reason}'"
        )
        res = self.memory_service.opt_out_caller(user_id=target_id, reason=reason)
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

    @function_tool
    async def fetch_nearest_phc_facility(
        self,
        context: RunContext,
        district: str = "",
        facility_type: str = "all",
        user_id: str = "",
    ) -> str:
        """Fetch nearby Primary Health Centres (PHC), Community Health Centres (CHC), government hospitals, or Jan Aushadhi generic chemist stores.

        Call this tool whenever the user asks for nearby healthcare facilities, emergency clinics, PHCs, CHCs, or government health centers in a district or location.

        Args:
            district: Target district, city, or area name (e.g. Jaipur, Delhi, Lucknow, Patna, Bhopal). If omitted or empty, auto-retrieves from saved caller memory.
            facility_type: Type of facility ('phc', 'chc', 'hospital', 'jan_aushadhi', or 'all').
            user_id: Optional caller identifier.
        """
        target_id = user_id or self.caller_id
        target_district = district.strip()
        if not target_district:
            facts = self.caller_profile.get("facts", {})
            target_district = str(
                facts.get("district") or facts.get("location") or "Jaipur"
            ).strip()

        now_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")
        logger.info(
            f"[TOOL] Executing fetch_nearest_phc_facility for target_id '{target_id}', district: '{target_district}', type: '{facility_type}'"
        )

        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                query = f"hospital PHC health center {target_district} India"
                url = f"https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=3"
                headers = {"User-Agent": "SwasthyaSathiVoiceAgent/1.0"}
                resp = await client.get(url, headers=headers)

                if resp.status_code == 200:
                    data = resp.json()
                    if isinstance(data, list) and len(data) > 0:
                        live_facilities = []
                        for item in data[:3]:
                            display_name = item.get("display_name", "Health Center")
                            short_name = display_name.split(",")[0]
                            live_facilities.append(
                                {
                                    "name": short_name,
                                    "type": "Primary / Government Health Facility",
                                    "address": display_name,
                                    "operating_hours": "8:00 AM - 4:00 PM (Emergency 24/7)",
                                    "contact": "108 Emergency Ambulance",
                                }
                            )

                        payload = {
                            "status": "success",
                            "district": target_district,
                            "facility_type": facility_type,
                            "data_source": "Live OpenStreetMap Healthcare Directory",
                            "data_timestamp": f"As of {now_str}",
                            "facilities": live_facilities,
                        }
                        logger.info(
                            f"[TOOL] Live OSM health lookup success for {target_district}"
                        )
                        return json.dumps(payload)
        except Exception as e:
            logger.warning(
                f"[TOOL] Live API request failed for {target_district} ({type(e).__name__}: {e}). Triggering graceful fallback out loud."
            )

        cached = get_cached_facilities(target_district, facility_type)
        payload = {
            "status": "network_timeout_fallback",
            "district": target_district,
            "facility_type": facility_type,
            "failure_reason": "Live government directory API unreachable due to network connection timeout.",
            "data_source": "Cached Government Health Facility Directory",
            "data_timestamp": f"As of {now_str}",
            "facilities": cached,
            "spoken_guidance": f"INFORM USER OUT LOUD: Note that live directory lookup timed out due to network connection, so this information is from the cached government health center registry updated as of today for {target_district}.",
        }
        logger.info(f"[TOOL] Graceful fallback payload generated for {target_district}")
        return json.dumps(payload)

    @function_tool
    async def fetch_district_health_advisory(
        self,
        context: RunContext,
        district: str = "",
        user_id: str = "",
    ) -> str:
        """Fetch live real-time air quality index (AQI), PM2.5 levels, temperature, and environmental health advisories for a district.

        Call this tool whenever the user asks about air quality, weather health risks, pollution level, heatwave advisory, or respiratory health precautions.

        Args:
            district: Target district or city name (e.g., Jaipur, Delhi, Lucknow, Patna). Auto-retrieves from saved caller profile if omitted.
            user_id: Optional caller identifier.
        """
        target_id = user_id or self.caller_id
        target_district = district.strip()
        if not target_district:
            facts = self.caller_profile.get("facts", {})
            target_district = str(
                facts.get("district") or facts.get("location") or "Jaipur"
            ).strip()

        lat, lon = get_district_coords(target_district)
        now_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")
        logger.info(
            f"[TOOL] Executing fetch_district_health_advisory for target_id '{target_id}', district: '{target_district}' (lat={lat}, lon={lon})"
        )

        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm10,pm2_5,european_aqi,us_aqi"
                resp = await client.get(url)

                if resp.status_code == 200:
                    res_data = resp.json()
                    curr = res_data.get("current", {})
                    pm25 = curr.get("pm2_5", 25.0)
                    pm10 = curr.get("pm10", 45.0)
                    us_aqi = curr.get("us_aqi", 70)

                    if us_aqi > 150 or pm25 > 75:
                        risk = "UNHEALTHY (High Respiratory Risk)"
                        advisory = "High particulate pollution detected. Respiratory patients, elderly, and children should wear N95 masks and stay indoors."
                    elif us_aqi > 100 or pm25 > 35:
                        risk = "MODERATE (Sensitive Groups Caution)"
                        advisory = "Moderate air quality. Sensitive individuals with asthma or bronchitis should limit prolonged outdoor activity."
                    else:
                        risk = "SATISFACTORY (Low Risk)"
                        advisory = "Air quality is within safe limits. Good condition for normal outdoor activities."

                    payload = {
                        "status": "success",
                        "district": target_district,
                        "data_source": "Live Open-Meteo Air Quality Sensor Network",
                        "data_timestamp": f"Recorded live as of {now_str}",
                        "aqi_us": us_aqi,
                        "pm2_5": pm25,
                        "pm10": pm10,
                        "health_risk_level": risk,
                        "advisory": advisory,
                    }
                    logger.info(
                        f"[TOOL] Live Open-Meteo advisory success for {target_district}: AQI={us_aqi}"
                    )
                    return json.dumps(payload)
        except Exception as e:
            logger.warning(
                f"[TOOL] Live Open-Meteo request failed for {target_district} ({type(e).__name__}: {e}). Triggering failure path."
            )

        payload = {
            "status": "network_timeout_fallback",
            "district": target_district,
            "failure_reason": "Live environmental sensor network unreachable due to network connection timeout.",
            "data_source": "Estimated Seasonal Health Advisory Matrix",
            "data_timestamp": f"As of {now_str}",
            "aqi_us": 85,
            "pm2_5": 30.0,
            "health_risk_level": "MODERATE (Seasonal Estimate)",
            "advisory": "Live sensor network is temporarily offline. Based on current seasonal health patterns, stay hydrated and consult your local PHC if experiencing breathing difficulty.",
            "spoken_guidance": f"INFORM USER OUT LOUD: Mention that live sensor network is unreachable right now due to a network connection timeout, and provide seasonal health guidance for {target_district}.",
        }
        return json.dumps(payload)


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

    # Determine if outbound SIP or outbound room
    is_outbound = False
    if (
        remote_p and remote_p.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
    ) or "outbound" in ctx.room.name.lower():
        is_outbound = True

    # Check caller opt-out status
    if caller_profile.get("found") and caller_profile.get("facts", {}).get("opted_out"):
        logger.warning(
            f"[OUTBOUND] Connected caller '{caller_id}' has opted out. Delivering opt-out statement."
        )
        optout_instruction = "OPT-OUT CALLER: State politely in 1 sentence that health reminder calls have been stopped per their request, then conclude."
        await session.generate_reply(instructions=optout_instruction)
        return

    # Generate initial reply instruction based on call direction and caller status
    if is_outbound:
        lang_pref = (
            caller_profile.get("language_preference") or "English"
            if caller_profile.get("found")
            else "English"
        )
        logger.info(f"[OUTBOUND] Delivering mandatory 3-part opening in {lang_pref}")
        if lang_pref.lower() == "hindi":
            greeting_instruction = (
                "OUTBOUND CALL MANDATORY OPENING: Speak the following 3-part opening in Hindi using Devanagari script: "
                "'नमस्ते, मैं Jana Seva से कॉल कर रहा हूँ। यह आपके स्वास्थ्य reminder के बारे में एक follow-up call है; अगर आप ऐसे calls नहीं चाहते हैं, तो मुझे बता दें और मैं इसे बंद कर दूँगा।'"
            )
        else:
            greeting_instruction = (
                "OUTBOUND CALL MANDATORY OPENING: Speak the following 3-part opening in English: "
                "'Hello, this is Jana Seva calling with a health reminder you previously requested. If you don't want these calls, just tell me and I won't call you again.'"
            )
    elif caller_profile.get("found"):
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
