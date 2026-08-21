// catalog.js – Gestión del catálogo de productos Faroluz
'use strict';

const Catalog = (() => {
  let _products = [];
  let _filtered  = [];
  let _currentTab = 'todos';
  let _searchTerm = '';
  let _catFilter  = '';
  let _favorites  = new Set();
  let _recientes  = [];

  function init(products) {
    _products = products || [];
    _loadFavorites();
    _loadRecientes();
    _buildCatFilter();
    renderList();
    const badge = document.getElementById('total-products-badge');
    if (badge) badge.textContent = _products.length;
  }

  function _loadFavorites() {
    try { const r = localStorage.getItem('fl_favorites'); if (r) _favorites = new Set(JSON.parse(r)); } catch(_) {}
  }
  function _saveFavorites() { localStorage.setItem('fl_favorites', JSON.stringify([..._favorites])); }
  function _loadRecientes() {
    try { const r = localStorage.getItem('fl_recientes'); if (r) _recientes = JSON.parse(r); } catch(_) {}
  }
  function _saveRecientes() { localStorage.setItem('fl_recientes', JSON.stringify(_recientes.slice(0,20))); }

  function addReciente(codigo) {
    _recientes = [codigo, ..._recientes.filter(c => c !== codigo)].slice(0,20);
    _saveRecientes();
  }
  function toggleFavorite(codigo) {
    if (_favorites.has(codigo)) { _favorites.delete(codigo); toast('Eliminado de favoritos','info'); }
    else { _favorites.add(codigo); toast('Agregado a favoritos ★','success'); }
    _saveFavorites();
    renderList();
  }

  function _normalize(str) {
    return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
  }
  function _match(p, terms) {
    const h = _normalize(p.codigo+' '+p.descripcion+' '+p.categoria+' '+p.observaciones);
    return terms.every(t => h.includes(t));
  }

  function filter(searchTerm, catFilter, tab) {
    if (searchTerm !== undefined) _searchTerm = searchTerm;
    if (catFilter  !== undefined) _catFilter  = catFilter;
    if (tab        !== undefined) _currentTab = tab;
    const terms = _normalize(_searchTerm).split(/\s+/).filter(Boolean);
    let base = _products;
    if (_currentTab === 'favoritos') base = _products.filter(p => _favorites.has(p.codigo));
    else if (_currentTab === 'recientes') base = _recientes.map(c => _products.find(p => p.codigo===c)).filter(Boolean);
    if (_catFilter) base = base.filter(p => p.categoria === _catFilter);
    if (terms.length > 0) base = base.filter(p => _match(p, terms));
    _filtered = base;
    const el = document.getElementById('search-count');
    if (el) el.textContent = _filtered.length + ' artículo' + (_filtered.length!==1?'s':'') + (_searchTerm?' · "'+_searchTerm+'"':'');
    return _filtered;
  }

  function _thumb(product) {
    const url = (typeof getImagenURL === 'function') ? getImagenURL(product.codigo, product.categoria) : null;
    const fallback = '<div class="prod-thumb-sm-placeholder"><span>'+esc(product.codigo)+'</span></div>';
    if (url) {
      return '<img class="prod-thumb-sm thumb-preview-trigger" src="'+url+'" alt="" loading="lazy" title="Ver foto" onclick="ImagePreview.show(this.src,event)" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
           + '<div class="prod-thumb-sm-placeholder" style="display:none"><span>'+esc(product.codigo)+'</span></div>';
    }
    return fallback;
  }

  function renderList(searchTerm, catFilter, tab) {
    const items = filter(searchTerm, catFilter, tab);
    const container = document.getElementById('catalogo-list');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '<div class="empty-state" style="padding:40px 20px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg><h3>Sin resultados</h3><p>'+(_currentTab==='favoritos'?'No tenés favoritos aún.<br>Clic derecho en un artículo.':'Intentá con otro término.')+'</p></div>';
      return;
    }

    const toShow = items;
    const terms  = _normalize(_searchTerm).split(/\s+/).filter(Boolean);

    const html = toShow.map(p => {
      const isFav = _favorites.has(p.codigo);
      const desc  = terms.length ? _highlight(esc(p.descripcion), terms) : esc(p.descripcion);
      const cod   = terms.length ? _highlight(esc(p.codigo), terms) : esc(p.codigo);
      return `<div class="catalog-item${isFav?' favorite':''}" onclick="Quotation.addItem('${ea(p.codigo)}')" oncontextmenu="Catalog.toggleFavorite('${ea(p.codigo)}');return false;" title="${ea(p.descripcion)}">`
        + _thumb(p)
        + `<span class="item-code" style="margin-top:0">${cod}</span>`
        + `<div class="item-info"><div class="item-desc">${desc}</div>${p.observaciones?'<div class="item-meta">'+esc(p.observaciones)+'</div>':''}<div class="item-meta" style="color:var(--verde-oscuro);opacity:.7;font-size:10px">${esc(p.categoria)}</div></div>`
        + `<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px"><span class="item-price">${fmtPesos(p.precio)}</span><button class="item-add-btn" onclick="event.stopPropagation();Quotation.addItem('${ea(p.codigo)}')" title="Agregar">+</button></div>`
        + '</div>';
    }).join('');

    container.innerHTML = html;
  }

  function _highlight(text, terms) {
    let r = text;
    terms.forEach(t => { r = r.replace(new RegExp('('+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),'<mark>$1</mark>'); });
    return r;
  }
  function _buildCatFilter() {
    const cats = [...new Set(_products.map(p => p.categoria))].sort();
    const sel  = document.getElementById('cat-select');
    if (!sel) return;
    sel.innerHTML = '<option value="">– Todas las categorías –</option>';
    cats.forEach(c => { const o=document.createElement('option'); o.value=c; o.textContent=c; sel.appendChild(o); });
  }
  function findByCode(codigo) { return _products.find(p => p.codigo.toLowerCase()===codigo.toLowerCase())||null; }
  function getAll() { return _products; }

  function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function ea(s)  { return String(s || '').replace(/'/g,"\\'"); }

  return { init, filter, renderList, findByCode, getAll, toggleFavorite, addReciente };
})();
