/* جرار — شريط السلة تحت الشاشة
   يطلع أول ما يضيف العميل منتج: صور اللي في السلة، العدد، المجموع، وزر يفتح السلة. */

Object.assign(T,{
  cb_one:{ar:'منتج واحد في السلة',en:'1 item in your cart'},
  cb_two:{ar:'منتجين في السلة',en:'2 items in your cart'},
  cb_n:{ar:'{n} منتجات في السلة',en:'{n} items in your cart'},
  cb_nn:{ar:'{n} منتج في السلة',en:'{n} items in your cart'},
  cb_go:{ar:'عرض السلة',en:'View cart'},
  cb_aria:{ar:'ملخص السلة',en:'Cart summary'}
});

(function(){
  const bar=document.createElement('div');
  bar.className='cbar';bar.id='cbar';bar.setAttribute('role','region');bar.hidden=true;
  bar.innerHTML=`<div class="cbar-in">
      <button type="button" class="cbar-sum" id="cbarSum">
        <span class="cbar-pics" id="cbarPics" aria-hidden="true"></span>
        <span class="cbar-t"><b id="cbarCount"></b><span id="cbarTot"></span></span>
      </button>
      <button type="button" class="cbar-go" id="cbarGo"><span id="cbarGoT"></span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg></button>
    </div>`;
  document.body.appendChild(bar);

  const countLabel=n=>n===1?t('cb_one'):n===2?t('cb_two'):(n<=10?t('cb_n',{n:ni(n)}):t('cb_nn',{n:ni(n)}));
  let lastN=0;

  function paint(){
    const keys=Object.keys(cart).filter(k=>cart[k]>0&&lineOf(k));
    const n=keys.reduce((s,k)=>s+cart[k],0);
    document.body.classList.toggle('has-cbar',n>0);
    if(!n){bar.classList.remove('on');setTimeout(()=>{if(!bar.classList.contains('on'))bar.hidden=true},300);lastN=0;return}
    const cc=CC();
    const sub=keys.reduce((s,k)=>s+convert(lineOf(k).price,cc)*cart[k],0)-promoDisc(keys,cc);
    const shown=keys.slice(-3).reverse();
    $('#cbarPics').innerHTML=shown.map(k=>`<img src="img/${lineOf(k).p.img}" alt="">`).join('')+(keys.length>3?`<i>+${ni(keys.length-3)}</i>`:'');
    $('#cbarCount').textContent=countLabel(n);
    $('#cbarTot').textContent=showAmt(sub,cc);
    $('#cbarGoT').textContent=t('cb_go');
    bar.setAttribute('aria-label',t('cb_aria'));
    $('#cbarSum').setAttribute('aria-label',`${countLabel(n)}، ${showAmt(sub,cc)}`);
    if(bar.hidden){bar.hidden=false;requestAnimationFrame(()=>bar.classList.add('on'))}else bar.classList.add('on');
    if(n>lastN&&lastN>0){bar.classList.remove('bump');void bar.offsetWidth;bar.classList.add('bump')}
    lastN=n;
  }

  /* نلف renderCart عشان الشريط يتحدّث مع كل تغيير في السلة */
  const orig=renderCart;
  renderCart=function(){orig.apply(this,arguments);paint()};

  const open=()=>openCart();
  $('#cbarGo').onclick=open;$('#cbarSum').onclick=open;

  /* نخفيه لما السلة أو البحث أو الشهادات مفتوحة */
  const watch=()=>{
    const cover=$('#drawer').classList.contains('on')||document.body.classList.contains('s-open');
    bar.classList.toggle('away',cover);
  };
  new MutationObserver(watch).observe($('#drawer'),{attributes:true,attributeFilter:['class']});
  new MutationObserver(watch).observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('localechange',paint);
  paint();
})();
