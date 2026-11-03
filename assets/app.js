(function(){
'use strict';
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
function safe(fn){try{fn()}catch(e){if(window.console)console.error(e)}}

/* toast */
var toastEl,toastT;
function toast(msg,bad){
  if(!toastEl){toastEl=document.createElement('div');toastEl.id='toast';toastEl.setAttribute('role','status');toastEl.setAttribute('aria-live','polite');document.body.appendChild(toastEl)}
  toastEl.textContent=msg;toastEl.className='show'+(bad?' bad':'');
  clearTimeout(toastT);toastT=setTimeout(function(){toastEl.className=''},3200);
}
/* copy with fallback */
function copyText(t){
  return new Promise(function(res,rej){
    function fb(){var a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;top:0;opacity:0';document.body.appendChild(a);a.focus();a.select();a.setSelectionRange(0,t.length);var r=false;try{r=document.execCommand('copy')}catch(e){}document.body.removeChild(a);r?res():rej()}
    if(navigator.clipboard&&navigator.clipboard.writeText&&window.isSecureContext){navigator.clipboard.writeText(t).then(res,fb)}else fb();
  });
}

/* progress, back-to-top, sticky bar */
safe(function(){
  var bar=$('#progress'),top=$('#top'),sb=$('#bar'),hero=$('.hero');
  function onScroll(){
    var h=document.documentElement,max=h.scrollHeight-h.clientHeight,y=h.scrollTop||window.pageYOffset;
    if(bar)bar.style.width=(max>0?y/max*100:0)+'%';
    if(top)top.classList.toggle('show',y>900);
    if(sb&&hero)sb.classList.toggle('show',y>hero.offsetHeight-60);
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  if(top)top.addEventListener('click',function(){window.scrollTo({top:0})});
});

/* lightbox */
safe(function(){
  var lb=$('#lb');if(!lb)return;
  var zs=$$('a.zoom');
  if(!lb.showModal){return}
  var img=$('img',lb),opener=null,pushed=false;
  function open(a){
    img.src=a.getAttribute('href');img.alt=$('img',a).alt;opener=a;
    lb.showModal();
    try{history.pushState({lb:1},'');pushed=true}catch(e){pushed=false}
    var x=$('#lbx');if(x)x.focus();
  }
  zs.forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();open(a)})});
  lb.addEventListener('click',function(){lb.close()});
  lb.addEventListener('close',function(){
    if(pushed){pushed=false;try{if(history.state&&history.state.lb)history.back()}catch(e){}}
    if(opener){try{opener.focus()}catch(e){}opener=null}
  });
  window.addEventListener('popstate',function(){if(lb.open){pushed=false;lb.close()}});
});

/* OS picker */
safe(function(){
  var tabs=$$('.ospick [role=tab]');if(!tabs.length)return;
  function pick(t,focus){
    tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on?'true':'false');x.tabIndex=on?0:-1;var p=document.getElementById(x.getAttribute('aria-controls'));if(p)p.hidden=!on});
    if(focus)t.focus();
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){pick(t)});
    t.addEventListener('keydown',function(e){
      var k=e.key,n=null;
      if(k==='ArrowLeft'||k==='ArrowRight')n=tabs[(i+1)%tabs.length];
      else if(k==='Home')n=tabs[0];else if(k==='End')n=tabs[tabs.length-1];
      if(n){e.preventDefault();pick(n,true)}
    });
  });
  tabs.forEach(function(x){x.tabIndex=0});
  /* preselect on desktop only */
  var ua=navigator.userAgent||'',mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(ua)||(navigator.maxTouchPoints>1&&/Mac/.test(ua));
  if(!mobile){var os=/Win/i.test((navigator.userAgentData&&navigator.userAgentData.platform)||navigator.platform||ua)?'win':(/Mac/i.test(navigator.platform||ua)?'mac':'');
    var t=os&&$('.ospick [data-os='+os+']');if(t)pick(t)}
});

/* copy chips + case */
safe(function(){
  $$('[data-copy]').forEach(function(c){
    var lab=$('.cl',c),orig=lab?lab.textContent:'',val=c.getAttribute('data-copy');
    c.addEventListener('click',function(){
      copyText(val).then(function(){
        c.classList.add('done');if(lab)lab.textContent='הועתק ✓';toast(val.length>40?'הועתק':'הועתק: '+val);
        setTimeout(function(){c.classList.remove('done');if(lab)lab.textContent=orig},2200);
      },function(){toast('ההעתקה נכשלה. סמנו את הטקסט והעתיקו ידנית.',true)});
    });
  });
  var btn=$('#copy'),ok=$('#copyok'),src=$('#casetxt');
  if(btn&&src)btn.addEventListener('click',function(){
    var t=src.textContent.trim();
    copyText(t).then(function(){
      var m='סיפור המקרה הועתק. עכשיו עוברים ל-OpenEvidence ומדביקים.';
      toast(m);if(ok){ok.textContent='✓ הועתק';setTimeout(function(){ok.textContent=''},3000)}
    },function(){toast('ההעתקה נכשלה. נסו שוב או פתחו את האתר בדפדפן אחר.',true)});
  });
});

})();
