(function(){
  const pages = [
    ['home.html','Home','<path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10.5V20h13v-9.5"></path><path d="M9.5 20v-6h5v6"></path>','home'],
    ['meals.html','Meals','<path d="M4 3v8"></path><path d="M8 3v8"></path><path d="M6 3v18"></path><path d="M15 3v18"></path><path d="M15 3c3 2 4.5 5 4.5 8H15"></path>','meals'],
    ['exercise.html','Exercise','<path d="M6 7v10"></path><path d="M18 7v10"></path><path d="M3 10v4"></path><path d="M21 10v4"></path><path d="M6 12h12"></path>','exercise'],
    ['progress.html','Progress','<path d="M4 19V5"></path><path d="M4 19h16"></path><path d="M7 15l3-3 3 2 5-7"></path>','progress'],
    ['support.html','Support','<path d="M12 21s-7-4.4-9-9a5 5 0 0 1 8-5 5 5 0 0 1 8 5c-2 4.6-9 9-9 9z"></path>','support'],
    ['social.html','Social','<path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="10" cy="7" r="4"></circle><path d="M21 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>','social'],
    ['settings.html','Settings','<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 3a1.65 1.65 0 0 0 1-1.51V1a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.14.31.4.55.72.67.17.07.35.1.53.1H21a2 2 0 1 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15z"></path>','settings']
  ];
  function currentKey(){
    const bodyPage = (document.body && document.body.dataset && document.body.dataset.page || '').toLowerCase();
    if(bodyPage) return bodyPage === 'community' ? 'social' : bodyPage;
    const file = (location.pathname.split('/').pop() || 'home.html').toLowerCase();
    if(file === '' || file === 'index.html') return 'home';
    return file.replace(/\.html?$/,'');
  }
  function renderPageSelector(){
    if(!document.body) return;
    const key = currentKey();
    let nav = document.querySelector('nav.bottom-nav, nav.hearty-page-selector, #bottomNav');
    if(!nav){
      nav = document.createElement('nav');
      document.body.appendChild(nav);
    }
    nav.className = 'bottom-nav hearty-page-selector';
    nav.setAttribute('aria-label','Page selector');
    nav.innerHTML = pages.map(([href,label,icon,pageKey]) => {
      const active = key === pageKey;
      return `<a class="nav-item${active ? ' active' : ''}" ${active ? 'aria-current="page"' : ''} href="${href}"><svg viewBox="0 0 24 24" aria-hidden="true">${icon}</svg><span>${label}</span></a>`;
    }).join('');
  }
  renderPageSelector();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderPageSelector, { once:true });
  window.addEventListener('load', renderPageSelector, { once:true });
  window.addEventListener('pageshow', renderPageSelector);
  window.HeartyRenderPageSelector = renderPageSelector;
})();
