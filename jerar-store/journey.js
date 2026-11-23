/* جرار — رحلة الزيتون: قنينة زيت جرار تتعبّى مع السكرول، والخطوات الأربع تتبدّل جنبها.
   في الكمبيوتر القنينة تميل وتتحرك يمين ويسار مع الماوس */
(function(){
  const old=document.querySelector('#story .journey');if(!old)return;
  const imgs=['img/story/farm.jpg','img/story/pick.jpg','img/story/press.jpg','img/giftbox.jpg'];
  const ord={ar:['الخطوة الأولى','الخطوة الثانية','الخطوة الثالثة','الخطوة الرابعة'],en:['Step one','Step two','Step three','Step four']};
  const wrap=document.createElement('div');wrap.className='jr2';wrap.id='journey';
  wrap.innerHTML=`<div class="wrap jr2-head"><h3 id="jr2H"></h3><p class="sub" id="jr2S"></p></div>
    <div class="jr2-track" id="jr2Track"><div class="jr2-stage wrap">
      <div class="jr2-steps" id="jr2Steps"></div>
      <div class="jr2-bot"><div class="jstage" id="jrBottle" role="img"><div class="jobj" style="--ar:1.0079;--sc:1" data-i="0"><img class="b-empty" src="img/j-tree.webp" alt=""><img class="b-full" src="img/j-tree.webp" alt=""><div class="b-mask" style="-webkit-mask-image:url(img/j-tree.webp);mask-image:url(img/j-tree.webp)"><span class="b-level"></span><span class="b-drop"></span></div></div><div class="jobj" style="--ar:1.0125;--sc:0.72" data-i="1"><img class="b-empty" src="img/j-olive.webp" alt=""><img class="b-full" src="img/j-olive.webp" alt=""><div class="b-mask" style="-webkit-mask-image:url(img/j-olive.webp);mask-image:url(img/j-olive.webp)"><span class="b-level"></span><span class="b-drop"></span></div></div><div class="jobj tin" style="--ar:0.7158;--sc:0.86" data-i="2"><img class="b-empty" src="img/j-tin.webp" alt=""><img class="b-full" src="img/j-tin.webp" alt=""><div class="b-mask" style="-webkit-mask-image:url(img/j-tin.webp);mask-image:url(img/j-tin.webp)"><span class="b-level"></span><span class="b-drop"></span></div></div><div class="jobj" style="--ar:0.2178;--sc:1" data-i="3"><img class="b-empty" src="img/bottle.png" alt=""><img class="b-full" src="img/bottle.png" alt=""><div class="b-mask" style="-webkit-mask-image:url(img/bottle.png);mask-image:url(img/bottle.png)"><span class="b-level"></span><span class="b-drop"></span></div></div></div><span class="jr2-pct" id="jr2Pct">0%</span></div>
    </div></div>`;
  /* القسم صار تحت الشهادات */
  old.remove();
  const sec=document.createElement('section');sec.className='jr2-sec';sec.appendChild(wrap);
  ($('#certs')||$('#story')).after(sec);
  const stepsEl=$('#jr2Steps'),bottle=$('#jrBottle'),objs=[...document.querySelectorAll('#jrBottle .jobj')],track=$('#jr2Track'),pct=$('#jr2Pct');
  let cur=-1;
  function paintText(){
    $('#jr2H').textContent=t('jr_h');$('#jr2S').textContent=t('jr_sub');
    bottle.setAttribute('aria-label',tx({ar:'من شجرة الزيتون للزيتونة للتنكة لقنينة زيت جرار',en:'From olive tree to olive to tin to a Jerar oil bottle'}));
    stepsEl.innerHTML=[1,2,3,4].map((n,i)=>`<article class="jr2-step${i===Math.max(cur,0)?' on':''}">
      <span class="jr2-num"><b>${n}</b>${ord[LANG][i]}</span><h4>${t('jr'+n+'_t')}</h4><p>${t('jr'+n+'_d')}</p>
      ${n===3?`<a class="jr-link" href="#certs">${t('jr3_l')}</a>`:''}<img src="${imgs[i]}" alt="" loading="lazy"></article>`).join('')
      +`<div class="jr2-dots" aria-hidden="true">${[0,1,2,3].map(i=>`<i class="${i<=Math.max(cur,0)?'on':''}"></i>`).join('')}</div>`;
  }
  function setStep(i){if(i===cur)return;cur=i;stepsEl.querySelectorAll('.jr2-step').forEach((s,k)=>s.classList.toggle('on',k===i));stepsEl.querySelectorAll('.jr2-dots i').forEach((d,k)=>d.classList.toggle('on',k<=i))}
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let shown=0,t0=0;
  function progress(){const r=track.getBoundingClientRect();const total=r.height-innerHeight;return total>0?Math.min(1,Math.max(0,-r.top/total)):0}
  function frame(){
    if(!track.offsetParent){requestAnimationFrame(frame);return}
    const target=progress();
    shown+=reduce?(target-shown):(target-shown)*0.12;
    /* كل خطوة لها شكلها: شجرة، زيتونة، تنكة، قنينة. كل شكل يتلوّن من تحت لفوق خلال خطوته */
    const moving=Math.abs(target-shown)>0.002;t0++;
    const si=Math.min(3,Math.floor(shown*4*0.9999));
    objs.forEach((o,i)=>{
      const lp=Math.min(1,Math.max(0,shown*4-i));
      const cut=(1-(i<si?1:lp))*100;
      o.classList.toggle('on',i===si);o.classList.toggle('past',i<si);
      o.style.setProperty('--cut',cut.toFixed(2)+'%');
      o.style.setProperty('--lv',i===si&&lp>0.02&&lp<0.98?1:0);
      o.style.setProperty('--dy',(i===si&&moving&&!reduce&&i>0?((t0*2.2)%Math.max(4,cut-8)):0)+'%');
      o.style.setProperty('--do',i===si&&moving&&!reduce&&i>0?1:0);
    });
    pct.textContent=Math.round(shown*100)+'%';
    setStep(Math.min(3,Math.floor(target*4*0.999)));
    requestAnimationFrame(frame);
  }
  /* الماوس: القنينة تميل وتتحرك يمين ويسار وراه */
  if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduce){
    let tx=0,cx=0,rot=0;
    addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*2});
    (function sway(){cx+=(tx-cx)*0.08;rot=cx*9;
      bottle.style.transform=`translateX(${(cx*38).toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;requestAnimationFrame(sway)})();
  }
  document.addEventListener('localechange',paintText);
  paintText();requestAnimationFrame(frame);
})();
