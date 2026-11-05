import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'4185'},stdio:'pipe'});let browser;
const results=[];
try{
 for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:4185')).ok)break}catch{}await new Promise(r=>setTimeout(r,100))}
 const executablePath=process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined;browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
 await page.goto('http://127.0.0.1:4185');await page.waitForFunction(()=>window.offlinePrepared===true,{},{timeout:90000});await page.reload();await context.setOffline(true);await page.reload();
 for(const lang of ['en','ur','ps','ar']){
  await page.locator('#language').selectOption(lang);
  for(let i=0;i<6;i++){
   await page.locator('.card button').nth(i).click();
   const id=await page.evaluate(()=>museum.getState().artifact),expected=id==='ingenuity'?5:3;
   assert.equal(await page.locator('#sceneNav button').count(),expected);
   const images=new Set();
   for(let s=0;s<expected;s++){
    await page.locator('#sceneNav button').nth(s).click();
    await page.waitForFunction(()=>{const image=document.querySelector('#sceneImage');return image.complete&&image.naturalWidth>0});
    images.add(await page.locator('#sceneImage').getAttribute('src'));
   }
   assert.equal(images.size,expected);
   const count=id==='ingenuity'?5:4;assert.equal(await page.locator('#galleryItems button').count(),count);
   for(let g=0;g<count;g++){
    const button=page.locator('#galleryItems button').nth(g);await button.focus();await page.keyboard.press('Enter');
    await page.waitForFunction(()=>{const image=document.querySelector('#largePhoto');return image.complete&&image.naturalWidth>0});
    assert.match(await page.locator('#largeSource').getAttribute('href'),/nasa.gov/);
    assert.ok((await page.locator('#largeCaption').innerText()).length>60);
    await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#photoDialog').open,{},{timeout:5000,polling:50});await page.waitForTimeout(150);assert.equal(await button.evaluate(e=>e===document.activeElement),true);
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  }
  results.push({language:lang,status:'PASS',checks:'Six artifacts offline: distinct scene photographs, full galleries, NASA sources, keyboard focus and mobile width'});
  console.log('PASS',lang,'all six offline photographic stories and galleries');
 }
 await context.close();
}finally{await browser?.close();server.kill();await writeFile('docs/GALLERY_RESULTS.json',JSON.stringify(results,null,2)+'\n')}
