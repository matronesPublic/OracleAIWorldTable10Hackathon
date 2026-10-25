import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateInput} from '../lib/planner.mjs';
import {generatePlan} from '../lib/ai.mjs';
const catalog=JSON.parse(await readFile(new URL('../public/data/sessions.json',import.meta.url),'utf8'));
const cache=new Map();let calls=[];
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Use POST to generate a plan.'});
 let input;try{input=validateInput(req.body);}catch(e){return res.status(400).json({error:e.message});}
 const key=createHash('sha256').update(JSON.stringify(input)).digest('hex');const cached=cache.get(key);
 if(cached&&Date.now()-cached.at<180000)return res.status(200).json({...cached.plan,cached:true});
 calls=calls.filter(t=>Date.now()-t<600000);if(calls.length>=30)return res.status(429).json({error:'The demo has reached its request limit. Please use the saved demo or try later.'});
 calls.push(Date.now());
 try{const plan=await generatePlan(catalog,input);if(cache.size>60)cache.clear();cache.set(key,{at:Date.now(),plan});return res.status(200).json(plan);}catch(e){return res.status(e.status||502).json({error:e.name==='TimeoutError'?'AI analysis timed out. Try again or use the saved demo.':e.message||'Unable to generate a plan.'});}
}
