/* جرار — السلة على شكل إيصال
   نعيد رسم قائمة السلة كإيصال: راس فيه الشعار والتاريخ، سطر لكل منتج، والمجاميع تحت بخطوط منقّطة. */

Object.assign(T,{
  rc_title:{ar:'إيصال طلبك',en:'Your order receipt'},
  rc_items:{ar:'{n} قطعة',en:'{n} pcs'},
  rc_thanks:{ar:'شكراً لأنك اخترت جرار',en:'Thank you for choosing Jerar'},
  rc_del:{ar:'احذف',en:'Remove'},rc_item:{ar:'المنتج',en:'Item'},rc_amt:{ar:'المبلغ',en:'Amount'},
  pm_h:{ar:'طريقة الدفع',en:'Payment method'},
  pm_bp:{ar:'بنفت باي',en:'BenefitPay'},pm_ap:{ar:'Apple Pay',en:'Apple Pay'},pm_card:{ar:'بطاقة',en:'Card'},
  pm_safe:{ar:'دفع آمن ومشفّر',en:'Secure, encrypted payment'},
  m_pay:{ar:'طريقة الدفع',en:'Payment method'}
});

/* طرق الدفع: جاهزة للربط مع بوابة الدفع. لين ما تنربط، الاختيار ينضاف لرسالة الطلب */
const PAY=[['bp','pm_bp','BenefitPay','bp'],['ap','pm_ap','Apple Pay','ap'],['card','pm_card','VISA · MC','vs']];
let payM='bp';try{const v=localStorage.getItem('jerar-pay');if(PAY.some(p=>p[0]===v))payM=v}catch(e){}

(function(){
  const drawer=$('#drawer');drawer.classList.add('rc');
  /* زر الحذف جنب الكمية */
  drawer.addEventListener('click',e=>{const b=e.target.closest('[data-del]');if(!b)return;e.preventDefault();e.stopPropagation();
    const row=b.closest('.rc-row');const k=b.dataset.del;
    const go=()=>{delete cart[k];save();renderCart()};
    if(row&&!matchMedia('(prefers-reduced-motion: reduce)').matches){row.classList.add('rc-out');setTimeout(go,220)}else go()},true);
  /* سطر الشكر والباركود تحت زر الطلب */
  const foot=$('#dFoot');
  /* خانة كود الخصم فوق اختيار التوصيل */
  const pc=document.createElement('div');pc.className='rc-code';pc.id='rcCode';
  foot.insertBefore(pc,foot.firstChild);
  let pcMsg='',pcErr=false;
  function paintCode(){
    const st=offerState();
    if(st==='off'||st==='over'&&!PROMO){pc.hidden=true;return}
    pc.hidden=false;
    if(PROMO){
      const keys=Object.keys(cart).filter(k=>cart[k]>0&&lineOf(k));
      const onlyEx=keys.length&&keys.every(k=>OFFER.exclude.includes(lineOf(k).p.id));
      const hasEx=keys.some(k=>OFFER.exclude.includes(lineOf(k).p.id));
      const why=st==='soon'?t('pc_soon'):st==='over'?t('pc_over'):onlyEx?t('pc_excl'):'';
      pc.innerHTML=`<div class="pc-on ${why?'warn':''}"><span class="pc-tag">${PROMO}</span><span class="pc-t">${why||t('pc_ok',{c:PROMO,p:OFFER.pct})}${!why&&hasEx?`<small>${t('pc_excl')}</small>`:''}</span><button type="button" id="pcRm">${t('pc_remove')}</button></div>`;
      $('#pcRm').onclick=()=>{setPromo('');pcMsg='';renderCart()};
    }else{
      pc.innerHTML=`<label for="pcIn">${t('pc_h')}</label><div class="pc-row"><input id="pcIn" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${t('pc_ph')}"><button type="button" id="pcGo">${t('pc_apply')}</button></div>${pcMsg?`<p class="pc-msg ${pcErr?'err':''}">${pcMsg}</p>`:''}`;
      const go=()=>{const v=$('#pcIn').value.trim().toUpperCase();if(!v)return;
        if(v!==OFFER.code){pcMsg=t('pc_bad');pcErr=true;paintCode();$('#pcIn').value=v;$('#pcIn').focus();return}
        const st2=offerState();
        if(st2==='over'){pcMsg=t('pc_over');pcErr=true;paintCode();return}
        pcMsg='';setPromo(v);renderCart()};
      $('#pcGo').onclick=go;$('#pcIn').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go()}};
    }
  }
  const pm=document.createElement('fieldset');pm.className='rc-pm';pm.id='rcPay';
  foot.insertBefore(pm,$('#checkout'));
  pm.addEventListener('change',e=>{const r=e.target.closest('input[name=pay]');if(!r)return;payM=r.value;try{localStorage.setItem('jerar-pay',payM)}catch(_){}renderCart()});
  const lock=document.createElement('div');lock.className='rc-lock';
  $('#checkout').insertAdjacentElement('afterend',lock);
  const end=document.createElement('div');end.className='rc-end';end.setAttribute('aria-hidden','true');
  end.innerHTML='<span class="rc-thx"></span><span class="rc-bars"></span>';
  foot.appendChild(end);

  const fmtDate=()=>new Intl.DateTimeFormat(LANG==='ar'?'ar-BH-u-nu-latn':'en-GB',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date());

  function paint(){
    const keys=Object.keys(cart).filter(k=>cart[k]>0&&lineOf(k));
    drawer.classList.toggle('rc-empty',!keys.length);
    end.querySelector('.rc-thx').textContent=t('rc_thanks');
    if(!keys.length)return;
    paintCode();
    pm.innerHTML=`<legend>${t('pm_h')}</legend>`+PAY.map(([k,l,chip,cls])=>`<label class="${k===payM?'on':''}"><input type="radio" name="pay" id="pay-${k}" value="${k}" ${k===payM?'checked':''}><span class="rc-radio"></span><span>${t(l)}</span><span class="rc-chip ${cls}">${chip}</span></label>`).join('');
    lock.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>${t('pm_safe')}`;
    const co=$('#checkout');
    co.innerHTML=`<span>${t('checkout')}</span><em class="rc-total">${$('#tot').textContent}</em>`;
    const pl=PAY.find(p=>p[0]===payM);
    /* نضيف سطر طريقة الدفع مرة وحدة على رابط الطلب، حتى لو انرسم الإيصال أكثر من مرة */
    const cur=co.getAttribute('href');
    if(cur!==co.dataset.full)co.dataset.base=cur;
    co.setAttribute('href',co.dataset.base+encodeURIComponent(`\n${t('m_pay')}: ${t(pl[1])}`));
    co.dataset.full=co.getAttribute('href');
    const cc=CC();
    const n=keys.reduce((s,k)=>s+cart[k],0);
    const head=`<div class="rc-head">
        <img src="img/logo-dark.png" alt="Jerar">
        <b>${t('rc_title')}</b>
        <span class="rc-meta"><span>${fmtDate()}</span></span>
      </div>
      <div class="rc-cols"><span>${t('rc_item')}</span><span>${t('rc_amt')}</span></div>`;
    const rows=keys.map(k=>{const L=lineOf(k);const unit=convert(L.price,cc);return`
      <div class="rc-row">
        <a class="rc-img" href="${link(L.p)}" tabindex="-1" aria-hidden="true"><img src="img/${L.p.img}" alt=""></a>
        <div class="rc-name"><a href="${link(L.p)}"><b>${nm(L.p)}</b></a>
          <span>${ni(cart[k])} × ${showAmt(unit,cc)}${L.label?' · '+L.label:''}</span></div>
        <div class="rc-side"><b class="rc-amt">${showAmt(unit*cart[k],cc)}</b>
          <div class="rc-ctl"><button type="button" class="rc-del" data-del="${k}" aria-label="${t('rc_del')} ${nm(L.p)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M10 11v6M14 11v6"/></svg></button><div class="qty"><button data-q="${k}" data-d="1" aria-label="${t('plus')}">+</button><span>${ni(cart[k])}</span><button data-q="${k}" data-d="-1" aria-label="${t('minus')}">−</button></div></div></div>
      </div>`}).join('');
    $('#dList').innerHTML=head+`<div class="rc-rows">${rows}</div>`;
  }

  const orig=renderCart;
  renderCart=function(){orig.apply(this,arguments);paint()};
  document.addEventListener('localechange',paint);
  /* التاريخ يتحدّث كل ما تنفتح السلة */
  new MutationObserver(()=>{if(drawer.classList.contains('on'))paint()}).observe(drawer,{attributes:true,attributeFilter:['class']});
  paint();
})();
