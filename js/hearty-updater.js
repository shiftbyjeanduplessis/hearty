(function(){
  'use strict';
  async function installRouteSafeWorker(){
    if(!('serviceWorker' in navigator)) return;
    try{
      const regs = await navigator.serviceWorker.getRegistrations();
      for(const reg of regs){
        const url = (reg.active && reg.active.scriptURL) || (reg.waiting && reg.waiting.scriptURL) || (reg.installing && reg.installing.scriptURL) || '';
        if(url && !/\/sw\.js(?:\?|$)/.test(url)) await reg.unregister();
      }
      const reg = await navigator.serviceWorker.register('/sw.js?v=105', {scope:'/', updateViaCache:'none'});
      await reg.update();
    }catch(_error){}
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installRouteSafeWorker, {once:true});
  else installRouteSafeWorker();
})();
