# Day 10 — Share Your Voice Agent Journey | #VoiceForBharat Challenge 🇮🇳🎙️

Day 10 of the **Murf AI 10 Days of Voice Agents — VoiceForBharat Edition** challenge!

Today marks the conclusion of our 10-day journey building **Jana Seva**, an AI Voice Assistant for Health Access in India.

Instead of just building another chatbot, we explored how voice AI can make public health services—hospital lookup, scheme guidance (Ayushman Bharat, JSY, PMMVY), medication reminders, human support escalation, and appointment guidance—truly accessible for non-technical users.

### 🌟 Key Engineering Milestones Built (Days 1–9):
1. **Sub-Second Voice Pipeline**: Murf Falcon TTS (hi-IN / EN) + Deepgram Nova-3 STT + Google Gemini LLM over WebRTC transport.
2. **Responsible Non-Diagnostic Limits**: Strict refusal to diagnose or prescribe; immediate 108 emergency ambulance advisories for red flags.
3. **User Memory with Explicit Consent**: Persistent SQLite profile lookup requiring out-loud caller agreement before saving health facts.
4. **Live Data & Freshness Timestamps**: Real-time OpenStreetMap hospital location lookup and Open-Meteo Air Quality (AQI) advisories.
5. **Outbound SIP Calling & Opt-Out**: Twilio SIP trunk integration with mandatory 3-part opening and 1-click caller opt-out memory persistence.
6. **Human Help Escalation Protocol**: PII-sanitized summaries logging reference IDs (`JS-2026-XXXX`) to a support dashboard.
7. **Call Analytics Dashboard**: Real-time operational metric tracking for total calls, success rates, and live session history.
8. **Multi-Agent Specialist Handoff**: Session agent switching to a dedicated **Clinic & Appointment Specialist** with zero-repetition context transfer!

📖 **Read our full technical blog post & developer guide**:
[From a Simple Voice Bot to a Responsible Health Access Agent: Building Jana Seva in 10 Days](https://github.com/lightcode01-oss/murf-livekit-starter/tree/main/docs/DAY10_BLOG_POST.md)

💻 **Explore the GitHub Repository**:
https://github.com/lightcode01-oss/murf-livekit-starter

Huge thanks to @Murf AI for organizing the #VoiceForBharat challenge!

#VoiceForBharat #VoiceAgents #MurfAI #LiveKit #Python #NextJS #AI #PublicHealth #MultiAgent #AIForGood
