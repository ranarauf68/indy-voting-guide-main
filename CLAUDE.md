# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm start         # dev server at http://localhost:3000
npm run build     # production build → build/
npm test          # run tests (CRA default Jest setup)
```

## Environment Variables

Requires a `.env` file with:
```
REACT_APP_CIVIC_API_KEY=...     # Google Civic Information API
REACT_APP_GEMINI_API_KEY=...    # Google Gemini API
```

## Architecture

**No React Router.** Navigation is entirely state-driven in [App.js](src/App.js): `currentPage` (1–4) controls which page renders, with `window.history.pushState` for browser back-button support. The Admin portal is overlaid via a `showAdmin` boolean, accessible at `/admin` path on load.

**Four user-facing pages:**
- **Page 1** ([src/pages/Page1.js](src/pages/Page1.js)) — Landing page with address/zip form, candidate search bar, and embedded chatbot. Calls Google Civic API (`/voterinfo` then falls back to `/divisionsByAddress`) to extract state and congressional district.
- **Page 2** ([src/pages/Page2.js](src/pages/Page2.js)) — Race selection (House/Senate/Governor) filtered by `GOVERNOR_STATES_2026` and `SENATE_STATES_2026` allowlists.
- **Page 3** ([src/pages/Page3.js](src/pages/Page3.js)) — Side-by-side candidate comparison. First tries the database (`/candidates?raceId=...`), then falls back to Gemini AI with Google Search to discover candidates and fetch per-issue positions. Issues are fetched one at a time with a 200ms sleep between each.
- **CandidatePage** ([src/pages/CandidatePage.js](src/pages/CandidatePage.js)) — Single-candidate detail view reached from the search bar on Page 1.

**Admin portal** ([src/pages/Admin.js](src/pages/Admin.js)) — Password-authenticated CRUD interface against the backend API. Supports editing candidate info, uploading photos (base64 to `/admin/upload-photo`), and overriding field values via `/admin/override`.

**Backend API** — AWS Lambda at `https://0uuj9e2rh5.execute-api.us-east-2.amazonaws.com`. Public endpoints: `/candidates?raceId=`, `/search?q=`. Admin endpoints require a `password` param: `/admin/races`, `/admin/candidates`, `/admin/override`, `/admin/upload-photo`.

**raceId format:** `{STATE}-house-{district}` | `{STATE}-senate` | `{STATE}-governor` (e.g. `IL-house-5`)

**Candidate positions** are stored as a `positions` object keyed by string issue IDs `"1"` through `"30"`. The 30 issues are defined as a constant in Page3, Admin, and CandidatePage (currently duplicated — not shared via a module).

**Gemini integration** — calls `gemini-2.5-flash-lite` directly from the browser with `REACT_APP_GEMINI_API_KEY`. Uses `googleSearch` grounding tool for candidate discovery and per-issue position lookups. Has retry logic (3 attempts, 2s sleep on 429).

**Chatbot** (embedded in Page1) — database-only, no Gemini. Extracts candidate name from free-text by stripping issue keywords, calls `/search`, then uses `buildAnswer()` for structured replies.

**Email capture** — optional email submitted to Beehiiv via AWS Lambda at a hardcoded URL in Page1.

## Key Patterns

- Party colors: Democrat `#3C3B6E`, Republican `#B22234`, Libertarian `#F38C00`, Green `#00A86B`, Independent `#6B7280`
- `getPartyColor()`, `getRaceLabel()`, `STATE_NAMES` are duplicated in multiple files — no shared utility module exists yet
- `candidateid` (lowercase, no camel) is the primary key from the database, values like `"democratic"`, `"republican"` etc.
- Candidate names tagged `(likely)` indicate unconfirmed 2026 candidates — strip with `name.replace(/\s*\(likely\)\s*/gi, '').trim()` before display or API calls
