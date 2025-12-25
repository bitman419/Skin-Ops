
# SKIN OPS — Product Strategy & Spec

========================
SECTION 1 — Elevator pitch
========================
- **Pitch:** SKIN OPS is a tactical skin intelligence dashboard that replaces guesswork with a real-time "Barrier Health Score" to decide exactly which actives your skin can handle *right now*.
- **Why it will blow up:**
  - **Behavior Change:** Users check it like a weather app before their routine (daily friction-killer).
  - **Virality:** Shareable "Rest Streaks" and "Barrier Score" cards gamify restraint in a world of over-exfoliation.
  - **Painkiller Angle:** Solves the "Skincare Anxiety" of wondering if a new product will cause a breakout or chemical burn.

========================
SECTION 2 — Target users
========================
1. **The Retinoid Rookie (22-35):**
   - Profile: Active lifestyle, starting anti-aging or acne treatment, high FOMO on trending products.
   - Pain Points: Peeling, "retinoid uglies", confusing conflicts, forgetting sunscreen, redness.
   - Success: Glow without irritation; consistent usage 3x weekly.
2. **The Shaving Struggler (18-45):**
   - Profile: Frequent shaving, gym-goer, minimal routine but prone to "bumps".
   - Pain Points: Razor burn vs. benzoyl peroxide stinging, sweat-induced acne, time-poor, simple products only.
   - Success: Zero razor bumps; clear neck area; routine under 2 minutes.
3. **The Skincare Minimalist (30-50):**
   - Profile: High-end single-active user, data-driven, barrier-conscious.
   - Pain Points: Dry cabin air from travel, unexpected sensitivity, hyperpigmentation recovery, pollution.
   - Success: Resilient barrier (score 80+); no "mystery" flare-ups.

========================
SECTION 3 — Features roadmap
========================
**MVP (Fast Build):**
1. Barrier Score Gauge (Heuristic logic)
2. Symptom Pulse (Fast toggle log)
3. Environment Sync (UV/Humidity via API)
4. "Go/No-Go" logic for 5 core actives
5. Manual routine log
6. Emergency Mode (Red score trigger)
7. Basic Product Repository
8. Safety Disclaimers
**Non-negotiables:** Barrier Score, GO/NO-GO Engine, UV-Sync.

**V1:** Barcode scanner, ingredient conflict detector, push notification "UV Slaps", and photo journals.
**V2:** ML-driven score refinement based on user outcomes, dermatologist chat-link, localized pollution data.
**Ruthless Cut:** Social feeds. Focus on *utility* first. Social is a distraction from the decision engine.

========================
SECTION 4 — Data inputs needed
========================
A) **User profile:** Goals, Sensitivity (1-10), Shave status, Fragrance tolerance, Active tolerance baseline.
B) **Routine history:** Last 7 days product category + active strength + timestamp.
C) **Symptoms:** Stinging, redness, peeling, dryness, burning (binary toggles).
D) **Environment:** UV Index (photosensitivity), Humidity (TEWL risk), Temperature, Sweat level today.
E) **Optional:** Progress photos (no diagnosis, only visual tracking).

========================
SECTION 5 — Barrier Health Score (0–100)
========================
- **Score:** Combined integrity + recovery capacity.
- **Bands:** 0–30 (Critical), 31–55 (Compromised), 56–75 (Stable), 76–100 (Resilient).
- **Update Rules:**
  - Baseline: 100.
  - Penalties: -20 per day for AHA/BHA (if used >2 days in row), -15 for Retinoids (if stinging reported), -30 for any burning after washing.
  - Decay: -5 on low humidity (<25%) or high UV (>7) days.
  - Recovery: +10 for "Rest Days" (no actives), +5 for consistent sunscreen use (7 days streak).
- **Windows:** 
  - Over-exfoliation: 5-day mandatory active pause if score < 40.
  - Sunburn: 3-day active pause + occlusive-only suggestion.

========================
SECTION 6 — Rules Engine Logic
========================
- **Priority:** Barrier Score > Symptoms > Environment > Conflict.
- **Conflicts:**
  - Retinoid + Benzoyl Peroxide = RED (unless formulated together).
  - L-Ascorbic Acid + AHA = YELLOW (low pH overload).
- **Special Conditions:**
  - **Shaving Day:** If Shaving=YES, Active(Exfoliant)=RED for 12 hours.
  - **UV 7+:** Retinoid=YELLOW/RED (PM use only).
  - **Humidity <25%:** Hyaluronic Acid=YELLOW (suggestion: apply to damp skin + occlusive).

========================
SECTION 7 — Pseudocode (Summary)
========================
`updateBarrierScore`: Inputs current state + logs -> returns 0-100 score using weighted deductions.
`canUseProductToday`: Checks score + env + conflicts -> returns {status, reason, suggestion}.
`generateTodayRoutine`: Map product list against `canUseProductToday` for AM/PM buckets.

========================
SECTION 8 — UX Flows
========================
A) **Onboarding:** 4 screens (Skin type, Goals, Sensitivity, Current Routine). < 90s.
B) **Check-in:** Home screen swipe-up -> Toggle 5 symptoms -> Done. < 30s.
C) **Add Product:** Scan barcode -> Fetch API -> Flag actives -> Save.
D) **Today Routine:** Big Green/Red cards for the shelf items.
E) **Emergency Mode:** Full screen red-wash if score drops below 30. "OPS LOCKDOWN: No actives permitted."

========================
SECTION 9 — UI Wireframes
========================
1. **Home:** Top: Barrier Score Gauge; Middle: Env Stats; Bottom: Routine items.
2. **Routine:** List of "Safe" vs "Risk" products for the morning/evening.
3. **Add Product:** Camera viewfinder + auto-recognition of ingredients.
4. **Score Detail:** 7-day trend line + "What hurt you" list.
5. **Trends:** Correlation between humidity and dryness reports.

========================
SECTION 10 — Database Schema
========================
- **Users:** (id, profile_json, current_score, last_checkin)
- **Products:** (id, name, actives[], strength)
- **Routine_Logs:** (id, user_id, product_id, timestamp)
- **Symptom_Logs:** (id, user_id, flags[], score_delta)
- **Environment:** (id, lat, long, uv, humidity, timestamp)
- **Conflict_Rules:** (active_a, active_b, severity, message)

========================
SECTION 11 — MVP 14-Day Build
========================
- Day 1-2: Logic Validation + UI Design System.
- Day 3-5: Engine Coding (Typescript) + Supabase Setup.
- Day 6-8: Environment API + Barrier Score Logic.
- Day 9-10: Routine Generation + "Ops" UI.
- Day 11-12: Scan integration (Barcode lookup API).
- Day 13: QA + Safety Testing.
- Day 14: Launch (Internal/Beta).

========================
SECTION 12 — Tech Stack
========================
**Next.js + Supabase (Mobile-first PWA):**
- **Why:** Fastest time-to-market. No App Store review delays for logic tweaks. Instant updates for rules.
- **Services:** Auth (Supabase), DB (PostgreSQL), Storage (Images), Functions (Engine calculation).
- **Cost:** Free tier for MVP.

========================
SECTION 13 — Viral Hooks
========================
1. **Skin Risk Card:** "My skin is at 84% Resilience. UV is high. Retinol is a NO today."
2. **Conflict Warning:** Shareable "Science-y" alert when someone tries to mix incompatible acids.
3. **Rest Streaks:** "3 days of barrier recovery" badge.
4. **UV Slap:** Aggressive notification: "UV IS 9. GET THE SHIELD ON."
5. **Community Benchmarks:** "80% of users in [Your City] are reporting dryness today. Add an occlusive."

========================
SECTION 14 — Safety & Compliance
========================
- **Disclaimer:** "Informational only. Not medical advice."
- **Red Flags:** Trigger "Seek Professional Care" if bleeding, weeping, severe swelling, or spreading rash.
- **Safe Phrasing:** Use "Stable/Resilient" instead of "Healthy"; "Compromised" instead of "Damaged".

========================
SECTION 15 — Product Spec Summary
========================
**Name:** SKIN OPS
**Tagline:** Skincare intelligence for tactical barrier defense.
**Problem:** People over-exfoliate and cause chemical burns because they don't know their current barrier limit.
**Solution:** A heuristic score that adjusts based on symptoms, history, and the weather.
**Monetization:** Freemium (Core score free; V1 barcode scan limit -> Premium).
