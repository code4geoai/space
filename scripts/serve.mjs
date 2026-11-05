import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(process.env.SERVE_DIR||'.'),port=Number(process.env.PORT||4173);
const prefix=(process.env.BASE_PATH||'').replace(/\/$/,'');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.ttf':'font/ttf','.md':'text/plain; charset=utf-8','.mp3':'audio/mpeg','.wav':'audio/wav'};
http.createServer(async(req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(prefix){if(!pathname.startsWith(prefix+'/')){res.writeHead(404).end();return}pathname=pathname.slice(prefix.length)}let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return}if((await stat(file)).isDirectory())file=path.join(file,'index.html');const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data)}catch{res.writeHead(404).end('Not found')}}).listen(port,'127.0.0.1',()=>console.log(`Digital Space Museum: http://127.0.0.1:${port}${prefix}/`));
