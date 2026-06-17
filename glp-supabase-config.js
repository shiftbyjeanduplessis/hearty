(function () {
  const SUPABASE_URL = 'https://mdsfcnocvelwqiercyci.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kc2Zjbm9jdmVsd3FpZXJjeWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTEzNjAsImV4cCI6MjA5MjY4NzM2MH0.TWRwj66PtVhBuf5Ov7AHteNFww1hrCQZuD5ZmEflC5M';

  if (!window.supabase || !window.supabase.createClient) {
    console.error('[Hearty] Supabase library not loaded.');
    return;
  }

  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  window.heartySupabase = window.supabaseClient;
})();
