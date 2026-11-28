/* WARWORLD V11 — rapport tactique, suivi local et défi d'entraînement */
(()=>{
 'use strict';
 const KEY='dustSiegeTacticalV11',defaults={shots:0,kills:0,bestStreak:0,streak:0,bestWave:0};
 let stats={...defaults};try{stats={...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){}
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(stats))}catch(e){}};
 const menu=document.getElementById('menu');if(!menu||document.getElementById('ds-v11-open'))return;
 const style=document.createElement('style');style.textContent=`
 #ds-v11-open{transform:none!important;display:block;margin:8px auto!important;padding:10px 16px!important;border:1px solid #d9a441!important;border-radius:18px!important;background:#1d1a15!important;color:#f3e6cf!important;font-weight:bold!important;font-size:14px!important}
 #ds-v11-panel{position:fixed;inset:0;z-index:40;display:none;overflow:auto;box-sizing:border-box;padding:20px;background:rgba(5,8,12,.97);color:#f3e6cf;font:15px Arial,sans-serif;touch-action:pan-y}
 #ds-v11-panel .wrap{max-width:560px;margin:0 auto}#ds-v11-panel h2{color:#d9a441;font-size:24px}
 #ds-v11-panel .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
 #ds-v11-panel .tile{padding:13px;border:1px solid #d9a44166;border-radius:10px;background:#171717}
 #ds-v11-panel .num{display:block;color:#fff;font-size:25px;font-weight:bold;margin-top:5px}
 #ds-v11-panel button{padding:11px 15px;margin:10px 5px 0 0;border-radius:8px;border:1px solid #888;background:#333;color:#fff;font-weight:bold}
 #ds-v11-panel .hint{color:#c7c0b4;line-height:1.45}@media(max-width:380px){#ds-v11-panel .grid{grid-template-columns:1fr}}
 `;document.head.appendChild(style);
 const open=document.createElement('button');open.id='ds-v11-open';open.type='button';open.textContent='RAPPORT TACTIQUE & DÉFIS';menu.appendChild(open);
 const panel=document.createElement('section');panel.id='ds-v11-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
 panel.innerHTML=`<div class="wrap"><h2>RAPPORT TACTIQUE</h2><p class="hint">Statistiques locales sur cet appareil. Elles ne modifient ni le classement en ligne ni les sauvegardes du serveur.</p><div class="grid"><div class="tile">Tirs effectués<span class="num" id="ds-v11-shots">0</span></div><div class="tile">Éliminations<span class="num" id="ds-v11-kills">0</span></div><div class="tile">Meilleure série<span class="num" id="ds-v11-streak">0</span></div><div class="tile">Meilleure vague<span class="num" id="ds-v11-wave">0</span></div></div><h2>OBJECTIF D'ENTRAÎNEMENT</h2><div class="tile"><b>Échauffement</b><p id="ds-v11-challenge">Effectue 10 tirs pendant une partie.</p><p class="hint">Objectif personnel : aucun argent ni XP n'est ajouté automatiquement.</p></div><button id="ds-v11-reset" type="button">Réinitialiser les statistiques locales</button><button id="ds-v11-close" type="button">RETOUR AU MENU</button></div>`;document.body.appendChild(panel);
 const refresh=()=>{for(const [id,val] of [['shots',stats.shots],['kills',stats.kills],['streak',stats.bestStreak],['wave',stats.bestWave]]){const n=document.getElementById('ds-v11-'+id);if(n)n.textContent=String(val)}const c=document.getElementById('ds-v11-challenge');if(c)c.textContent=stats.shots>=10?'Défi terminé : 10 tirs effectués. Continue à t’entraîner !':`Progression : ${Math.min(stats.shots,10)} / 10 tirs.`};
 open.addEventListener('click',()=>{refresh();panel.style.display='block'});document.getElementById('ds-v11-close').addEventListener('click',()=>panel.style.display='none');panel.addEventListener('click',e=>{if(e.target===panel)panel.style.display='none'});
 document.getElementById('ds-v11-reset').addEventListener('click',()=>{if(!confirm('Effacer les statistiques tactiques enregistrées sur cet appareil ?'))return;stats={...defaults};save();refresh()});
 if(typeof window.shoot==='function'&&!window.__dsV11ShootWrapped){window.__dsV11ShootWrapped=true;const original=window.shoot;window.shoot=function(){const before=typeof ammo==='number'?ammo:null;const result=original.apply(this,arguments);if(before!==null&&typeof ammo==='number'&&ammo<before){stats.shots++;save()}return result}}
 if(typeof window.fire==='function'&&!window.__dsV11FireWrapped){window.__dsV11FireWrapped=true;const originalFire=window.fire;window.fire=function(){const before=typeof kills==='number'?kills:0;const result=originalFire.apply(this,arguments);if(typeof kills==='number'&&kills>before){const diff=kills-before;stats.kills+=diff;stats.streak+=diff;stats.bestStreak=Math.max(stats.bestStreak,stats.streak);save()}return result}}
 if(typeof window.nextWave==='function'&&!window.__dsV11WaveWrapped){window.__dsV11WaveWrapped=true;const originalWave=window.nextWave;window.nextWave=function(){const result=originalWave.apply(this,arguments);if(typeof wave==='number'&&wave>stats.bestWave){stats.bestWave=wave;save()}return result}}
})();
