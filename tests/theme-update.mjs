import http from 'node:http';
import path from 'node:path';
import {readFile,stat,access} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
let oldTheme=true,browser;const root=process.cwd();
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.ttf':'font/ttf','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(file!==root&&!file.startsWith(root+path.sep))throw Error('Invalid path');if((await stat(file)).isDirectory())file=path.join(file,'index.html');let bytes=await readFile(file);if(oldTheme&&file.endsWith('styles.css'))bytes=Buffer.from(bytes.toString().replaceAll('#ffb15b','#d0ee82'));if(oldTheme&&file.endsWith('sw.js'))bytes=Buffer.from(bytes.toString().replace(/const CACHE="[^"]+"/,'const CACHE="space-archaeology-v5-theme-test-old"'));res.writeHead(200,{'Content-Type':types[path.extname(file)]||'text/plain','Cache-Control':'no-cache'});res.end(bytes)}catch{res.writeHead(404).end()}});
await new Promise(resolve=>server.listen(4176,'127.0.0.1',resolve));
try{
 let executablePath;for(const p of ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']){try{await access(p);executablePath=p;break}catch{}}
 browser=await chromium.launch({executablePath,headless:true});const context=await browser.newContext(),page=await context.newPage();
 await page.goto('http://127.0.0.1:4176');await page.waitForFunction(()=>window.offlinePrepared===true,{},{timeout:90000});await page.reload();
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()),'#d0ee82');
 oldTheme=false;await page.evaluate(async()=>{const registration=await navigator.serviceWorker.getRegistration();await registration.update()});
 await page.waitForFunction(()=>getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()==='#ffb15b',{},{timeout:60000});
 await context.setOffline(true);await page.reload();await page.waitForFunction(()=>document.querySelector('.planet-disc')!==null);assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()),'#ffb15b');
 console.log('PASS: cached green theme updates automatically to V4 orange/blue, and remains correct after offline reload.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
