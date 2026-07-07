(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  let activeRecipeFilter = '';
  let mealIdeasVisible = false;

  function escapeHtml(text) {
    return String(text == null ? '' : text).replace(/[&<>"]/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[ch]));
  }

  function tidyCopy(text) {
    return String(text == null ? '' : text)
      .replace(/Perfect Women-style/gi, 'Hearty-style')
      .replace(/Perfect Women/gi, 'Hearty')
      .replace(/client plan/gi, 'your plan')
      .replace(/the client plan/gi, 'your plan')
      .replace(/clients who/gi, 'people who')
      .replace(/client needs/gi, 'you need')
      .replace(/client wants/gi, 'you want')
      .replace(/the client wants/gi, 'you want')
      .replace(/client is/gi, 'you are')
      .replace(/client/gi, 'you');
  }

  function recipes() {
    return Array.isArray(window.PW_RECIPES) ? window.PW_RECIPES : [];
  }

  function mealIdeas() {
    return window.PW_MEAL_IDEAS || {};
  }

  function mealTypeLabel(type) {
    return { breakfast: 'Breakfast', snack: 'Snack', lunch: 'Lunch', dinner: 'Dinner' }[type] || 'Meal';
  }

  function currentMealType() {
    return $('#mealGeneratorType')?.value || 'breakfast';
  }

  function randomFrom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function toast(message) {
    const el = $('#recipeToast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    window.clearTimeout(toast._timer);
    toast._timer = window.setTimeout(() => el.classList.remove('show'), 2200);
  }

  function normaliseTags(recipe) {
    return Array.isArray(recipe?.tags) ? recipe.tags : [];
  }

  function recipeType(recipe) {
    const text = `${recipe?.title || ''} ${normaliseTags(recipe).join(' ')} ${recipe?.summary || ''}`.toLowerCase();
    if (/breakfast|oats|yoghurt|yogurt|egg|smoothie/.test(text)) return 'breakfast';
    if (/snack|apple|berry|bar|bites/.test(text)) return 'snack';
    if (/lunch|salad|wrap/.test(text)) return 'lunch';
    return 'dinner';
  }

  function typeLabelForRecipe(recipe) {
    return mealTypeLabel(recipeType(recipe));
  }

  function iconSvg(type) {
    const icons = {
      breakfast: '<svg viewBox="0 0 24 24"><path d="M4 13c0 4 3.6 7 8 7s8-3 8-7H4z"></path><path d="M8 13c.3-3 1.8-4.5 4-4.5s3.7 1.5 4 4.5"></path><path d="M12 3v2"></path><path d="M5 6l1.4 1.4"></path><path d="M19 6l-1.4 1.4"></path></svg>',
      lunch: '<svg viewBox="0 0 24 24"><path d="M4 12c3-4 8-5 16-3-3 6-8 9-16 8 1-2 3-4 7-6"></path><path d="M8 15c2-2 5-3 9-4"></path></svg>',
      dinner: '<svg viewBox="0 0 24 24"><path d="M5 12a7 7 0 1 0 14 0"></path><path d="M4 12h16"></path><path d="M8 9c0-1.5 1-2.2 2-3"></path><path d="M14 9c0-1.5 1-2.2 2-3"></path><path d="M10 19h4"></path></svg>',
      snack: '<svg viewBox="0 0 24 24"><path d="M12 7c4-2 8 1 7 6-.7 4.4-3.4 7-7 7s-6.3-2.6-7-7c-1-5 3-8 7-6z"></path><path d="M12 7c-.2-2 1.1-3.4 3.5-4"></path><path d="M12 7c-1.2-1-2.5-1.2-4-1"></path></svg>',
      book: '<svg viewBox="0 0 24 24"><path d="M4 5.5c2.2-.9 4.7-.9 7.5.1v14c-2.8-1-5.3-1-7.5-.1z"></path><path d="M12.5 5.6c2.8-1 5.3-1 7.5-.1v14c-2.2-.9-4.7-.9-7.5.1z"></path><path d="M8 8v7"></path><path d="M16 8c1.2 1.2 1.2 3.4 0 4.2V15"></path></svg>'
    };
    return icons[type] || icons.book;
  }

  function categoryClass(type) {
    return `recipe-category-${type || 'dinner'}`;
  }

  function categoryInitial(type) {
    return { breakfast: 'B', lunch: 'L', dinner: 'D', snack: 'S' }[type] || 'R';
  }

  function categoryLine(type, label) {
    const safeType = type || 'dinner';
    return `<div class="category-line"><span class="category-badge" aria-hidden="true">${escapeHtml(categoryInitial(safeType))}</span><span>${escapeHtml(label || mealTypeLabel(safeType))}</span></div>`;
  }

  function timeLabel(recipe) {
    const text = `${normaliseTags(recipe).join(' ')} ${recipe?.summary || ''} ${recipe?.title || ''}`.toLowerCase();
    if (/no cook|no-cook|smoothie|salad/.test(text)) return '10 min';
    if (/quick|wrap|egg|omelette|snack/.test(text)) return '15 min';
    if (/slow cooker/.test(text)) return 'slow cook';
    if (/casserole|sunday|roast/.test(text)) return '45 min';
    return '25 min';
  }

  function estimateFibre(recipe) {
    const direct = recipe?.fibre ?? recipe?.fiber;
    if (direct != null && direct !== '') return direct;
    const text = `${recipe?.title || ''} ${recipe?.summary || ''} ${normaliseTags(recipe).join(' ')} ${(recipe?.ingredients || []).join(' ')}`.toLowerCase();
    let score = 3;
    if (/lentil|bean|chickpea|oat|bran|barley/.test(text)) score += 5;
    if (/berries|berry|apple|pear/.test(text)) score += 2;
    if (/salad|spinach|vegetable|veg|broccoli|cauliflower|carrot|baby marrow|green beans/.test(text)) score += 2;
    if (/low carb/.test(text)) score = Math.max(3, score - 1);
    return Math.min(score, 10);
  }

  function withUnit(value, unit, label) {
    const raw = String(value == null || value === '' ? '—' : value).trim();
    if (raw === '—') return `${raw} ${label}`;
    const hasUnit = new RegExp(`\\b${unit}\\b`, 'i').test(raw);
    return `${raw}${hasUnit ? '' : unit === 'kcal' ? ' kcal' : unit} ${label}`.replace(' kcal kcal', ' kcal');
  }

  function metaLine(recipe) {
    const parts = [
      timeLabel(recipe),
      withUnit(recipe?.protein, 'g', 'protein'),
      withUnit(recipe?.calories, 'kcal', '').trim(),
      withUnit(estimateFibre(recipe), 'g', 'fibre')
    ];
    return `<div class="recipe-meta-line" aria-label="Estimated recipe details">${parts.map(escapeHtml).join(' · ')}</div>`;
  }

  function tagLine(tags, limit = 4) {
    const clean = (tags || []).slice(0, limit).map(tidyCopy).filter(Boolean);
    return clean.length ? `<div class="recipe-tag-line">${clean.map(escapeHtml).join(' · ')}</div>` : '';
  }

  function selectFeatured(source) {
    if (!source.length) return null;
    return source.find((recipe) => /high protein/i.test(normaliseTags(recipe).join(' '))) || source[0];
  }

  function renderFeatured(visible) {
    const host = $('#featuredRecipe');
    if (!host) return;
    const recipe = selectFeatured(visible.length ? visible : recipes());
    if (!recipe) {
      host.className = 'featured-recipe recipes-card recipe-category-dinner';
      host.innerHTML = '<p class="muted">No featured recipe loaded yet.</p>';
      return;
    }
    const type = recipeType(recipe);
    host.className = `featured-recipe recipes-card ${categoryClass(type)}`;
    host.innerHTML = `
      <div class="featured-body">
        ${categoryLine(type, 'Featured recipe')}
        <h2>${escapeHtml(tidyCopy(recipe.title))}</h2>
        <p class="muted">${escapeHtml(tidyCopy(recipe.summary || 'A simple recipe idea for your week.'))}</p>
        ${metaLine(recipe)}
        ${tagLine(normaliseTags(recipe), 5)}
        <div><button class="recipe-primary" data-open-recipe="${escapeHtml(recipe.id)}" type="button">View recipe</button></div>
      </div>
    `;
  }

  function renderMealIdea(idea, type) {
    const result = $('#mealIdeaResult');
    if (!result || !idea) return;
    result.className = `meal-result ${categoryClass(type)}`;
    result.innerHTML = `
      ${categoryLine(type, `${mealTypeLabel(type)} idea`)}
      <h3>${escapeHtml(tidyCopy(idea.title))}</h3>
      ${idea.structure ? `<p class="meal-structure">${escapeHtml(tidyCopy(idea.structure))}</p>` : ''}
      <p class="muted small">${escapeHtml(tidyCopy(idea.idea || ''))}</p>
      ${tagLine(idea.tags || [], 4)}
      ${idea.note ? `<p class="small muted"><strong>Hearty note:</strong> ${escapeHtml(tidyCopy(idea.note))}</p>` : ''}
    `;
  }

  function renderMealIdeaList() {
    const list = $('#mealIdeaList');
    const btn = $('#showAllMealIdeasBtn');
    if (!list || !btn) return;
    const type = currentMealType();
    const items = mealIdeas()[type] || [];
    list.hidden = !mealIdeasVisible;
    btn.textContent = mealIdeasVisible ? 'Hide all ideas' : 'Show all ideas';
    if (!mealIdeasVisible) {
      list.innerHTML = '';
      return;
    }
    list.innerHTML = items.length ? items.map((idea) => `
      <article class="meal-option-card ${categoryClass(type)}">
        ${categoryLine(type, mealTypeLabel(type))}
        <div>
          <h3>${escapeHtml(tidyCopy(idea.title))}</h3>
          <p class="small muted">${escapeHtml(tidyCopy(idea.idea))}</p>
        </div>
      </article>
    `).join('') : '<article class="meal-option-card"><p class="muted">No ideas loaded for this meal type yet.</p></article>';
  }

  function resetMealGenerator() {
    const type = currentMealType();
    const result = $('#mealIdeaResult');
    if (result) {
      result.className = `meal-result ${categoryClass(type)}`;
      result.innerHTML = `
        ${categoryLine(type, mealTypeLabel(type))}
        <h3>Tap for one simple idea.</h3>
        <p class="muted small">Use this when you need an option without changing your weekly Meals plan.</p>
      `;
    }
    renderMealIdeaList();
  }

  function spinMealWheel() {
    const type = currentMealType();
    const items = mealIdeas()[type] || [];
    if (!items.length) {
      toast('No meal ideas loaded yet');
      return;
    }
    const btn = $('#spinMealBtn');
    const idea = randomFrom(items);
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Choosing...';
    }
    window.setTimeout(() => {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Get another idea';
      }
      renderMealIdea(idea, type);
    }, 260);
  }

  function recipeFilterMatches(recipe, filter) {
    if (!filter || filter === '__all__') return true;
    const type = recipeType(recipe);
    const normalised = String(filter).toLowerCase();
    if (normalised === 'snacks') return type === 'snack';
    if (['breakfast', 'lunch', 'dinner', 'snack'].includes(normalised)) return type === normalised;
    return normaliseTags(recipe).some((tag) => String(tag).toLowerCase() === normalised);
  }

  function activeFilterLabel() {
    if (!activeRecipeFilter) return '';
    if (activeRecipeFilter === '__all__') return 'All recipes';
    return tidyCopy(activeRecipeFilter === 'Snack' ? 'Snacks' : activeRecipeFilter);
  }

  function filteredRecipes() {
    const source = recipes();
    const q = ($('#recipeSearch')?.value || '').trim().toLowerCase();
    if (!q && !activeRecipeFilter) return [];
    return source.filter((recipe) => {
      const matchesFilter = recipeFilterMatches(recipe, activeRecipeFilter);
      const tags = normaliseTags(recipe);
      const haystack = `${recipe.title || ''} ${tags.join(' ')} ${recipe.summary || ''} ${(recipe.ingredients || []).join(' ')} ${(recipe.searchTerms || []).join(' ')}`.toLowerCase();
      return matchesFilter && (!q || haystack.includes(q));
    });
  }

  function renderFilters() {
    const filterHost = $('#recipeFilters');
    if (!filterHost) return;
    const source = recipes();
    const tagSet = new Set(source.flatMap((r) => normaliseTags(r)));
    const wantedTags = ['High Protein', 'Quick', 'Low Carb', 'No Cook', 'Meal Prep', 'Comfort Meals'];
    const availableTags = wantedTags.filter((tag) => tagSet.has(tag));
    const filters = [
      { value: 'Breakfast', label: 'Breakfast' },
      { value: 'Lunch', label: 'Lunch' },
      { value: 'Dinner', label: 'Dinner' },
      { value: 'Snack', label: 'Snacks' },
      ...availableTags.map((tag) => ({ value: tag, label: tidyCopy(tag) })),
      { value: '__all__', label: 'View all' }
    ];
    filterHost.innerHTML = filters.map((item) => `<button class="${item.value === activeRecipeFilter ? 'active' : ''}" data-recipe-filter="${escapeHtml(item.value)}" type="button">${escapeHtml(item.label)}</button>`).join('');
    $$('[data-recipe-filter]').forEach((btn) => btn.addEventListener('click', () => {
      activeRecipeFilter = btn.dataset.recipeFilter || '';
      renderRecipes();
      document.querySelector('.recipe-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }

  function promptCardHtml() {
    return `
      <article class="recipes-empty recipe-prompt-card">
        <h3>Choose what you need.</h3>
        <p class="muted">Search by ingredient or tap a category above. Your recipes will appear here only after you choose.</p>
      </article>
    `;
  }

  function renderRecipes() {
    const listHost = $('#recipeList');
    if (!listHost) return;
    renderFilters();
    const q = ($('#recipeSearch')?.value || '').trim();
    const visible = filteredRecipes();
    renderFeatured(recipes());

    const title = $('#recipeLibraryTitle');
    const count = $('#recipeCount');
    if (!q && !activeRecipeFilter) {
      if (title) title.textContent = 'Find recipes';
      if (count) count.textContent = 'Search or choose a category';
      listHost.innerHTML = promptCardHtml();
      return;
    }

    if (title) {
      title.textContent = q ? 'Search results' : activeFilterLabel();
    }
    if (count) count.textContent = visible.length === 1 ? '1 recipe' : `${visible.length} recipes`;

    listHost.innerHTML = visible.length ? visible.map((recipe) => recipeCardHtml(recipe)).join('') : `
      <article class="recipes-empty"><h3>No recipes found</h3><p class="muted">Try a simpler search or choose a different category.</p></article>
    `;

    $$('[data-open-recipe]').forEach((btn) => btn.addEventListener('click', () => openRecipe(btn.dataset.openRecipe)));
  }

  function recipeCardHtml(recipe) {
    const tags = normaliseTags(recipe);
    const type = recipeType(recipe);
    return `
      <article class="recipe-card ${categoryClass(type)}">
        <div class="recipe-card-body">
          <div class="recipe-card-top">
            ${categoryLine(type, typeLabelForRecipe(recipe))}
            <button class="recipe-open-mini" data-open-recipe="${escapeHtml(recipe.id)}" type="button">View</button>
          </div>
          <div>
            <h3>${escapeHtml(tidyCopy(recipe.title))}</h3>
            <p class="muted">${escapeHtml(tidyCopy(recipe.summary || 'Simple Hearty recipe idea.'))}</p>
          </div>
          ${metaLine(recipe)}
          ${tagLine(tags, 4)}
        </div>
      </article>
    `;
  }

  function openRecipe(id) {
    const recipe = recipes().find((item) => item.id === id);
    const modal = $('#recipeModal');
    const content = $('#recipeModalContent');
    if (!recipe || !modal || !content) return;
    const tags = normaliseTags(recipe);
    const type = recipeType(recipe);
    content.className = `recipe-modal-content ${categoryClass(type)}`;
    content.innerHTML = `
      <button class="recipe-modal-close" id="recipeModalClose" type="button" aria-label="Close recipe">×</button>
      <div class="modal-title-row">
        ${categoryLine(type, tidyCopy(tags.slice(0, 2).join(' • ') || typeLabelForRecipe(recipe)))}
        <h2>${escapeHtml(tidyCopy(recipe.title))}</h2>
      </div>
      <p class="muted">${escapeHtml(tidyCopy(recipe.summary || 'Simple Hearty recipe idea.'))}</p>
      ${metaLine(recipe)}
      ${tagLine(tags, 6)}
      <h3>Ingredients</h3>
      <ul>${(recipe.ingredients || []).map((item) => `<li>${escapeHtml(tidyCopy(item))}</li>`).join('')}</ul>
      <h3>Method</h3>
      <ol>${(recipe.method || []).map((item) => `<li>${escapeHtml(tidyCopy(item))}</li>`).join('')}</ol>
      ${recipe.planNote ? `<p class="muted"><strong>Hearty note:</strong> ${escapeHtml(tidyCopy(recipe.planNote))}</p>` : ''}
    `;
    $('#recipeModalClose')?.addEventListener('click', closeRecipeModal);
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
  }

  function closeRecipeModal() {
    const modal = $('#recipeModal');
    if (!modal) return;
    if (typeof modal.close === 'function') modal.close();
    else modal.removeAttribute('open');
  }

  function bind() {
    $('#spinMealBtn')?.addEventListener('click', spinMealWheel);
    $('#mealGeneratorType')?.addEventListener('change', () => {
      mealIdeasVisible = false;
      const btn = $('#spinMealBtn');
      if (btn) btn.textContent = 'Get a meal idea';
      resetMealGenerator();
    });
    $('#showAllMealIdeasBtn')?.addEventListener('click', () => {
      mealIdeasVisible = !mealIdeasVisible;
      renderMealIdeaList();
    });
    $('#recipeSearch')?.addEventListener('input', () => {
      renderRecipes();
    });
    $$('[data-quick-filter]').forEach((btn) => btn.addEventListener('click', () => {
      activeRecipeFilter = btn.dataset.quickFilter || 'All';
      const search = $('#recipeSearch');
      if (search) search.value = '';
      renderRecipes();
      document.querySelector('.recipe-library')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
    $('#recipeModal')?.addEventListener('click', (event) => {
      if (event.target === $('#recipeModal')) closeRecipeModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeRecipeModal();
    });
  }

  function init() {
    bind();
    resetMealGenerator();
    renderRecipes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
