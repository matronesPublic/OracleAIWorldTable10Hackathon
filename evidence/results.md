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

## Calendar export and attendee handoff

The public app now exports an Outlook-compatible `my-ai-world-agenda.ics` file. Each primary session becomes an event with its exact start/end instants, room, learning rationale, evidence, official link, and backup notes. Backups do not create extra events. The export always covers the whole agenda, even while the attendee filters to one day. A saved example is labeled in the app, calendar name, and event descriptions.

All **26 automated checks pass**. Five export checks cover event/source parity, exact timezone conversion, backup handling, stable IDs, invalid inputs, escaping, and UTF-8-safe line folding. Existing scheduling and calendar checks remain passing. See `checks.txt`.

A real browser download from the public production URL, while Monday was selected, produced all **10 primary events** from the fixed saved example with **seven backups in notes** and **zero additional backup events**. The independent `ical.js 2.2.1` parser accepted the actual downloaded file. Every start/end instant, title, room, official source, and evidence quote matched the fixture; all transitions remained at least ten minutes. This parser is a QA-only dependency outside the application. See `calendar-export-eval.json` and the actual `exported-example.ics` file.

Four deterministic judge workflows passed **55 browser steps**, covering agenda inspection, exact catalog evidence and a backup, time-block calendar details, and the Outlook export handoff. The handoff checks include the all-days export scope and visible import instructions without requiring external account access. See `browser-verification.json` and `calendar-export-browser-workflows.json`. These flows use the labeled saved example and do not establish new live personalization.

The export panel was checked at 1280px and 477px. The button and import instructions fit without page overflow. Screenshots: `calendar-export-live.jpg` and `calendar-export-mobile.jpg`. Browser download and independent file parsing are verified; importing into an authenticated Outlook account remains a manual acceptance step. The export is a snapshot with no automatic synchronization or seat reservation.
