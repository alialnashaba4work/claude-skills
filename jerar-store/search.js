/* جرار — البحث
   يدوّر في الاسم بالعربي والإنجليزي، الوصف، المكوّنات، القسم ومحتوى البوكسات.
   يتجاهل التشكيل والهمزات والـ"ال"، فـ"زعتر" و"الزعتر" و"zaatar" كلها تلقى نفس المنتج. */

Object.assign(T,{
  search_aria:{ar:'ابحث في المتجر',en:'Search the shop'},
  search_ph:{ar:'دوّر على زيت، زعتر، سماق…',en:'Search olive oil, zaatar, sumac…'},
  search_close:{ar:'سكّر البحث',en:'Close search'},
  search_try:{ar:'جرّب تدوّر على',en:'Try searching for'},
  search_count:{ar:'النتائج: {n}',en:'{n} results'},
  search_one:{ar:'نتيجة وحدة',en:'1 result'},
  search_none:{ar:'ما لقينا شي باسم «{q}»',en:'Nothing found for “{q}”'},
  search_none_p:{ar:'جرّب كلمة ثانية، أو اسألنا على واتساب ونقول لك إذا متوفر.',en:'Try another word, or ask us on WhatsApp and we will tell you if we have it.'},
  search_ask:{ar:'اسأل على واتساب',en:'Ask on WhatsApp'},
  m_search:{ar:'هلا جرار، عندكم {q}؟',en:'Hello Jerar, do you have {q}?'},
  search_hint:{ar:'اضغط Enter لأول نتيجة',en:'Press Enter for the first result'}
});

const SUGGEST={ar:['زعتر','زيت زيتون','سماق','بدون سكر','تتبيلة','هدايا'],en:['Zaatar','Olive oil','Sumac','No added sugar','Dressing','Gifts']};

/* توحيد الحروف العربية عشان البحث ما يتأثر بالكتابة */
function norm(s){
  return String(s||'').toLowerCase()
    .replace(/[ً-ٰٟـ]/g,'')
    .replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي')
    .replace(/[^\p{L}\p{N}%.]+/gu,' ').trim();
}
const both=v=>v?(Array.isArray(v.ar)?[...v.ar,...v.en]:[v.ar,v.en]):[];

/* نجهّز نص كل منتج مرة وحدة */
const INDEX=P.map(p=>{
  const c=CATS.find(x=>x[0]===p.c);
  return{p,
    name:norm(both(p.name).join(' ')),
    rest:norm([...both(p.desc),...both(p.about),...both(p.ing),...both(p.lines),...both(p.inside),...both(p.size),...both(p.origin),...(c?both(c[1]):[])].join(' '))};
});

function search(q){
  const words=norm(q).split(' ').filter(Boolean);
  if(!words.length)return[];
  const out=[];
  for(const it of INDEX){
    let score=0,ok=true;
    for(const w of words){
      const alts=[w];
      if(w.startsWith('ال')&&w.length>3)alts.push(w.slice(2));
      if(w.startsWith('بال')&&w.length>4)alts.push(w.slice(3));
      if(alts.some(a=>it.name.includes(a)))score+=alts.some(a=>(' '+it.name).includes(' '+a))?10:6;
      else if(alts.some(a=>it.rest.includes(a)))score+=2;
      else{ok=false;break}
    }
    if(ok)out.push([score-(isOut(it.p)?1:0),it.p]);
  }
  return out.sort((a,b)=>b[0]-a[0]).map(x=>x[1]);
}

const sx=$('#search'),sIn=$('#sInput'),sRes=$('#sResults');
let lastFocus=null;

function resultHTML(p){
  const out=isOut(p);
  return `<li><a class="s-item" href="${link(p)}" style="--c:${p.col}">
    <img src="img/${p.img}" alt="" loading="lazy">
    <span class="s-t"><b>${nm(p)}</b><span>${catName(p.c)}${p.size?' · '+tx(p.size):''}</span></span>
    <span class="s-p">${out?`<em>${t('sold_out')}</em>`:priceHTML(p.p,!!p.sizes)}</span>
  </a></li>`;
}

function renderSearch(){
  const q=sIn.value.trim();
  if(!q){
    sRes.innerHTML=`<p class="s-h">${t('search_try')}</p>
      <div class="s-sugg">${SUGGEST[LANG].map(s=>`<button type="button" data-sugg="${s}">${s}</button>`).join('')}</div>`;
    return;
  }
  const r=search(q);
  if(!r.length){
    sRes.innerHTML=`<div class="s-none"><b>${t('search_none',{q:q.replace(/[<>&"]/g,'')})}</b><p>${t('search_none_p')}</p>
      <a class="btn btn-soft" target="_blank" rel="noopener" href="${waUrl(t('m_search',{q}))}">${WA_ICON}${t('search_ask')}</a></div>`;
    return;
  }
  sRes.innerHTML=`<p class="s-h"><span>${r.length===1?t('search_one'):t('search_count',{n:ni(r.length)})}</span><span class="s-k">${t('search_hint')}</span></p>
    <ul class="s-list">${r.map(resultHTML).join('')}</ul>`;
}

function openSearch(){
  if(sx.classList.contains('on'))return sIn.focus();
  lastFocus=document.activeElement;
  closeCart();toggleMenu(false);toggleCountry(false);
  sx.hidden=false;
  requestAnimationFrame(()=>{sx.classList.add('on');sIn.focus();sIn.select()});
  document.body.classList.add('s-open');
  $('#searchBtn').setAttribute('aria-expanded','true');
  renderSearch();
}
function closeSearch(back=true){
  if(!sx.classList.contains('on'))return;
  sx.classList.remove('on');
  document.body.classList.remove('s-open');
  $('#searchBtn').setAttribute('aria-expanded','false');
  setTimeout(()=>{if(!sx.classList.contains('on'))sx.hidden=true},250);
  if(back&&lastFocus&&lastFocus.focus)lastFocus.focus();
}

$('#searchBtn').onclick=openSearch;
$('#sClose').onclick=()=>closeSearch();
sx.addEventListener('click',e=>{
  if(e.target===sx)return closeSearch();
  const s=e.target.closest('[data-sugg]');if(s){sIn.value=s.dataset.sugg;renderSearch();sIn.focus();return}
  if(e.target.closest('.s-item'))closeSearch(false);
});
sIn.addEventListener('input',renderSearch);
$('#sForm').addEventListener('submit',e=>{
  e.preventDefault();
  const first=sRes.querySelector('.s-item');
  if(first){closeSearch(false);location.hash=first.getAttribute('href').slice(1)}
});
/* الأسهم تتنقل بين النتائج */
sx.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.stopPropagation();closeSearch();return}
  if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;
  const items=[...sRes.querySelectorAll('.s-item')];if(!items.length)return;
  e.preventDefault();
  const i=items.indexOf(document.activeElement);
  const n=e.key==='ArrowDown'?(i+1)%items.length:(i<=0?(document.activeElement===sIn?items.length-1:-1):i-1);
  (n<0?sIn:items[n]).focus();
});
/* "/" أو Ctrl+K يفتح البحث من أي مكان */
document.addEventListener('keydown',e=>{
  const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if((e.key==='/'&&!typing)||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k')){e.preventDefault();openSearch()}
});
document.addEventListener('localechange',()=>{if(sx.classList.contains('on'))renderSearch()});
addEventListener('hashchange',()=>closeSearch(false));
