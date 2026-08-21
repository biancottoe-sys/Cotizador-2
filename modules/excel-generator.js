// excel-generator.js – Generación de Excel profesional Faroluz (ExcelJS)
'use strict';

const ExcelGenerator = (() => {

  // ── Paleta corporativa (ARGB) ────────────────────────────────
  const C = {
    NEGRO:       'FF0F1410',
    VERDE_OSC:   'FF1A5C38',
    VERDE_MED:   'FF2D8C5E',
    VERDE_SUAVE: 'FFE8F5EE',
    VERDE_TEXT:  'FF64B48C',   // texto suave sobre fondo oscuro
    BLANCO:      'FFFFFFFF',
    GRIS_CLARO:  'FFF4F6F4',
    GRIS_ALT:    'FFF8FBF9',
    GRIS_BORDE:  'FFD4DBD6',
    GRIS_TEXT:   'FF3C5046',
    GRIS_MED:    'FF8CA898',
    ROJO_DESC:   'FFC85028',
    AMBER_BG:    'FFFEF3C7',
    AMBER_BORDE: 'FFF0B429',
    AMBER_TEXT:  'FFA06400',
  };

  // ── Helpers ──────────────────────────────────────────────────
  function _fill(argb) {
    return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
  }

  function _font(size, bold, argb, italic) {
    return { name: 'Calibri', size, bold: !!bold, italic: !!italic, color: { argb: argb || C.NEGRO } };
  }

  function _align(h, v, wrap) {
    return { horizontal: h || 'left', vertical: v || 'middle', wrapText: !!wrap };
  }

  function _thinBorder(argb) {
    const b = { style: 'thin', color: { argb: argb || C.GRIS_BORDE } };
    return { top: b, bottom: b, left: b, right: b };
  }

  function _hairBorderBottom(argb) {
    return { bottom: { style: 'hair', color: { argb: argb || C.GRIS_BORDE } } };
  }

  function _applyToRange(ws, r1, c1, r2, c2, fn) {
    for (let row = r1; row <= r2; row++) {
      for (let col = c1; col <= c2; col++) {
        fn(ws.getCell(row, col), row, col);
      }
    }
  }

  // Rellena una fila completa (1..NCOLS) con un color de fondo
  function _fillRow(ws, r, argb, ncols) {
    for (let c = 1; c <= ncols; c++) {
      ws.getCell(r, c).fill = _fill(argb);
    }
  }

  // ── Generador principal (async) ──────────────────────────────
  async function _doGenerate(data) {
    if (!window.ExcelJS) { toast('Librería ExcelJS no disponible', 'error'); return; }

    const wb = new ExcelJS.Workbook();
    wb.creator  = 'Faroluz Sistema de Cotizaciones';
    wb.modified = new Date();

    const ws = wb.addWorksheet('Cotización', {
      pageSetup: {
        paperSize:    9,    // A4
        orientation: 'portrait',
        fitToPage:    true,
        fitToWidth:   1,
        margins: { left: 0.5, right: 0.5, top: 0.7, bottom: 0.7, header: 0.3, footer: 0.3 },
      },
      views: [{ showGridLines: false }],
    });

    const NCOLS   = 8;
    const ivaPct  = data.ivaReducido ? 10.5 : 21;
    const t       = data.totals;
    const cli     = data.cliente;
    let   r       = 1;

    // Anchos de columna (en caracteres aprox.)
    ws.columns = [
      { width: 5   },  // A  N°
      { width: 14  },  // B  Código
      { width: 42  },  // C  Descripción
      { width: 22  },  // D  Color / Terminación
      { width: 9   },  // E  Cant.
      { width: 20  },  // F  Precio Unit.
      { width: 11  },  // G  Dto. %
      { width: 20  },  // H  Subtotal
    ];

    // ── HEADER EMPRESA ──────────────────────────────────────────
    // Fila 1 – Marca + N° Cotización
    ws.getRow(r).height = 34;
    // Lado izquierdo: FAROLUZ (A1:E1)
    ws.mergeCells(r, 1, r, 5);
    const brandCell    = ws.getCell(r, 1);
    brandCell.value    = 'FAROLUZ';
    brandCell.fill     = _fill(C.NEGRO);
    brandCell.font     = _font(22, true, C.BLANCO);
    brandCell.alignment = _align('left', 'middle');
    brandCell.border   = { left: { style: 'medium', color: { argb: C.VERDE_OSC } } };
    // Relleno negro en celdas E-H de fila 1 antes de mergear el lado derecho
    // Lado derecho: COTIZACIÓN (F1:H1)
    ws.mergeCells(r, 6, r, NCOLS);
    const cotHdrCell    = ws.getCell(r, 6);
    cotHdrCell.value    = 'COTIZACIÓN';
    cotHdrCell.fill     = _fill(C.VERDE_OSC);
    cotHdrCell.font     = _font(8, true, C.BLANCO);
    cotHdrCell.alignment = _align('center', 'bottom');
    r++;

    // Fila 2 – Subtítulo + Número cotización
    ws.getRow(r).height = 20;
    ws.mergeCells(r, 1, r, 5);
    const subCell    = ws.getCell(r, 1);
    subCell.value    = 'ILUMINACIÓN INDUSTRIAL Y DECORATIVA';
    subCell.fill     = _fill(C.NEGRO);
    subCell.font     = _font(8, false, C.VERDE_TEXT);
    subCell.alignment = _align('left', 'middle');
    subCell.border   = { left: { style: 'medium', color: { argb: C.VERDE_OSC } } };

    ws.mergeCells(r, 6, r, NCOLS);
    const cotNumCell    = ws.getCell(r, 6);
    cotNumCell.value    = '#' + data.numero;
    cotNumCell.fill     = _fill(C.VERDE_OSC);
    cotNumCell.font     = _font(18, true, C.BLANCO);
    cotNumCell.alignment = _align('center', 'middle');
    r++;

    // Fila 3 – Website + Lista
    ws.getRow(r).height = 15;
    ws.mergeCells(r, 1, r, 5);
    const webCell    = ws.getCell(r, 1);
    webCell.value    = 'www.faroluz.com.ar  ·  Buenos Aires, Argentina';
    webCell.fill     = _fill(C.NEGRO);
    webCell.font     = _font(7.5, false, C.GRIS_CLARO);
    webCell.alignment = _align('left', 'middle');
    webCell.border   = { left: { style: 'medium', color: { argb: C.VERDE_OSC } } };

    ws.mergeCells(r, 6, r, NCOLS);
    const listaCell    = ws.getCell(r, 6);
    listaCell.value    = 'Lista N.º 183 – Agosto 2026';
    listaCell.fill     = _fill(C.VERDE_OSC);
    listaCell.font     = _font(7.5, false, 'FFCCE8D8');
    listaCell.alignment = _align('center', 'middle');
    r++;

    // Fila 4 – separador visual (negro completo)
    ws.getRow(r).height = 5;
    _fillRow(ws, r, C.NEGRO, NCOLS);
    ws.mergeCells(r, 1, r, NCOLS);
    r++;

    // ── BLOQUE INFO ─────────────────────────────────────────────
    // Cabeceras de los dos paneles
    ws.getRow(r).height = 16;
    ws.mergeCells(r, 1, r, 4);
    const iHdrL    = ws.getCell(r, 1);
    iHdrL.value    = 'INFORMACIÓN DE LA COTIZACIÓN';
    iHdrL.fill     = _fill(C.VERDE_OSC);
    iHdrL.font     = _font(7, true, C.BLANCO);
    iHdrL.alignment = _align('center', 'middle');

    ws.mergeCells(r, 5, r, NCOLS);
    const iHdrR    = ws.getCell(r, 5);
    iHdrR.value    = 'DATOS DEL CLIENTE';
    iHdrR.fill     = _fill(C.VERDE_OSC);
    iHdrR.font     = _font(7, true, C.BLANCO);
    iHdrR.alignment = _align('center', 'middle');
    r++;

    // Filas de info (izquierda = cotización, derecha = cliente)
    const infoLeft = [
      ['Fecha:',        cli.fecha || new Date().toLocaleDateString('es-AR')],
      ['Validez:',      (cli.validez || 15) + ' días'],
      ['Vendedor:',     cli.vendedor  || '—'],
      ['Cond. IVA:',    (cli.condIva || '').replace('_', ' ') || '—'],
    ];
    const infoRight = [
      ['Cliente:',      cli.nombre    || '—'],
      ['CUIT:',         cli.cuit      || '—'],
      ['Email:',        cli.email     || '—'],
      ['Teléfono:',     cli.tel       || '—'],
    ];

    // Nombre del cliente va destacado encima del panel derecho
    ws.getRow(r).height = 22;
    const nameLbl    = ws.getCell(r, 1);
    nameLbl.value    = infoLeft[0][0];
    nameLbl.fill     = _fill(C.GRIS_CLARO);
    nameLbl.font     = _font(8, true, C.VERDE_OSC);
    nameLbl.alignment = _align('left', 'middle');

    ws.mergeCells(r, 2, r, 4);
    const nameVal    = ws.getCell(r, 2);
    nameVal.value    = infoLeft[0][1];
    nameVal.fill     = _fill(C.GRIS_CLARO);
    nameVal.font     = _font(9, false, C.NEGRO);
    nameVal.alignment = _align('left', 'middle');
    nameVal.border   = _hairBorderBottom();

    // Nombre cliente (destacado)
    ws.mergeCells(r, 5, r, NCOLS);
    const cliNameCell    = ws.getCell(r, 5);
    cliNameCell.value    = cli.nombre || '—';
    cliNameCell.fill     = _fill(C.GRIS_CLARO);
    cliNameCell.font     = _font(12, true, C.VERDE_OSC);
    cliNameCell.alignment = _align('left', 'middle');
    cliNameCell.border   = _hairBorderBottom();
    r++;

    // Resto de filas info
    for (let i = 1; i < 4; i++) {
      ws.getRow(r).height = 18;

      const lLbl    = ws.getCell(r, 1);
      lLbl.value    = infoLeft[i][0];
      lLbl.fill     = _fill(C.GRIS_CLARO);
      lLbl.font     = _font(8, true, C.VERDE_OSC);
      lLbl.alignment = _align('left', 'middle');

      ws.mergeCells(r, 2, r, 4);
      const lVal    = ws.getCell(r, 2);
      lVal.value    = infoLeft[i][1];
      lVal.fill     = _fill(C.GRIS_CLARO);
      lVal.font     = _font(8.5, false, C.NEGRO);
      lVal.alignment = _align('left', 'middle');
      lVal.border   = _hairBorderBottom();

      const rLbl    = ws.getCell(r, 5);
      rLbl.value    = infoRight[i][0];
      rLbl.fill     = _fill(C.GRIS_CLARO);
      rLbl.font     = _font(8, true, C.VERDE_OSC);
      rLbl.alignment = _align('left', 'middle');

      ws.mergeCells(r, 6, r, NCOLS);
      const rVal    = ws.getCell(r, 6);
      rVal.value    = infoRight[i][1];
      rVal.fill     = _fill(C.GRIS_CLARO);
      rVal.font     = _font(8.5, false, C.NEGRO);
      rVal.alignment = _align('left', 'middle');
      rVal.border   = _hairBorderBottom();
      r++;
    }

    // Direccion (fila extra si existe)
    if (cli.direccion) {
      ws.getRow(r).height = 17;
      const dLbl    = ws.getCell(r, 1);
      dLbl.value    = 'Dirección:';
      dLbl.fill     = _fill(C.GRIS_CLARO);
      dLbl.font     = _font(8, true, C.VERDE_OSC);
      dLbl.alignment = _align('left', 'middle');

      ws.mergeCells(r, 2, r, 4);
      const dVal    = ws.getCell(r, 2);
      dVal.value    = '';
      dVal.fill     = _fill(C.GRIS_CLARO);

      ws.mergeCells(r, 5, r, NCOLS);
      const dirCell    = ws.getCell(r, 5);
      dirCell.value    = cli.direccion;
      dirCell.fill     = _fill(C.GRIS_CLARO);
      dirCell.font     = _font(8.5, false, C.NEGRO);
      dirCell.alignment = _align('left', 'middle');
      dirCell.border   = _hairBorderBottom();
      r++;
    }

    // Separador
    ws.getRow(r).height = 8;
    r++;

    // ── TABLA DE ARTÍCULOS ──────────────────────────────────────
    // Encabezado de tabla
    ws.getRow(r).height = 22;
    const colHeaders = ['N°', 'Código', 'Descripción', 'Color / Terminación', 'Cant.', 'Precio Unit.', 'Dto. %', 'Subtotal'];
    const colAligns  = ['center', 'left', 'left', 'left', 'center', 'right', 'center', 'right'];
    colHeaders.forEach((h, ci) => {
      const cell    = ws.getCell(r, ci + 1);
      cell.value    = h;
      cell.fill     = _fill(C.NEGRO);
      cell.font     = _font(8, true, C.BLANCO);
      cell.alignment = _align(colAligns[ci], 'middle');
    });
    r++;

    // Ítems
    data.items.forEach((item, idx) => {
      const base     = data.preciosConIva ? item.precio / (1 + ivaPct / 100) : item.precio;
      const conDesc  = base * (1 - (item.descItem || 0) / 100);
      const sub      = conDesc * item.qty;
      const isAlt    = idx % 2 === 1;
      const rowBg    = isAlt ? C.GRIS_ALT : C.BLANCO;
      const hasObs   = !!item.observaciones;

      ws.getRow(r).height = hasObs ? 28 : 20;

      // N°
      const nCell    = ws.getCell(r, 1);
      nCell.value    = idx + 1;
      nCell.fill     = _fill(rowBg);
      nCell.font     = _font(7.5, false, C.GRIS_MED);
      nCell.alignment = _align('center', 'middle');
      nCell.border   = _hairBorderBottom();

      // Código
      const codeCell    = ws.getCell(r, 2);
      codeCell.value    = (item.manual ? '✏ ' : '') + item.codigo;
      codeCell.fill     = _fill(rowBg);
      codeCell.font     = _font(8, true, item.manual ? C.VERDE_MED : C.VERDE_OSC);
      codeCell.alignment = _align('left', 'middle');
      codeCell.border   = _hairBorderBottom();

      // Descripción (con observaciones en la misma celda)
      const descCell    = ws.getCell(r, 3);
      descCell.value    = item.descripcion + (hasObs ? '\n' + item.observaciones : '');
      descCell.fill     = _fill(rowBg);
      descCell.font     = _font(8, false, C.NEGRO);
      descCell.alignment = _align('left', 'middle', hasObs);
      descCell.border   = _hairBorderBottom();

      // Color / Terminación
      const colorCell    = ws.getCell(r, 4);
      const hasColor     = !!(item.color && item.color.trim());
      colorCell.value    = item.color || '—';
      colorCell.fill     = _fill(hasColor ? C.VERDE_SUAVE : rowBg);
      colorCell.font     = hasColor ? _font(8, true, C.VERDE_OSC) : _font(8, false, C.GRIS_BORDE);
      colorCell.alignment = _align('left', 'middle');
      colorCell.border   = _hairBorderBottom();

      // Cantidad
      const qtyCell    = ws.getCell(r, 5);
      qtyCell.value    = item.qty;
      qtyCell.fill     = _fill(rowBg);
      qtyCell.font     = _font(8, true, C.NEGRO);
      qtyCell.alignment = _align('center', 'middle');
      qtyCell.border   = _hairBorderBottom();

      // Precio unitario
      const priceCell    = ws.getCell(r, 6);
      priceCell.value    = base;
      priceCell.fill     = _fill(rowBg);
      priceCell.font     = _font(8, false, C.NEGRO);
      priceCell.alignment = _align('right', 'middle');
      priceCell.numFmt   = '"$ "#,##0.00';
      priceCell.border   = _hairBorderBottom();

      // Descuento %
      const discCell    = ws.getCell(r, 7);
      const hasDsc      = !!(item.descItem);
      discCell.value    = hasDsc ? item.descItem : null;
      discCell.fill     = _fill(rowBg);
      discCell.font     = hasDsc ? _font(8, false, C.ROJO_DESC) : _font(8, false, C.GRIS_BORDE);
      discCell.alignment = _align('center', 'middle');
      if (hasDsc) discCell.numFmt = '0.##"%"';
      else discCell.value = '—';
      discCell.border   = _hairBorderBottom();

      // Subtotal
      const subCell    = ws.getCell(r, 8);
      subCell.value    = sub;
      subCell.fill     = _fill(rowBg);
      subCell.font     = _font(8, true, C.NEGRO);
      subCell.alignment = _align('right', 'middle');
      subCell.numFmt   = '"$ "#,##0.00';
      subCell.border   = _hairBorderBottom();

      r++;
    });

    // Línea de cierre de tabla
    for (let c = 1; c <= NCOLS; c++) {
      ws.getCell(r - 1, c).border = {
        ...ws.getCell(r - 1, c).border,
        bottom: { style: 'thin', color: { argb: C.VERDE_OSC } },
      };
    }

    // Separador
    ws.getRow(r).height = 10;
    r++;

    // ── TOTALES ─────────────────────────────────────────────────
    // Función helper para filas de total
    const addTotalRow = (lbl, val, opts = {}) => {
      ws.getRow(r).height = opts.isFinal ? 26 : 18;

      if (opts.obs) {
        // Observaciones en el lado izquierdo de la fila de total
      } else {
        // Columnas A-F vacías (o con observaciones)
        ws.mergeCells(r, 1, r, 6);
        ws.getCell(r, 1).fill = _fill(C.BLANCO);
      }

      const lblCell    = ws.getCell(r, 7);
      const valCell    = ws.getCell(r, 8);
      lblCell.value    = lbl;
      valCell.value    = typeof val === 'number' ? val : null;
      valCell.numFmt   = '"$ "#,##0.00';

      if (opts.isFinal) {
        lblCell.fill     = _fill(C.NEGRO);
        valCell.fill     = _fill(C.NEGRO);
        lblCell.font     = _font(9, true, 'FFB4D2BE');
        valCell.font     = _font(13, true, C.BLANCO);
        lblCell.alignment = _align('left', 'middle');
        valCell.alignment = _align('right', 'middle');
      } else {
        lblCell.fill     = _fill(C.GRIS_CLARO);
        valCell.fill     = _fill(C.GRIS_CLARO);
        if (opts.bold) {
          lblCell.font   = _font(9, true, C.VERDE_OSC);
          valCell.font   = _font(9, true, C.VERDE_OSC);
        } else if (opts.isDesc) {
          lblCell.font   = _font(8.5, false, C.ROJO_DESC);
          valCell.font   = _font(8.5, false, C.ROJO_DESC);
        } else {
          lblCell.font   = _font(8.5, false, C.GRIS_TEXT);
          valCell.font   = _font(8.5, false, C.NEGRO);
        }
        lblCell.alignment  = _align('left', 'middle');
        valCell.alignment  = _align('right', 'middle');
        lblCell.border     = _hairBorderBottom();
        valCell.border     = {
          ..._hairBorderBottom(),
          right: { style: 'thin', color: { argb: C.GRIS_BORDE } },
        };
      }
      r++;
    };

    addTotalRow('Subtotal bruto:',  t.subtotalBruto);
    if (t.montoDesc > 0) {
      const lbl = data.descType === 'pct'
        ? `Descuento (${data.descGlobal}%):`
        : 'Descuento:';
      addTotalRow(lbl, -t.montoDesc, { isDesc: true });
    }
    addTotalRow('Subtotal neto:',   t.subtotalNeto, { bold: true });
    if (data.mostrarIva) {
      addTotalRow(`IVA (${t.ivaPct}%):`, t.ivaAmount);
    }
    addTotalRow('TOTAL FINAL', t.total, { isFinal: true });

    // ── OBSERVACIONES ────────────────────────────────────────────
    if (data.observaciones) {
      r++;
      ws.getRow(r).height = 16;
      ws.mergeCells(r, 1, r, NCOLS);
      const obsHdr    = ws.getCell(r, 1);
      obsHdr.value    = 'OBSERVACIONES';
      obsHdr.fill     = _fill(C.AMBER_BG);
      obsHdr.font     = _font(7, true, C.AMBER_TEXT);
      obsHdr.alignment = _align('left', 'middle');
      r++;

      ws.getRow(r).height = 40;
      ws.mergeCells(r, 1, r, NCOLS);
      const obsCell    = ws.getCell(r, 1);
      obsCell.value    = data.observaciones;
      obsCell.fill     = _fill(C.AMBER_BG);
      obsCell.font     = _font(8.5, false, C.NEGRO);
      obsCell.alignment = _align('left', 'middle', true);
      r++;
    }

    // ── CONDICIONES COMERCIALES ──────────────────────────────────
    if (data.condiciones) {
      r++;
      ws.getRow(r).height = 16;
      ws.mergeCells(r, 1, r, NCOLS);
      const condHdr    = ws.getCell(r, 1);
      condHdr.value    = 'CONDICIONES COMERCIALES';
      condHdr.fill     = _fill(C.GRIS_CLARO);
      condHdr.font     = _font(7, true, C.VERDE_OSC);
      condHdr.alignment = _align('left', 'middle');
      r++;

      ws.getRow(r).height = 50;
      ws.mergeCells(r, 1, r, NCOLS);
      const condCell    = ws.getCell(r, 1);
      condCell.value    = data.condiciones;
      condCell.fill     = _fill(C.GRIS_CLARO);
      condCell.font     = _font(8, false, C.NEGRO);
      condCell.alignment = _align('left', 'top', true);
      r++;
    }

    // ── FOOTER ───────────────────────────────────────────────────
    r++;
    ws.getRow(r).height = 14;
    ws.mergeCells(r, 1, r, NCOLS);
    const footCell    = ws.getCell(r, 1);
    footCell.value    = 'FAROLUZ  ·  www.faroluz.com.ar  ·  Iluminación Industrial y Decorativa  ·  Buenos Aires, Argentina';
    footCell.fill     = _fill(C.NEGRO);
    footCell.font     = _font(7, false, C.GRIS_MED);
    footCell.alignment = _align('center', 'middle');

    // ── SEGUNDA HOJA – RESUMEN ───────────────────────────────────
    const wsRes = wb.addWorksheet('Resumen', { views: [{ showGridLines: false }] });
    wsRes.columns = [{ width: 22 }, { width: 35 }];

    const addResRow = (lbl, val, bold, bgArgb) => {
      const row = wsRes.addRow([lbl, val]);
      row.height = 20;
      [1, 2].forEach(c => {
        const cell    = row.getCell(c);
        cell.fill     = _fill(bgArgb || C.BLANCO);
        cell.font     = _font(9, !!bold, bold === 'inv' ? C.BLANCO : C.NEGRO);
        cell.alignment = c === 2 ? _align('right', 'middle') : _align('left', 'middle');
        if (c === 2 && typeof val === 'number') cell.numFmt = '"$ "#,##0.00';
      });
    };

    wsRes.addRow([]);
    // Título
    const resTitle = wsRes.addRow(['RESUMEN DE COTIZACIÓN', '']);
    resTitle.height = 26;
    resTitle.getCell(1).fill     = _fill(C.NEGRO);
    resTitle.getCell(2).fill     = _fill(C.NEGRO);
    resTitle.getCell(1).font     = _font(13, true, C.BLANCO);
    resTitle.getCell(1).alignment = _align('left', 'middle');
    wsRes.mergeCells(resTitle.number, 1, resTitle.number, 2);

    wsRes.addRow([]).height = 6;
    addResRow('Número de cotización',  '#' + data.numero,  false, C.GRIS_CLARO);
    addResRow('Cliente',               cli.nombre || '—',  false, C.GRIS_CLARO);
    addResRow('Fecha',                 cli.fecha  || '—',  false, C.GRIS_CLARO);
    addResRow('Vendedor',              cli.vendedor || '—', false, C.GRIS_CLARO);
    addResRow('Cantidad de artículos', data.items.length,  false, C.GRIS_CLARO);
    wsRes.addRow([]).height = 6;
    addResRow('Subtotal neto',         t.subtotalNeto,     false, C.GRIS_CLARO);
    if (data.mostrarIva) addResRow('IVA (' + t.ivaPct + '%)', t.ivaAmount, false, C.GRIS_CLARO);
    addResRow('TOTAL FINAL',           t.total,            'inv',  C.NEGRO);

    // ── DESCARGA ─────────────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer();
    const blob   = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = 'Faroluz_Cotizacion_' + data.numero + '_' + (cli.nombre || 'cliente').replace(/\s+/g, '_') + '.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Excel generado correctamente', 'success');
  }

  function generate(data) {
    if (Quotation && Quotation.isEmpty && Quotation.isEmpty()) {
      toast('La cotización está vacía', 'warning');
      return;
    }
    _doGenerate(data).catch(err => {
      console.error('ExcelGenerator error:', err);
      toast('Error al generar Excel', 'error');
    });
  }

  return { generate };
})();
