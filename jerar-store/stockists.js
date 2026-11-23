/* جرار — «منتجاتنا متوفرة في»: المحلات تتحرك في صفّين، أبطأ من شريط العرض فوق */

Object.assign(T,{
  sk_h:{ar:'منتجاتنا متوفرة في',en:'Find our products at'},
  sk_sub:{ar:'في أكثر من 70 فرع حول البحرين',en:'In more than 70 branches across Bahrain'},
  sk_on:{ar:'اطلب أونلاين',en:'Order online'},
  sk_site:{ar:'موقع جرار',en:'Jerar website'},sk_jahez:{ar:'تطبيق جاهز',en:'Jahez app'},sk_talabat:{ar:'تطبيق طلبات مارت',en:'talabat mart app'}
});

/* [عربي, إنجليزي, المكان عربي, المكان إنجليزي, لون الشارة] */
const STORES=[
  ['أسواق الحلّي','Al Helli','جميع الفروع','All branches','#2E8B3E','alhelli'],
  ['أسواق الساتر','Alsater','جميع الفروع','All branches','#1F3F8F','alsater'],
  ['أسواق الأسرة','Alosra','جميع الفروع','All branches','#5E8C3A','alosra'],
  ['أسواق التميمي','Tamimi Markets','','','#D7262E','tamimi'],
  ['أسواق ميدوي','Midway','المحرق / توبلي / عراد','Muharraq / Tubli / Arad','#C2202F','midway'],
  ['لوتس','Lotus','جميع الفروع','All branches','#4F6B3A','lotus'],
  ['أساسيات','Asasiat','شارع البديع','Budaiya Road','#E2811E','asasiat'],
  ['طوبى','Tuba','جد علي','Jid Ali','#1D2B26','tuba'],
  ['رضوي','Radawi','الدراز','Diraz','#1E8EA6','radawi'],
  ['غلومي','Ghuloomi','الجنبية','Janabiya','#7FA33A','ghuloomi'],
  ['عالم الأورجانيك','Organico World','جدحفص','Jidhafs','#8E7A2C','organico'],
  ['ليلي أورجانيكس','Lily Organics','المالكية','Malkiya','#6E5A8C','lily'],
  ['أورجانتشر','Organature','توبلي','Tubli','#E26A5E','organature'],
  ['فوديفاي','Foodify','مجمع سار','Saar Mall','#7D8B7E','foodify'],
  ['صيدلية عُلا','OLA Pharmacy','عالي','A\'ali','#9AA3A0','ola'],
  ['مكسراتي','Mukasarati','أمواج + هالا بلازا','Amwaj + Hala Plaza','#5B3B2A','mukasarati'],
  ['طيبة للمخللات','Pickles Taiba','مجمع العالي','A\'ali Mall','#23302A','taiba']
];
const ONLINE=[['sk_jahez','Jahez','#E52421','img/stores/jahez.png'],['sk_talabat','talabat mart','#F2652A','img/stores/talabat.png']];

(function(){
  const sec=document.createElement('section');sec.className='stock';sec.id='stockists';
  sec.innerHTML=`<div class="wrap sk-head"><img src="img/leaf.png" alt="" aria-hidden="true"><h2 id="skH"></h2><p id="skSub"></p></div>
    <div class="sk-rows" aria-hidden="true"><div class="sk-row"><span class="sk-track" id="skA"></span></div><div class="sk-row rev"><span class="sk-track" id="skB"></span></div></div>
    <ul class="sr" id="skList"></ul>
    <div class="wrap sk-on"><span id="skOnH"></span><div id="skOn"></div></div>`;
  $('#gifts').after(sec);

  const ini=en=>en.replace(/[^A-Za-z ]/g,'').split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const card=s=>`<span class="sk-c"><span class="sk-b sk-logo"><img src="img/stores/${s[5]}.png" alt="" loading="lazy"></span><span class="sk-t"><b>${LANG==='ar'?s[0]:s[1]}</b><small>${LANG==='ar'?s[1]:s[0]}</small>${s[2]?`<em><svg viewBox="0 0 24 24"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>${LANG==='ar'?s[2]:s[3]}</em>`:''}</span></span>`;

  function fill(el,list,secPer){
    el.innerHTML=`<span class="sk-half">${list.map(card).join('')}</span>`;
    const one=el.firstChild.getBoundingClientRect().width||900;
    const n=Math.max(1,Math.ceil((Math.max(innerWidth,screen.width||0)+200)/one));
    const half=`<span class="sk-half">${list.map(card).join('').repeat(n)}</span>`;
    el.innerHTML=half+half;
    el._half=el.firstChild.getBoundingClientRect().width;el._speed=secPer;
  }
  function paint(){
    $('#skH').textContent=t('sk_h');$('#skSub').textContent=t('sk_sub',{n:ni(STORES.length)});
    fill($('#skA'),STORES.slice(0,9),22);fill($('#skB'),STORES.slice(9),22);
    $('#skList').innerHTML=STORES.map(s=>`<li>${LANG==='ar'?s[0]:s[1]}${s[2]?'، '+(LANG==='ar'?s[2]:s[3]):''}</li>`).join('');
    $('#skOnH').textContent=t('sk_on');
    $('#skOn').innerHTML=ONLINE.map(([k,lbl,c,img],i)=>`<span class="sk-o"><i class="full" style="--b:${c}"><img src="${img}" alt=""></i><b>${t(k)}</b><small>${lbl}</small></span>`).join('');
  }
  /* الحركة بالكود بدل CSS، عشان العميل يقدر يسحب الشعارات بإصبعه أو بالماوس، وبعدها ترجع تمشي */
  const rows=[[$('#skA'),1],[$('#skB'),-1]].map(([el,dir])=>({el,dir,x:dir>0?-1:0,drag:null,hover:false}));
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  rows.forEach(r=>{
    const box=r.el.parentElement;
    /* الوقفة عند المرور بالماوس بس، عشان اللمس في الجوال ما يوقّفها للأبد */
    box.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')r.hover=true});
    box.addEventListener('pointerleave',()=>{r.hover=false});
    box.addEventListener('pointerdown',e=>{r.drag={sx:e.clientX,x0:r.x,moved:false};box.setPointerCapture(e.pointerId);box.classList.add('grab')});
    box.addEventListener('pointermove',e=>{if(!r.drag)return;const dx=e.clientX-r.drag.sx;if(Math.abs(dx)>3)r.drag.moved=true;r.x=r.drag.x0+dx;wrap(r);r.el.style.transform=`translateX(${r.x}px)`});
    const end=()=>{if(!r.drag)return;r.drag=null;box.classList.remove('grab')};
    box.addEventListener('pointerup',end);box.addEventListener('pointercancel',end);
  });
  function wrap(r){const h=r.el._half||1;while(r.x>0)r.x-=h;while(r.x<=-h)r.x+=h}
  let last=performance.now();
  function tick(now){
    const dt=Math.min(64,now-last)/1000;last=now;
    /* لو القسم كان مخفي وقت الرسم (العميل فتح صفحة منتج أول)، نعيد حساب العرض أول ما يبان */
    if(rows.some(r=>(r.el._half||0)<50)&&sec.offsetParent!==null&&sec.getBoundingClientRect().width>0){paint();rows.forEach(r=>{r.x=r.dir>0?-(r.el._half||0):0})}
    rows.forEach(r=>{
      if(r.x===-1&&r.dir>0)r.x=-(r.el._half||0);
      if(!reduce&&!r.drag&&!r.hover)r.x+=r.dir*(r.el._speed||22)*dt;
      wrap(r);r.el.style.transform=`translateX(${r.x}px)`;
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  document.addEventListener('localechange',paint);
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(paint,300)});
  paint();
})();
