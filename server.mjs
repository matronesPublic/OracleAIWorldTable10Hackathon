import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname} from 'node:path';
// Credentials are loaded only in this local server; deployment uses environment variables.
for(const url of [new URL('./.env.local',import.meta.url),new URL('../../work/.env.local',import.meta.url),new URL('../../work.env.local.txt',import.meta.url)]){
 try{const raw=await readFile(url,'utf8');for(const name of ['OPENAI_API_KEY','OPENAI_MODEL']){const value=raw.match(new RegExp('(?:^|\\n)\\s*'+name+'\\s*=\\s*["\']?([^\\s"\']+)'))?.[1];if(value&&!process.env[name])process.env[name]=value;}if(!process.env.OPENAI_API_KEY&&/^sk-/.test(raw.trim()))process.env.OPENAI_API_KEY=raw.trim();}catch{}
}
const {default:plan}=await import('./api/plan.mjs');const {default:status}=await import('./api/status.mjs');
const types={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml'};
const allowed=new Set(['index.html','styles.css','calendar.css','app.mjs','calendar.mjs','calendar-export.mjs','data/sessions.json','data/demo-plan.json','favicon.svg']);
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');
 const pathname=new URL(req.url,'http://localhost').pathname;
 res.status=function(n){this.statusCode=n;return this;};res.json=function(o){this.setHeader('Content-Type','application/json');this.end(JSON.stringify(o));};
 if(pathname==='/api/status')return status(req,res);
 if(pathname==='/api/plan'){
  let data='';try{for await(const chunk of req){data+=chunk;if(data.length>8000)return res.status(413).json({error:'Request is too large.'});}req.body=JSON.parse(data||'{}');}catch{return res.status(400).json({error:'Invalid request JSON.'});}return plan(req,res);
 }
 const file=pathname==='/'?'index.html':pathname.slice(1);
 if(!allowed.has(file))return res.status(404).json({error:'Not found'});
 try{res.setHeader('Content-Type',(types[extname(file)]||'text/plain')+'; charset=utf-8');res.end(await readFile(new URL('./public/'+file,import.meta.url)));}catch{return res.status(404).json({error:'File not available'});}
});
server.listen(Number(process.env.PORT)||3000,'127.0.0.1',()=>console.log('My AI World running at http://127.0.0.1:'+(Number(process.env.PORT)||3000)+' · AI '+(process.env.OPENAI_API_KEY?'configured':'not configured')));
