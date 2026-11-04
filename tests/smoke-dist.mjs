import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {access} from 'node:fs/promises';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,SERVE_DIR:'dist',PORT:'4175',BASE_PATH:'/museum'},stdio:'pipe'});
let browser;
try{
 for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:4175/museum/')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 let executablePath;if(process.platform==='win32')for(const p of ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']){try{await access(p);executablePath=p;break}catch{}}
 browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox']});const context=await browser.newContext(),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4175/museum/');await page.waitForFunction(()=>window.offlinePrepared===true,{},{timeout:90000});await page.reload();await context.setOffline(true);await page.reload();await page.locator('#language').selectOption('ur');await page.locator('#start').click();await page.evaluate(()=>document.fonts.ready);await page.locator('#sceneNav button').last().click();await page.waitForFunction(()=>document.querySelector('#sceneImage').naturalWidth>0);assert.equal(await page.locator('#subtitle').getAttribute('lang'),'ur');
 for(const file of ['docs/SOURCES.md','docs/TEST_REPORT.md','docs/TEST_RESULTS.json','docs/RECORDING_SCRIPTS.md','README.md'])assert.equal(await page.evaluate(async path=>(await fetch(path)).ok,file),true);
 assert.deepEqual(errors,[]);console.log('PASS: packaged dist/ under repository subpath, offline Urdu story, fonts, NASA images and all handoff documents.');
}finally{await browser?.close();server.kill()}
