# Plan: Generate Career Crush PRD Document

## What you'll get

A polished, multi-section **Product Requirements Document** for the Career Crush app, delivered as both:
- `CareerCrush_PRD.md` — Markdown source (easy to edit/share)
- `CareerCrush_PRD.pdf` — Formatted PDF (ready to hand off)

Both files saved to `/mnt/documents/` and surfaced as downloadable artifacts in chat.

## PRD structure

The document will be ~15-20 pages and cover every feature I've identified in the codebase:

1. **Executive Summary** — vision, target users, core value prop
2. **User Personas** — Crush Mode user (active job seeker) vs. Climb Mode user (employed, growth-focused)
3. **Onboarding Flow** — 4-step setup, mode selection, theme picker, profile basics
4. **Authentication** — email/password, Google OAuth, forgot password, reset flow
5. **Core Modes**
   - Crush Mode: sprint dashboard, context quiz, weekly brief, "One Move" card, 2x2 sprint goals, streak capture
   - Climb Mode: Career Target quiz, monthly Career Briefing, pillar checklists (Visibility/Network/Skills), momentum map
6. **Home Dashboard** — mode-aware widget grid, customizable widget preferences, quick actions
7. **Widget Catalog** — full list of 20+ widgets across both modes (Today's Momentum, Application Pipeline, Upcoming Interviews, Career Health, Promotion Readiness, Skills Progress, etc.)
8. **Applications Module** — list/map views, application detail page, status pipeline, resume scoring, AI resume optimization & generation
9. **Interview Prep** — AI-powered interview wizard (research + coaching), STAR story integration
10. **Profile Hub**
    - Master Resume Builder
    - Dream Job Profiler (with new ranked priorities UI)
    - Career PATHer (AI roadmap generator, exploratory + goal-oriented modes)
    - Account settings, theme picker, mode switcher, feedback form
11. **Contacts / Network** — contact cards, detail dialog with editable interaction log, follow-up scheduling, connection strength tracking
12. **Track Record** — STAR story builder, AI strength scoring, quick-add wins, usage logging
13. **Goals System** — Crush sprint goals, Climb pillars, custom goals, weekly check-ins, streak tracking
14. **AI Capabilities** — full inventory of edge functions (12): analyze-resume, generate-resume, interview-prep, career-pather, career-briefing, crush-brief, weekly-brief, climb-nudges, analyze-track-record, career-target-summary, crush-context-summary, send-feedback. All powered by Lovable AI Gateway (Gemini/GPT models).
15. **Navigation & UX** — animated top nav bar, sidebar, retro UI design system, theme system (8 color palettes), light/dark mode
16. **Data Model** — overview of 20 database tables and their relationships
17. **Security & Privacy** — RLS policies, per-user data isolation, authenticated edge function calls
18. **Functional Requirements** — feature-by-feature acceptance criteria
19. **Non-Functional Requirements** — performance, accessibility, responsive design
20. **Future / Out of Scope** — items mentioned but not yet built (market intel via Perplexity/Firecrawl, etc.)

## How it'll be built

- Write a Python script using `reportlab` to generate a clean, branded PDF (using the app's actual theme colors as accent) alongside the Markdown source
- QA the PDF by rendering pages to images and visually inspecting for layout issues
- Deliver both files as `<lov-artifact>` downloads

## Note on document storage

`/mnt/documents` is currently flagged as temporarily unavailable in this environment. I'll write to `/home/lovable` as a fallback if needed and let you know — files there are ephemeral but should remain accessible for this session.

Approve and I'll generate the PRD.
