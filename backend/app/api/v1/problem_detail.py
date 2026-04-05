from fastapi import APIRouter
router = APIRouter(prefix="/api/v1/problem-detail", tags=["problem-detail"])

NARRATIVES = {
    "ai-voice-fraud": {
        "narrative": "Cybercriminals are now using AI to clone the voices of trusted family members, CFOs, and attorneys. In the last 12 months, the FBI has documented a 300% increase in AI-enabled impersonation attacks specifically targeting high-net-worth households. A single successful attack can result in wire transfers exceeding $2 million — and most family offices have no verification protocol in place.",
        "simple_narrative": "Bad guys are using computers to copy people's voices and trick rich families into sending money. It's getting worse really fast — 3 times more attacks this year than last year. One trick can cost a family millions of dollars, and most families don't know how to protect themselves.",
        "real_scenario": "Last month, our CFO got a call that sounded exactly like our principal. Same voice, same speech patterns. They requested a $2.3 million wire transfer. If our operations manager hadn't followed the new dual-verification protocol, we would have lost everything.",
        "scenario_attribution": "Family Office CFO, $2.1B AUM",
        "why_wealthy": ["Higher-value targets justify sophisticated AI cloning costs", "More weak links: staff, vendors, older relatives, board members", "68% of family offices lack formal incident response plans"],
        "roi_proof": "One prevented wire fraud pays for 2+ years of fees",
        "client_trigger": "Near-miss incident or peer's security breach",
        "current_solutions": [
            {"approach": "IT managed service provider", "why_it_fails": "Handles corporate infrastructure, not family."},
            {"approach": "Consumer-grade password managers", "why_it_fails": "Solves one vector but not voice cloning or social engineering."},
            {"approach": "Ad hoc training sessions", "why_it_fails": "One-time sessions don't build lasting habits."}
        ],
        "compliance_risk": "none",
        "compliance_risk_note": "",
        "trend_data": [12, 15, 18, 22, 28, 35, 42, 50, 58, 65, 72, 80],
        "competitor_count": 3,
    },
    "coordination-overload": {
        "narrative": "Newly wealthy founders who exit with $10-50M face an immediate lifestyle complexity explosion. Within months, they acquire multiple properties, hire staff, join boards, and begin family travel — all without structures to manage it. The result: missed deadlines, double-booked travel, vendor chaos, and constant anxiety.",
        "simple_narrative": "When someone suddenly gets rich — like selling their company — their life gets really complicated really fast. Suddenly they have 3 houses, 10 workers, and a million appointments. Without help, things fall apart.",
        "real_scenario": "I sold my company for $42 million and suddenly had three houses, a nanny, two drivers, a property manager, and no system connecting any of them. My daughter missed her school play because my calendar synced wrong.",
        "scenario_attribution": "Tech Founder, 18 months post-exit",
        "why_wealthy": ["Every additional property and staff member multiplies coordination", "Founder's time opportunity cost makes DIY management expensive", "No corporate infrastructure — they went from a company with an EA to solo chaos"],
        "roi_proof": "Clients report saving 15-20 hours per week of personal time",
        "client_trigger": "Exit or IPO within 12 months",
        "current_solutions": [
            {"approach": "Executive assistant", "why_it_fails": "One person can't cover 3 properties, 10 vendors, and travel logistics."},
            {"approach": "House manager per property", "why_it_fails": "No coordination between properties. Each manager is siloed."},
            {"approach": "DIY with apps and spreadsheets", "why_it_fails": "Founders don't have time. The system breaks when they travel."}
        ],
        "compliance_risk": "none",
        "compliance_risk_note": "",
        "trend_data": [20, 22, 25, 28, 32, 36, 40, 44, 48, 52, 55, 58],
        "competitor_count": 5,
    },
}

OFFER_PREVIEWS = {
    "ai-voice-fraud": {
        "offer_name": "Family Cybersecurity & Identity Command Center",
        "tagline": "24/7 protection for your family's digital identity and financial communications",
        "price_min": 10000, "price_max": 25000,
        "pricing_model": "Monthly retainer", "delivery_model": "Team",
        "matched_playbook": "family-cyber-command",
        "first_client_path": [
            "Contact 3 estate attorneys or private bankers you know.",
            "Offer a free 30-minute assessment.",
            "Present the retainer with the ROI argument."
        ],
        "objections": [
            {"objection": "We already have IT support", "response": "IT handles your company. This handles your family."},
            {"objection": "We have cyber insurance", "response": "Insurance pays after. This prevents the loss."},
            {"objection": "How do we know you're trustworthy?", "response": "Background checks, NDA, referral-only."}
        ],
        "weekly_hours": 8,
        "startup_cost": "$200-500 in tools and setup",
    },
    "coordination-overload": {
        "offer_name": "Private Operations Office",
        "tagline": "Your family's managed back office — SOPs, vendors, travel, emergencies",
        "price_min": 15000, "price_max": 30000,
        "pricing_model": "Monthly retainer", "delivery_model": "Orchestrated",
        "matched_playbook": "private-ops-office",
        "first_client_path": [
            "Contact 3 estate attorneys or private bankers you know.",
            "Offer a free 30-minute assessment.",
            "Present the retainer with the ROI argument."
        ],
        "objections": [
            {"objection": "We already have IT support", "response": "IT handles your company. This handles your family."},
            {"objection": "We have cyber insurance", "response": "Insurance pays after. This prevents the loss."},
            {"objection": "How do we know you're trustworthy?", "response": "Background checks, NDA, referral-only."}
        ],
        "weekly_hours": 8,
        "startup_cost": "$200-500 in tools and setup",
    },
}

@router.get("/narrative/{problem_id}")
async def get_narrative(problem_id: str):
    if problem_id in NARRATIVES:
        return NARRATIVES[problem_id]
    return {"error": "Problem not found"}, 404

@router.get("/offer-preview/{problem_id}")
async def get_offer_preview(problem_id: str):
    if problem_id in OFFER_PREVIEWS:
        return OFFER_PREVIEWS[problem_id]
    return {"error": "No matching offer"}, 404
