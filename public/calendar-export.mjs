// RFC 5545 iCalendar. UTC instants preserve conference times in any calendar timezone.
const encoder = new TextEncoder();
const zone = 'America/Los_Angeles';
const time = value => new Date(value).toLocaleTimeString('en-US', {timeZone: zone, hour: 'numeric', minute: '2-digit', timeZoneName: 'short'});
const day = value => new Date(value).toLocaleDateString('en-US', {timeZone: zone, weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'});

function text(value) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

function stamp(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error('A session has an invalid calendar time.');
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function fold(line) {
  // Fold on Unicode character boundaries, counting the continuation space in 75 octets.
  const lines = [];
  let current = '', bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > 75) { lines.push(current); current = ' '; bytes = 1; }
    current += char;
    bytes += size;
  }
  lines.push(current);
  return lines.join('\r\n');
}

function description(session, plan) {
  const goals = (plan.goals ?? []).filter((_, i) => session.goalScores?.[i] >= 2).map(g => g.goal);
  const backup = session.backup;
  return [
    plan.mode === 'saved' ? 'SAVED EXAMPLE - previously generated AI agenda.' : 'My AI World 26 - personal learning agenda.',
    `Conference time: ${day(session.start)}, ${time(session.start)} to ${time(session.end)} (Las Vegas).`,
    goals.length ? `Learning goals supported:\n${goals.join('\n')}` : '',
    session.reason ? `Why this session: ${session.reason}` : '',
    session.evidenceQuote ? `Catalog evidence: "${session.evidenceQuote}"` : '',
    `Official session: ${session.source}`,
    backup ? [
      `BACKUP OPTION (not a separate calendar event): ${backup.title} [${backup.code}]`,
      `${day(backup.start)}, ${time(backup.start)} to ${time(backup.end)}. ${backup.room}`,
      backup.reason,
      backup.source,
      'This backup fits as a single replacement for this primary. Multiple replacements need a fresh conflict check.'
    ].filter(Boolean).join('\n') : 'No suitable backup fits the rest of this agenda.',
    'The agenda allows 10 minutes between sessions. Calendar events use the actual session times.',
    'A plan, not a reservation. Remaining seats are not published. Check official access requirements and room updates.',
    `Catalog snapshot: ${plan.catalogCapturedAt}. This export is a snapshot and does not update automatically.`
  ].filter(Boolean).join('\n\n');
}

export function buildCalendarExport(plan, {now = new Date()} = {}) {
  if (!plan?.sessions?.length) throw new Error('Build an agenda with sessions before exporting a calendar.');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//My AI World 26//Learning Agenda//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${text(plan.mode === 'saved' ? 'My AI World 26 - Saved example' : 'My AI World 26 - Learning agenda')}`
  ];
  const created = stamp(now);
  for (const session of [...plan.sessions].sort((a, b) => Date.parse(a.start) - Date.parse(b.start))) {
    if (!session.id || Date.parse(session.end) <= Date.parse(session.start)) throw new Error('A session has invalid calendar details.');
    const url = new URL(session.source);
    if (url.protocol !== 'https:') throw new Error('A session has an invalid source link.');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${encodeURIComponent(session.id)}@my-ai-world-26.vercel.app`,
      `DTSTAMP:${created}`,
      `DTSTART:${stamp(session.start)}`,
      `DTEND:${stamp(session.end)}`,
      `SUMMARY:${text(`${session.title} [${session.code}]`)}`,
      `LOCATION:${text(session.room)}`,
      `DESCRIPTION:${text(description(session, plan))}`,
      `URL:${url.href}`,
      'TRANSP:OPAQUE',
      'END:VEVENT'
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
