# Bookella Technical Roadmap (Incremental)

## Current Baseline (Observed)
- Frontend-first web app (HTML/CSS/JS) with Tailwind CDN and local scripts.
- LocalStorage-backed data model simulating workbook sheets for users/orders/books/borrowing.
- Existing features: authentication pages, admin panel, search enhancements, dark mode, reviews, loyalty, PWA support.
- No backend/API layer yet; state is browser-local.

## Delivery Strategy
### MVP Stabilization (Now)
1. Modularize existing frontend logic into domain modules (auth, catalog, cart, engagement).
2. Introduce foundational user reading state features in-browser:
   - Reading session tracker
   - Yearly challenge progress
   - Local dashboard widgets
3. Add defensive validation and schema migration helpers for LocalStorage payloads.

### V1 Platform Layer
1. Introduce backend service (Node.js/Nest or Laravel) with PostgreSQL.
2. Add real authentication (JWT + OAuth providers).
3. Migrate critical entities: users, books, reviews, reading progress, challenges.
4. Add API gateway contract versioning and feature flags.

### V2 Social + AI Expansion
1. Social graph + activity feed + notifications.
2. Reader services (EPUB/PDF state sync + highlights + quotes).
3. Recommendation and assistant services (RAG-ready architecture).
4. Marketplace/payments with Stripe/PayPal and entitlement controls.

## Architectural Principles
- Extend existing UX and naming to avoid user-facing disruption.
- Keep each new feature independently releasable.
- Prefer adapter-based migration so legacy LocalStorage UX keeps working while backend is introduced.

## Initial Increment Implemented
- Added **Reading Tracker** section to homepage with:
  - Current-book page progress
  - Yearly reading challenge progress
  - Motivational status and remaining counters
- Added persistence and validation in `script.js` under `bookella_reading_tracker` key.
