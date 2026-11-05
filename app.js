/* Buildless, relative URLs: works under any GitHub Pages repository path. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id), html=document.documentElement;
 const state={lang:'en',world:'all',artifact:null,contentLang:'en',scenes:[],index:-1,time:0,duration:60,playing:false,mode:'visual',last:0,frame:0,token:0,paused:false,tts:null,recording:false,speechNext:null,voiceWaitCancel:null,speechTimer:0};
 const audio=new Audio(); audio.preload='metadata';
 let recorder,stream,recordContext,recordChunks=[],galleryReturn;
 function stored(k){try{return localStorage.getItem(k)}catch{return null}}
 function save(k,v){try{localStorage.setItem(k,v)}catch{/* Private browsing still works. */}}
 function t(key){return UI[state.lang]?.[key]??UI.en[key]??key}
 function label(el,key){const translated=UI[state.lang]?.[key];el.textContent=translated??UI.en[key]??key;const fallback=state.lang!=='en'&&translated===undefined;el.lang=fallback?'en':state.lang;el.dir=fallback?'ltr':LANGUAGES[state.lang].dir;if(fallback){const marker=document.createElement('small');marker.className='en-marker';marker.textContent=' EN';marker.setAttribute('aria-label','English source');el.append(marker)}}
 function status(key){label($('playStatus'),key)}
 function imagePath(key){return 'assets/images/'+PHOTOS[key].file}
 function caption(key){const p=PHOTOS[key];return `${p.caption} · ${p.credit} · ${p.id}`}
 function setImage(img,key){img.src=imagePath(key);img.alt=PHOTOS[key].caption;img.lang='en';img.dir='ltr';img.onerror=()=>{img.alt=t('imageUnavailable')+' · '+PHOTOS[key].id;img.classList.add('image-error')}}
 function canChange(){if(state.recording){status('stopRecording');return false}return true}
 function applyLanguage(language){
  if(!canChange()){$('language').value=state.lang;return}
  stopPlayback();state.lang=LANGUAGES[language]?language:'en';html.lang=state.lang;html.dir=LANGUAGES[state.lang].dir;save('sa-v5-language',state.lang);$('language').value=state.lang;
  document.querySelectorAll('[data-t]').forEach(el=>label(el,el.dataset.t));
  $('reviewNote').textContent=state.lang==='en'?'':t('review');
  $('reviewNote').lang=state.lang;$('language').setAttribute('aria-label',t('language'));$('sceneNav').setAttribute('aria-label',t('scene'));renderCards();updateOffline();if(state.artifact)openArtifact(state.artifact.id,false);
 }
 function textFor(a){const language=a.text[state.lang]?state.lang:'en';return {language,value:a.text[language]}}
 function renderCards(){
  $('cards').replaceChildren();
  for(const [i,a] of ARTIFACTS.entries()){
   if(state.world!=='all'&&a.world!==state.world)continue;
   const card=document.createElement('article');card.className='card';
   const img=document.createElement('img');img.className='card-photo';img.width=600;img.height=400;img.loading='lazy';setImage(img,a.photo);
   const body=document.createElement('div');body.className='card-body';
   const meta=document.createElement('div');meta.className='card-meta';const world=document.createElement('span');world.textContent=t(a.world)+' / '+String(i+1).padStart(2,'0');const date=document.createElement('span');date.dir='ltr';date.textContent=a.year;meta.append(world,date);
   const {language,value}=textFor(a),h=document.createElement('h3'),p=document.createElement('p');h.textContent=value[0];h.lang=p.lang=language;h.dir=p.dir=LANGUAGES[language].dir;p.textContent=value[1];
   if(language!==state.lang){const note=document.createElement('p');note.className='review-note';note.textContent=t('sourceText')+' · EN';body.append(note)}
   const b=document.createElement('button');const name=document.createElement('span');label(name,'view');const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');b.append(name,arrow);b.setAttribute('aria-label',t('view')+': '+value[0]);b.onclick=()=>openArtifact(a.id,true);body.append(meta,h,p,b);card.append(img,body);$('cards').append(card);
  }
 }
 function recording(){return AUDIO.recordings[`${state.contentLang}/${state.artifact.id}`]}
 function deviceVoices(){try{return window.speechSynthesis?.getVoices()??[]}catch{return []}}
 function matchingVoice(){
  const language=state.contentLang.toLowerCase(),base=language.split('-')[0],normalize=v=>v.lang.toLowerCase().replaceAll('_','-');
  const matches=deviceVoices().filter(v=>language==='zh-cn'?['zh-cn','zh-sg','zh-hans','cmn-cn'].includes(normalize(v))||normalize(v).startsWith('zh-hans-'):normalize(v).split('-')[0]===base);
  return matches.find(v=>normalize(v)===language&&v.localService)??matches.find(v=>v.localService)??matches.find(v=>normalize(v)===language)??matches[0];
 }
 function voiceAvailability(){
  if(!state.artifact)return;const voice=matchingVoice();
  label($('deviceVoiceStatus'),voice?'deviceReady':'noVoice');
  if(voice){const name=document.createElement('bdi');name.lang='en';name.textContent=' · '+voice.name+' ('+voice.lang+')';$('deviceVoiceStatus').append(name)}
 }
 function waitForVoice(token){
  const voice=matchingVoice();if(voice||deviceVoices().length||!window.speechSynthesis)return Promise.resolve(voice);
  status('voiceLoading');
  return new Promise(resolve=>{
   let done=false;const synth=window.speechSynthesis;
   const finish=value=>{if(done)return;done=true;clearInterval(poll);clearTimeout(timeout);synth.removeEventListener('voiceschanged',check);if(state.voiceWaitCancel===cancel)state.voiceWaitCancel=null;resolve(value)};
   const check=()=>{const match=matchingVoice();if(token!==state.token)finish(null);else if(match)finish(match)};
   const cancel=()=>finish(null),poll=setInterval(check,150),timeout=setTimeout(()=>finish(matchingVoice()),3000);
   state.voiceWaitCancel=cancel;synth.addEventListener('voiceschanged',check);check();
  });
 }
 function validRecording(r){return !!(r?.available&&r.file===`audio/${state.contentLang}/${state.artifact.id}.mp3`&&Array.isArray(r.cues)&&r.cues.length===state.scenes.length&&r.cues[0]===0&&r.cues.every((n,i)=>Number.isFinite(n)&&(i===0||n>r.cues[i-1]))&&Number.isFinite(r.duration)&&r.duration>r.cues.at(-1))}
 function resetTimeline(){const r=recording();state.duration=validRecording(r)?r.duration:state.scenes.length*12;state.time=0;state.index=-1;state.scenes.forEach((scene,i)=>{scene.start=validRecording(r)?r.cues[i]:i*12});paint()}
 function openArtifact(id,focus=true){
  if(!canChange())return;stopPlayback();const a=ARTIFACTS.find(a=>a.id===id);if(!a)return;state.artifact=a;
  const {language,value}=textFor(a);state.contentLang=language;$('exhibit').hidden=false;$('storyTitle').textContent=value[0];$('storyTitle').lang=language;$('storyTitle').dir=LANGUAGES[language].dir;
  const scenes=a.id==='ingenuity'?(INGENUITY_SCENES[language]||INGENUITY_SCENES.en):[[value[0],value[2]]];
  state.scenes=scenes.map(([title,text],i)=>({title,text,photo:a.scenePhotos?.[i]??a.photo,start:i*12}));
  $('facts').textContent=value[1];$('facts').lang=language;$('facts').dir=LANGUAGES[language].dir;
  $('transcript').replaceChildren();state.scenes.forEach(scene=>{const p=document.createElement('p');p.textContent=scene.text;p.lang=language;p.dir=LANGUAGES[language].dir;$('transcript').append(p)});
  $('contentNotice').textContent=language!==state.lang?t('englishFallback'):(language==='en'?t('reviewSource'):t('review'));
  $('sources').replaceChildren();a.sources.forEach(([title,url])=>{const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener';link.lang='en';link.dir='ltr';link.textContent=title+' ↗';$('sources').append(link)});
  $('sceneNav').replaceChildren();state.scenes.forEach((scene,i)=>{const b=document.createElement('button');b.textContent=String(i+1).padStart(2,'0');b.setAttribute('aria-label',t('scene')+' '+(i+1)+': '+scene.title);b.onclick=()=>seek(state.scenes[i].start);$('sceneNav').append(b)});
  resetTimeline();renderGallery();renderQuiz();renderFlightLab();updateRecording();status('ready');
  if(focus){$('exhibit').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('exhibit').focus({preventScroll:true})}
 }
 function updateRecording(){
  label($('recordingState'),validRecording(recording())?'recordReady':'recordNeeded');$('recordingPath').textContent=`audio/${state.contentLang}/${state.artifact.id}.mp3`;
  label($('play'),$('audioMode').value==='visual'?'play':'playNarration');voiceAvailability();
 }
 function renderGallery(){
  $('galleryItems').replaceChildren();for(const key of [...new Set(state.scenes.map(s=>s.photo))]){const b=document.createElement('button');b.setAttribute('aria-label',t('galleryLabel')+': '+PHOTOS[key].id);const img=document.createElement('img');img.loading='lazy';img.width=300;img.height=200;setImage(img,key);const span=document.createElement('span');span.lang='en';span.dir='ltr';span.textContent=PHOTOS[key].id+' · '+PHOTOS[key].credit;b.append(img,span);b.onclick=()=>{galleryReturn=b;setImage($('largePhoto'),key);$('largeCaption').textContent=caption(key);$('largeCaption').lang='en';$('largeCaption').dir='ltr';$('largeSource').href=PHOTOS[key].source;$('photoDialog').showModal()};$('galleryItems').append(b)}
 }
 function renderQuiz(){
  const a=state.artifact;$('question').textContent=a.quiz.key==='flights'?QUIZ_FLIGHTS[state.lang]:t('question');$('answers').replaceChildren();$('feedback').textContent='';
  const options=a.quiz.options??[t('moon'),t('mars')],correct=a.quiz.key==='flights'?a.quiz.correct:(a.world==='moon'?0:1);
  options.forEach((option,i)=>{const b=document.createElement('button');b.className='outline';b.textContent=option;b.onclick=()=>{label($('feedback'),i===correct?'correct':'wrong');b.setAttribute('aria-pressed',i===correct?'true':'false')};$('answers').append(b)})
 }
 function stopVideo(){
  $('nasaVideoFrame')?.remove();if($('loadNasaVideo'))$('loadNasaVideo').hidden=false;if($('closeNasaVideo'))$('closeNasaVideo').hidden=true;
  document.querySelectorAll('[data-clip]').forEach(button=>button.setAttribute('aria-pressed','false'));if($('clipLearning'))$('clipLearning').hidden=true;
 }
 function renderFlightLab(){
  const lab=$('flightLab');lab.replaceChildren();lab.hidden=state.artifact.id!=='ingenuity';if(lab.hidden)return;
  const text=FLIGHT_LAB.text[state.lang]??FLIGHT_LAB.text.en;lab.lang=state.lang;lab.dir=LANGUAGES[state.lang].dir;
  const el=(tag,content,className)=>{const node=document.createElement(tag);if(content)node.textContent=content;if(className)node.className=className;return node};
  const title=el('h3',text.title);title.id='flightLabTitle';lab.append(title,el('p',text.intro));
  const cards=el('div',null,'flight-facts');
  for(const [number,key]of [['~1%','density'],['~38%','gravity'],['~2,400 rpm','rotors']]){const card=el('article'),metric=el('bdi',number,'flight-number');metric.dir='ltr';card.append(metric,el('h4',text[key]),el('p',text[key+'Text']));cards.append(card)}lab.append(cards);
  const chart=el('div',null,'density-chart');
  for(const [label,cls]of [[text.earth,'earth-air'],[text.mars,'mars-air']]){const row=el('div',null,'density-row'),track=el('div',null,'density-track'),bar=el('span',null,cls);track.setAttribute('aria-hidden','true');track.append(bar);row.append(el('p',label),track);chart.append(row)}lab.append(chart,el('p',text.note,'small'));
  const sources=el('div',null,'sources');for(const [name,url]of FLIGHT_LAB.sources){const a=el('a',name+' ↗');a.href=url;a.target='_blank';a.rel='noopener';a.lang='en';a.dir='ltr';sources.append(a)}lab.append(sources);
  const words=text.excerpts,video=el('div',null,'video-reference');video.append(el('h3',words.heading),el('p',words.hint,'small'),el('p',text.videoNote,'small'));
  const excerptCards=el('div',null,'video-clips');
  const learning=el('div',null,'clip-learning');learning.id='clipLearning';learning.hidden=true;
  const question=el('h4'),answer=el('p'),reveal=el('button',words.explain,'outline');question.id='clipQuestion';answer.id='clipAnswer';answer.hidden=true;reveal.setAttribute('aria-controls','clipAnswer');reveal.setAttribute('aria-expanded','false');
  reveal.onclick=()=>{answer.hidden=!answer.hidden;reveal.textContent=answer.hidden?words.explain:words.hide;reveal.setAttribute('aria-expanded',String(!answer.hidden))};learning.append(question,reveal,answer);
  const load=el('button',words.full,'primary');load.id='loadNasaVideo';
  const close=el('button',words.stop,'outline');close.id='closeNasaVideo';close.hidden=true;close.onclick=()=>{stopVideo();notice.textContent='';load.focus()};
  const external=el('a',text.open,'outline');external.href=FLIGHT_LAB.video.url;external.target='_blank';external.rel='noopener';
  const notice=el('p',null,'small');notice.id='videoStatus';notice.setAttribute('role','status');
  const playerHost=el('div',null,'video-host');
  function loadVideo(clip,index){
   stopVideo();
   if(clip){document.querySelector(`[data-clip="${clip.id}"]`).setAttribute('aria-pressed','true');question.textContent=words.clips[index][1];answer.textContent=words.clips[index][2];answer.hidden=true;reveal.textContent=words.explain;reveal.setAttribute('aria-expanded','false');learning.hidden=false}
   if(!navigator.onLine){notice.textContent=text.unavailable;return}
   stopPlayback();status('ready');
   const start=clip?.start??FLIGHT_LAB.video.start,range=clip?'&end='+clip.end:'';
   const frame=el('iframe');frame.id='nasaVideoFrame';frame.title=clip?words.clips[index][0]+' · English NASA video':'NASA Ingenuity mission video · English';frame.lang='en';frame.src=`https://www.youtube-nocookie.com/embed/${FLIGHT_LAB.video.id}?start=${start}${range}&rel=0&playsinline=1&cc_load_policy=1&cc_lang_pref=en`;frame.allow='encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';playerHost.append(frame);close.hidden=false;
   external.href=`https://www.youtube.com/watch?v=${FLIGHT_LAB.video.id}&t=${start}s`;
   if(clip){notice.replaceChildren(el('span',words.selected+' · '));const time=el('bdi',formatTime(clip.start)+'–'+formatTime(clip.end));time.dir='ltr';notice.append(time,el('span',' · '+words.playerHint))}else notice.textContent=words.playerHint;
  }
  FLIGHT_LAB.video.clips.forEach((clip,index)=>{const card=el('article'),button=el('button',null,'clip-button');button.dataset.clip=clip.id;button.setAttribute('aria-pressed','false');const time=el('bdi',formatTime(clip.start)+'–'+formatTime(clip.end));time.dir='ltr';button.append(el('span',words.watch+' '+(index+1),'small'),el('strong',words.clips[index][0]),time);button.onclick=()=>loadVideo(clip,index);card.append(button);excerptCards.append(card)});
  load.onclick=()=>loadVideo();
  const provenance=el('a',text.source);provenance.href=FLIGHT_LAB.video.source;provenance.target='_blank';provenance.rel='noopener';
  video.append(excerptCards,load,close,external,notice,playerHost,learning,provenance);lab.append(video);
 }
 function formatTime(seconds){const n=Math.max(0,Math.floor(seconds));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')}
 function paint(){
  if(!state.scenes.length)return;
  let index=0;state.scenes.forEach((s,i)=>{if(state.time>=s.start)index=i});
  if(index!==state.index){state.index=index;const s=state.scenes[index];setImage($('sceneImage'),s.photo);$('sceneCaption').textContent=PHOTOS[s.photo].credit+' · '+PHOTOS[s.photo].id+' · '+t('photoNote');$('sceneCaption').lang='en';$('sceneCaption').dir='ltr';$('sceneTitle').textContent=s.title;$('subtitle').textContent=s.text;for(const id of ['sceneTitle','subtitle']){$(id).lang=state.contentLang;$(id).dir=LANGUAGES[state.contentLang].dir}$('sceneCount').textContent=String(index+1).padStart(2,'0')+' / '+String(state.scenes.length).padStart(2,'0');[...$('sceneNav').children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)))}
  $('seek').value=String(state.time/state.duration*100);$('seek').setAttribute('aria-valuetext',formatTime(state.time)+' / '+formatTime(state.duration));$('time').textContent=formatTime(state.time)+' / '+formatTime(state.duration);
 }
 function stopPlayback(){
  state.token++;state.voiceWaitCancel?.();clearTimeout(state.speechTimer);state.speechNext=null;cancelAnimationFrame(state.frame);state.playing=false;state.paused=false;state.tts=null;audio.pause();audio.onended=audio.onerror=audio.ontimeupdate=null;audio.removeAttribute('src');audio.load();window.speechSynthesis?.cancel();if($('pause'))label($('pause'),'pause');
 }
 function end(){state.playing=false;cancelAnimationFrame(state.frame);state.time=state.duration;paint();status('ended');label($('pause'),'pause')}
 function tick(now){
  if(!state.playing||state.mode!=='visual')return;
  if(document.hidden){state.last=now}else{state.time=Math.min(state.duration,state.time+(now-state.last)/1000*Number($('speed').value));state.last=now;paint()}
  if(state.time>=state.duration)return end();state.frame=requestAnimationFrame(tick);
 }
 async function play(){
  if(!state.artifact)return;
  stopVideo();
  if(state.paused)return togglePause();
  const position=state.time>=state.duration?0:state.time;stopPlayback();state.time=position;state.mode=$('audioMode').value;state.playing=true;const token=state.token;paint();
  if(state.mode==='auto')state.mode=validRecording(recording())?'recorded':'browser';
  if(state.mode==='visual'){status('visualStatus');state.last=performance.now();state.frame=requestAnimationFrame(tick);return}
  if(state.contentLang!==state.lang){state.playing=false;status('sourceAudioBlocked');return}
  if(state.mode==='recorded'){
   const r=recording();if(!validRecording(r)){state.playing=false;status('missingAudio');return}
   let failed=false;const failure=()=>{if(failed||token!==state.token)return;failed=true;audio.pause();if($('audioMode').value==='auto'){label($('recordingState'),'audioLoadFail');startDeviceVoice(token)}else{state.playing=false;status('audioLoadFail')}};
   audio.src=r.file;audio.playbackRate=Number($('speed').value);audio.currentTime=state.time;audio.ontimeupdate=()=>{if(token!==state.token||!state.playing||state.mode!=='recorded')return;state.time=Math.min(audio.currentTime,state.duration);paint()};audio.onended=end;audio.onerror=failure;
   try{await audio.play();if(token===state.token&&!failed)status('recordPlaying')}catch(error){if(token===state.token){if(error.name==='NotAllowedError'){failed=true;state.playing=false;status('blocked')}else failure()}}return;
  }
  return startDeviceVoice(token);
 }
 async function startDeviceVoice(token){
  state.mode='browser';const immediate=matchingVoice();const voice=immediate??await waitForVoice(token);if(token!==state.token)return;
  voiceAvailability();if(!voice||!window.SpeechSynthesisUtterance){state.playing=false;state.paused=false;label($('pause'),'pause');status('noVoice');return}
  const begin=()=>{window.speechSynthesis.resume();speakScene(state.index,voice,token)};
  if(state.paused)state.speechNext=begin;else begin();
 }
 function speakScene(index,voice,token,part=0){
  if(token!==state.token)return;if(index>=state.scenes.length)return end();
  const scene=state.scenes[index],parts=scene.text.match(/[^.!?۔؟。！？]+[.!?۔؟。！？]*/gu)??[scene.text];
  if(part>=parts.length)return speakScene(index+1,voice,token);
  const offset=parts.slice(0,part).join('').length,sceneEnd=state.scenes[index+1]?.start??state.duration;
  state.time=scene.start+(sceneEnd-scene.start)*offset/scene.text.length;paint();
  const utterance=new SpeechSynthesisUtterance(parts[part]);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=Number($('speed').value);utterance.volume=1;state.tts=utterance;let started=false;
  const current=()=>token===state.token&&state.tts===utterance;
  utterance.onstart=()=>{if(current()){started=true;clearTimeout(state.speechTimer);status('devicePlaying')}};
  utterance.onboundary=e=>{if(current()&&state.playing){state.time=scene.start+(sceneEnd-scene.start)*Math.min(.999,(offset+e.charIndex)/scene.text.length);paint()}};
  utterance.onend=()=>{if(!current())return;clearTimeout(state.speechTimer);const next=()=>speakScene(index,voice,token,part+1);if(state.paused)state.speechNext=next;else if(state.playing)next()};
  utterance.onerror=e=>{if(current()&&e.error!=='canceled'&&e.error!=='interrupted'){clearTimeout(state.speechTimer);state.playing=false;status('blocked')}};
  state.speechTimer=setTimeout(()=>{if(current()&&!started&&state.playing){state.tts=null;state.playing=false;window.speechSynthesis.cancel();status('blocked')}},5000);
  try{window.speechSynthesis.speak(utterance)}catch{clearTimeout(state.speechTimer);state.playing=false;status('blocked')}
 }
 function togglePause(){
  if(!state.playing&&!state.paused)return;
  if(state.paused){state.paused=false;state.playing=true;label($('pause'),'pause');if(state.mode==='visual'){state.last=performance.now();state.frame=requestAnimationFrame(tick)}else if(state.mode==='recorded'){audio.play().catch(()=>{state.playing=false;status('blocked')})}else if(state.speechNext){const next=state.speechNext;state.speechNext=null;window.speechSynthesis?.resume();next()}else window.speechSynthesis?.resume();return}
  state.paused=true;state.playing=false;cancelAnimationFrame(state.frame);label($('pause'),'resume');if(state.mode==='recorded'){audio.pause();state.time=Math.min(audio.currentTime,state.duration);paint()}if(state.mode==='browser')window.speechSynthesis.pause();
 }
 function seek(time){const active=state.playing;stopPlayback();state.time=Math.max(0,Math.min(time,state.duration));paint();if(active)play();else status('ready')}
 function updateOffline(){const el=$('offlineStatus');const key=!('serviceWorker'in navigator)||location.protocol==='file:'?'offlineUnavailable':window.offlinePrepared?'offlineReady':window.offlineFailed?'offlineFail':'offlineWaiting';label(el,key)}
 $('language').onchange=e=>applyLanguage(e.target.value);
 document.querySelectorAll('[data-world]').forEach(b=>b.onclick=()=>{state.world=b.dataset.world;document.querySelectorAll('[data-world]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderCards()});
 $('start').onclick=()=>{openArtifact('ingenuity',true)};
 $('play').onclick=play;$('pause').onclick=togglePause;$('stop').onclick=()=>{stopPlayback();state.time=0;paint();status('ready')};
 $('audioMode').onchange=()=>{stopPlayback();state.time=0;paint();updateRecording();status('ready')};
 $('speed').onchange=()=>{audio.playbackRate=Number($('speed').value);if(state.playing&&state.mode==='browser'){const pos=state.scenes[state.index].start;seek(pos)}};
 $('seek').oninput=e=>seek(Number(e.target.value)/100*state.duration);
 $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('exhibit').requestFullscreen()}catch{status('fullUnavailable')}};
 document.addEventListener('fullscreenchange',()=>label($('fullscreen'),document.fullscreenElement?'exitFullscreen':'present'));
 $('closePhoto').onclick=()=>$('photoDialog').close();$('photoDialog').addEventListener('close',()=>galleryReturn?.focus());
 $('record').onclick=async()=>{
  if(!state.artifact||state.recording)return;stopPlayback();recordContext={id:state.artifact.id,lang:state.contentLang};state.recording=true;$('record').disabled=true;
  try{if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw Error('unsupported');stream=await navigator.mediaDevices.getUserMedia({audio:true});recordChunks=[];recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>{if(e.data.size)recordChunks.push(e.data)};
   recorder.onstop=()=>{const blob=new Blob(recordChunks,{type:recorder.mimeType||'audio/webm'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=recordContext.id+'-'+recordContext.lang+(blob.type.includes('ogg')?'.ogg':'.webm');a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);stream.getTracks().forEach(track=>track.stop());state.recording=false;$('record').disabled=false;$('finish').disabled=true;label($('recordStatus'),'recordSaved')};
   recorder.start();state.recording=true;$('record').disabled=true;$('finish').disabled=false;label($('recordStatus'),'recording');
  }catch{state.recording=false;$('record').disabled=false;stream?.getTracks().forEach(track=>track.stop());label($('recordStatus'),'recordDenied')}
 };
 $('finish').onclick=()=>{if(recorder?.state==='recording')recorder.stop()};
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.playing)togglePause()});
 window.addEventListener('pagehide',()=>{stopPlayback();if(recorder?.state==='recording')recorder.stop();stream?.getTracks().forEach(track=>track.stop())});
 applyLanguage(stored('sa-v5-language')||'en');
 window.speechSynthesis?.addEventListener('voiceschanged',voiceAvailability);
 deviceVoices(); // Start asynchronous browser voice discovery before the first Play click.
 const controlledAtLoad=!!navigator.serviceWorker?.controller;
 navigator.serviceWorker?.addEventListener('controllerchange',()=>{
  // An installed update has a complete offline cache. Refresh an older open
  // page so its HTML and stylesheet cannot keep showing the previous theme.
  if(controlledAtLoad&&!state.recording&&!window.museumUpdateReloading){window.museumUpdateReloading=true;location.reload()}
 });
 if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(async registration=>{
  const ready=await navigator.serviceWorker.ready;const worker=ready.active||registration.active;
  if(worker){const channel=new MessageChannel();channel.port1.onmessage=e=>{window.offlinePrepared=e.data.ready;window.offlineFailed=!e.data.ready;updateOffline()};worker.postMessage({type:'CACHE_STATUS'},[channel.port2])}
 }).catch(()=>{window.offlineFailed=true;updateOffline()});
 // A read-only hook lets browser tests inspect the same state the visitor sees.
 window.museum={getState:()=>({lang:state.lang,contentLang:state.contentLang,artifact:state.artifact?.id,scene:state.index,time:state.time,playing:state.playing,paused:state.paused,mode:state.mode})};
})();
