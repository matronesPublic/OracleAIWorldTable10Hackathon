# Verified local MVP

21 automated tests pass, including 100 generated schedules, backup replacement checks, calendar geometry, Las Vegas time conversion, empty days, and calendar/agenda parity for all four captured live personas.

| Live AI persona | Sessions | Backups | Goals supported | Conflicts | Latency |
|---|---:|---:|---:|---:|---:|
| AI application developer | 10 | 7 | 3/3 | 0 | 37.5s |
| Enterprise architect | 11 | 10 | 3/3 | 0 | 25.2s |
| Database professional | 12 | 7 | 3/3 | 0 | 28.2s |
| User-provided Oracle Fusion / Cloud administrator | 11 | 11 | 3/3 | 0 | 23.4s |

All session details and evidence quotes matched the official catalog snapshot. Every backup was independently verified as a single replacement. An unrelated pastry goal produced zero sessions and an explicit gap.

The user's Fusion/Cloud admin brief (AI Agents, AI Governance, AI Security) also completed through the browser after the fix: 11 primary sessions, 10 backups, all goals supported, and zero conflicts. Live model output can vary between runs. The exact original failed response was not available, so its particular invalid field could not be diagnosed retrospectively. The validation fix constrains score dimensions and drops invalid individual suggestions while retaining fully verified recommendations.

Browser checks verified Agenda/Calendar switching, matching primary IDs, Monday filtering (four sessions in both views), and opening a session's compatible backup from the calendar. Calendar screenshots and browser check details accompany this report.

Seat availability is unpublished.

## Public deployment

Production demo: https://my-ai-world-26.vercel.app/ (Vercel project `oracle-hackathon-team10/my-ai-world-26`).

Unauthenticated checks returned 200 for the app, JavaScript modules, calendar CSS, catalog snapshot, and saved example. The status endpoint confirmed live AI configuration. Credential and server-source paths returned 404. The production Fusion/Cloud admin test returned 11 sessions, 11 compatible backups, all three goals supported, and zero conflicts in 25.9 seconds. Exact source details and evidence quotes passed independent verification. See `vercel-eval.json` and `vercel-live-plan.json`.

The production browser flow also generated the agenda successfully. All 11 primary IDs matched between Agenda and Calendar. Filtering Monday left four sessions in either view; opening a calendar block exposed its compatible backup. At a 477px viewport, horizontal scrolling remained inside the calendar and the page did not overflow. No browser console errors were recorded. See `vercel-browser-checks.json` and `vercel-live.jpg`.
