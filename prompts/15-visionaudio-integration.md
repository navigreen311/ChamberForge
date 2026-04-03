# Prompt 15: VisionAudioForge Integration (8 Module Touchpoints)
Branch: ai-feature/visionaudio-integration

## Mission
Build VisionAudioForge API integration across all 8 module touchpoints: Client Delivery Portal, Proof-to-Reputation Engine, Trust Pack Studio, Offer Brand Studio, Go-To-Market Lab, Authority Positioning, Pre-Meeting Intel Brief, Delivery Team Trainer.

## What to Build

### Backend
1. **services/integrations/visionaudio_client.py** — VisionAudioForge API client: authenticate, render_presentation, render_dashboard, generate_brand_assets, produce_video, generate_visual_scorecard, get_render_status
2. **services/integrations/visionaudio_delivery.py** — Client Delivery Portal: narrated visual presentations, interactive KPI dashboards, multimedia reports
3. **services/integrations/visionaudio_proof.py** — Visual before/after scorecards, narrated proof walkthroughs, media-ready assets
4. **services/integrations/visionaudio_trust_pack.py** — Multimedia trust packages: narrated video overview, branded credibility deck
5. **services/integrations/visionaudio_brand.py** — Brand identity assets, presentation templates, visual identity system
6. **services/integrations/visionaudio_gtm.py** — Video ad creative, visual landing assets, multimedia outreach sequences
7. **services/integrations/visionaudio_authority.py** — Video clips, narrated insight pieces, visual data storytelling
8. **services/integrations/visionaudio_brief.py** — Visual snapshot for intel briefs: prospect timeline, complexity map
9. **services/integrations/visionaudio_trainer.py** — Video training modules with visual demonstrations, certification tracking
10. **api/v1/visionaudio.py** — All VisionAudioForge integration endpoints
11. **jobs/visionaudio_events.py** — Webhook handler for render completion, asset ready events

### Frontend
1. **app/build/trust-pack/page.tsx** — Update: add multimedia preview with video player
2. **app/build/brand/page.tsx** — Offer Brand Studio with visual identity preview
3. **app/sell/marketing/page.tsx** — Update: add video ad creative preview
4. **app/sell/authority/page.tsx** — Authority Positioning with video content calendar
5. **app/lifecycle/trainer/page.tsx** — Update: add video training module player
6. **components/modules/MultimediaPreview.tsx** — Universal multimedia asset preview (video, presentation, dashboard)
7. **components/modules/BrandIdentityViewer.tsx** — Brand assets gallery with download
8. **components/modules/VideoPlayer.tsx** — Embedded video player for training/proofs/briefs

## Tests
- test VisionAudioForge client with mocked API
- test delivery portal rendering flow
- test brand asset generation
- test webhook event handling

## Commit
feat: add VisionAudioForge integration — delivery portal, proof visuals, brand studio, GTM assets, video training
