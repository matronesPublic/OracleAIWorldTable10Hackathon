// Keep calendar geometry independent of the viewer's timezone.
export function localMinutes(iso){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(iso));
 return Number(parts.find(p=>p.type==='hour').value)*60+Number(parts.find(p=>p.type==='minute').value);
}
export function minuteLabel(minute){const hour=Math.floor(minute/60)%24;return `${hour%12||12}:${String(minute%60).padStart(2,'0')} ${hour<12?'AM':'PM'}`;}
export function buildCalendarModel(plan,activeDay='all'){
 const dates=plan.input.days.filter(d=>activeDay==='all'||d===activeDay).slice().sort();
 const sessions=plan.sessions.filter(s=>dates.includes(s.date));
 const start=Math.floor(Math.min(480,...sessions.map(s=>localMinutes(s.start)))/60)*60;
 const end=Math.ceil(Math.max(1080,...sessions.map(s=>localMinutes(s.end)))/60)*60;
 const days=dates.map(date=>{
  const booked=sessions.filter(s=>s.date===date).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start));
  const segments=[];let cursor=start;
  booked.forEach((session,index)=>{
   const from=localMinutes(session.start),to=localMinutes(session.end);
   if(from>cursor)segments.push({type:'open',start:cursor,end:from});
   segments.push({type:'session',start:from,end:to,session});cursor=to;
   if(index<booked.length-1){const until=Math.min(to+plan.bufferMinutes,localMinutes(booked[index+1].start));if(until>cursor)segments.push({type:'transition',start:cursor,end:until});cursor=until;}
  });
  if(cursor<end)segments.push({type:'open',start:cursor,end});
  return {date,segments,openMinutes:segments.filter(s=>s.type==='open').reduce((sum,s)=>sum+s.end-s.start,0)};
 });
 return {start,end,days,hours:Array.from({length:(end-start)/60+1},(_,i)=>start+i*60)};
}
