# Prompt 14: VoiceForge Integration (6 Module Touchpoints)
Branch: ai-feature/voiceforge-integration

## Mission
Build VoiceForge API integration across all 6 module touchpoints: Persona Simulator (live AI voice roleplay), Pre-Meeting Intel Brief (audio delivery), Secure Comms (encrypted voice), Crisis Mode Console (voice escalation), Client Health Monitor (call sentiment), Delivery Team Trainer (voice certification).

## What to Build

### Backend
1. **services/integrations/voiceforge_client.py** — VoiceForge API client: authenticate, initiate_call, send_audio, get_transcript, get_sentiment_analysis, verify_identity, escalate_crisis
2. **services/integrations/voiceforge_persona_sim.py** — Persona Simulator integration: start_roleplay_session(persona_type: founder|cfo|inheritor|family_office_principal), stream_conversation, score_performance, end_session_with_feedback
3. **services/integrations/voiceforge_intel_brief.py** — Convert text intel brief to 60-second audio for in-transit delivery
4. **services/integrations/voiceforge_secure_comms.py** — Encrypted voice channel setup, passphrase protocol management, identity verification
5. **services/integrations/voiceforge_crisis.py** — Outbound verified voice escalation to principal + CFO + key staff
6. **services/integrations/voiceforge_health.py** — Call sentiment analysis, engagement pattern tracking across client touchpoints
7. **services/integrations/voiceforge_trainer.py** — Voice-based certification modules, scenario assessment, scoring
8. **api/v1/voiceforge.py** — All VoiceForge integration endpoints
9. **jobs/voiceforge_events.py** — Webhook handler for VoiceForge callbacks (call completed, sentiment ready, crisis acknowledged)

### Frontend
1. **app/sell/persona-sim/page.tsx** — Update: add voice roleplay UI with start/stop, live transcript, performance score
2. **app/lifecycle/intel-brief/[clientId]/page.tsx** — Update: add "Listen to Audio Brief" player
3. **app/compliance/comms/page.tsx** — Update: add voice channel status, identity verification controls
4. **app/build/crisis/page.tsx** — Update: add voice escalation controls with status tracking
5. **components/modules/VoiceRoleplay.tsx** — Voice roleplay interface with waveform, transcript, score
6. **components/modules/AudioBriefPlayer.tsx** — Audio player for intel brief delivery
7. **components/modules/VoiceEscalation.tsx** — Crisis voice escalation status tracker

## Tests
- test VoiceForge client with mocked API responses
- test persona simulator session flow
- test crisis escalation sequence
- test webhook event handling

## Commit
feat: add VoiceForge integration — persona simulator, audio briefs, secure comms, crisis escalation, sentiment analysis
