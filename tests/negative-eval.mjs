import assert from 'node:assert/strict';import {readFile,writeFile} from 'node:fs/promises';import {independentlyCheck} from './independent-checks.mjs';
const base=process.env.APP_URL||'http://127.0.0.1:3000';
const input={profile:'I am a professional baker looking for hands-on pastry and bread instruction.',goals:['Learn French pastry lamination and sourdough baking techniques'],days:['2026-10-26']};
const start=Date.now();const r=await fetch(base+'/api/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});const plan=await r.json();assert.equal(r.status,200,plan.error);const catalog=JSON.parse(await readFile(new URL('../public/data/sessions.json',import.meta.url),'utf8'));independentlyCheck(plan,catalog);assert.equal(plan.sessions.length,0,'Unrelated goals must not produce a filled agenda');assert.ok(plan.goals.every(g=>g.status==='Gap'));
const bad=await fetch(base+'/api/plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...input,days:[]})});assert.equal(bad.status,400);
const method=await fetch(base+'/api/plan');assert.equal(method.status,405);
const secret=await fetch(base+'/.env.local');assert.equal(secret.status,404);
const result={evaluatedAt:new Date().toISOString(),unrelatedGoal:{sessions:0,status:'Gap',liveAI:plan.aiCalled,latencyMs:Date.now()-start,responseId:plan.responseId},invalidInput:400,wrongMethod:405,privateFileNotServed:404};console.log(JSON.stringify(result));await writeFile(new URL('../evidence/negative-eval.json',import.meta.url),JSON.stringify(result,null,2));
