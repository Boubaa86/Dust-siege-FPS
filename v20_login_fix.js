/* DUST SIEGE V20 — correct login overlay targeting.
   V18 creates the login panel with mkOv(); it has class .ov and no #lg id.
   This patch targets the actual panel containing #lge/#lgp. */
(()=>{
 'use strict';
 const STYLE_ID='dust-siege-v20-login-style';
 function findLoginPanel(){
  const email=document.getElementById('lge');
  const pass=document.getElementById('lgp');
  if(!email || !pass) return null;
  return email.closest('.ov') || email.parentElement;
 }
 function apply(){
  const panel=findLoginPanel();
  if(!panel) return;
  panel.style.setProperty('z-index','20000','important');
  panel.style.setProperty('pointer-events','auto','important');
  for(const el of panel.querySelectorAll('input,button')){
   el.style.setProperty('pointer-events','auto','important');
   el.style.setProperty('position','relative','important');
   el.style.setProperty('z-index','20001','important');
   if(el.tagName==='INPUT'){
    el.style.setProperty('touch-action','manipulation','important');
    el.style.setProperty('-webkit-user-select','text','important');
    el.style.setProperty('user-select','text','important');
    el.removeAttribute('readonly');
    el.tabIndex=0;
   }
  }
 }
 function install(){
  if(!document.getElementById(STYLE_ID)){
   const style=document.createElement('style'); style.id=STYLE_ID;
   style.textContent=`.ov:has(#lge):has(#lgp){z-index:20000!important;pointer-events:auto!important}.ov:has(#lge):has(#lgp) input,.ov:has(#lge):has(#lgp) button{pointer-events:auto!important;touch-action:manipulation!important}.ov:has(#lge):has(#lgp) input{-webkit-user-select:text!important;user-select:text!important}`;
   (document.head||document.documentElement).appendChild(style);
  }
  apply();
  // Observe only DOM insertions. Do not observe style/class attributes: that
  // would re-trigger this function when it writes styles and can freeze UI.
  const observer=new MutationObserver(()=>{ if(document.getElementById('lge') && document.getElementById('lgp')) apply(); });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('pointerdown',e=>{
   const input=e.target && e.target.closest && e.target.closest('#lge,#lgp');
   if(input){apply(); try{input.focus({preventScroll:true});}catch(_){input.focus();}}
  },true);
  document.addEventListener('focusin',e=>{
   if(e.target && (e.target.id==='lge'||e.target.id==='lgp')) apply();
  },true);
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true}); else install();
})();
