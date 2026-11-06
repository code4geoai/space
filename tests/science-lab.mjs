import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {access,writeFile,mkdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:4180',ids=['apollo11','rover','reflector','opportunity','ingenuity','debris'],languages=['en','ur','ps','ar','fr','es'];
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'4180'},stdio:'pipe'});const results=[];let browser;
async function run(name,task){try{await task();results.push({name,status:'PASS'});console.log('PASS',name)}catch(error){results.push({name,status:'FAIL',error:error.message});console.error('FAIL',name,error.message)}}
const open=(page,id)=>page.evaluate(id=>{[...document.querySelectorAll('#cards button')][ARTIFACTS.findIndex(a=>a.id===id)].click()},id);
const fire=async page=>{await page.click('#laserFire');await page.waitForFunction(()=>!document.getElementById('laserFire').disabled&&!document.getElementById('laserMath').hidden,{},{timeout:6000});return Number((await page.textContent('#laserTime')).replace(' s',''))};
try{
 await mkdir('test-results',{recursive:true});
 for(let i=0;i<100;i++){try{if((await fetch(base)).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 let executablePath;if(process.platform==='win32')for(const p of ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']){try{await access(p);executablePath=p;break}catch{}}
 browser=await chromium.launch({executablePath,headless:true});
 await run('Every exhibit shows its science panel in all six languages without overflow at 320 px and desktop',async()=>{
  for(const viewport of [{width:320,height:800},{width:1440,height:1000}]){
   const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);
   for(const language of languages){await page.selectOption('#language',language);for(const id of ids){await open(page,id);
    const info=await page.evaluate(()=>{const p=document.getElementById('scienceLab');return{hidden:p.hidden,lang:p.lang,dir:p.dir,cards:p.querySelectorAll('.science-facts article').length,links:p.querySelectorAll('.sources a').length,game:!!document.getElementById('laserGame'),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,text:p.textContent.length}});
    assert.equal(info.hidden,false);assert.equal(info.lang,language);assert.equal(info.dir,['ur','ps','ar'].includes(language)?'rtl':'ltr');assert.equal(info.cards,2);assert.ok(info.links>=1);assert.ok(info.text>100);assert.equal(info.game,id==='reflector',`game only on reflector: ${id}`);assert.ok(info.overflow<=0,`overflow ${language}/${id} at ${viewport.width}: ${info.overflow}`)}}
   assert.deepEqual(errors,[]);await context.close()}
 });
 await run('Laser game: real timing, wrong and right answers, Urdu digits, working, and reset on a new shot',async()=>{
  const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'}),page=await context.newPage();await page.goto(base);await open(page,'reflector');
  assert.equal(await page.isHidden('#laserMath'),true);
  await page.click('#laserFire');assert.equal(await page.isDisabled('#laserFire'),true);await page.waitForTimeout(600);const mid=await page.evaluate(()=>parseFloat(document.querySelector('.laser-pulse').style.left));assert.ok(mid>0,'pulse moves');
  await page.waitForFunction(()=>!document.getElementById('laserMath').hidden,{},{timeout:6000});const t=Number((await page.textContent('#laserTime')).replace(' s',''));
  assert.ok(t>=2.42&&t<=2.71,`round trip ${t}`);const answer=Math.round(150000*t);
  await page.click('#laserCheck');assert.ok((await page.textContent('#laserFeedback')).includes('number'));
  await page.fill('#laserAnswer','100000');await page.click('#laserCheck');assert.ok((await page.textContent('#laserFeedback')).startsWith('Not quite'));
  await page.fill('#laserAnswer',answer.toLocaleString('en-US'));await page.click('#laserCheck');assert.match(await page.textContent('#laserFeedback'),/^Correct! .*1969.* about \d+\.\d m/);
  await page.locator('#scienceLab').screenshot({path:'test-results/science-panel-en.png'});
  await page.click('#laserReveal');assert.equal(await page.textContent('#laserWorking'),`300,000 km/s × ${t.toFixed(2)} s ÷ 2 = ${Math.round(150000*t).toLocaleString('en-US')} km`);assert.equal(await page.getAttribute('#laserReveal','aria-expanded'),'true');
  await page.fill('#laserAnswer',String(answer).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]));await page.click('#laserCheck');assert.ok((await page.textContent('#laserFeedback')).startsWith('Correct'));
  const second=await fire(page);assert.ok(second>=2.42&&second<=2.71);assert.equal(await page.inputValue('#laserAnswer'),'');assert.equal(await page.textContent('#laserFeedback'),'');assert.equal(await page.isHidden('#laserWorking'),true);
  await context.close()
 });
 await run('Changing language mid-shot cancels cleanly; RTL keeps the Earth-Moon diagram readable',async()=>{
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await open(page,'reflector');await page.click('#laserFire');await page.selectOption('#language','ur');await page.waitForTimeout(3200);
  assert.equal(await page.isDisabled('#laserFire'),false);assert.equal(await page.textContent('#laserTime'),'—');assert.deepEqual(errors,[]);
  assert.equal(await page.getAttribute('.laser-stage','dir'),'ltr');
  await page.click('#laserFire');await page.waitForFunction(()=>!document.getElementById('laserMath').hidden,{},{timeout:6000});await page.locator('#scienceLab').screenshot({path:'test-results/science-panel-ur-mobile.png'});await context.close()
 });
 await run('Reduced-motion visitors get the result at once with no pulse',async()=>{
  const context=await browser.newContext({reducedMotion:'reduce',serviceWorkers:'block'}),page=await context.newPage();await page.goto(base);await open(page,'reflector');await page.click('#laserFire');assert.equal(await page.isHidden('#laserMath'),false);assert.equal(await page.isHidden('.laser-pulse'),true);await context.close()
 });
 await run('Theme is untouched: tokens, heading fonts and no colour outside the existing palette',async()=>{
  const css=await readFile('styles.css','utf8'),marker=css.indexOf('/* Science panel and Laser the Moon.');assert.ok(marker>0);
  const colours=text=>new Set([...text.matchAll(/#[0-9a-f]{3,8}\b/gi)].map(m=>m[0].toLowerCase()));const before=colours(css.slice(0,marker));
  for(const colour of colours(css.slice(marker)))assert.ok(before.has(colour),`New colour ${colour}`);
  assert.ok(!/font-family|@font-face/.test(css.slice(marker)),'New CSS must not set a font family');
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();await page.goto(base);await open(page,'reflector');
  const seen=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement),f=q=>getComputedStyle(document.querySelector(q)).fontFamily;return{accent:s.getPropertyValue('--accent').trim(),line:s.getPropertyValue('--line').trim(),muted:s.getPropertyValue('--muted').trim(),site:f('#question'),science:f('#scienceTitle'),lab:f('#laserTitle')}});
  assert.equal(seen.accent,'#ffb15b');assert.equal(seen.line,'#405474');assert.equal(seen.muted,'#becbe3');assert.equal(seen.science,seen.site);assert.equal(seen.lab,seen.site);await context.close()
 });
 await run('Panel and game work offline after the museum is cached',async()=>{
  const context=await browser.newContext(),page=await context.newPage();await page.goto(base);await page.waitForFunction(()=>window.offlinePrepared===true,{},{timeout:90000});await page.reload();await context.setOffline(true);await page.reload();await open(page,'reflector');const t=await fire(page);assert.ok(t>=2.42&&t<=2.71);await context.close()
 });
}finally{await browser?.close();server.kill();await writeFile('test-results/science-lab.json',JSON.stringify(results,null,2))}
if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
