import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {buildCalendarExport} from '../public/calendar-export.mjs';

const demo = JSON.parse(await readFile(new URL('../public/data/demo-plan.json', import.meta.url), 'utf8'));
const now = new Date('2026-10-25T20:00:00Z');
const unfold = value => value.replace(/\r\n[ \t]/g, '');
const decodeText = value => value.replace(/\\([\\;,nN])/g, (_, char) => /n/i.test(char) ? '\n' : char);
function events(value) {
  return unfold(value).split('BEGIN:VEVENT\r\n').slice(1).map(block => Object.fromEntries(
    block.split('END:VEVENT')[0].trim().split('\r\n').map(line => {
      const colon = line.indexOf(':');return [line.slice(0, colon), line.slice(colon + 1)];
    })
  ));
}
const toDate = value => new Date(value.replace(/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)Z$/, '$1-$2-$3T$4:$5:$6Z'));

test('calendar export has exactly one event per primary with exact times, rooms, evidence, and sources', () => {
  const ics = buildCalendarExport({...demo, mode: 'saved'}, {now});
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'));
  assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
  const rows = events(ics);
  assert.equal(rows.length, demo.sessions.length);
  assert.equal(new Set(rows.map(row => row.UID)).size, rows.length);
  for (const session of demo.sessions) {
    const row = rows.find(row => row.UID === `${encodeURIComponent(session.id)}@my-ai-world-26.vercel.app`);
    assert.equal(toDate(row.DTSTART).getTime(), Date.parse(session.start));
    assert.equal(toDate(row.DTEND).getTime(), Date.parse(session.end));
    assert.equal(row.DTSTAMP, '20261025T200000Z');
    assert.equal(decodeText(row.SUMMARY), `${session.title} [${session.code}]`);
    assert.equal(decodeText(row.LOCATION), session.room);
    assert.equal(row.URL, session.source);
    const notes = decodeText(row.DESCRIPTION);
    for (const expected of [session.reason, session.evidenceQuote, 'SAVED EXAMPLE', 'not a reservation', 'does not update automatically']) assert.ok(notes.includes(expected));
    if (session.backup) {
      assert.ok(notes.includes(session.backup.title));
      assert.ok(notes.includes(session.backup.source));
      assert.ok(notes.includes('not a separate calendar event'));
      assert.ok(!rows.some(row => row.UID === `${session.backup.id}@my-ai-world-26.vercel.app`));
    }
  }
  for (let i = 1; i < rows.length; i++) assert.ok(toDate(rows[i].DTSTART) - toDate(rows[i - 1].DTEND) >= 600000);
});

test('UTC export preserves Las Vegas times regardless of host timezone and handles explicit offsets', () => {
  const session = {...demo.sessions[0], start:'2026-10-26T11:30:00-07:00', end:'2026-10-26T12:15:00-07:00'};
  const [row] = events(buildCalendarExport({...demo, sessions:[session]}, {now}));
  assert.equal(row.DTSTART, '20261026T183000Z');
  assert.equal(row.DTEND, '20261026T191500Z');
  assert.ok(decodeText(row.DESCRIPTION).includes('11:30 AM PDT to 12:15 PM PDT (Las Vegas)'));
});

test('calendar text escaping and UTF-8 line folding preserve punctuation and prevent injected events', () => {
  const title = 'Security, governance; RAG \\ agents\r\nBEGIN:VEVENT\n' + '日本語😀é'.repeat(30);
  const session = {...demo.sessions[0], title};
  const ics = buildCalendarExport({...demo, sessions:[session]}, {now});
  const rows = events(ics);
  assert.equal(rows.length, 1);
  assert.equal(decodeText(rows[0].SUMMARY), `${title.replace(/\r\n/g, '\n')} [${session.code}]`);
  assert.ok(!ics.replace(/\r\n/g, '').includes('\n'));
  for (const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line, 'utf8') <= 75);
  assert.ok(!ics.includes('\uFFFD'));
});

test('live export omits saved labeling and keeps stable event IDs across downloads', () => {
  const plan = {...demo, mode:'live'};
  const first = buildCalendarExport(plan, {now});
  const later = buildCalendarExport(plan, {now:new Date('2026-10-25T21:00:00Z')});
  assert.ok(!first.includes('SAVED EXAMPLE'));
  assert.deepEqual(events(first).map(row => row.UID), events(later).map(row => row.UID));
});

test('empty agendas and invalid event times cannot produce a misleading calendar', () => {
  assert.throws(() => buildCalendarExport({...demo, sessions:[]}), /with sessions/);
  assert.throws(() => buildCalendarExport({...demo, sessions:[{...demo.sessions[0], start:'invalid'}]}), /invalid calendar time/);
  assert.throws(() => buildCalendarExport({...demo, sessions:[{...demo.sessions[0], end:demo.sessions[0].start}]}), /invalid calendar details/);
});
