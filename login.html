/*
  Hearty Account Prompt v1
  Step 2B soft-login prompt.

  Adds a soft "Secure your account" card without blocking current users.
*/

(function(){
  "use strict";

  const $ = (s, r=document) => r.querySelector(s);
  const sb = () => window.supabaseClient || window.heartySupabase || null;

  function style(){
    if(document.getElementById("hearty-account-prompt-style")) return;
    const css = `
      .hearty-account-card{
        border:1px solid rgba(47,109,246,.18);
        background:linear-gradient(180deg,rgba(255,255,255,.94),rgba(245,250,255,.9));
        border-radius:24px;
        padding:18px;
        box-shadow:0 16px 40px rgba(15,35,65,.08);
        margin:16px 0;
        color:#102033;
      }
      .hearty-account-card .eyebrow{
        text-transform:uppercase;
        letter-spacing:.12em;
        color:#2f6df6;
        font-weight:900;
        font-size:.72rem;
        margin-bottom:5px;
      }
      .hearty-account-card h2{
        margin:0 0 7px;
        font-size:1.15rem;
        letter-spacing:-.02em;
      }
      .hearty-account-card p{
        margin:0;
        color:#64748b;
        line-height:1.45;
        font-size:.94rem;
      }
      .hearty-account-card .actions{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        margin-top:14px;
      }
      .hearty-account-card a,.hearty-account-card button{
        border:0;
        text-decoration:none;
        border-radius:14px;
        padding:11px 14px;
        font-weight:850;
        font-size:.92rem;
        cursor:pointer;
        font-family:inherit;
      }
      .hearty-account-card .primary{
        background:#2f6df6;
        color:white;
        box-shadow:0 10px 22px rgba(47,109,246,.18);
      }
      .hearty-account-card .soft{
        background:white;
        color:#102033;
        border:1px solid rgba(148,163,184,.28);
      }
      .hearty-account-card .status{
        display:inline-flex;
        align-items:center;
        border-radius:999px;
        padding:5px 9px;
        font-size:.78rem;
        font-weight:900;
        margin-top:10px;
        background:rgba(24,184,166,.12);
        color:#12856f;
      }
    `;
    const tag = document.createElement("style");
    tag.id = "hearty-account-prompt-style";
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  async function getUser(){
    const client = sb();
    if(!client || !client.auth) return null;
    try {
      const { data } = await client.auth.getUser();
      return data && data.user ? data.user : null;
    } catch {
      return null;
    }
  }

  async function getEntitlement(){
    if(window.HeartyAuthSoft && window.HeartyAuthSoft.getEntitlement){
      return window.HeartyAuthSoft.getEntitlement();
    }
    return { active:false };
  }

  function findMount(){
    return (
      document.querySelector("[data-hearty-account-prompt]") ||
      document.querySelector("main") ||
      document.body
    );
  }

  async function render(){
    if(document.getElementById("hearty-account-card")) return;
    style();

    const mount = findMount();
    if(!mount) return;

    const user = await getUser();
    const entitlement = user ? await getEntitlement() : { active:false };

    const card = document.createElement("section");
    card.className = "hearty-account-card";
    card.id = "hearty-account-card";

    if(user){
      card.innerHTML = `
        <div class="eyebrow">Account</div>
        <h2>Your Hearty account is active</h2>
        <p>You are signed in as <strong>${user.email || "your account"}</strong>. Existing local app data stays on this device.</p>
        <span class="status">${entitlement && entitlement.active ? "Lifetime access active" : "Account secured"}</span>
        <div class="actions">
          <a class="soft" href="/login.html">Account page</a>
          <button class="soft" type="button" data-hearty-logout>Sign out</button>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="eyebrow">New</div>
        <h2>Secure your Hearty account</h2>
        <p>We’ve added individual accounts. If you already bought Hearty, create your account using the same email you used when purchasing. Your lifetime access will be kept.</p>
        <div class="actions">
          <a class="primary" href="/login.html?mode=signup">Create / secure account</a>
          <a class="soft" href="/login.html?mode=access">Can’t find access?</a>
        </div>
      `;
    }

    const preferred = document.querySelector("[data-hearty-account-prompt]");
    if(preferred){
      preferred.appendChild(card);
    } else {
      mount.insertBefore(card, mount.firstChild);
    }

    card.querySelectorAll("[data-hearty-logout]").forEach(btn => {
      btn.addEventListener("click", () => {
        if(window.HeartyAuthSoft && window.HeartyAuthSoft.signOut) window.HeartyAuthSoft.signOut();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => setTimeout(render, 400));
})();
