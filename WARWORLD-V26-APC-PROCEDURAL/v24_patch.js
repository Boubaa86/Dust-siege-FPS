/* WARWORLD V24 — correctifs ciblés, sans remplacer les systèmes existants */
(()=>{
  'use strict';
  if(window.__dustSiegeV24)return;
  window.__dustSiegeV24=true;

  // The original gadget remains a gadget. Vehicle entry/exit is handled by Y or AUTO.
  // Previously, merely standing near a car could hijack the mobile gadget button.
  if(typeof dsBaseGadget==='function'){
    gadget=function(){
      if(drv){dsVehicleToggle();return;}
      dsBaseGadget();
    };
  }

  // Keep creative saves bounded and automatically persist each newly placed object.
  // Existing blueprints are retained; no map, account, currency or HUD data is reset.
  if(typeof dsCreativePlace==='function'){
    const dsV24Place=dsCreativePlace;
    dsCreativePlace=function(kind){
      if(!playing||mode!=='creative')return;
      if(Array.isArray(dsCreativeObjects)&&dsCreativeObjects.length>=100){
        banner('Limite de construction atteinte (100 objets)');
        return;
      }
      const before=Array.isArray(dsCreativeObjects)?dsCreativeObjects.length:0;
      dsV24Place(kind);
      if(Array.isArray(dsCreativeObjects)&&dsCreativeObjects.length>before)dsCreativeSave();
    };
  }

  // In REAL WORLD, tapping the mission-complete panel starts a fresh round.
  // It does not interfere with the temporary respawn message during a live round.
  const missionPanel=document.getElementById('gameMessage');
  if(missionPanel&&!missionPanel.dataset.dsV24Restart){
    missionPanel.dataset.dsV24Restart='1';
    missionPanel.style.cursor='pointer';
    missionPanel.addEventListener('click',()=>{
      if(missionPanel.textContent.includes('MISSION ACCOMPLIE')){const play=document.getElementById('playMode');if(play)play.click();}
    });
  }

  // Make touch sprint release reliable even if the finger slides off the button.
  const sprint=document.getElementById('dsSprintBtn');
  if(sprint){
    sprint.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){e.preventDefault();keys.ShiftLeft=1;}},{passive:false});
    const release=()=>{keys.ShiftLeft=0;};
    window.addEventListener('pointerup',release,{passive:true});
    window.addEventListener('pointercancel',release,{passive:true});
    window.addEventListener('blur',release,{passive:true});
  }

  // Small, non-intrusive version marker for support/debugging.
  window.dsBuildInfo={version:'24.0',base:'Dust-Siege-V23-Parcours-Creatif',patches:['gadget-control-fix','creative-autosave-and-limit','real-world-restart-tap','touch-sprint-release']};
  const marker=document.createElement('div');
  marker.id='ds-v24-build';
  marker.textContent='WARWORLD · V24';
  marker.style.cssText='position:fixed;right:7px;top:7px;z-index:4;padding:3px 6px;border-radius:6px;background:#10182099;color:#e4e9e9;font:9px Arial;letter-spacing:.08em;pointer-events:none;opacity:.65';
  document.body.appendChild(marker);
})();
