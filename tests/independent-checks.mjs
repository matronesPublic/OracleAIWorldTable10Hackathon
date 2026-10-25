import assert from 'node:assert/strict';
export function independentlyCheck(plan,catalog){
 const byId=new Map(catalog.sessions.map(s=>[s.id,s]));
 const examine=s=>{const source=byId.get(s.id);assert.ok(source,'Session must exist in snapshot');for(const k of ['title','code','start','end','date','room','source'])assert.equal(s[k],source[k],k+' must match source');assert.ok(source.description.includes(s.evidenceQuote),'Evidence quote must be an exact catalog excerpt');assert.ok(plan.input.days.includes(s.date),'Session must be on a selected day');assert.equal(s.seatStatus,'not-published');};
 const clear=items=>{assert.equal(new Set(items.map(s=>s.code)).size,items.length,'No repeated session codes');const sorted=items.slice().sort((a,b)=>Date.parse(a.start)-Date.parse(b.start));for(let i=1;i<sorted.length;i++)assert.ok(Date.parse(sorted[i].start)-Date.parse(sorted[i-1].end)>=600000,'At least 10 minutes between all sessions');for(const d of plan.input.days)assert.ok(items.filter(s=>s.date===d).length<=4,'At most 4 sessions per day');};
 clear(plan.sessions);for(const s of plan.sessions){examine(s);if(plan.selectionNotBefore)assert.ok(Date.parse(s.start)>=Date.parse(plan.selectionNotBefore));if(s.backup){examine(s.backup);clear(plan.sessions.map(x=>x.id===s.id?s.backup:x));assert.equal(s.backup.date,s.date);}}
 return {conflicts:0,evidenceVerified:true,sourceDetailsVerified:true,backupsVerified:true};
}
