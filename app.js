// app.js – Controlador principal Faroluz Cotizaciones
'use strict';

// ── App ─────────────────────────────────────────────────────
const App = (() => {
  let _cotNumero = '0001';
  let _descType  = 'pct'; // 'pct' | 'monto'
  let _autosaveTimer = null;

  // ── Inicialización ─────────────────────────────────────────
  function init() {
    // Cargar historial
    History.init();

    // Número de cotización
    _asignarNumeroCotizacion(History.getNextNumber());

    // Fecha de hoy
    const fechaInput = document.getElementById('cli-fecha');
    if (fechaInput) fechaInput.value = new Date().toISOString().slice(0, 10);

    // Cargar catálogo
    if (typeof PRODUCTOS_LISTA !== 'undefined' && PRODUCTOS_LISTA.length > 0) {
      Catalog.init(PRODUCTOS_LISTA);
    } else {
      document.getElementById('search-count').textContent = 'Sin productos cargados. Cargá una lista de precios.';
    }

    // Restaurar autoguardado
    _restoreAutoguardado();

    // Ocultar loading
    setTimeout(() => {
      const loading = document.getElementById('loading-overlay');
      if (loading) loading.classList.add('hidden');
    }, 1000);

    // Atajos de teclado
    document.addEventListener('keydown', _onKeyDown);

    // Focus en buscador
    setTimeout(() => {
      const inp = document.getElementById('search-input');
      if (inp) inp.focus();
    }, 1100);

    recalcular();
  }

  // ── Búsqueda ───────────────────────────────────────────────
  function onSearch(value) {
    const clearBtn = document.getElementById('search-clear');
    if (clearBtn) clearBtn.classList.toggle('visible', value.length > 0);
    Catalog.renderList(value, document.getElementById('cat-select')?.value, undefined);
  }

  function clearSearch() {
    const inp = document.getElementById('search-input');
    if (inp) { inp.value = ''; inp.focus(); }
    const clearBtn = document.getElementById('search-clear');
    if (clearBtn) clearBtn.classList.remove('visible');
    Catalog.renderList('', document.getElementById('cat-select')?.value, undefined);
  }

  function onCatFilter(value) {
    Catalog.renderList(document.getElementById('search-input')?.value, value, undefined);
  }

  function switchTab(tab, el) {
    document.querySelectorAll('.quick-tab').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');
    Catalog.renderList(document.getElementById('search-input')?.value, document.getElementById('cat-select')?.value, tab);
  }

  // ── Recalcular totales ─────────────────────────────────────
  function recalcular() {
    const descGlobal   = parseFloat(document.getElementById('desc-global-input')?.value) || 0;
    const mostrarIva   = !!document.getElementById('sw-mostrar-iva')?.checked;
    const preciosConIva = !!document.getElementById('sw-precios-con-iva')?.checked;
    const ivaReducido  = !!document.getElementById('sw-iva-reducido')?.checked;

    const t = Quotation.calcTotals(descGlobal, _descType, mostrarIva, preciosConIva, ivaReducido);

    // Actualizar UI
    _setText('t-subtotal-bruto', fmtPesos(t.subtotalBruto));
    _setText('t-subtotal-neto',  fmtPesos(t.subtotalNeto));
    _setText('t-total',          fmtPesos(t.total));
    _setText('t-iva',            fmtPesos(t.ivaAmount));

    const rowDesc = document.getElementById('row-desc');
    const lblDesc = document.getElementById('lbl-desc');
    if (t.montoDesc > 0) {
      if (rowDesc) rowDesc.style.display = '';
      const descLabel = _descType === 'pct' ? `Descuento (${descGlobal}%)` : 'Descuento';
      if (lblDesc) lblDesc.textContent = descLabel;
      _setText('t-descuento', `– ${fmtPesos(t.montoDesc)}`);
    } else {
      if (rowDesc) rowDesc.style.display = 'none';
    }

    const rowIva = document.getElementById('row-iva');
    const lblIva = document.getElementById('lbl-iva');
    if (rowIva) rowIva.style.display = mostrarIva ? '' : 'none';
    if (lblIva) lblIva.textContent = `IVA (${t.ivaPct}%)`;

    const ivaInfo = document.getElementById('t-iva-info');
    if (ivaInfo) {
      ivaInfo.textContent = mostrarIva
        ? `IVA ${t.ivaPct}% incluido: ${fmtPesos(t.ivaAmount)}`
        : 'Precios sin IVA discriminado';
    }

    // Re-render tabla para actualizar precios mostrados
    Quotation.renderTable();
  }

  // ── Tipo de descuento ──────────────────────────────────────
  function setDescType(type) {
    _descType = type;
    document.getElementById('btn-desc-pct').classList.toggle('active', type === 'pct');
    document.getElementById('btn-desc-monto').classList.toggle('active', type === 'monto');
    const inp = document.getElementById('desc-global-input');
    if (inp) inp.value = 0;
    recalcular();
  }

  // ── Datos cliente ──────────────────────────────────────────
  function onClienteChange() {
    autoguardar();
  }

  function _getClienteData() {
    return {
      nombre:   _getVal('cli-nombre'),
      cuit:     _getVal('cli-cuit'),
      tel:      _getVal('cli-tel'),
      email:    _getVal('cli-email'),
      direccion: _getVal('cli-direccion'),
      vendedor: _getVal('cli-vendedor'),
      fecha:    _getVal('cli-fecha'),
      validez:  _getVal('cli-validez') || '15',
      condIva:  _getVal('cli-cond-iva'),
    };
  }

  function _getConfig() {
    return {
      descGlobal:   parseFloat(_getVal('desc-global-input')) || 0,
      descType:     _descType,
      mostrarIva:   !!document.getElementById('sw-mostrar-iva')?.checked,
      preciosConIva: !!document.getElementById('sw-precios-con-iva')?.checked,
      ivaReducido:  !!document.getElementById('sw-iva-reducido')?.checked,
    };
  }

  function _asignarNumeroCotizacion(numero) {
    _cotNumero = numero;
    const display = document.getElementById('cot-num-display');
    if (display) display.textContent = `#${_cotNumero}`;
  }

  // ── Autoguardado ───────────────────────────────────────────
  function autoguardar() {
    clearTimeout(_autosaveTimer);
    _autosaveTimer = setTimeout(_doAutoguardar, 1500);
  }

  function _doAutoguardar() {
    const items = Quotation.getItems();
    if (items.length === 0) return;
    const cfg = _getConfig();
    const t   = Quotation.calcTotals(cfg.descGlobal, cfg.descType, cfg.mostrarIva, cfg.preciosConIva, cfg.ivaReducido);
    const cli = _getClienteData();
    const record = {
      numero:      _cotNumero,
      cliente:     cli.nombre,
      empresa:     cli.nombre,
      vendedor:    cli.vendedor,
      fecha:       cli.fecha,
      total:       t.total,
      items:       items,
      cliente_data: cli,
      config:      cfg,
      condiciones: _getVal('cond-textarea'),
      observaciones: _getVal('obs-textarea'),
    };
    History.save(record);
    const el = document.querySelector('.autosave-indicator span');
    if (el) { el.textContent = 'Guardado ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }); }
  }

  function _restoreAutoguardado() {
    // Buscar si hay un draft sin número de cotización generado
    const numero = History.getNextNumber();
    // Si el número es 0001, no hay nada previo — fresh start
    // Si hay historial, el último se puede cargar
    // Por diseño: no auto-restaurar, solo mostrar alerta si había sesión
    const all = History.getAll();
    if (all.length > 0) {
      const last = all[0];
      if (last.items && last.items.length > 0) {
        // Mostrar badge de "continuar"
        setTimeout(() => {
          toast(`Sesión anterior disponible: cotización #${last.numero}. Abrí el historial para recuperarla.`, 'info');
        }, 1500);
      }
    }
  }

  // ── Nueva cotización ───────────────────────────────────────
  function nuevaCotizacion() {
    if (!Quotation.isEmpty()) {
      if (!confirm('¿Iniciar una nueva cotización? La actual se guardará en el historial.')) return;
      _doAutoguardar();
    }
    _asignarNumeroCotizacion(History.getNextNumber());
    Quotation.clear();
    // Limpiar cliente
    ['cli-nombre','cli-cuit','cli-tel','cli-email','cli-direccion','cli-vendedor'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('cli-fecha').value = new Date().toISOString().slice(0, 10);
    document.getElementById('cli-validez').value = '15';
    document.getElementById('obs-textarea').value = '';
    document.getElementById('desc-global-input').value = 0;
    recalcular();
    toast('Nueva cotización iniciada', 'success');
  }

  // ── Limpiar ────────────────────────────────────────────────
  function limpiarCotizacion() {
    if (Quotation.isEmpty()) return;
    if (!confirm('¿Vaciar todos los artículos de la cotización?')) return;
    Quotation.clear();
    recalcular();
  }

  // ── Generar cotización (guardar + PDF) ─────────────────────
  function generarCotizacion() {
    if (Quotation.isEmpty()) { toast('Agregá artículos antes de generar la cotización', 'warning'); return; }
    exportarPDF();
  }

  // ── Ítem manual ────────────────────────────────────────────
  function showItemManualModal() {
    // Limpiar campos antes de abrir
    ['manual-codigo', 'manual-desc', 'manual-color'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const qEl = document.getElementById('manual-qty');
    if (qEl) qEl.value = '1';
    const pEl = document.getElementById('manual-precio');
    if (pEl) pEl.value = '';
    openModal('modal-item-manual');
    setTimeout(() => document.getElementById('manual-desc')?.focus(), 80);
  }

  function agregarItemManual() {
    const ok = Quotation.addManualItem({
      codigo:      document.getElementById('manual-codigo')?.value,
      descripcion: document.getElementById('manual-desc')?.value,
      qty:         document.getElementById('manual-qty')?.value,
      color:       document.getElementById('manual-color')?.value,
      precio:      document.getElementById('manual-precio')?.value,
    });
    if (ok) closeModal('modal-item-manual');
  }

  // ── Exportar PDF ───────────────────────────────────────────
  // Carga imágenes como base64 para incrustar en el PDF.
  // Intenta directo (CORS permitido) y si falla usa proxy público.
  async function _precargarImagenesPDF(items) {
    const cache = {};
    const PROXY = 'https://corsproxy.io/?url=';

    // Convierte una URL a base64 via fetch
    const _fetchB64 = (url) =>
      fetch(url, { mode: 'cors' })
        .then(r => { if (!r.ok) throw new Error('http'); return r.blob(); })
        .then(blob => new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload  = () => res(reader.result);
          reader.onerror = () => rej();
          reader.readAsDataURL(blob);
        }));

    const promises = items.map(async (item) => {
      const url = (typeof getImagenURL === 'function') ? getImagenURL(item.codigo) : null;
      if (!url) return;
      try {
        // 1.° intento: URL directa (funciona si el servidor permite CORS)
        cache[item.codigo] = await _fetchB64(url);
      } catch (_) {
        try {
          // 2.° intento: vía proxy CORS público
          cache[item.codigo] = await _fetchB64(PROXY + encodeURIComponent(url));
        } catch (_2) { /* imagen no disponible */ }
      }
    });

    await Promise.all(promises);
    return cache;
  }

  async function exportarPDF() {
    if (Quotation.isEmpty()) { toast('La cotización está vacía', 'warning'); return; }
    _asignarNumeroCotizacion(History.getNextNumber());
    _doAutoguardar();
    toast('Preparando PDF con imágenes… (puede tardar unos segundos)', 'info');
    const cfg   = _getConfig();
    const t     = Quotation.calcTotals(cfg.descGlobal, cfg.descType, cfg.mostrarIva, cfg.preciosConIva, cfg.ivaReducido);
    const items = Quotation.getItems();
    const imageCache = await _precargarImagenesPDF(items);
    PDFGenerator.generate({
      numero:       _cotNumero,
      cliente:      _getClienteData(),
      items,
      totals:       t,
      descGlobal:   cfg.descGlobal,
      descType:     cfg.descType,
      mostrarIva:   cfg.mostrarIva,
      preciosConIva: cfg.preciosConIva,
      ivaReducido:  cfg.ivaReducido,
      observaciones: _getVal('obs-textarea'),
      condiciones:  _getVal('cond-textarea'),
      imageCache,
    });
  }

  // ── Exportar Excel ─────────────────────────────────────────
  function exportarExcel() {
    if (Quotation.isEmpty()) { toast('La cotización está vacía', 'warning'); return; }
    const cfg = _getConfig();
    const t   = Quotation.calcTotals(cfg.descGlobal, cfg.descType, cfg.mostrarIva, cfg.preciosConIva, cfg.ivaReducido);
    ExcelGenerator.generate({
      numero:       _cotNumero,
      cliente:      _getClienteData(),
      items:        Quotation.getItems(),
      totals:       t,
      descGlobal:   cfg.descGlobal,
      descType:     cfg.descType,
      mostrarIva:   cfg.mostrarIva,
      preciosConIva: cfg.preciosConIva,
      ivaReducido:  cfg.ivaReducido,
      observaciones: _getVal('obs-textarea'),
      condiciones:  _getVal('cond-textarea'),
    });
  }

  // ── Historial ──────────────────────────────────────────────
  function showHistorial() {
    History.renderModal();
    openModal('modal-historial');
  }

  function loadFromHistory(numero) {
    const record = History.getByNumero(numero);
    if (!record) { toast('Cotización no encontrada', 'error'); return; }
    closeModal('modal-historial');

    _cotNumero = record.numero;
    document.getElementById('cot-num-display').textContent = `#${_cotNumero}`;

    // Restaurar cliente
    if (record.cliente_data) {
      const cli = record.cliente_data;
      _setVal('cli-nombre', cli.nombre);
      _setVal('cli-cuit', cli.cuit);
      _setVal('cli-tel', cli.tel);
      _setVal('cli-email', cli.email);
      _setVal('cli-direccion', cli.direccion);
      _setVal('cli-vendedor', cli.vendedor);
      _setVal('cli-fecha', cli.fecha);
      _setVal('cli-validez', cli.validez);
      _setVal('cli-cond-iva', cli.condIva);
    }

    // Restaurar config
    if (record.config) {
      const cfg = record.config;
      _setVal('desc-global-input', cfg.descGlobal);
      _setChecked('sw-mostrar-iva', cfg.mostrarIva);
      _setChecked('sw-precios-con-iva', cfg.preciosConIva);
      _setChecked('sw-iva-reducido', cfg.ivaReducido);
      _descType = cfg.descType || 'pct';
      setDescType(_descType);
    }

    // Restaurar observaciones / condiciones
    _setVal('obs-textarea', record.observaciones);
    _setVal('cond-textarea', record.condiciones);

    // Restaurar items
    Quotation.loadFromHistory(record.items || []);
    recalcular();
    toast(`Cotización #${numero} cargada`, 'success');
  }

  function duplicarCotizacion(numero) {
    loadFromHistory(numero);
    closeModal('modal-historial');
    // Asignar nuevo número
    const newNum = History.getNextNumber();
    _asignarNumeroCotizacion(newNum);
    toast(`Cotización duplicada como #${newNum}`, 'success');
  }

  // ── Cargar Excel ───────────────────────────────────────────
  function showCargarExcel() { openModal('modal-excel'); }

  function onFileDrop(event) {
    event.preventDefault();
    document.getElementById('drop-zone').classList.remove('drag-over');
    const file = event.dataTransfer.files[0];
    if (file) _processExcelFile(file);
  }

  function onFileSelect(event) {
    const file = event.target.files[0];
    if (file) _processExcelFile(file);
  }

  function _processExcelFile(file) {
    const status = document.getElementById('excel-status');
    if (status) status.textContent = 'Procesando archivo…';

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const products = _parseExcel(wb);
        if (products.length === 0) {
          if (status) status.textContent = '⚠ No se encontraron productos válidos en el archivo.';
          return;
        }
        Catalog.init(products);
        if (status) status.textContent = `✓ ${products.length} artículos cargados correctamente.`;
        setTimeout(() => closeModal('modal-excel'), 1500);
        toast(`Lista cargada: ${products.length} artículos`, 'success');
      } catch(err) {
        if (status) status.textContent = `✕ Error al procesar: ${err.message}`;
        toast('Error al procesar el archivo Excel', 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function _parseExcel(wb) {
    const products = [];
    const seen = new Set();

    wb.SheetNames.forEach(sheetName => {
      if (sheetName === 'Hoja1' || sheetName === 'COLORES') return;
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

      let currentCat = sheetName.replace(/_/g, ' ');

      rows.forEach((row, i) => {
        if (!row || row.length < 2) return;
        const nonNull = row.filter(v => v !== null && v !== '');

        // Detectar categoría
        if (nonNull.length === 1 && typeof nonNull[0] === 'string' && nonNull[0].length > 3) {
          const t = String(nonNull[0]).trim();
          if (!t.startsWith('Lista') && !['Artículo','Articulo','Foto','Descripción'].includes(t)) {
            currentCat = t;
            return;
          }
        }

        // Detectar producto: primer campo es código (contiene letras o /)
        const col0 = String(row[0] || '').trim();
        if (!col0 || col0.length < 2) return;
        if (['Artículo','Articulo','Foto','Descripción'].includes(col0)) return;

        let codigo = col0;
        let precio = null;
        let descripcion = '';

        // Intentar diferentes layouts
        for (let c = 1; c < row.length; c++) {
          if (typeof row[c] === 'number' && row[c] > 0 && !precio) {
            precio = Math.round(row[c] * 100) / 100;
          } else if (typeof row[c] === 'string' && row[c].trim().length > 3 && !descripcion) {
            descripcion = row[c].trim();
          }
        }

        if (codigo && precio && precio > 0 && descripcion && !seen.has(codigo)) {
          seen.add(codigo);
          products.push({ codigo, descripcion, precio, categoria: currentCat, observaciones: '' });
        }
      });
    });

    return products;
  }

  // ── Modales ────────────────────────────────────────────────
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
  }
  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }

  // ── Teclado ────────────────────────────────────────────────
  function _onKeyDown(e) {
    // Escape cierra modales
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
    // Ctrl+F = focus buscador
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      const inp = document.getElementById('search-input');
      if (inp) { inp.focus(); inp.select(); }
    }
    // Ctrl+Enter = generar cotización
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generarCotizacion();
    }
    // Ctrl+P = PDF
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      exportarPDF();
    }
    // Ctrl+E = Excel
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      exportarExcel();
    }
  }

  // ── Helpers ────────────────────────────────────────────────
  function _setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  function _getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }
  function _setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val ?? '';
  }
  function _setChecked(id, val) {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
  }

  return {
    init, onSearch, clearSearch, onCatFilter, switchTab,
    recalcular, setDescType, onClienteChange, autoguardar,
    nuevaCotizacion, limpiarCotizacion,
    generarCotizacion, exportarPDF, exportarExcel,
    showItemManualModal, agregarItemManual,
    showHistorial, loadFromHistory, duplicarCotizacion,
    showCargarExcel, onFileDrop, onFileSelect,
    openModal, closeModal,
  };
})();

// ── Arranque ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
