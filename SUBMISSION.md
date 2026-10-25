# My AI World 26 — a conference plan built around professional learning goals

## The problem and first user

Our first user is an Oracle Fusion / Oracle Cloud administrator who wants to bring AI into their enterprise safely. Their stated learning goals are **AI Agents, AI Governance, and AI Security**. This is a real brief supplied during development, not a fabricated persona.

Today, the attendee searches and filters the conference catalog, opens descriptions, compares times, and assembles an agenda manually. The October 25 snapshot contains **764 scheduled entries**. Finding relevant content is only part of the task: the attendee must also avoid overlaps, leave transition time, and find an alternative if a session becomes unavailable. The current workflow and its time cost have not yet been measured in a user study.

The consequence we aim to reduce is wasted conference time and an agenda that looks relevant but cannot be attended or leaves a learning goal unsupported. We have evidence of one attendee's need; broader demand and willingness to pay remain hypotheses.

## Who else and who might buy

The initial segment is Oracle administrators and technical practitioners attending this large, multi-track conference with several specific learning objectives. Architects, developers, and database professionals are adjacent users tested with fixed briefs. Those tests establish software behavior, not market demand.

A future buyer hypothesis is a conference organizer or an enterprise learning team that wants attendees to make better use of conference attendance. We have no validated market-size estimate, paid pilots, customer interviews beyond the initial user, or revenue claim. The next validation should compare this planner with manual catalog planning for several attendees and ask organizers whether they would pilot it.

## The product and before/after

**Before:** search individual topics, read descriptions, compare times, and maintain a personal agenda and fallback list.

**With My AI World:** enter a professional background, up to three goals, and attending days. The app uses live AI to match actual catalog entries, then code constructs a schedule with a 10-minute transition buffer and at most four sessions per day. Each primary has a reason, a verbatim catalog excerpt, room and time, and an official source link. A compatible backup appears when one is available. Goal gaps are explicit.

The attendee can inspect the agenda as a list or a time-block calendar, filter days, see unscheduled time, and print or download the plan. Seat availability is not published by the catalog, so the app labels it unknown and makes no reservation claims.

The smallest useful product is one conference attendee's accepted plan, ready to use during the event. **Download calendar (.ics)** turns every primary session into an importable calendar event with its room, rationale, evidence, official link, and backup in the notes. This removes the need to retype the proposed agenda into Outlook. Backups stay in notes so importing does not create overlapping appointments. The export is a snapshot, not a reservation or live subscription.

The design follows the attendee's planning decisions. Optional starting profiles reduce blank-form effort while keeping the background and goals editable. Up to three goals keep the brief focused; goal coverage makes omissions visible. Four sessions per day and ten-minute transitions leave time to move and reflect. Exact evidence helps the attendee judge the match before accepting it. The Agenda view supports reading, while Calendar exposes time commitments and open periods. One file transfers the complete accepted plan into the calendar the attendee already uses, without requiring another app account.

## Demo access and a 90-second verification script

**Public demo:** https://my-ai-world-26.vercel.app/ — no login required. The production URL was verified through unauthenticated requests. Source code: https://github.com/matronesPublic/OracleAIWorldTable10Hackathon.

1. Enter this background: “I am an Oracle Fusion/ Oracle Cloud admin. Currently interested in ways that we can incorporate AI into our enterprise, with focus on agents and security.”
2. Enter three lines: **AI Agents**, **AI Governance**, **AI Security**. Keep Monday–Wednesday selected.
3. Select **Build my learning agenda**. A real AI request typically takes 25–40 seconds; service latency may vary.
4. Verify the **LIVE AI · VERIFIED TIMES** badge, goal coverage, and zero-conflict summary.
5. Open **Why this match?** and compare the quoted text with the supplied catalog snapshot or official session link.
6. Select **Calendar**. Compare filled blocks, open time, and 10-minute transitions. Filter to Monday and select a block to inspect its compatible backup.
7. Select **Download calendar (.ics)**. Verify the session count and open the import instructions. In Outlook on the web, use **Calendar → Add calendar → Upload from file**, choose `my-ai-world-agenda.ics`, and import into a separate conference calendar. Show a session's room, rationale, source, and backup in its event notes. **Explore a saved example** provides a clearly labeled, previously verified AI response if the provider is unavailable. It does not customize the saved response to new inputs.

The first public production run of the actual user's brief produced **11 sessions, 11 backups, three supported goals, and zero conflicts**, with a live AI response in 25.9 seconds. All session details, evidence quotes, transition gaps, and individual backup replacements passed independent checks against the snapshot. Recommendations can vary between calls. “Supported” means relevant sessions are scheduled, not that learning mastery has been proven.

## Code and technical proof

Source code is included in this folder. See `README.md` to run it and `evidence/results.md` for results. No dependencies or build step are needed; the local server uses Node.js 24. Provider credentials remain on the server and are excluded from the archive.

- The public snapshot contains 764 actual catalog occurrences, with official source links and precise times.
- Retrieval supplies up to 72 candidates to live AI. Structured output constrains IDs and goal-score dimensions. The model selects a source excerpt by index; code supplies the exact original text.
- Each recommendation is validated independently. A bad recommendation is dropped while valid ones survive; a wholly invalid response is an explicit error.
- A deterministic scheduler enforces days, transitions, daily limits, and distinct session codes. Every backup is checked against the other primary sessions as a single replacement.
- **26 automated checks pass**, including 100 generated schedules, exact buffer boundaries, source validation, backup replacements, timezone conversion, calendar/agenda parity, and iCalendar export integrity.
- Four live professional briefs passed independent checks against the source snapshot. An unrelated pastry-learning goal returned no sessions and an explicit gap.

The planner searches a shortlist; it does not guarantee a global optimum. Goal relevance is an AI judgment, with exact evidence shown for review. Simultaneously swapping several backups requires a new conflict check.

## Differentiation and the next proof

Our current distinction is the complete path from **professional context and goals → evidence-backed recommendations → a feasible agenda and compatible backups**, with time constraints enforced outside the model. The calendar makes gaps and tradeoffs visible. We have not completed a competitor comparison and do not claim unique technology or an established moat.

Potential durability would come from organizer integrations, better session and access data, and permissioned feedback about which recommendations helped attendees. Those capabilities are future work. The next version should prove:

1. Attendees accept the plans and spend less time planning than with the catalog alone.
2. Goal coverage and professional fit hold up under independent human review across varied users.
3. An organizer can supply current schedules and real availability, and sees enough value to pilot the product.

## Submission readiness

Demo-ready: working public URL without login, live AI, captured catalog, verified schedules, backups, two schedule views, Outlook-compatible calendar export, source code, test evidence, and demo instructions. Automated checks and browser downloads verify the export; importing it into an authenticated Outlook account remains a separate manual acceptance step.

Hackathon-grade: catalog and availability refresh, provider reliability, request limiting, and operations at production traffic levels. The public catalog is a captured snapshot; actual remaining seats are unknown. AI requests depend on provider availability, and the saved example is a clearly labeled recovery path. There is no calendar synchronization or organizer reservation integration.

Pending: broader user-demand evidence, measured planning-time savings, and an organizer pilot. Do not claim these have been completed.
