/* جرار — (1) صورة المنتج تميل مع الماوس في الكمبيوتر  (2) شريط تنقّل ثابت تحت الشاشة في الجوال */

Object.assign(T,{bn_home:{ar:'الرئيسية',en:'Home'},bn_shop:{ar:'المنتجات',en:'Products'},bn_search:{ar:'بحث',en:'Search'},bn_cart:{ar:'السلة',en:'Cart'},bn_aria:{ar:'التنقل السريع',en:'Quick navigation'}});

/* (1) الميلان: بس للأجهزة اللي فيها ماوس */
(function(){
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const MAX=7;
  document.addEventListener('pointermove',e=>{
    const m=e.target.closest&&e.target.closest('#gMain');
    document.querySelectorAll('#gMain.tilting').forEach(x=>{if(x!==m){x.classList.remove('tilting');x.style.transform=''}});
    if(!m)return;
    const r=m.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
    m.classList.add('tilting');
    m.style.transform=`perspective(900px) rotateY(${(px*MAX*2).toFixed(2)}deg) rotateX(${(-py*MAX*2).toFixed(2)}deg) scale(1.02)`;
    m.style.setProperty('--gx',(px+.5)*100+'%');m.style.setProperty('--gy',(py+.5)*100+'%');
  });
  document.addEventListener('pointerleave',()=>document.querySelectorAll('#gMain.tilting').forEach(x=>{x.classList.remove('tilting');x.style.transform=''}));
})();

/* (2) شريط التنقل تحت */
(function(){
  const nav=document.createElement('nav');nav.className='bnav';nav.id='bnav';
  const I={
    home:'<path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    shop:'<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
    cart:'<path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'
  };
  const items=[['home','#top','bn_home'],['shop','#products','bn_shop'],['search',null,'bn_search'],['cart',null,'bn_cart']];
  function paint(){
    nav.setAttribute('aria-label',t('bn_aria'));
    nav.innerHTML=items.map(([k,href,l])=>{
      const inner=`<span class="bn-ic"><svg viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg>${k==='cart'?'<em class="bn-n" id="bnCount"></em>':''}</span><span class="bn-t">${t(l)}</span>`;
      return href?`<a href="${href}" class="bn-i" data-bn="${k}">${inner}</a>`:`<button type="button" class="bn-i" data-bn="${k}">${inner}</button>`;
    }).join('');
    count();active();
  }
  function count(){
    const n=Object.keys(cart).reduce((s,k)=>s+(lineOf(k)?cart[k]:0),0);
    const el=$('#bnCount');if(el){el.textContent=ni(n);el.hidden=!n}
  }
  function active(){
    const h=location.hash.slice(1);
    const k=h==='products'||h.startsWith('p-')?'shop':(h===''||h==='top'||document.getElementById(h)&&$('#top').contains(document.getElementById(h)))?'home':'';
    nav.querySelectorAll('[data-bn]').forEach(b=>b.classList.toggle('on',b.dataset.bn===k));
  }
  nav.addEventListener('click',e=>{
    const b=e.target.closest('[data-bn]');if(!b)return;
    if(b.dataset.bn==='search'){e.preventDefault();openSearch()}
    else if(b.dataset.bn==='cart'){e.preventDefault();openCart()}
    else if(b.getAttribute('href')===location.hash||(b.dataset.bn==='home'&&!location.hash)){scrollTo({top:0,behavior:'smooth'})}
  });
  document.body.appendChild(nav);
  const orig=renderCart;renderCart=function(){orig.apply(this,arguments);count()};
  addEventListener('hashchange',()=>setTimeout(active,0));
  document.addEventListener('localechange',paint);
  paint();
})();
