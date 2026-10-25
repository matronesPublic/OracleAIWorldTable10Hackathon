import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';
const base=process.env.APP_URL||'http://127.0.0.1:3000';const checks=[];
for(const path of ['/','/app.mjs','/calendar.mjs','/calendar.css']){const r=await fetch(base+path);assert.equal(r.status,200,path);const content=await r.text();assert.ok(content.length>100,path);checks.push({path,status:r.status,bytes:content.length});}
const status=await (await fetch(base+'/api/status')).json();assert.equal(status.aiConfigured,true);
for(const path of ['/.env.local','/SUBMISSION.md','/lib/ai.mjs']){const r=await fetch(base+path);assert.equal(r.status,404,path);checks.push({path,status:r.status});}
const result={capturedAt:new Date().toISOString(),base,aiConfigured:status.aiConfigured,checks};await writeFile(new URL('../evidence/smoke.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
