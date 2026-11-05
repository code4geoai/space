/* "The science it made possible" panel and the Laser the Moon game.
   app.js calls renderScience() whenever an exhibit or language changes. */
(() => {
 'use strict';
 let run=0; // Replacing the panel invalidates any pulse still in flight.
 const el=(tag,content,className)=>{const node=document.createElement(tag);if(content!==undefined&&content!==null)node.textContent=content;if(className)node.className=className;return node};
 const ltr=(text,className)=>{const node=el('bdi',text,className);node.dir='ltr';return node};
 const grouped=value=>Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
 const links=list=>{const box=el('div',null,'sources');for(const [name,url]of list){const a=el('a',name+' ↗');a.href=url;a.target='_blank';a.rel='noopener';a.lang='en';a.dir='ltr';box.append(a)}return box};
 // Accepts Latin, Urdu/Pashto and Arabic digits, with or without separators.
 function parseAnswer(text){const digits=String(text).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^\d]/g,'');return digits?Number(digits):NaN}

 function renderLaser(words){
  const config=SCIENCE.laser,box=el('div',null,'laser-game');box.id='laserGame';const current=++run;
  const title=el('h3',words.title);title.id='laserTitle';box.setAttribute('aria-labelledby','laserTitle');box.append(title,el('p',words.intro));
  const stage=el('div',null,'laser-stage');stage.dir='ltr';stage.setAttribute('role','img');stage.setAttribute('aria-label',words.diagram);
  const earth=el('span',words.earth,'laser-body laser-earth'),moon=el('span',words.moon,'laser-body laser-moon'),track=el('span',null,'laser-track'),pulse=el('span',null,'laser-pulse');
  pulse.hidden=true;track.append(pulse);stage.append(earth,track,moon);
  const readings=el('div',null,'laser-readings'),timeBox=el('p'),speedBox=el('p');
  const timeValue=ltr('—');timeValue.id='laserTime';
  timeBox.append(el('span',words.time,'small'),el('br'),timeValue);speedBox.append(el('span',words.speed,'small'),el('br'),ltr('~'+grouped(config.speedKmS)+' km/s'));readings.append(timeBox,speedBox);
  const fire=el('button',words.fire,'primary');fire.id='laserFire';
  const status=el('p',null,'small');status.id='laserStatus';status.setAttribute('role','status');
  const math=el('div',null,'laser-math');math.id='laserMath';math.hidden=true;
  const formula=el('p',words.formula,'laser-formula'),why=el('p',words.why,'small');
  const fieldId='laserAnswer',label=el('label',words.answer);label.htmlFor=fieldId;
  const input=el('input');input.id=fieldId;input.type='text';input.inputMode='numeric';input.autocomplete='off';input.dir='ltr';
  const check=el('button',words.check,'primary');check.id='laserCheck';
  const reveal=el('button',words.working,'outline');reveal.id='laserReveal';reveal.setAttribute('aria-expanded','false');reveal.setAttribute('aria-controls','laserWorking');
  const row=el('div',null,'laser-answer');row.append(input,check,reveal);
  const feedback=el('p',null,'laser-feedback');feedback.id='laserFeedback';feedback.setAttribute('role','status');
  const working=el('p',null,'laser-formula');working.id='laserWorking';working.dir='ltr';working.hidden=true;
  math.append(formula,why,label,row,feedback,working);
  box.append(stage,readings,fire,status,math,el('p',words.note,'small'),links(config.sources));

  let seconds=0;
  function finish(){
   timeValue.textContent=seconds.toFixed(2)+' s';pulse.hidden=true;fire.disabled=false;fire.textContent=words.again;status.textContent='';
   input.value='';feedback.textContent='';working.hidden=true;reveal.textContent=words.working;reveal.setAttribute('aria-expanded','false');math.hidden=false;
  }
  fire.onclick=()=>{
   // Each shot lands somewhere on the Moon's real orbit, so times differ.
   const distance=config.minKm+Math.random()*(config.maxKm-config.minKm);
   seconds=Number((2*distance/config.trueSpeedKmS).toFixed(2));
   if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return}
   fire.disabled=true;math.hidden=true;status.textContent=words.flying;pulse.hidden=false;const start=performance.now();
   const tick=now=>{
    if(current!==run)return;
    const elapsed=(now-start)/1000,share=Math.min(elapsed/seconds,1);
    pulse.style.left=(share<.5?share*2:(1-share)*2)*100+'%';timeValue.textContent=Math.min(elapsed,seconds).toFixed(2)+' s';
    if(share<1)requestAnimationFrame(tick);else finish();
   };requestAnimationFrame(tick);
  };
  check.onclick=()=>{
   const guess=parseAnswer(input.value),target=config.speedKmS*seconds/2;
   if(!Number.isFinite(guess)){feedback.textContent=words.empty;input.focus();return}
   if(Math.abs(guess-target)<=target*config.tolerance){
    const metres=(new Date().getFullYear()-config.sinceYear)*config.driftCmPerYear/100;
    feedback.textContent=words.correct+' '+words.drift.replace('{m}',metres.toFixed(1));
   }else feedback.textContent=words.wrong;
  };
  reveal.onclick=()=>{
   working.hidden=!working.hidden;reveal.textContent=working.hidden?words.working:words.hide;reveal.setAttribute('aria-expanded',String(!working.hidden));
   working.textContent=grouped(config.speedKmS)+' km/s × '+seconds.toFixed(2)+' s ÷ 2 = '+grouped(config.speedKmS*seconds/2)+' km';
  };
  return box;
 }

 window.renderScience=(panel,id,language)=>{
  run++;panel.replaceChildren();
  const text=SCIENCE.text[language]??SCIENCE.text.en,entry=text.exhibits[id],metrics=SCIENCE.metrics[id];
  panel.hidden=!entry;if(!entry)return;
  panel.lang=language in SCIENCE.text?language:'en';panel.dir=LANGUAGES[panel.lang].dir;
  const heading=el('h3',text.title);heading.id='scienceTitle';
  panel.append(el('p',text.eyebrow,'eyebrow'),heading,el('p',entry[0]));
  const cards=el('div',null,'science-facts');
  metrics.forEach((number,i)=>{const card=el('article'),value=ltr(number,'flight-number');card.append(value,el('p',entry[i+1]));cards.append(card)});
  panel.append(cards,links(SCIENCE.sources[id]));
  if(id==='reflector')panel.append(renderLaser(text.laser));
 };
})();
