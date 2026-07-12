// quotation.js – Motor de cotización Faroluz
'use strict';

const Quotation = (() => {
  let _items = [];
  let _manualCounter = 0;
  let _idCounter = 0;          // ID único por fila (independiente del código)

  function _nextId() { return ++_idCounter; }

  function _byId(id) { return _items.find(i => i._id === id); }

  function _getThumb(item) {
    const url = (typeof getImagenURL === 'function') ? getImagenURL(item.codigo, item.categoria) : null;
    const placeholder = '<div class="prod-thumb-code">'+esc(item.codigo)+'</div>';
    if (url) {
      return '<img class="prod-thumb thumb-preview-trigger" src="'+url+'" alt="" loading="lazy" title="Ver foto" onclick="ImagePreview.show(this.src,event)" style="width:44px;height:44px;border-radius:6px;border:1.5px solid var(--gris-borde);object-fit:contain;display:block;background:#fff"'
           + ' onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
           + '<div class="prod-thumb-code" style="display:none">'+esc(item.codigo)+'</div>';
    }
    return placeholder;
  }


  // Siempre agrega una fila nueva (mismo código puede estar varias veces)
  function addItem(codigo) {
    const product = Catalog.findByCode(codigo);
    if (!product) { toast('Artículo no encontrado: '+codigo,'error'); return; }
    _items.push({
      _id: _nextId(),
      codigo: product.codigo,
      descripcion: product.descripcion,
      precio: product.precio,
      qty: 1,
      descItem: 0,
      color: '',
      categoria: product.categoria,
      observaciones: product.observaciones || '',
    });
    toast(product.codigo+' – agregado a la cotización','success');
    Catalog.addReciente(codigo);
    renderTable();
    App.recalcular();
    App.autoguardar();
  }

  function removeItem(id) {
    _items = _items.filter(i => i._id !== id);
    renderTable(); App.recalcular(); App.autoguardar();
  }

  function setQty(id, qty) {
    qty = Math.max(1, parseInt(qty)||1);
    const item = _byId(id);
    if (item) { item.qty = qty; _patchSubtotal(item); App.recalcular(); App.autoguardar(); }
  }
  function incQty(id) {
    const item = _byId(id);
    if (item) { item.qty++; _patchSubtotal(item); App.recalcular(); App.autoguardar(); }
  }
  function decQty(id) {
    const item = _byId(id);
    if (!item) return;
    if (item.qty <= 1) { removeItem(id); return; }
    item.qty--;
    _patchSubtotal(item); App.recalcular(); App.autoguardar();
  }
  function setDescItem(id, pct) {
    const item = _byId(id);
    if (item) { item.descItem = Math.min(100, Math.max(0, parseFloat(pct)||0)); App.recalcular(); App.autoguardar(); }
  }
  function setColor(id, color) {
    const item = _byId(id);
    if (item) { item.color = color; App.autoguardar(); }
  }

  function _patchSubtotal(item) {
    const conIva = document.getElementById('sw-precios-con-iva')?.checked;
    const ivaR   = document.getElementById('sw-iva-reducido')?.checked;
    const ivaPct = ivaR ? 10.5 : 21;
    const base   = conIva ? item.precio/(1+ivaPct/100) : item.precio;
    const sub    = base*(1-(item.descItem||0)/100)*item.qty;
    const row    = document.querySelector('tr[data-id="'+item._id+'"]');
    if (!row) { renderTable(); return; }
    const qEl = row.querySelector('.qty-input');
    if (qEl) qEl.value = item.qty;
    const sEl = row.querySelector('.td-subtotal');
    if (sEl) sEl.textContent = fmtPesos(sub);
  }

  // Agrega un ítem creado manualmente (no existe en el catálogo)
  function addManualItem({ codigo, descripcion, qty, color, precio }) {
    descripcion = (descripcion || '').trim();
    if (!descripcion) { toast('La descripción es obligatoria', 'warning'); return false; }
    qty    = Math.max(1, parseInt(qty) || 1);
    precio = Math.max(0, parseFloat(String(precio).replace(',', '.')) || 0);
    // Generar código: usar el ingresado o auto-generar
    let cod = (codigo || '').trim();
    if (!cod) {
      _manualCounter++;
      cod = 'ESPEC-' + String(_manualCounter).padStart(3, '0');
    }
    _items.push({ _id: _nextId(), codigo: cod, descripcion, precio, qty, descItem: 0, color: color || '', categoria: 'Manual', observaciones: '', manual: true });
    toast(cod + ' – ítem manual agregado', 'success');
    renderTable();
    App.recalcular();
    App.autoguardar();
    return true;
  }

  function clear() { _items = []; renderTable(); App.recalcular(); App.autoguardar(); }

  function renderTable() {
    const tbody   = document.getElementById('cot-tbody');
    const emptyEl = document.getElementById('empty-state');
    const badge   = document.getElementById('items-count');
    if (!tbody) return;
    if (badge) badge.textContent = _items.length;

    if (_items.length === 0) {
      tbody.innerHTML = '';
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }
    if (emptyEl) emptyEl.classList.add('hidden');

    const conIva = document.getElementById('sw-precios-con-iva')?.checked;
    const ivaR   = document.getElementById('sw-iva-reducido')?.checked;
    const ivaPct = ivaR ? 10.5 : 21;

    tbody.innerHTML = _items.map(item => {
      const base     = conIva ? item.precio/(1+ivaPct/100) : item.precio;
      const withDisc = base*(1-(item.descItem||0)/100);
      const sub      = withDisc*item.qty;
      const id       = item._id;
      return `<tr data-id="${id}">
        <td class="td-img-cell">${item.manual ? '<div class="manual-thumb">✏️</div>' : _getThumb(item)}</td>
        <td class="td-code">${item.manual ? '<span class="manual-badge" title="Ítem manual">M</span> ' : ''}${esc(item.codigo)}</td>
        <td class="td-desc">
          <div class="td-desc-text">${esc(item.descripcion)}</div>
          ${item.observaciones?'<div class="td-desc-sub">'+esc(item.observaciones)+'</div>':''}
        </td>
        <td class="td-color-cell">
          <input class="color-input" type="text" value="${esc(item.color||'')}"
            placeholder="Ej: Negro mate / Blanco"
            onchange="Quotation.setColor(${id},this.value)"
            onblur="Quotation.setColor(${id},this.value)">
        </td>
        <td class="text-center">
          <div class="qty-ctrl">
            <button class="qty-btn" onclick="Quotation.decQty(${id})">−</button>
            <input class="qty-input" type="number" value="${item.qty}" min="1"
              onchange="Quotation.setQty(${id},this.value)"
              onblur="Quotation.setQty(${id},this.value)">
            <button class="qty-btn" onclick="Quotation.incQty(${id})">+</button>
          </div>
        </td>
        <td class="td-price">${fmtPesos(base)}</td>
        <td class="text-center">
          <input class="disc-input" type="number" value="${item.descItem||''}" min="0" max="100" step="0.5" placeholder="0"
            onchange="Quotation.setDescItem(${id},this.value)"
            onblur="Quotation.setDescItem(${id},this.value)">
        </td>
        <td class="td-subtotal">${fmtPesos(sub)}</td>
        <td>
          <button class="delete-btn" onclick="Quotation.removeItem(${id})" title="Eliminar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </td>
      </tr>`;
    }).join('');
  }

  function calcTotals(descGlobal, descType, mostrarIva, preciosConIva, ivaReducido) {
    const ivaPct = ivaReducido ? 10.5 : 21;
    let subtotalBruto=0, subtotalConDesc=0;
    _items.forEach(item => {
      const base = preciosConIva ? item.precio/(1+ivaPct/100) : item.precio;
      subtotalBruto   += base*item.qty;
      subtotalConDesc += base*(1-(item.descItem||0)/100)*item.qty;
    });
    let montoDesc = descType==='pct' ? subtotalConDesc*(descGlobal/100) : Math.min(descGlobal, subtotalConDesc);
    const subtotalNeto = subtotalConDesc - montoDesc;
    const ivaAmount    = mostrarIva ? subtotalNeto*(ivaPct/100) : 0;
    const total        = subtotalNeto + ivaAmount;
    return { subtotalBruto, subtotalConDesc, montoDesc, subtotalNeto, ivaAmount, total, ivaPct };
  }

  function getItems()  { return _items.map(i => ({...i})); }
  function isEmpty()   { return _items.length === 0; }
  function loadFromHistory(items) {
    // Al cargar del historial, asignar _id si no tienen
    _items = items.map(i => ({ color:'', ...i, _id: i._id || _nextId() }));
    renderTable(); App.recalcular();
  }

  function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  return { addItem, addManualItem, removeItem, setQty, incQty, decQty, setDescItem, setColor, clear, renderTable, calcTotals, getItems, isEmpty, loadFromHistory };
})();
