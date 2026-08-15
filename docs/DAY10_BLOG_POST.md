# From a Simple Voice Bot to a Responsible Health Access Agent: Building Jana Seva in 10 Days

*A technical postmortem and developer guide on building a voice-first, Indian-language public health access AI assistant using Murf Falcon TTS, LiveKit, Deepgram, and Gemini.*

---

## Executive Summary & Overview

Healthcare information and public service navigation in India present a significant UX challenge. Millions of citizens interact with public health systems— Primary Health Centres (PHCs), Community Health Centres (CHCs), government schemes like Ayushman Bharat (PM-JAY), Janani Suraksha Yojana (JSY), and vaccination drives. However, traditional digital access points require users to:
1. Read dense English/Hindi text on mobile browsers.
2. Navigate multi-nested web menus and government portals.
3. Formulate precise text queries in standardized search bars.

For many users—particularly in rural communities, elder care settings, or low-literacy regions—typing and text navigation create high interaction friction. Voice conversation provides a far more natural and accessible model.

**Jana Seva** ("People's Service") was built during the **Murf AI 10 Days of Voice Agents — VoiceForBharat Edition** challenge to explore how real-time AI voice agents can bridge this accessibility gap. Over 10 days of iterative engineering, Jana Seva evolved from a simple text-to-speech chatbot into a robust, responsible, multi-agent voice application equipped with real-world health data lookup, persistent user memory with consent, human escalation protocols, real-time call operational analytics, and specialized sub-agent handoffs.

This article details the architecture, code implementation, engineering challenges, responsible AI guardrails, and step-by-step developer guide for building production-grade voice agents.

---

## 1. Feature Audit Matrix: What Was Actually Built

Before diving into architecture, here is an audited breakdown of the features actually present, verified, and tested in the [Jana Seva codebase](https://github.com/lightcode01-oss/murf-livekit-starter):

| Feature | Status | Evidence in Codebase | Description |
| :--- | :--- | :--- | :--- |
| **Real-time Voice Pipeline** | Implemented | `backend/src/agent.py:L665-685` | Deepgram Nova-3 STT + Google Gemini 3.5 Flash Lite + Murf Falcon TTS + LiveKit WebRTC transport |
| **Domain Prompt System** | Implemented | `backend/src/prompt.py` | Dr. Swasthya Sathi identity, public scheme guidance, short voice-optimized sentence structure |
| **User Memory & Consent** | Implemented | `backend/src/memory/database.py`, `service.py` | Persistent SQLite user profile lookup & explicit consent requirement before saving health facts |
| **Safety & Non-Diagnostic Limits**| Implemented | `backend/src/agent.py:L307-350`, `sanitizer.py` | Refusal to diagnose/prescribe, emergency symptom triage, PII scrubbing |
| **Live Internet Data Lookup** | Implemented | `backend/src/health_data.py`, `agent.py:L435-597` | Live OSM Nominatim hospital lookup + Open-Meteo Air Quality (AQI) with spoken freshness timestamps |
| **Outbound SIP Calling** | Implemented | `backend/src/outbound_service.py`, `outbound_call.py` | Twilio SIP trunk integration, E.164 phone masking, mandatory 3-part opening, caller opt-out |
| **Human Escalation Workflow** | Implemented | `backend/src/memory/database.py`, `escalation_api.py` | Reference ID `JS-2026-XXXX` generation, permission-gated logging, frontend support dashboard |
| **Call Analytics Dashboard** | Implemented | `backend/src/analytics_api.py`, `app/analytics/page.tsx` | Real-time call tracking (total calls, success/failure rate, session history, live sync) |
| **Specialist Agent Handoff** | Implemented | `backend/src/agent.py:L598-885`, `test_handoff.py` | LiveKit session agent switching to `Clinic & Appointment Specialist` with zero-repetition context transfer |

---

## 2. System Architecture & Real-Time Voice Transport

A voice AI agent requires far tighter latency budgets than traditional web chat applications. In a text chat, a 2-second LLM delay is acceptable. In a voice conversation, a pause exceeding 1 second feels unnaturally dead and causes users to interrupt or speak over the agent.

To achieve conversational fluidity, Jana Seva couples **Murf Falcon TTS** (offering sub-100ms model latency) with **LiveKit Agents WebRTC transport**, **Deepgram Nova-3 multilingual STT**, and **Google Gemini LLM**.

```text
                                  ┌───────────────────────────┐
                                  │   Browser / Phone User    │
                                  └─────────────┬─────────────┘
                                                │
                                    WebRTC Audio Stream (Opus)
                                                │
                                                ▼
                                  ┌───────────────────────────┐
                                  │      LiveKit Server       │
                                  └─────────────┬─────────────┘
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 │                              │                              │
                 ▼                              ▼                              ▼
    ┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────┐
    │  Deepgram STT (Nova-3)   │   │ Google Gemini 3.5 Lite   │   │  Murf Falcon Streaming   │
    │  Multilingual Endpointing│   │ Tool Calling & Reasoning │   │  HI-IN / EN Conversational│
    └──────────────────────────┘   └──────────────────────────┘   └──────────────────────────┘
```

### Audio Pipeline Control Flow
1. **Audio Capture**: The user's microphone audio is captured in the browser via WebRTC (Opus encoded at 48kHz).
2. **Speech Recognition**: LiveKit streams PCM audio frames directly to **Deepgram Nova-3 STT** using multilingual endpointing (`min_endpointing_delay=0.7s`, `max_endpointing_delay=3.0s`).
3. **Agent Loop & Tool Evaluation**: Deepgram emits final text transcripts. The **LiveKit Agent Session** passes transcript tokens to Gemini LLM. If Gemini detects a tool call (e.g. `fetch_nearest_phc_facility` or `handoff_to_clinic_specialist`), the tool executes asynchronously.
4. **Speech Synthesis**: Response text is chunked into natural sentence boundaries by `SentenceTokenizer` and streamed to **Murf Falcon TTS** (`voice="Anisha"`, `locale="hi-IN"`, `text_pacing=True`).
5. **Playback**: Murf Falcon streams PCM audio back over LiveKit WebRTC to the browser speakers.

---

## 3. Deep Dive into Key Engineering Subsystems

### 3.1 Safety Guardrails & Emergency Triage
In a public health context, an AI assistant must never attempt to replace a doctor, interpret complex diagnostic imagery, or prescribe dosages. 

Jana Seva enforces a clear 3-tier boundary:
1. **General Health Access Information**: Document requirements, scheme benefits (e.g., Ayushman Bharat eligibility), clinic opening hours -> Answered directly.
2. **Diagnosis & Clinical Judgment Requests**: Handled by explaining agent limitations and offering permission-gated human escalation.
3. **Emergency Red-Flag Symptoms**: Severe chest pain, respiratory distress, unconsciousness -> Immediate emergency ambulance advisory (108) + urgent escalation trigger.

#### Code Snippet: Symptom Triage Tool (`backend/src/agent.py`)
```python
@function_tool
async def triage_symptom(
    self,
    context: RunContext,
    symptom: str,
    duration_days: int = 1,
    severity: str = "moderate",
) -> str:
    """Evaluate patient symptoms and provide preliminary triage advice and referral guidance."""
    symptom_lower = symptom.lower()
    if any(w in symptom_lower for w in ["chest pain", "breathing", "unconscious", "heavy bleeding", "convulsion"]):
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
            "If symptoms worsen, visit local ASHA worker or PHC clinic."
        )
```

---

### 3.2 User Memory with Consent Workflow
Voice interfaces should feel personalized for returning callers (remembering their preferred language, district, or ongoing non-sensitive health categories). However, storing health information without explicit consent violates user trust and privacy principles.

Jana Seva implements a 3-step memory flow:
1. **Recognize Candidate Facts**: Detect caller name, language preference, age band, or non-sensitive health facts.
2. **Explicit Consent Prompt**: Ask out loud before saving (*"Got it! Would you like me to remember that for your future conversations?"*).
3. **Persist or Decline**: Execute `save_caller_memory` only when explicit user agreement is received.

#### Code Snippet: SQLite Caller Profile Management (`backend/src/memory/service.py`)
```python
def save_caller_memory(
    self,
    user_id: str,
    name: str = "",
    language_preference: str = "",
    facts: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """Save caller-approved information to persistent memory after explicit permission."""
    if not user_id:
        return {"success": False, "message": "No valid user_id provided."}
    
    success = self.db.upsert_user(
        user_id=user_id,
        name=name,
        language_preference=language_preference,
        facts=facts,
    )
    return {"success": success, "message": f"Caller memory updated for {user_id}."}
```

---

### 3.3 Real-World Internet Data Integrations with Spoken Timestamps
A health assistant must not hallucinate hospital addresses or air quality levels. Jana Seva integrates live APIs with fallback cached registries:
- **OpenStreetMap Nominatim API**: Dynamically searches nearby Primary Health Centres (PHCs) and government hospitals.
- **Open-Meteo Air Quality API**: Fetches live PM2.5, PM10, and US AQI environmental warnings.
- **Spoken Timestamping & Failure Guidance**: When presenting live data, the agent explicitly states the freshness of the data out loud (*"Based on live health directory data updated as of today..."*). If live APIs time out, the agent gracefully informs the caller and presents cached registry fallback data without breaking the call.

---

### 3.4 Human Help Escalation & Consent Flow (Day 7)
When a user requests clinical diagnosis or presents red-flag symptoms, Jana Seva generates a human support escalation record.

```text
[User Request] ──► [Permission Prompt] ──► [Explicit Yes] ──► [PII Sanitizer] ──► [Generate Reference ID JS-2026-XXXX] ──► [DB Entry & Web Dashboard]
```

- **Permission Gated**: `create_escalation` aborts immediately if `permission_confirmed=False`.
- **PII Scrubbing**: `sanitizer.py` strips passwords, OTPs, PINs, bank details, and tokens.
- **Collision-Free Reference ID**: Generates structured reference IDs (`JS-2026-XXXX`)spoken out loud to the caller for tracking on the `/escalations` dashboard.

---

### 3.5 Call Analytics Dashboard (Day 8)
Operational visibility is essential for monitoring agent performance. Jana Seva records session analytics in an SQLite `calls` table:
- **Metrics Tracked**: Total calls, successful calls, failed calls, success rate (%), channel (`browser` vs `sip`), call duration in seconds, failure reasons (`agent_error`, `incomplete_task`).
- **Live Sync API**: React frontend fetches `/api/analytics` for live status displays.

---

### 3.6 Multi-Agent Specialist Handoff (Day 9)
As voice applications grow, a single system prompt becomes overloaded with conflicting rules. On Day 9, Jana Seva introduced a **Specialist Agent Handoff Architecture**.

```text
                          ┌─────────────────────┐
                          │    Jana Seva        │
                          │   Main Agent        │
                          │ Health Access       │
                          └──────────┬──────────┘
                                     │
                      handoff when appointment/
                      clinic assistance is needed
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │ Clinic & Appointment│
                          │ Specialist Agent    │
                          └─────────────────────┘
```

#### Zero-Repetition Handoff Execution
1. **Main Agent Announcement**: Tells caller out loud (*"I'll connect you with our Clinic & Appointment Specialist, who can help you with the appointment process."*).
2. **Context Packaging**: Packages `user_request`, `conversation_summary`, `user_language`, and known location.
3. **Session Agent Switch**: Calls `context.session.update_agent(specialist)`.
4. **Participant Attribute Sync**: Updates LiveKit local participant attributes (`active_agent: "Clinic & Appointment Specialist"`), triggering visual badge updates on the React UI.
5. **Specialist Introduction**: Specialist takes over naturally without asking *"How can I help you?"* (*"Hi, I'm Jana Seva's Clinic & Appointment Specialist. I understand you're looking for help with a general health consultation appointment. Let's get that sorted."*).

---

## 4. The Architectural Lesson: Why One Agent Shouldn't Do Everything

During early development (Days 1–5), it was tempting to place all tools, health scheme rules, symptom triage, medication reminders, clinic lookup, and appointment logic into one massive system prompt.

However, as instruction complexity increased, LLMs exhibited several failure modes:
1. **Instruction Bleed**: Main agent would prematurely trigger appointment booking tools during general informational queries.
2. **Increased Prompt Token Latency**: System prompts exceeding 2,000 tokens slowed down first-token response times.
3. **Difficult Testing**: Testing prompt tweaks for emergency triage accidentally degraded performance on hospital document lookup.

### The Specialist Sub-Agent Pattern
Splitting the application into `MainAssistant` and `ClinicSpecialist` provided clear architectural advantages:
- **Smaller Prompt Footprints**: Each agent maintains a focused, deterministic system prompt.
- **Explicit Capabilities**: `ClinicSpecialist` only registers tools relevant to clinic discovery, department navigation, and appointment preparation.
- **Reusable Lifecycle**: The specialist agent can trigger `handback_to_main_agent` when the appointment task completes or if the user asks an unrelated general health query.

---

## 5. The Hard Parts: Real Engineering Challenges Encountered

### Challenge 1: Asynchronous Task Lifecycle in Python (`RUF006`)
- **Problem**: When triggering background speech generation (`context.session.generate_reply`) or participant attribute updates inside async tool calls, Python garbage collection occasionally dropped un-referenced `asyncio.create_task()` instances, causing intermittent handoff failures.
- **Cause**: Pytest and `ruff` flagged un-retained tasks via rule `RUF006`.
- **Solution**: Created a centralized task tracking helper `_run_bg_task(coro)` in `agent.py` storing strong references in a module-level set until task completion:
  ```python
  _background_tasks: set[asyncio.Task[Any]] = set()

  def _run_bg_task(coro: Any) -> asyncio.Task[Any]:
      task = asyncio.create_task(coro)
      _background_tasks.add(task)
      task.add_done_callback(_background_tasks.discard)
      return task
  ```

### Challenge 2: Synchronous Mock vs. Async Execution in Unit Testing
- **Problem**: LiveKit Agents SDK testing framework expects `generate_reply` and `set_attributes` to return coroutines, but standard `MagicMock()` returns non-awaitable objects during unit testing.
- **Solution**: Updated tool handlers in `agent.py` to inspect return types with `inspect.iscoroutine(res)` before wrapping in background tasks, and configured unit tests in `test_handoff.py` using `unittest.mock.AsyncMock`.

### Challenge 3: Maintaining Audio Stream Continuity Across Agent Transitions
- **Problem**: Early handoff experiments caused WebRTC audio dropouts or forced browser reconnects when switching agents.
- **Solution**: Utilized native LiveKit Agents `AgentSession.update_agent(new_agent)` API. Because `update_agent` operates in-place on the active `AgentSession`, the underlying WebRTC audio tracks, STT pipeline, VAD models, and Murf Falcon TTS connections remain fully active without audio interruptions.

---

## 6. Responsible AI Principles for Health Voice Agents

Building voice AI for health access requires higher standards than building general entertainment bots. Jana Seva strictly follows 7 responsible AI principles:

1. **Explicit Identity Disclosure**: Always introduces itself as an AI Health Access assistant, never as a medical doctor.
2. **Strict Non-Diagnostic Boundaries**: Never provides definitive medical diagnoses or drug prescriptions.
3. **Emergency Priority**: Immediate 108 ambulance advisories for red-flag symptoms (chest pain, respiratory distress).
4. **Consent-Gated Data Persistence**: Asks permission out loud before saving user memory.
5. **Permission-Gated Escalation**: Shared summaries are sanitized of PII and require explicit user consent.
6. **Data Freshness Transparency**: Explicitly announces timestamps for live data and reports API timeouts out loud.
7. **Graceful Fallback**: If network tools fail or specialist handoffs encounter errors, the main agent falls back gracefully without hanging the call.

---

## 7. How to Build Your Own Voice Agent: Practical Setup Guide

Follow these steps to set up and run Jana Seva locally.

### 7.1 Prerequisites
- **Python 3.10+**
- **[uv](https://docs.astral.sh/uv/)** package manager
- **Node.js 18+** & **pnpm**
- **LiveKit Cloud** account (or local LiveKit server executable)
- **Murf AI API Key**
- **Deepgram API Key**
- **Google Gemini API Key** (or OpenAI API Key)

---

### 7.2 Step-by-Step Setup

#### Step 1: Clone Repository
```bash
git clone https://github.com/lightcode01-oss/murf-livekit-starter.git
cd murf-livekit-starter
```

#### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local` in both `backend/` and `frontend/`:

**`backend/.env.local`**:
```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

MURF_API_KEY=your_murf_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
GOOGLE_API_KEY=your_google_gemini_api_key

# Optional Twilio Telephony Credentials for Outbound Calls
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
LIVEKIT_SIP_TRUNK_ID=ST_your_trunk_id
```

**`frontend/.env.local`**:
```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
```

#### Step 3: Install Backend Dependencies
```bash
cd backend
uv sync
uv run python src/agent.py download-files
```

#### Step 4: Install Frontend Dependencies
```bash
cd ../frontend
pnpm install
```

#### Step 5: Run Local Application
Run LiveKit dev server, backend agent, and frontend client:

**Backend Agent**:
```bash
cd backend
uv run python src/agent.py dev
```

**Frontend App**:
```bash
cd frontend
pnpm dev
```

Open browser at `http://localhost:3000` and click **"Talk to Jana Seva"**.

---

### 7.3 Running the Test Suite
Validate all 42 backend unit and evaluation tests:
```bash
cd backend
uv run pytest
```

Run code linter:
```bash
uv run ruff check .
```

---

## 8. Code Examples from the Build

### 8.1 Specialist Handoff Tool (`backend/src/agent.py`)
```python
@function_tool
async def handoff_to_clinic_specialist(
    self,
    context: RunContext,
    user_request: str,
    conversation_summary: str = "",
    user_language: str = "",
    known_user_context: str = "",
) -> str:
    """Hand off conversation to Clinic & Appointment Specialist."""
    lang = user_language or self.caller_profile.get("language_preference") or "English"
    clean_summary = sanitize_text(conversation_summary or f"Request: {user_request}")
    clean_request = sanitize_text(user_request)

    random_num = random.randint(1000, 9999)
    handoff_id = f"HO-2026-{random_num:04d}"

    if self.call_id and self.memory_service:
        self.memory_service.log_handoff(
            handoff_id=handoff_id,
            call_id=self.call_id,
            from_agent="main",
            to_agent="clinic_appointment_specialist",
            reason=clean_request,
            success=True,
        )

    specialist = ClinicSpecialist(
        memory_service=self.memory_service,
        caller_id=self.caller_id,
        caller_profile=self.caller_profile,
        call_id=self.call_id,
        channel=self.channel,
        call_tracker=self.call_tracker,
        user_request=clean_request,
        conversation_summary=clean_summary,
        user_language=lang,
        known_user_context=known_user_context,
    )

    # Switch agent on live WebRTC session in-place
    context.session.update_agent(specialist)

    # Update participant metadata for React UI badge
    if context.session.room and context.session.room.local_participant:
        res = context.session.room.local_participant.set_attributes(
            {"active_agent": "Clinic & Appointment Specialist", "agent_role": "specialist"}
        )
        if inspect.iscoroutine(res):
            _run_bg_task(res)

    intro_instruction = f"SPECIALIST INTRO: Introduce yourself warmly in {lang}: 'Hi, I\'m Jana Seva\'s Clinic & Appointment Specialist. I understand you\'re looking for help with {clean_request}. Let\'s get that sorted.'"
    reply_res = context.session.generate_reply(instructions=intro_instruction)
    if inspect.iscoroutine(reply_res):
        _run_bg_task(reply_res)

    return json.dumps({"status": "handoff_successful", "handoff_id": handoff_id})
```

---

## 9. Future Roadmap & Next Steps

While Jana Seva has achieved full functional coverage across Days 1–9, future iterations can expand its impact:
1. **Expanded Regional Indian Language Voices**: Incorporating additional regional Indian accents and dialects via Murf Falcon's growing voice library (e.g. Odia, Bengali, Tamil, Telugu, Marathi).
2. **Direct Hospital OPD API Integration**: Connecting appointment preparation workflows directly to state e-Hospital and ABHA (Ayushman Bharat Health Account) APIs for verified live booking slots.
3. **Off-line / Edge STT & VAD**: Optimizing local Silero VAD models for ultra-low bandwidth rural connectivity environments.

---

## 10. Project Links & Resources

- **GitHub Repository**: [github.com/lightcode01-oss/murf-livekit-starter](https://github.com/lightcode01-oss/murf-livekit-starter)
- **Murf AI Falcon TTS**: [murf.ai/api/docs](https://murf.ai/api/docs)
- **LiveKit Agents SDK**: [docs.livekit.io/agents](https://docs.livekit.io/agents)
- **Deepgram STT**: [developers.deepgram.com](https://developers.deepgram.com)
