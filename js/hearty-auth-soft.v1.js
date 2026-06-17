(function(){
  function ready(fn){ if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  async function softLogout(){
    try{
      const client = window.heartySupabaseClient || window.heartySupabase || window.supabaseClient || null;
      if(client && client.auth && typeof client.auth.signOut === 'function') await client.auth.signOut();
    }catch(err){ console.warn('Hearty soft logout warning', err); }
    try{ localStorage.setItem('heartyLastLogoutAt', new Date().toISOString()); }catch(e){}
    if(!/login\.html$/i.test(location.pathname)) location.href = 'login.html';
  }
  ready(function(){
    document.querySelectorAll('[data-hearty-logout]').forEach(function(btn){
      if(btn.__heartySoftLogoutBound) return;
      btn.__heartySoftLogoutBound = true;
      btn.addEventListener('click', function(event){ event.preventDefault(); softLogout(); });
    });
  });
  window.HeartyAuthSoft = window.HeartyAuthSoft || { logout: softLogout };
})();
