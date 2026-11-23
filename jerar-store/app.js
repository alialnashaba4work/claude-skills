const FACT_IC={
 size:'<path d="M4 8l8-4 8 4-8 4z"/><path d="M4 8v8l8 4 8-4V8"/><path d="M12 12v8"/>',
 ing:'<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/>',
 allergy:'<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.5"/>',
 origin:'<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
 store:'<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 11v6"/>',
 use:'<path d="M7 3v7a2 2 0 0 0 2 2v9M11 3v7a2 2 0 0 1-2 2M9 3v6"/><path d="M17 21V3c-2 1.5-3 4-3 7s1 3 3 3"/>',
 del:'<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.7"/><circle cx="17" cy="17.5" r="1.7"/>'
};
/* جرار — الصفحة الرئيسية وصفحات المنتجات في صفحة وحدة.
   #p-malaki يفتح صفحة المنتج، و #shop أو #gifts ... ترجع للرئيسية.
   كل شي يعيد رسم نفسه لما تتغير اللغة أو البلد (حدث localechange) */

const WA_ICON='<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.1-3.6A8 8 0 0 1 4 12z"/></svg>';

/* ===== الرئيسية ===== */
let cat='all';
function renderTabs(){
  $('#tabs').innerHTML=CATS.filter(c=>c[0]!=='gifts').map(([k,l])=>`<button class="tab" data-k="${k}" aria-pressed="${k===cat}">${tx(l)}</button>`).join('');
}
/* p.shop: منتج من الهدايا بس يطلع مع المنتجات (مثل الميني بوكس) */
let sortBy='def',inStock=false;
function renderGrid(){
  let list=P.filter(p=>(p.c!=='gifts'&&(cat==='all'||p.c===cat))||(p.shop&&cat==='all'));
  if(inStock)list=list.filter(p=>!isOut(p));
  const nmOf=p=>nm(p);
  if(sortBy==='lo')list=[...list].sort((x,y)=>x.p-y.p);
  else if(sortBy==='hi')list=[...list].sort((x,y)=>y.p-x.p);
  else if(sortBy==='az')list=[...list].sort((x,y)=>nmOf(x).localeCompare(nmOf(y),LANG));
  else list=[...list].sort((x,y)=>(isOut(x)?1:0)-(isOut(y)?1:0));
  $('#grid').innerHTML=list.length?list.map(cardHTML).join(''):`<p class="empty" style="grid-column:1/-1">${t('f_none')}</p>`;
  const c=$('#fCount');if(c)c.textContent=t('f_count',{n:ni(list.length)});
}
function renderTools(){
  const el=$('#shopTools');if(!el)return;
  el.innerHTML=`<span class="f-count" id="fCount"></span>
    <label class="f-stock"><input type="checkbox" id="fStock" ${inStock?'checked':''}><span class="f-sw" aria-hidden="true"></span>${t('f_stock')}</label>
    <label class="f-sort"><span>${t('f_sort')}</span><select id="fSort">
      ${[['def','f_def'],['lo','f_lo'],['hi','f_hi'],['az','f_az']].map(([k,l])=>`<option value="${k}" ${k===sortBy?'selected':''}>${t(l)}</option>`).join('')}
    </select></label>`;
  $('#fSort').onchange=e=>{sortBy=e.target.value;renderGrid()};
  $('#fStock').onchange=e=>{inStock=e.target.checked;renderGrid()};
}
function renderGifts(){
  const gl=P.filter(p=>p.c==='gifts'&&!p.shop);
  $('#giftsGrid').classList.toggle('two',gl.length===2);
  $('#giftsGrid').innerHTML=gl.map(p=>`
   <article class="gift ${p.big?'big':''}"><img loading="lazy" src="img/${p.img}" alt="${nm(p)}">
     <a class="cover" href="${link(p)}" aria-label="${nm(p)}"></a>
     <div class="in"><div><h3>${nm(p)}</h3><p>${tx(p.desc)}${LANG==='ar'?'، ':', '}${money(p.p)}</p></div>
     <button class="add" data-add="${p.id}" aria-label="${t('add_aria',{p:nm(p)})}">${ICON_ADD}${t('add')}</button></div>
   </article>`).join('');
}
function renderDelivery(){
  if(!$('#delStrip'))return;
  const cc=CC();
  const nv=$('#noteVat');if(nv)nv.textContent=isBH()?t('note_vat'):t('note_conv');
  $('#delStrip').innerHTML=isBH()
    ?`<div><span class="fee">${money(0.8)}</span><b>${t('del_std')}</b><span>${t('del_std_s')}</span></div>
      <div><span class="fee">${money(1.5)}</span><b>${t('del_exp')}</b><span>${t('del_exp_s')}</span></div>
      <div><b>${t('del_q')}</b><span>${t('del_q_s')} <a class="ltr" href="https://wa.me/97332159000">+973 3215 9000</a></span></div>`
    :`<div><b>${t('del_out',{c:cc[LANG]})}</b><span>${t('del_out_s')}</span></div>
      <div><b>${t('del_rate')}</b><span>${t('del_rate_s')}</span></div>
      <div><b>${t('del_q')}</b><span>${t('del_q_s')} <a class="ltr" href="https://wa.me/97332159000">+973 3215 9000</a></span></div>`;
}

/* طلب الجملة: الزر رابط واتساب يتحدّث مع كل حرف */
function updateWs(){
  const via=t(document.querySelector('input[name=via]:checked').value);
  $('#wsSend').href=waUrl(`${t('m_ws')}\n${t('m_name')}: ${$('#wsName').value||'-'}\n${t('m_co')}: ${$('#wsCo').value||'-'}\n${t('m_country')}: ${CC()[LANG]}\n${t('m_via')}: ${via}\n\n${$('#wsMsg').value}`);
}
$('#wsForm').addEventListener('input',updateWs);
$('#wsForm').addEventListener('change',updateWs);
$('#wsForm').addEventListener('submit',e=>e.preventDefault());

/* ===== صور المنتج: الصورة الأساسية + p.gallery (صور إضافية) + عرض بملء الشاشة ===== */
/* كل منتج: صورته + صوره الإضافية + بطاقة «المكونات» (إذا عنده مكونات) */
const pics=p=>[p.img,...(p.gallery||[])].concat(p.ing?['@ing']:[]);
function ingCard(p,big){
  const items=tx(p.ing).split(/[،,]\s*/).filter(Boolean);
  return `<div class="ing-card ${big?'big':''}" style="--c:${p.col}">
    <div class="ing-top"><img src="img/leaf.png" alt=""><span>${t('fact_ing')}</span></div>
    <b class="ing-name">${nm(p)}</b>
    <ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul>
    ${p.size?`<span class="ing-size">${tx(p.size)}</span>`:''}
  </div>`;
}
function galleryHTML(p){
  const ps=pics(p);
  return `<div class="pd-arch" id="gMain"><img id="gImg" src="img/${ps[0]}" alt="${nm(p)}"><div class="g-ing" id="gIng" hidden>${p.ing?ingCard(p):''}</div>
      <button type="button" class="g-full" id="gFull" aria-label="${t('g_full')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg><span>${t('g_full')}</span></button>
      ${ps.length>1?`<span class="g-n" id="gN">1 / ${ps.length}</span>`:''}
    </div>
    ${ps.length>1?`<div class="g-thumbs" role="group" aria-label="${t('g_pics')}">${ps.map((s,i)=>s==='@ing'?`<button type="button" class="g-ing-th" data-g="${i}" aria-pressed="false" aria-label="${t('fact_ing')}"><img src="img/leaf.png" alt=""><span>${t('fact_ing')}</span></button>`:`<button type="button" data-g="${i}" aria-pressed="${i===0}" aria-label="${t('g_pic',{n:i+1})}"><img src="img/${s}" alt="" loading="lazy"></button>`).join('')}</div>`:''}`;
}
let gIdx=0;
function bindGallery(p){
  const ps=pics(p);gIdx=0;
  const show=i=>{gIdx=(i+ps.length)%ps.length;const isIng=ps[gIdx]==='@ing';$('#gIng').hidden=!isIng;$('#gImg').hidden=isIng;if(!isIng)$('#gImg').src='img/'+ps[gIdx];
    document.querySelectorAll('[data-g]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.g===gIdx));
    const n=$('#gN');if(n)n.textContent=`${gIdx+1} / ${ps.length}`;};
  document.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>show(+b.dataset.g));
  $('#gFull').onclick=()=>openLB(p,gIdx);
  let swiped=false;
  $('#gImg').onclick=()=>{if(swiped){swiped=false;return}openLB(p,gIdx)};
  /* السحب يمين ويسار ينقل للصورة الثانية (مثل تطبيقات التسوق) */
  if(ps.length>1)swipe($('#gMain'),d=>{swiped=true;setTimeout(()=>swiped=false,350);const m=$('#gMain');m.classList.remove('sw-l','sw-r');void m.offsetWidth;m.classList.add(d>0?'sw-l':'sw-r');show(gIdx+d)});
}
/* سحب بالإصبع أو الماوس: d=1 للصورة الجاية، d=-1 للي قبلها. في العربي الجاية على اليسار */
function swipe(el,cb){
  let x0=null,y0=0,id=null;
  el.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;x0=e.clientX;y0=e.clientY;id=e.pointerId});
  el.addEventListener('pointerup',e=>{if(x0===null||e.pointerId!==id)return;const dx=e.clientX-x0,dy=e.clientY-y0;x0=null;
    if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.2){const next=LANG==='ar'?dx>0:dx<0;cb(next?1:-1)}});
  el.addEventListener('pointercancel',()=>x0=null);
  el.addEventListener('dragstart',e=>e.preventDefault());
}
function openLB(p,i){
  const ps=pics(p);let k=i;
  let lb=$('#lb');
  if(!lb){lb=document.createElement('div');lb.id='lb';lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');document.body.appendChild(lb)}
  const paint=()=>{lb.innerHTML=`<button type="button" class="lb-x icon-btn" data-lbx aria-label="${t('cert_close')}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    ${ps[k]==='@ing'?ingCard(p,true):`<img src="img/${ps[k]}" alt="${nm(p)}">`}
    ${ps.length>1?`<button type="button" class="lb-nav lb-p" data-lbs="-1" aria-label="${t('cert_prev')}"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg></button>
    <button type="button" class="lb-nav lb-n" data-lbs="1" aria-label="${t('cert_next')}"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button><span class="lb-c">${k+1} / ${ps.length}</span>`:''}`};
  const close=()=>{lb.classList.remove('on');document.body.classList.remove('s-open');document.removeEventListener('keydown',key);setTimeout(()=>lb.hidden=true,200);$('#gFull')&&$('#gFull').focus()};
  const key=e=>{if(e.key==='Escape')close();else if(e.key==='ArrowLeft'){k=(k+(LANG==='ar'?1:-1)+ps.length)%ps.length;paint()}else if(e.key==='ArrowRight'){k=(k+(LANG==='ar'?-1:1)+ps.length)%ps.length;paint()}};
  lb.onclick=e=>{if(e.target===lb||e.target.closest('[data-lbx]'))return close();const s=e.target.closest('[data-lbs]');if(s){k=(k+ +s.dataset.lbs+ps.length)%ps.length;paint()}};
  if(!lb._sw){lb._sw=1;swipe(lb,d=>lb._go&&lb._go(d))}
  lb._go=ps.length>1?d=>{k=(k+d+ps.length)%ps.length;paint()}:null;
  paint();lb.hidden=false;requestAnimationFrame(()=>lb.classList.add('on'));document.body.classList.add('s-open');document.addEventListener('keydown',key);
  setTimeout(()=>lb.querySelector('.lb-x').focus(),30);
}

/* ===== صفحة المنتج ===== */
let current=null;          // المنتج المفتوح
let pstate={size:null,qty:1};
function renderProduct(p,keep){
  if(!keep){pstate={size:p.sizes?(p.sizes.find(s=>s.in)||p.sizes[0]).k:null,qty:1}}
  const size=()=>p.sizes?p.sizes.find(s=>s.k===pstate.size):null;
  const out=()=>p.sizes?!size().in:!!p.out;
  const price=()=>size()?size().p:p.p;
  const key=()=>size()?`${p.id}:${size().k}`:p.id;

  const facts=[];
  if(p.size)facts.push([p.c==='dressings'?t('fact_pack'):t('fact_size'),tx(p.size),'size']);
  if(p.ing)facts.push([t('fact_ing'),tx(p.ing),'ing']);
  if(p.store)facts.push([t('fact_store'),tx(p.store),'store']);
  if(p.use)facts.push([t('fact_use'),tx(p.use),'use']);
  if(p.origin)facts.push([t('fact_origin'),tx(p.origin),'origin']);

  const related=P.filter(x=>x.id!==p.id&&x.c===p.c&&!isOut(x)).concat(P.filter(x=>x.c!==p.c&&x.c!=='gifts'&&!isOut(x))).slice(0,4);

  $('#pmain').innerHTML=`
  <section class="pd" style="--c:${p.col}">
    <div class="wrap">
      <nav class="crumbs" aria-label="${t('crumbs')}">
        <a href="#top">${t('home')}</a><span aria-hidden="true">/</span>
        <a href="${p.c==='gifts'?'#gifts':'#products'}" data-cat="${p.c==='gifts'?'all':p.c}">${catName(p.c)}</a><span aria-hidden="true">/</span>
        <span aria-current="page">${nm(p)}</span>
      </nav>
      <div class="pd-grid">
        <div class="pd-media">${galleryHTML(p)}</div>
        <div class="pd-info">
          <span class="band" aria-hidden="true"></span>
          <h1>${nm(p)}</h1>
          <span class="en">${otherName(p)}</span>
          <p class="pd-price" id="price"></p>
          <p class="pd-tax" id="ptax"></p>
          <p class="pd-about">${tx(p.about)}</p>
          <ul class="pd-lines">${tx(p.lines).map(l=>`<li>${l}</li>`).join('')}</ul>
          ${p.sizes?`<span class="opt-label" id="sizeLbl">${t('choose_size')}</span>
            <div class="sizes" role="group" aria-labelledby="sizeLbl">${p.sizes.map(s=>`<button data-size="${s.k}" ${s.in?'':'disabled'} aria-pressed="${s.k===pstate.size}">${tx(s.l)}<small>${s.in?money(s.p):t('sold_out')}</small></button>`).join('')}</div>`:''}
          <div id="buyArea"></div>
        </div>
      </div>
      ${p.inside?`<div class="inside"><h2>${t('inside_box')}</h2><ul>${tx(p.inside).map(i=>`<li>${i}</li>`).join('')}</ul></div>`:''}
      <dl class="pd-facts">${facts.map(([a,b,k])=>`<div><span class="f-ic" aria-hidden="true"><svg viewBox="0 0 24 24">${FACT_IC[k]||''}</svg></span><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>
    </div>
  </section>
  ${related.length?`<section class="related"><div class="wrap"><h2>${t('related')}</h2><div class="grid">${related.map(cardHTML).join('')}</div></div></section>`:''}`;

  function renderBuy(){
    $('#price').innerHTML=priceHTML(price());
    $('#ptax').textContent=isBH()?t('vat'):t('conv',{p:bhdText(price())});
    const name=`${nm(p)}${size()?' ('+tx(size().l)+')':''}`;
    if(out()){
      $('#buyArea').innerHTML=`<p class="oos">${p.sizes?t('oos_size'):t('oos_prod')}</p>
        <div class="buy"><a class="btn btn-soft" target="_blank" rel="noopener" href="${waUrl(t('m_notify',{p:name}))}">${WA_ICON}${t('notify')}</a></div>`;
      return;
    }
    $('#buyArea').innerHTML=`<div class="buy">
        <div class="qty"><button id="qPlus" aria-label="${t('qty_plus')}">+</button><span id="qVal" aria-live="polite">${ni(pstate.qty)}</span><button id="qMinus" aria-label="${t('qty_minus')}">−</button></div>
        <button class="btn btn-green" id="addBtn">${t('add_to_cart',{p:showAmt(convert(price())*pstate.qty)})}</button>
      </div>`;
    $('#qPlus').onclick=()=>{pstate.qty++;renderBuy()};
    $('#qMinus').onclick=()=>{pstate.qty=Math.max(1,pstate.qty-1);renderBuy()};
    $('#addBtn').onclick=()=>{add(key(),pstate.qty);pstate.qty=1;renderBuy();openCart()};
  }
  $('#pmain').onclick=e=>{
    const b=e.target.closest('[data-size]');if(!b||b.disabled)return;
    pstate.size=b.dataset.size;
    document.querySelectorAll('[data-size]').forEach(x=>x.setAttribute('aria-pressed',x===b));
    renderBuy();
  };
  renderBuy();
  bindGallery(p);
}

/* ===== التنقل بالـ hash ===== */
function route(){
  const h=location.hash.slice(1);
  const p=h.startsWith('p-')?byId(h.slice(2)):null;
  const plp=!p&&h==='products';
  document.body.classList.toggle('view-product',!!p);
  document.body.classList.toggle('view-plp',plp);
  $('#top').hidden=!!p||plp;
  $('#pmain').hidden=!p;
  $('#plp').hidden=!plp;
  current=p;
  if(p){
    document.title=`${nm(p)} | ${LANG==='ar'?'جرار':'Jerar'}`;
    renderProduct(p);
    scrollTo({top:0,behavior:'instant'});
  }else if(plp){
    document.title=t('plp_title');
    scrollTo({top:0,behavior:'instant'});
  }else{
    document.title=t('doc_title');
    const target=h&&document.getElementById(h);
    if(target)setTimeout(()=>scrollTo({top:target.getBoundingClientRect().top+scrollY-70,behavior:'instant'}),0);
    else if(!h)scrollTo({top:0,behavior:'instant'});
  }
  closeCart();toggleMenu(false);setHeader();
}
function renderBest(){
  const el=$('#bestGrid');if(!el)return;
  el.innerHTML=P.filter(p=>p.best&&!isOut(p)).map(cardHTML).join('');
  el.querySelectorAll('.card .ph').forEach(ph=>{const b=document.createElement('span');b.className='best-tag';b.textContent=t('best_tag');ph.appendChild(b)});
}
function renderHome(){renderBest();renderTabs();renderTools();renderGrid();renderGifts();renderDelivery();updateWs()}

document.addEventListener('localechange',()=>{
  renderHome();
  if(current){document.title=`${nm(current)} | ${LANG==='ar'?'جرار':'Jerar'}`;renderProduct(current,true)}
  else document.title=location.hash==='#products'?t('plp_title'):t('doc_title');
});
document.addEventListener('click',e=>{
  const tb=e.target.closest('.tab');if(tb){cat=tb.dataset.k;renderTabs();renderGrid();return}
  const f=e.target.closest('[data-cat]');if(f){cat=f.dataset.cat;renderTabs();renderGrid()}
  /* رابط لنفس الـ hash الحالي ما يطلق hashchange، فنعيد التوجيه يدوياً */
  const a=e.target.closest('a[href^="#"]');
  if(a&&a.getAttribute('href')===location.hash)route();
});
addEventListener('hashchange',route);

renderHome();route();

/* ===== الواجهة: تتبدل بالمنتجات ===== */
(function heroSlider(){
  const arch=document.querySelector('.hero .arch'),stamp=$('#heroStamp'),dotsEl=$('#heroDots');
  if(!arch||!stamp||!dotsEl)return;
  const list=P.filter(p=>!isOut(p));
  const gi=list.findIndex(p=>p.id==='gift');if(gi>0)list.unshift(list.splice(gi,1)[0]);
  let i=0,timer=null,paused=false;
  arch.innerHTML=list.map((p,k)=>`<img class="hs${k===0?' on':''}" src="img/${p.img}" alt="" ${k>2?'loading="lazy"':''}>`).join('');
  dotsEl.innerHTML=list.map((p,k)=>`<button type="button" data-k="${k}" aria-pressed="${k===0}"></button>`).join('');
  const imgs=[...arch.querySelectorAll('img')],dots=[...dotsEl.children];
  function paint(){
    const p=list[i];
    imgs.forEach((im,k)=>{im.classList.toggle('on',k===i);im.alt=k===i?nm(p):'';});
    dots.forEach((d,k)=>{d.setAttribute('aria-pressed',k===i);d.setAttribute('aria-label',nm(list[k]));});
    arch.style.setProperty('--hc',p.col);
    stamp.href=link(p);
    stamp.innerHTML=`<span>${nm(p)}</span><span>${money(p.p)}</span>`;
  }
  function go(k){
    i=(k+list.length)%list.length;
    stamp.classList.add('sw');
    setTimeout(()=>{paint();stamp.classList.remove('sw')},220);
    imgs.forEach((im,n)=>im.classList.toggle('on',n===i));
    dots.forEach((d,n)=>d.setAttribute('aria-pressed',n===i));
  }
  function start(){stop();timer=setInterval(()=>{if(!paused&&!document.hidden)go(i+1)},4500)}
  function stop(){if(timer)clearInterval(timer)}
  dotsEl.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;go(+b.dataset.k);start()});
  const jar=document.querySelector('.hero .jar');
  jar.addEventListener('mouseenter',()=>paused=true);
  jar.addEventListener('mouseleave',()=>paused=false);
  document.addEventListener('localechange',paint);
  paint();start();
})();

/* ===== الشهادات: معاينة داخل الموقع ===== */
(function certs(){
  const C={
    '2024':{lab:{ar:'مختبر ATECH، البحرين',en:'ATECH Laboratory, Bahrain'},date:'11.12.2024',
      verdict:{ar:'مطابق لمواصفة زيت الزيتون البكر الممتاز GSO/FS/1019/2014',en:'Complies with GSO/FS/1019/2014 for extra virgin olive oil'},
      res:[[{ar:'الأحماض الدهنية الحرة',en:'Free fatty acid'},'0.33 %','≤ 0.8'],[{ar:'قيمة البيروكسيد',en:'Peroxide value'},'9.8 meqO₂/kg','≤ 20'],
           [{ar:'الحديد',en:'Iron (Fe)'},'0.08 mg/kg','≤ 3.0'],[{ar:'النحاس',en:'Copper (Cu)'},'0.03 mg/kg','≤ 0.1']]},
    '2023':{lab:{ar:'مختبر ALS Arabia، معتمد ISO 17025',en:'ALS Arabia, ISO 17025 accredited'},date:'16.01.2024',
      verdict:{ar:'تحليل القيمة الغذائية لزيت الزيتون البكر الممتاز',en:'Nutrition analysis of extra virgin olive oil'},
      res:[[{ar:'الدهون الكلية',en:'Total fat'},'99.3 g/100mL',''],[{ar:'الدهون الأحادية غير المشبعة',en:'Monounsaturated fat'},'66.1 g/100mL',''],
           [{ar:'رقم الحموضة',en:'Acid value'},'0.25 mg KOH/mL',''],[{ar:'الدهون المتحولة',en:'Trans fat'},'< 0.20 g/100mL',''],[{ar:'الكوليسترول',en:'Cholesterol'},'< 3 mg/100mL','']]},
    '2022':{lab:{ar:'وزارة الصحة، إدارة الصحة العامة، البحرين',en:'Ministry of Health, Public Health Directorate, Bahrain'},date:'12.01.2022',
      verdict:{ar:'نتيجة الفحص الكيميائي: مُرضية',en:'Chemistry status: satisfactory result'},
      res:[[{ar:'الأحماض الدهنية الحرة',en:'Free fatty acid'},'0.74 %','0 – 3.3'],[{ar:'قيمة البيروكسيد',en:'Peroxide value'},'4.88 mEq/kg','0 – 20'],
           [{ar:'الرقم اليودي',en:'Iodine value'},'78.34','75 – 94'],[{ar:'رقم التصبن',en:'Saponification value'},'186.46 mg KOH/g','184 – 196']]}
  };
  const ORDER=['2024','2023','2022'];
  const box=$('#cbox');if(!box)return;
  const img=$('#cbImg'),view=$('#cbView'),info=$('#cbInfo');
  let cur='2024',lastFocus=null;
  function labs(){document.querySelectorAll('[data-cert-lab]').forEach(el=>el.textContent=tx(C[el.dataset.certLab].lab))}
  function paint(){
    const c=C[cur];
    img.src=`img/certs/cert-${cur}.jpg`;img.alt=`${t('cert_t')} ${cur}`;
    view.classList.remove('zoomed');view.scrollTo(0,0);
    info.innerHTML=`<span class="cb-y">${cur}</span>
      <h3>${t('cert_t')}</h3>
      <p class="cb-ok"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>${tx(c.verdict)}</p>
      <dl class="cb-meta"><div><dt>${t('cert_lab')}</dt><dd>${tx(c.lab)}</dd></div><div><dt>${t('cert_date')}</dt><dd class="ltr">${c.date}</dd></div></dl>
      <h4>${t('cert_res')}</h4>
      <ul class="cb-res">${c.res.map(([n,v,l])=>`<li><span>${tx(n)}</span><b class="ltr">${v}</b>${l?`<small>${t('cert_lim')} <span class="ltr">${l}</span></small>`:''}</li>`).join('')}</ul>
      <p class="cb-hint">${t('cert_zoom')}</p>
      <div class="cb-dots">${ORDER.map(y=>`<button type="button" data-go="${y}" aria-pressed="${y===cur}">${y}</button>`).join('')}</div>`;
  }
  function open(y){cur=y;lastFocus=document.activeElement;paint();box.hidden=false;requestAnimationFrame(()=>box.classList.add('on'));document.body.classList.add('s-open');box.querySelector('.cb-x').focus()}
  function close(){box.classList.remove('on');document.body.classList.remove('s-open');setTimeout(()=>{box.hidden=true},250);if(lastFocus)lastFocus.focus()}
  function step(d){const i=ORDER.indexOf(cur);cur=ORDER[(i+d+ORDER.length)%ORDER.length];paint()}
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-cert]');if(b){open(b.dataset.cert);return}
    if(box.hidden)return;
    if(e.target.closest('[data-cb-close]')){close();return}
    const g=e.target.closest('[data-go]');if(g){cur=g.dataset.go;paint();return}
    if(e.target===img){view.classList.toggle('zoomed');return}
  });
  $('#cbPrev').addEventListener('click',()=>step(-1));
  $('#cbNext').addEventListener('click',()=>step(1));
  document.addEventListener('keydown',e=>{
    if(box.hidden)return;
    if(e.key==='Escape')close();
    else if(e.key==='ArrowLeft')step(LANG==='ar'?1:-1);
    else if(e.key==='ArrowRight')step(LANG==='ar'?-1:1);
  });
  document.addEventListener('localechange',()=>{labs();if(!box.hidden)paint()});
  labs();
})();

/* ===== reveal on scroll ===== */
(function reveal(){
  const els=document.querySelectorAll('.st-reveal');
  if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.2});
  els.forEach(e=>io.observe(e));
})();
