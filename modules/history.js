// history.js – Historial de cotizaciones Faroluz
'use strict';

const History = (() => {
  const STORAGE_KEY = 'fl_historial';
  let _records = [];

  function init() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) _records = JSON.parse(raw);
    } catch(_) { _records = []; }
  }

  function save(record) {
    // record: { numero, cliente, empresa, total, fecha, items, cliente_data, config }
    const idx = _records.findIndex(r => r.numero === record.numero);
    if (idx >= 0) { _records[idx] = record; }
    else          { _records.unshift(record); }
    _records = _records.slice(0, 200); // máximo 200
    _persist();
    toast(`Cotización ${record.numero} guardada`, 'success');
  }

  function remove(numero) {
    _records = _records.filter(r => r.numero !== numero);
    _persist();
    renderModal();
    toast('Cotización eliminada', 'info');
  }

  function getAll() { return [..._records]; }

  function getByNumero(numero) { return _records.find(r => r.numero === numero) || null; }

  function getNextNumber() {
    const now = new Date();
    const min = 150;
    const max = 500;
    const span = max - min + 1;
    const millisDelDia = now.getHours()*3600000 + now.getMinutes()*60000 + now.getSeconds()*1000 + now.getMilliseconds();
    const perf = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const extra = Math.floor(perf * 1000);
    return String(min + ((millisDelDia + extra) % span));
  }

  function _persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_records)); } catch(e) { console.warn('Storage full'); }
  }

  function renderModal() {
    const body = document.getElementById('hist-body');
    if (!body) return;
    if (_records.length === 0) {
      body.innerHTML = '<p style="color:var(--gris-texto);text-align:center;padding:40px">Sin cotizaciones guardadas aún.</p>';
      return;
    }
    body.innerHTML = _records.map(r => `
      <div class="hist-item">
        <span class="hist-num">#${esc(r.numero)}</span>
        <div class="hist-info">
          <div class="hist-cliente">${esc(r.cliente || 'Sin nombre')}</div>
          <div class="hist-meta">
            ${esc(r.fecha || '')}
            ${r.vendedor ? ' · ' + esc(r.vendedor) : ''}
            · ${(r.items || []).length} artículo${(r.items||[]).length!==1?'s':''}
          </div>
        </div>
        <div class="hist-total">${fmtPesos(r.total || 0)}</div>
        <div class="hist-actions">
          <button class="btn-sm" onclick="App.loadFromHistory('${ea(r.numero)}')" title="Cargar esta cotización">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Abrir
          </button>
          <button class="btn-sm" onclick="App.duplicarCotizacion('${ea(r.numero)}')" title="Duplicar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            Duplicar
          </button>
          <button class="btn-sm danger" onclick="History.remove('${ea(r.numero)}')" title="Eliminar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7M10 11v6m4-6v6M4 7h16m-10-4h4"/></svg>
          </button>
        </div>
      </div>`).join('');
  }

  function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function ea(s)  { return String(s || '').replace(/'/g,"\\'"); }

  return { init, save, remove, getAll, getByNumero, getNextNumber, renderModal };
})();
