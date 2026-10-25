# Acceptance and evaluation plan

The MVP passes when it produces a useful customized session list and agenda from real catalog records, with no overlapping sessions and clear support or gaps for the attendee's stated learning goals.

## Deterministic acceptance gates

- All session IDs exist in the 764-entry snapshot.
- Titles, codes, start/end times, rooms, dates, and official links match the snapshot exactly.
- Every displayed evidence quote is an exact substring of the original catalog description.
- All sessions fall on selected conference days. Live generation excludes sessions that have started.
- Adjacent primary sessions have at least 10 minutes between them.
- At most four primary sessions per day; no repeated session codes.
- Every backup is on the primary's day and passes all conflict, buffer, duplicate, and daily-limit checks when substituted for that primary.
- Unknown remaining seat availability is displayed honestly. Room capacity is not a remaining-seat count.
- Invalid inputs fail with a clear error. Provider errors do not silently become fake live-AI results.

## Live acceptance fixtures

| Professional context | Learning goals | Acceptance intent |
|---|---|---|
| AI application developer | RAG/vector search; agent deployment on OCI; evaluation/governance | Practical technical content with explanations tied to implementation |
| Enterprise architect | Secure agent architecture; governed enterprise data; multicloud/reliability | Architecture, integration, and operational tradeoffs |
| Database professional | Vector/RAG implementation; database security; upgrades/high availability | Database-oriented learning and operational practices |
| Professional baker | French pastry and sourdough techniques | No unrelated conference sessions; explicit goal gap |

`live-eval.json` contains observed latency, session and backup counts, goal support, provider response IDs, and independent source/constraint checks. The evaluator independently compares session details against the snapshot and checks the actual schedule arithmetic and every single backup replacement.

## Qualitative review

Review relevance, professional fit, specificity of the explanation, source support, and agenda usefulness on a 1–5 scale. A target of at least 4/5 is an acceptance goal, not a measured external-judge result. Technical-profile outputs have been inspected for topical fit. An attendee's own usefulness rating and the hackathon's official judging rubric remain outstanding.

Goal coverage comes from model relevance judgments; it is not evidence of acquired knowledge. The app does not claim globally optimal scheduling across all 764 sessions: AI evaluates a balanced retrieved shortlist of up to 72 candidates.

## Browser acceptance

Check desktop and mobile layouts, profile preset editing, generation/loading/error states, saved-example labeling, day filtering, expandable source evidence, backup details, and a readable downloaded agenda. Preserve screenshots and the downloaded file in this directory.

## Regression protection

Keep the first known-good demo archive and a later verified source archive. Run the deterministic suite after changes to matching, source validation, or scheduling. Run relevant live fixtures after changing the AI prompt or response schema. Do not overwrite a passing saved example with a failed response. All archives must exclude credentials.
