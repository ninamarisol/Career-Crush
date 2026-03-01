

# Redesigning Goal Crusher (Climb Mode) as a Monthly Career Briefing

## The Vision

Replace the current checklist/tracker UI in Climb Mode's Goal Crusher with an **AI-powered Monthly Career Briefing** — a narrative intelligence layer that synthesizes the user's own data into a coaching-style debrief with one high-leverage recommendation.

The current implementation has: 3 pillar cards (Visibility, Network, Skills) with checklists, a streak tracker, AI nudges panel, and a custom goal builder. All of this becomes secondary to the briefing itself.

## What We Can Actually Build

**Data we can synthesize (all in the database already):**
- `applications` — 30-day application volume, companies targeted, statuses, match scores
- `contacts` — network size, last-contacted dates, dormant connections
- `contact_interactions` — interaction frequency, types
- `track_record_entries` — wins logged, visibility actions synced
- `skill_tracking` — hours logged vs targets
- `career_wins` — recent achievements
- `climb_goals` — visibility activities, custom goals, streak data
- `events` — interviews, follow-ups scheduled
- `user_goals` — targets and calibration state

**Market context we can add:**
- Perplexity and Firecrawl connectors are not yet connected, so we cannot add external market intel in this iteration. The briefing will be powered entirely by the user's internal data, which is substantial.

**AI model:** `google/gemini-2.5-flash` via Lovable AI gateway (no API key needed).

## Architecture

### 1. New Edge Function: `career-briefing`

Receives the user's 30-day data snapshot and generates a structured briefing via the AI gateway. The prompt instructs the model to act as an executive career coach producing:

- **Retrospective** — plain-language summary of the last 30 days across all dimensions
- **Patterns** — what the data reveals (e.g., "Your network activity dropped 40% vs. last month")  
- **Blind Spots** — what the user might not be seeing (e.g., "You've logged 12 wins but none are quantified with impact metrics")
- **The One Move** — the single highest-leverage action for the coming month
- **Forward Brief** — 2-3 supporting actions tied to the one move

Returns structured JSON that the UI renders as a narrative card.

### 2. Database: `career_briefings` table

Stores generated briefings so users can revisit past months without re-generating. Schema:
- `id`, `user_id`, `month_key` (e.g. "2026-02"), `briefing_data` (JSONB), `generated_at`, `created_at`
- Unique constraint on `(user_id, month_key)`
- RLS: users can only read/write their own rows

### 3. UI Overhaul: `ClimbModeGoals.tsx`

Replace the current layout with:

```text
┌─────────────────────────────────────────────┐
│  February Career Briefing                   │
│  ─────────────────────────────────────────  │
│                                             │
│  YOUR LAST 30 DAYS                          │
│  [2-3 sentence narrative retrospective]     │
│                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ 12 apps │ │ 8 wins  │ │ 3 skills│       │
│  │ Applied │ │ Logged  │ │ On Track│       │
│  └─────────┘ └─────────┘ └─────────┘       │
│                                             │
│  WHAT THE DATA SAYS                         │
│  • Pattern insight 1                        │
│  • Pattern insight 2                        │
│                                             │
│  WHAT YOU'RE NOT SEEING                     │
│  • Blind spot 1                             │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  🎯 YOUR ONE MOVE FOR MARCH        │    │
│  │  [Bold recommendation text]         │    │
│  │                                     │    │
│  │  Supporting actions:                │    │
│  │  1. Action tied to the move         │    │
│  │  2. Action tied to the move         │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [Regenerate Briefing]                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Monthly Streak: 3 consecutive months       │
└─────────────────────────────────────────────┘
```

The three pillar tracker cards and checklists move to a collapsible "Activity Log" section below the briefing — they still exist for logging actions, but they're no longer the primary experience.

### 4. Home Widget Update: `ClimbWidgets.tsx`

The Goal Crusher monitor card on the home page changes from pillar progress bars to a teaser of the briefing's "One Move" recommendation, with a CTA to read the full briefing.

### 5. Goals Page Update: `Goals.tsx`

The Climb Mode branch renders the new briefing-first layout instead of directly rendering `ClimbModeGoals` as the primary view.

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/career-briefing/index.ts` | **Create** — new edge function |
| Migration for `career_briefings` table | **Create** — new table with RLS |
| `src/components/goals/ClimbModeGoals.tsx` | **Major rewrite** — briefing-first layout |
| `src/components/home/ClimbWidgets.tsx` | **Modify** — update Goal Crusher monitor widget |
| `src/pages/Goals.tsx` | **Minor update** — pass briefing data |
| `src/hooks/useGoalCrusher.tsx` | **Extend** — add briefing fetch/cache logic |

## Technical Details

**Edge function data gathering:** The function receives a pre-assembled data snapshot from the client (applications count, network stats, wins, skills, visibility actions, streak). This avoids the function needing its own DB queries and keeps auth simple.

**AI prompt structure:** The system prompt establishes the "executive coach doing a monthly debrief" persona. The user prompt contains the raw data snapshot. Response is structured JSON with fields: `retrospective`, `stats`, `patterns`, `blindSpots`, `oneMove`, `supportingActions`.

**Caching:** Briefings are stored in `career_briefings`. On page load, if a briefing exists for the current month, it's displayed immediately. A "Regenerate" button allows refreshing. This prevents unnecessary AI calls on every page visit.

**Streak preservation:** The monthly streak tracker remains — it still tracks whether the user completes >= 70% of their activities. The activity logging UI (pillar checklists) moves to a collapsible section so it's still functional but subordinate to the briefing narrative.

