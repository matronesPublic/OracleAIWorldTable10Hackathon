export const BUFFER=10;
export const DAYS=['2026-10-25','2026-10-26','2026-10-27','2026-10-28'];
export function validateInput(value){
 if(!value||typeof value!=='object')throw new Error('Enter your background and learning goals.');
 const profile=typeof value.profile==='string'?value.profile.trim():'';
 const goals=Array.isArray(value.goals)?value.goals.map(g=>typeof g==='string'?g.trim():'').filter(Boolean):[];
 const days=Array.isArray(value.days)?[...new Set(value.days)]:[];
 if(profile.length<8||profile.length>1200)throw new Error('Describe your professional background in 8–1,200 characters.');
 if(!goals.length||goals.length>3||goals.some(g=>g.length<3||g.length>240))throw new Error('Enter one to three learning goals, each 3–240 characters.');
 if(!days.length||days.some(d=>!DAYS.includes(d)))throw new Error('Select at least one conference day.');
 return {profile,goals:[...new Set(goals)],days};
}
export const eligible=s=>s.start&&s.end&&Date.parse(s.end)>Date.parse(s.start)&&!['Oracle University Training','Hackathon','Ancillary Event'].includes(s.type)&&!/^(ANC|OUT|HAC)/.test(s.code);
export const compatible=(a,b)=>Date.parse(a.end)+BUFFER*60000<=Date.parse(b.start)||Date.parse(b.end)+BUFFER*60000<=Date.parse(a.start);
const stop=new Set('the and for with from into learn build how about oracle world ai want use using professional work that this on in to of a an i my as is'.split(' '));
export function tokens(text){return [...new Set(text.toLowerCase().replace(/\brag\b/g,'rag retrieval augmented generation').replace(/\boci\b/g,'oci infrastructure cloud').replace(/\bagents?\b/g,'agent agentic').replace(/\bdbas?\b/g,'database administration').match(/[a-z0-9]+/g)||[])].filter(t=>t.length>2&&!stop.has(t));}
export function shortlist(catalog,input,limit=72,{notBefore=0}={}){
 const pool=catalog.sessions.filter(s=>input.days.includes(s.date)&&eligible(s)&&Date.parse(s.start)>=notBefore);
 const termGroups=input.goals.map(tokens);const background=tokens(input.profile);
 const ranked=pool.map(s=>{const title=s.title.toLowerCase(),text=(s.title+' '+s.description+' '+s.attributes.join(' ')).toLowerCase();const scores=termGroups.map(ts=>ts.reduce((n,t)=>n+(title.includes(t)?5:text.includes(t)?1:0),0));return {...s,retrievalScores:scores,retrievalScore:scores.reduce((a,b)=>a+b,0)+background.filter(t=>text.includes(t)).length*.15};}).sort((a,b)=>b.retrievalScore-a.retrievalScore||a.start.localeCompare(b.start));
 const selected=new Map();
 // Give each goal and day room in the candidate set before filling globally.
 for(let goal=0;goal<input.goals.length;goal++)for(const day of input.days){const group=ranked.filter(s=>s.date===day&&s.retrievalScores[goal]>0).sort((a,b)=>b.retrievalScores[goal]-a.retrievalScores[goal]);for(const s of group.slice(0,Math.max(3,Math.floor(48/(input.goals.length*input.days.length)))))selected.set(s.id,s);}
 for(const s of ranked){if(selected.size>=limit)break;selected.set(s.id,s);}
 return [...selected.values()].slice(0,limit).map(s=>({...s,evidence:s.description.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)?.map(t=>t.trim()).filter(Boolean).slice(0,12)||[s.description]}));
}
export function validateRankings(payload,candidates,input){
 if(!payload||!Array.isArray(payload.rankings)||payload.rankings.length>72)throw new Error('AI returned an invalid session ranking.');
 const byId=new Map(candidates.map(s=>[s.id,s]));const ids=new Set();
 return payload.rankings.map(r=>{const s=byId.get(r.id);const quote=Number.isInteger(r.evidenceIndex)?s?.evidence?.[r.evidenceIndex]:r.evidenceQuote;if(!s||ids.has(r.id)||!Array.isArray(r.goalScores)||r.goalScores.length!==input.goals.length||r.goalScores.some(n=>!Number.isInteger(n)||n<0||n>3)||typeof r.reason!=='string'||r.reason.length<10||r.reason.length>800||typeof quote!=='string'||quote.length<12||!s.description.includes(quote))throw new Error('AI returned a session or evidence quote that could not be verified.');ids.add(r.id);return {...s,goalScores:r.goalScores,reason:r.reason,evidenceQuote:quote};});
}
export function verifiedRankings(payload,candidates,input){
 if(!payload||!Array.isArray(payload.rankings)||payload.rankings.length>72)throw new Error('Invalid ranking structure.');
 const verified=[],seen=new Set(),rejected=[];const byId=new Map(candidates.map(s=>[s.id,s]));
 for(const row of payload.rankings){if(!row||typeof row!=='object'){rejected.push({problem:'invalid-row'});continue;}if(seen.has(row.id)){rejected.push({id:row.id,problem:'duplicate'});continue;}
  try{verified.push(...validateRankings({rankings:[row]},candidates,input));seen.add(row.id);}
  catch{const source=byId.get(row.id);rejected.push({id:row.id,problem:!source?'unknown-id':row.goalScores?.length!==input.goals.length?'goal-score-count':!Number.isInteger(row.evidenceIndex)||!source.evidence?.[row.evidenceIndex]?'evidence-index':'invalid-fields',evidenceIndex:row.evidenceIndex,evidenceCount:source?.evidence?.length,scoreCount:row.goalScores?.length,expectedScoreCount:input.goals.length});}
 }
 if(rejected.length)console.warn('Excluded unverified AI suggestions:',JSON.stringify(rejected));
 if(payload.rankings.length&&!verified.length)throw new Error('No AI suggestions passed source validation.');
 return {rankings:verified,rejectedCount:rejected.length};
}
const weight=s=>s.goalScores.reduce((a,b)=>a+b,0)*10;
const mask=s=>s.goalScores.reduce((m,v,i)=>m|(v>=2?1<<i:0),0);
const popcount=n=>n.toString(2).replaceAll('0','').length;
export function makeAgenda(ranked,input,meta={}){
 const useful=ranked.filter(s=>eligible(s)&&input.days.includes(s.date)&&s.goalScores.some(n=>n>=2));
 const selected=[];const used=new Set();let covered=0;
 for(const day of [...input.days].sort()){
  const items=useful.filter(s=>s.date===day&&!used.has(s.code)).sort((a,b)=>a.end.localeCompare(b.end)||a.id.localeCompare(b.id));
  const states=[new Map([['0:0',{score:0,mask:0,path:[]}]])];
  for(let i=0;i<items.length;i++){
   const s=items[i];let previous=i-1;while(previous>=0&&!compatible(items[previous],s))previous--;
   const current=new Map(states[i]);
   for(const state of states[previous+1].values()){
    if(state.path.length>=4||state.path.some(p=>p.code===s.code))continue;
    const next={score:state.score+weight(s),mask:state.mask|mask(s),path:[...state.path,s]};const key=next.path.length+':'+next.mask;const old=current.get(key);
    if(!old||next.score>old.score)current.set(key,next);
   }
   states.push(current);
  }
  const best=[...states.at(-1).values()].sort((a,b)=>(b.score+45*popcount(b.mask&~covered))-(a.score+45*popcount(a.mask&~covered))||a.path.length-b.path.length)[0];
  for(const s of best.path){selected.push(s);used.add(s.code);covered|=mask(s);}
 }
 selected.sort((a,b)=>a.start.localeCompare(b.start));
 const sessions=selected.map(primary=>{
  const others=selected.filter(s=>s.id!==primary.id);
  const alternatives=useful.filter(s=>s.date===primary.date&&s.code!==primary.code&&!others.some(o=>o.code===s.code)&&others.every(o=>compatible(o,s))).sort((a,b)=>weight(b)-weight(a)||Math.abs(Date.parse(a.start)-Date.parse(primary.start))-Math.abs(Date.parse(b.start)-Date.parse(primary.start)));
  return {...primary,backup:alternatives[0]||null};
 });
 const goals=input.goals.map((goal,i)=>{const matched=sessions.filter(s=>s.goalScores[i]>=2);const partial=sessions.filter(s=>s.goalScores[i]===1);return {goal,status:matched.length?'Supported':partial.length?'Partial':'Gap',sessionIds:matched.map(s=>s.id),explanation:matched.length?`${matched.length} selected session${matched.length===1?' supports':'s support'} this goal. Attendance supports learning; it does not verify mastery.`:partial.length?'Some related content is scheduled; no strong match was found.':'No strong match fits the selected days and constraints. Broaden your days or refine this goal.'};});
 assertAgenda(sessions,input);
 return {sessions,goals,input,bufferMinutes:BUFFER,timeZone:'America/Los_Angeles',generatedAt:new Date().toISOString(),...meta};
}
export function assertAgenda(sessions,input){const ids=new Set(),codes=new Set();for(let i=0;i<sessions.length;i++){const s=sessions[i];if(!input.days.includes(s.date)||ids.has(s.id)||codes.has(s.code))throw new Error('Agenda validation failed.');ids.add(s.id);codes.add(s.code);for(let j=0;j<i;j++)if(!compatible(s,sessions[j]))throw new Error('Agenda contains a time conflict.');if(s.backup&&sessions.some(o=>o.id!==s.id&&(!compatible(o,s.backup)||o.code===s.backup.code)))throw new Error('Backup conflicts with the agenda.');}return true;}
export function markdown(plan){return `# My AI World — Personal learning agenda\n\n${plan.mode==='live'?'Live AI recommendations':'Saved demo recommendations'} · All times Las Vegas (PDT)\n10-minute transition buffer · Seats are not reserved\n\n## Your goals\n${plan.goals.map(g=>`- ${g.goal}: ${g.status}`).join('\n')}\n\n## Sessions\n${plan.sessions.map(s=>`### ${s.date} · ${new Date(s.start).toLocaleTimeString('en-US',{timeZone:plan.timeZone,hour:'numeric',minute:'2-digit'})}–${new Date(s.end).toLocaleTimeString('en-US',{timeZone:plan.timeZone,hour:'numeric',minute:'2-digit'})}\n${s.title} [${s.code}]\n${s.room}\n${s.reason}\nEvidence: "${s.evidenceQuote}"\n${s.source}\nSeat availability not published.\n${s.backup?`Backup: ${s.backup.title} [${s.backup.code}] · ${new Date(s.backup.start).toLocaleTimeString('en-US',{timeZone:plan.timeZone,hour:'numeric',minute:'2-digit'})} · ${s.backup.room}\n${s.backup.source}`:'No compatible backup found.'}`).join('\n\n')}\n\nCatalog captured: ${plan.catalogCapturedAt}\nVerify room, access requirements, and any schedule changes in the official catalog.\n`;}
