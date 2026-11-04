import {readFile,stat,readdir} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const context={};context.window=context;vm.createContext(context);
for(const file of ['data/ui.js','data/content.js','data/flight-lab.js','data/media.js']){
 // Browser global object and lexical identifiers share the same realm.
 Object.assign(context,context.window);vm.runInContext(await readFile(file,'utf8'),context,{filename:file});
}
Object.assign(context,context.window);
const {ARTIFACTS,UI,LANGUAGES,INGENUITY_SCENES,PHOTOS,AUDIO,FLIGHT_LAB}=context.window;
assert.equal(ARTIFACTS.length,6);assert.equal(Object.keys(LANGUAGES).length,7);
for(const file of ['app.js','sw.js','data/ui.js','data/content.js','data/flight-lab.js','data/media.js'])execFileSync(process.execPath,['--check',file]);
const html=await readFile('index.html','utf8'),css=await readFile('styles.css','utf8');
for(const key of [...html.matchAll(/data-t="(.*?)"/g)].map(m=>m[1]))assert.ok(UI.en[key],`Missing English UI: ${key}`);
assert.ok(!/@import|https?:\/\//.test(css),'Fonts must be local');
for(const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g))assert.ok((await stat(match[1])).isFile(),`Missing stylesheet asset: ${match[1]}`);
assert.ok(!(await readFile('sw.js','utf8')).includes('/.gitkeep'),'Git folder markers must not be required by offline caching');
for(const l of Object.keys(LANGUAGES)){
 assert.ok((await stat('audio/'+l)).isDirectory(),`Missing recording folder: ${l}`);
 assert.ok(UI[l].headline);assert.ok(UI[l].review||l==='en');
 assert.ok(FLIGHT_LAB.text[l]);for(const value of Object.values(FLIGHT_LAB.text[l]))assert.equal(typeof value,'string');
 for(const [key,value]of Object.entries(UI[l]))assert.equal(typeof value,'string',`Undefined UI ${l}/${key}`);
 assert.equal(INGENUITY_SCENES[l].length,5);
 for(const a of ARTIFACTS){assert.ok(a.text[l]?.every(Boolean),`Missing content ${l}/${a.id}`);assert.equal(a.text[l].length,3)}
}
for(const [key,p]of Object.entries(PHOTOS)){
 const data=await readFile('assets/images/'+p.file);assert.ok(data.length>3000);assert.equal(data[0],255);assert.equal(data[1],216);assert.ok(/nasa\.gov/.test(p.source),`Non-NASA source ${key}`);assert.ok(p.credit.startsWith('NASA'));
}
for(const file of ['Inter.ttf','NotoNastaliqUrdu.ttf','NotoNaskhArabic.ttf','NotoSansSC.ttf'])assert.ok((await stat('assets/fonts/'+file)).size>30000);
for(const a of ARTIFACTS){assert.ok(PHOTOS[a.photo]);for(const [,url]of a.sources)assert.ok(url.includes('nasa.gov'));assert.ok(['moon','mars'].includes(a.world))}
for(const [key,r]of Object.entries(AUDIO.recordings)){
 const [l,id]=key.split('/');assert.ok(LANGUAGES[l]);const a=ARTIFACTS.find(a=>a.id===id);assert.ok(a);if(!r.available)continue;
 assert.equal(r.file,`audio/${l}/${id}.mp3`);assert.ok((await stat(r.file)).size>1000);assert.equal(r.cues.length,id==='ingenuity'?5:1);assert.equal(r.cues[0],0);assert.ok(r.cues.every((v,i)=>Number.isFinite(v)&&(i===0||v>r.cues[i-1])));assert.ok(r.duration>r.cues.at(-1));
}
const scripts=await readFile('docs/RECORDING_SCRIPTS.md','utf8');
for(const l of ['en','ur','ps'])for(const [,text]of INGENUITY_SCENES[l])assert.ok(scripts.includes(text),`Recording script drift: ${l}`);
for(const fontLicense of ['Inter-OFL.txt','Naskh-OFL.txt','Nastaliq-OFL.txt','Chinese-OFL.txt'])assert.ok((await readFile('assets/fonts/'+fontLicense,'utf8')).includes('OPEN FONT LICENSE'));
assert.ok(html.includes('width=device-width'));assert.ok(!html.includes('autoplay'));
assert.equal(FLIGHT_LAB.video.id,'hW5akI5Rnyg');assert.equal(FLIGHT_LAB.video.start,115);for(const [,source]of FLIGHT_LAB.sources)assert.ok(source.includes('nasa.gov'));
const inventory=JSON.parse(await readFile('docs/ASSET_INVENTORY.json','utf8'));
assert.equal(inventory.assets.length,13);assert.equal(inventory.cinematicScenes.length,5);
for(const asset of inventory.assets){const bytes=await readFile(asset.file);assert.equal(bytes.length,asset.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,`Asset checksum mismatch: ${asset.file}`)}
console.log('PASS: content, seven locales, nine authentic local images, bundled fonts/licenses, scripts, MP3 manifest and JavaScript syntax.');
