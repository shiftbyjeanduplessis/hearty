/*
  Hearty Auth Soft v1
  Step 2B: soft login + grandfathered access claim.

  Important:
  - Does not force login.
  - Does not enforce entitlement yet.
  - On signup/signin, it tries to claim grandfathered lifetime access by matching auth email.
*/

(function(){
  "use strict";

  const AUTH_CONFIG = Object.assign({
    appHome: "/home.html",
    loginPage: "/login.html",
    requireEntitlement: false,
    entitlementKey: "hearty_lifetime"
  }, window.HEARTY_AUTH_CONFIG || {});

  const $ = (id) => document.getElementById(id);
  const supabase = () => window.supabaseClient || window.heartySupabase || null;

  function getRedirectTarget(){
    const params = new URLSearchParams(window.location.search || "");
    const value = params.get("redirect");
    if(!value) return AUTH_CONFIG.appHome;
    try {
      const decoded = decodeURIComponent(value);
      if(decoded.startsWith("/") && !decoded.startsWith("//")) return decoded;
    } catch {}
    return AUTH_CONFIG.appHome;
  }

  function setMessage(text, kind){
    const el = $("message");
    if(!el) return;
    el.textContent = text || "";
    el.classList.toggle("error", kind === "error");
    el.classList.toggle("success", kind === "success");
  }

  function showDebug(label, err){
    console.error("[Hearty Auth]", label, err);
    const el = $("debug");
    if(!el) return;
    el.style.display = "block";
    el.textContent = label + ": " + (err && (err.message || JSON.stringify(err)) || "Unknown error");
  }

  function clearDebug(){
    const el = $("debug");
    if(!el) return;
    el.style.display = "none";
    el.textContent = "";
  }

  function setBusy(busy){
    ["signinBtn","signupBtn","googleBtn","resetSendBtn","savePasswordBtn","accessRequestBtn"].forEach(id => {
      const btn = $(id);
      if(btn) btn.disabled = !!busy;
    });
  }

  function setPanel(name){
    const titles = {
      signin: ["Secure your account", "Create or sign into your individual Hearty account."],
      signup: ["Create your account", "Use your purchase email if you already bought Hearty."],
      forgot: ["Reset your password", "Enter your email and we’ll send you a secure reset link."],
      newPassword: ["Choose a new password", "Enter a new password for your Hearty account."],
      access: ["Can’t find your access?", "Send a request and we’ll manually match your purchase."]
    };

    ["signinPanel","signupPanel","forgotPanel","newPasswordPanel","accessPanel"].forEach(id => {
      const el = $(id);
      if(el) el.classList.remove("active");
    });

    const panel = $(name + "Panel");
    if(panel) panel.classList.add("active");

    const tabs = $("authTabs");
    if(tabs) tabs.style.display = (name === "signin" || name === "signup") ? "grid" : "none";

    document.querySelectorAll("[data-auth-tab]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.authTab === name);
    });

    const title = $("authTitle");
    const subtitle = $("authSubtitle");
    if(title) title.textContent = (titles[name] || titles.signin)[0];
    if(subtitle) subtitle.textContent = (titles[name] || titles.signin)[1];

    setMessage("");
    clearDebug();
  }

  function emailLooksValid(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  async function getCurrentUser(){
    const sb = supabase();
    if(!sb || !sb.auth) return null;
    const { data } = await sb.auth.getUser();
    return data && data.user ? data.user : null;
  }

  async function ensureProfile(user){
    const sb = supabase();
    if(!sb || !user) return { ok:false, reason:"No Supabase user" };

    const now = new Date().toISOString();
    const metaName = user.user_metadata?.full_name || user.user_metadata?.name || "";
    const name = metaName || (user.email ? user.email.split("@")[0] : "Hearty user");

    try {
      await sb.from("profiles").upsert({
        user_id: user.id,
        user_name: name,
        account_email: user.email || null,
        updated_at: now
      }, { onConflict:"user_id" });
    } catch(err) {
      console.warn("[Hearty Auth] profile upsert skipped", err);
    }

    try {
      await sb.from("user_settings").upsert({
        user_id: user.id,
        theme: "clean_blue",
        units_system: "metric",
        hydration_auto: true,
        hydration_target_litres: 3.0,
        social_enabled: true,
        photo_privacy: "local_only",
        onboarding_complete: false,
        updated_at: now
      }, { onConflict:"user_id" });
    } catch(err) {
      console.warn("[Hearty Auth] settings upsert skipped", err);
    }

    try {
      await sb.from("user_roles").upsert({
        user_id: user.id,
        role: "client",
        updated_at: now
      }, { onConflict:"user_id" });
    } catch(err) {
      console.warn("[Hearty Auth] role upsert skipped", err);
    }

    try {
      localStorage.setItem("heartyAccountEmail", user.email || "");
      localStorage.setItem("heartyAuthUserId", user.id);
      localStorage.setItem("heartyLastLoginAt", now);
    } catch {}

    return { ok:true };
  }

  async function claimGrandfatheredAccess(){
    const sb = supabase();
    if(!sb || !sb.rpc) return { claimed:false, reason:"no_rpc" };

    try {
      const { data, error } = await sb.rpc("hearty_claim_grandfathered_access");
      if(error) throw error;
      return data || { claimed:false, reason:"no_match" };
    } catch(err){
      console.warn("[Hearty Auth] grandfather claim skipped/failed", err);
      return { claimed:false, reason:"error", error:err };
    }
  }

  async function getEntitlement(){
    const sb = supabase();
    const user = await getCurrentUser();
    if(!sb || !user) return { active:false, reason:"signed_out" };

    try {
      const { data, error } = await sb
        .from("user_entitlements")
        .select("status,entitlement_key,source,ends_at,created_at")
        .eq("user_id", user.id)
        .eq("entitlement_key", AUTH_CONFIG.entitlementKey)
        .eq("status", "active")
        .limit(1);

      if(error) throw error;

      const active = (data || []).some(row => {
        if(!row.ends_at) return true;
        return new Date(row.ends_at).getTime() > Date.now();
      });

      return { active, rows:data || [] };
    } catch(err){
      return { active:false, reason:"error", error:err };
    }
  }

  async function completeLogin(user){
    await ensureProfile(user);
    const claim = await claimGrandfatheredAccess();
    const entitlement = await getEntitlement();

    if(claim && claim.claimed){
      setMessage("Account secured. Lifetime access matched to your purchase email.", "success");
    } else if(entitlement.active){
      setMessage("Account secured. Lifetime access is active.", "success");
    } else {
      setMessage("Account secured. If you already bought Hearty, make sure this is your purchase email or send an access request.", "");
    }

    setTimeout(() => {
      window.location.replace(getRedirectTarget());
    }, 700);
  }

  function hashParams(){
    return new URLSearchParams(window.location.hash ? window.location.hash.slice(1) : "");
  }

  function searchParams(){
    return new URLSearchParams(window.location.search || "");
  }

  function isRecoveryLink(){
    const h = hashParams();
    const s = searchParams();
    return h.get("type") === "recovery" || s.get("type") === "recovery" || s.get("mode") === "new-password";
  }

  function cleanUrl(){
    if(window.history && (window.location.hash || window.location.search)){
      window.history.replaceState({}, document.title, AUTH_CONFIG.loginPage);
    }
  }

  async function handleAuthRedirect(){
    const sb = supabase();
    if(!sb || !sb.auth) return false;

    const h = hashParams();
    const accessToken = h.get("access_token");
    const refreshToken = h.get("refresh_token");

    if(accessToken && refreshToken){
      setBusy(true);
      setMessage(isRecoveryLink() ? "Opening password reset…" : "Completing sign in…");
      const { data, error } = await sb.auth.setSession({ access_token:accessToken, refresh_token:refreshToken });
      if(error) throw error;

      if(isRecoveryLink()){
        cleanUrl();
        setPanel("newPassword");
        setBusy(false);
        return true;
      }

      if(data && data.session && data.session.user){
        await completeLogin(data.session.user);
        return true;
      }
    }

    if(window.location.search.includes("code=")){
      setBusy(true);
      setMessage(isRecoveryLink() ? "Opening password reset…" : "Completing sign in…");
      const { data, error } = await sb.auth.exchangeCodeForSession(window.location.href);
      if(error) throw error;

      if(isRecoveryLink()){
        cleanUrl();
        setPanel("newPassword");
        setBusy(false);
        return true;
      }

      if(data && data.session && data.session.user){
        await completeLogin(data.session.user);
        return true;
      }
    }

    return false;
  }

  async function checkExistingSession(){
    const sb = supabase();
    if(!sb || !sb.auth){
      setMessage("Login connection failed. Check /glp-supabase-config.js.", "error");
      showDebug("Missing Supabase client", { hasSupabaseLibrary: !!window.supabase, hasSupabaseClient: !!window.supabaseClient });
      return;
    }

    try {
      if(await handleAuthRedirect()) return;

      const params = searchParams();
      if(params.get("mode") === "signup") setPanel("signup");
      if(params.get("type") === "recovery" || params.get("mode") === "new-password") setPanel("newPassword");

      const { data } = await sb.auth.getSession();
      if(data && data.session && data.session.user && !isRecoveryLink()){
        const entitlement = await getEntitlement();
        if(entitlement.active){
          setMessage("You are signed in. Lifetime access is active.", "success");
        } else {
          const claim = await claimGrandfatheredAccess();
          if(claim && claim.claimed) setMessage("You are signed in. Lifetime access matched to your purchase email.", "success");
          else setMessage("You are signed in. If you already purchased, use your purchase email or send an access request.");
        }
      }
    } catch(err){
      setBusy(false);
      setMessage("Could not complete sign in. Try again.", "error");
      showDebug("Auth redirect/session error", err);
    }
  }

  async function signIn(){
    const sb = supabase();
    const email = ($("signinEmail")?.value || "").trim().toLowerCase();
    const password = $("signinPassword")?.value || "";

    if(!emailLooksValid(email)){ setMessage("Please enter a valid email address.", "error"); return; }
    if(!password){ setMessage("Please enter your password.", "error"); return; }

    try {
      setBusy(true); clearDebug(); setMessage("Signing in…");
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if(error) throw error;
      if(data && data.user) await completeLogin(data.user);
    } catch(err){
      setBusy(false);
      setMessage(err.message || "Could not sign in.", "error");
      showDebug("Password sign in failed", err);
    }
  }

  async function signUp(){
    const sb = supabase();
    const name = ($("signupName")?.value || "").trim();
    const email = ($("signupEmail")?.value || "").trim().toLowerCase();
    const password = $("signupPassword")?.value || "";
    const confirm = $("signupConfirm")?.value || "";

    if(!name){ setMessage("Please enter your name.", "error"); return; }
    if(!emailLooksValid(email)){ setMessage("Please enter a valid email address.", "error"); return; }
    if(password.length < 8){ setMessage("Password must be at least 8 characters.", "error"); return; }
    if(password !== confirm){ setMessage("Passwords do not match.", "error"); return; }

    try {
      setBusy(true); clearDebug(); setMessage("Creating your account…");
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: { full_name:name },
          emailRedirectTo: window.location.origin + AUTH_CONFIG.loginPage
        }
      });
      if(error) throw error;

      if(data && data.session && data.user){
        await completeLogin(data.user);
        return;
      }

      setBusy(false);
      setMessage("Account created. Check your email to confirm your account, then sign in.");
      setPanel("signin");
      const signinEmail = $("signinEmail");
      if(signinEmail) signinEmail.value = email;
    } catch(err){
      setBusy(false);
      setMessage(err.message || "Could not create account.", "error");
      showDebug("Account creation failed", err);
    }
  }

  async function googleSignIn(){
    const sb = supabase();
    try {
      setBusy(true); clearDebug(); setMessage("Opening Google sign in…");
      const { error } = await sb.auth.signInWithOAuth({
        provider:"google",
        options:{ redirectTo: window.location.origin + AUTH_CONFIG.loginPage }
      });
      if(error) throw error;
    } catch(err){
      setBusy(false);
      setMessage(err.message || "Could not open Google sign in.", "error");
      showDebug("Google login failed", err);
    }
  }

  async function sendReset(){
    const sb = supabase();
    const email = ($("resetEmail")?.value || $("signinEmail")?.value || "").trim().toLowerCase();

    if(!emailLooksValid(email)){ setMessage("Please enter a valid email address.", "error"); return; }

    try {
      setBusy(true); clearDebug(); setMessage("Sending reset link…");
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + AUTH_CONFIG.loginPage + "?type=recovery"
      });
      if(error) throw error;
      setBusy(false);
      setMessage("Check your email for the password reset link.", "success");
    } catch(err){
      setBusy(false);
      setMessage(err.message || "Could not send reset link.", "error");
      showDebug("Password reset failed", err);
    }
  }

  async function saveNewPassword(){
    const sb = supabase();
    const p1 = $("newPassword")?.value || "";
    const p2 = $("confirmPassword")?.value || "";

    if(p1.length < 8){ setMessage("Password must be at least 8 characters.", "error"); return; }
    if(p1 !== p2){ setMessage("Passwords do not match.", "error"); return; }

    try {
      setBusy(true); clearDebug(); setMessage("Saving password…");
      const { data: userData } = await sb.auth.getUser();
      const { error } = await sb.auth.updateUser({ password:p1 });
      if(error) throw error;
      const user = userData && userData.user ? userData.user : null;
      if(user) await completeLogin(user);
      else window.location.replace(AUTH_CONFIG.appHome);
    } catch(err){
      setBusy(false);
      setMessage(err.message || "Could not update password.", "error");
      showDebug("Password update failed", err);
    }
  }

  async function sendAccessRequest(){
    const sb = supabase();
    const purchaseEmail = ($("purchaseEmail")?.value || "").trim().toLowerCase();
    const accountEmail = ($("accountEmail")?.value || "").trim().toLowerCase();
    const message = ($("accessMessage")?.value || "").trim();

    if(!emailLooksValid(purchaseEmail)){ setMessage("Please enter the email used when buying Hearty.", "error"); return; }
    if(!emailLooksValid(accountEmail)){ setMessage("Please enter the account email you want to use.", "error"); return; }

    try {
      setBusy(true); clearDebug(); setMessage("Sending access request…");

      let user = await getCurrentUser();

      const { error } = await sb.from("access_recovery_requests").insert({
        purchase_email: purchaseEmail,
        account_email: accountEmail,
        email: purchaseEmail,
        user_id: user ? user.id : null,
        reason: message || "Grandfather access matching request",
        status: "open"
      });

      if(error) throw error;

      setBusy(false);
      setMessage("Request sent. We’ll manually match your purchase if needed.", "success");
      $("purchaseEmail").value = "";
      $("accountEmail").value = "";
      $("accessMessage").value = "";
    } catch(err){
      setBusy(false);
      setMessage(err.message || "Could not send access request.", "error");
      showDebug("Access request failed", err);
    }
  }

  async function signOut(){
    const sb = supabase();
    try { if(sb && sb.auth) await sb.auth.signOut(); } catch(err) {}
    try {
      localStorage.removeItem("heartyAuthUserId");
      localStorage.removeItem("heartyLastLoginAt");
    } catch {}
    window.location.replace(AUTH_CONFIG.loginPage);
  }

  function bindLoginPage(){
    document.querySelectorAll("[data-auth-tab]").forEach(btn => {
      btn.addEventListener("click", () => setPanel(btn.dataset.authTab));
    });

    $("signinBtn")?.addEventListener("click", signIn);
    $("signupBtn")?.addEventListener("click", signUp);
    $("googleBtn")?.addEventListener("click", googleSignIn);
    $("forgotPasswordBtn")?.addEventListener("click", () => {
      const email = $("signinEmail")?.value || "";
      setPanel("forgot");
      const resetEmail = $("resetEmail");
      if(resetEmail) resetEmail.value = email;
    });
    $("accessHelpBtn")?.addEventListener("click", () => {
      const email = $("signinEmail")?.value || $("signupEmail")?.value || "";
      setPanel("access");
      const purchase = $("purchaseEmail");
      const account = $("accountEmail");
      if(purchase) purchase.value = email;
      if(account) account.value = email;
    });
    $("backToLoginBtn")?.addEventListener("click", () => setPanel("signin"));
    $("backFromAccessBtn")?.addEventListener("click", () => setPanel("signin"));
    $("resetSendBtn")?.addEventListener("click", sendReset);
    $("savePasswordBtn")?.addEventListener("click", saveNewPassword);
    $("accessRequestBtn")?.addEventListener("click", sendAccessRequest);

    ["signinPassword","signupConfirm","confirmPassword"].forEach(id => {
      $(id)?.addEventListener("keydown", e => {
        if(e.key !== "Enter") return;
        if(id === "signinPassword") signIn();
        if(id === "signupConfirm") signUp();
        if(id === "confirmPassword") saveNewPassword();
      });
    });

    const params = searchParams();
    if(params.get("mode") === "signup") setPanel("signup");
    if(params.get("mode") === "access") setPanel("access");
    if(params.get("type") === "recovery" || params.get("mode") === "new-password") setPanel("newPassword");

    const sb = supabase();
    if(sb && sb.auth){
      sb.auth.onAuthStateChange((event, session) => {
        if(event === "PASSWORD_RECOVERY"){
          setBusy(false);
          setPanel("newPassword");
          return;
        }
        if(session && session.user && event === "SIGNED_IN" && !isRecoveryLink()){
          completeLogin(session.user);
        }
      });
    }

    setBusy(false);
    checkExistingSession();
  }

  window.HeartyAuthSoft = {
    config: AUTH_CONFIG,
    ensureProfile,
    claimGrandfatheredAccess,
    getEntitlement,
    signOut,
    getCurrentUser
  };

  window.HeartyAuth = window.HeartyAuthSoft;

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-hearty-logout]").forEach(el => {
      el.addEventListener("click", signOut);
    });

    if(document.documentElement.dataset.authPage === "login"){
      bindLoginPage();
    }
  });
})();
