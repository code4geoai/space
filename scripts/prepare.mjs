import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const context={};context.window=context;vm.createContext(context);
vm.runInContext(await readFile('data/media.js','utf8'),context);
for(const folder of ['assets/images','assets/fonts','data','docs','scripts','tests','.github/workflows',...['en','ur','ps','ar','fr','es','zh-CN'].map(l=>'audio/'+l)]){
 await mkdir(folder,{recursive:true});
 if(folder.startsWith('audio/'))await writeFile(folder+'/.gitkeep','');
}
const entries=[];
for(const [key,photo]of Object.entries(context.PHOTOS)){
 const file='assets/images/'+photo.file,data=await readFile(file);
 entries.push({kind:'photograph',key,file,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex'),archiveId:photo.id,credit:photo.credit,source:photo.source,caption:photo.caption});
}
for(const [file,license,source]of [
 ['Inter.ttf','Inter-OFL.txt','inter/Inter%5Bopsz,wght%5D.ttf'],
 ['NotoNastaliqUrdu.ttf','Nastaliq-OFL.txt','notonastaliqurdu/NotoNastaliqUrdu%5Bwght%5D.ttf'],
 ['NotoNaskhArabic.ttf','Naskh-OFL.txt','notonaskharabic/NotoNaskhArabic%5Bwght%5D.ttf'],
 ['NotoSansSC.ttf','Chinese-OFL.txt','notosanssc/NotoSansSC%5Bwght%5D.ttf']]){
 const local='assets/fonts/'+file,data=await readFile(local);
 entries.push({kind:'font',file:local,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex'),license:'assets/fonts/'+license,source:'https://raw.githubusercontent.com/google/fonts/main/ofl/'+source});
}
await writeFile('docs/ASSET_INVENTORY.json',JSON.stringify({photographs:9,fontFamilies:4,cinematicScenes:['ingenuity','first-flight','aerial','debris','final'],assets:entries},null,2)+'\n');
console.log('Prepared seven recording folders and verified inventory of nine local NASA photographs and four fonts.');
