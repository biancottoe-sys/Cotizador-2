// pdf-generator.js - Generacion de PDF profesional Faroluz con imagenes
'use strict';

const PDFGenerator = (() => {

  function generate(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const PW=210, PH=297, ML=14, MR=14;
    const VERDE_OSC=[26,92,56], VERDE_MED=[45,140,94], NEGRO=[15,20,16];
    const GRIS_CLARO=[244,246,244], GRIS_BORDE=[212,219,214], BLANCO=[255,255,255];
    const VERDE_SUAVE=[232,245,238];
    const imgCache = data.imageCache || {};  // base64 pre-fetched images for PDF

    // HEADER
    doc.setFillColor(...NEGRO);
    doc.rect(0, 0, PW, 42, 'F');
    doc.setFillColor(...VERDE_OSC);
    doc.rect(0, 0, 5, 42, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(26); doc.setTextColor(...BLANCO);
    doc.text('FAROLUZ', ML+5, 17);
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(100,180,140);
    doc.text('ILUMINACION INDUSTRIAL Y DECORATIVA', ML+5, 23);
    doc.text('www.faroluz.com.ar  -  Buenos Aires, Argentina', ML+5, 28.5);

    doc.setFillColor(...VERDE_OSC);
    doc.roundedRect(PW-MR-52, 8, 52, 26, 3, 3, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...BLANCO);
    doc.text('COTIZACION', PW-MR-26, 15, {align:'center'});
    doc.setFontSize(18);
    doc.text('#'+data.numero, PW-MR-26, 24, {align:'center'});
    doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...GRIS_CLARO);
    doc.text('Lista N. 183 - Agosto 2026', PW-MR-26, 30, {align:'center'});

    // CLIENTE
    let y=50;
    const colW=(PW-ML-MR-8)/2, cli=data.cliente;

    doc.setFillColor(...GRIS_CLARO); doc.roundedRect(ML,y,colW,38,3,3,'F');
    doc.setDrawColor(...GRIS_BORDE); doc.setLineWidth(0.3); doc.roundedRect(ML,y,colW,38,3,3,'S');
    doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(...VERDE_OSC);
    doc.text('DATOS DEL CLIENTE', ML+4, y+7);
    [cli.nombre||null, cli.cuit?'CUIT: '+cli.cuit:null, cli.email||null, cli.tel?'Tel: '+cli.tel:null, cli.direccion||null]
      .filter(Boolean).forEach((line,i)=>{
        if(i===0){doc.setFont('helvetica','bold');doc.setFontSize(9);}else{doc.setFont('helvetica','normal');doc.setFontSize(8);}
        doc.setTextColor(...NEGRO);
        doc.text(line, ML+4, y+15+i*5.5, {maxWidth:colW-8});
      });

    const col2X=ML+colW+8;
    doc.setFillColor(...GRIS_CLARO); doc.roundedRect(col2X,y,colW,38,3,3,'F');
    doc.setDrawColor(...GRIS_BORDE); doc.roundedRect(col2X,y,colW,38,3,3,'S');
    doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(...VERDE_OSC);
    doc.text('INFORMACION DE LA COTIZACION', col2X+4, y+7);
    [['Fecha:', cli.fecha||new Date().toLocaleDateString('es-AR')],['Validez:',(cli.validez||15)+' dias'],['Vendedor:',cli.vendedor||''],['Cond. IVA:',(cli.condIva||'').replace('_',' ')]]
      .forEach(([lbl,val],i)=>{
        doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...NEGRO);
        doc.text(lbl, col2X+4, y+15+i*5.8);
        doc.setFont('helvetica','normal'); doc.setTextColor(60,80,70);
        doc.text(val, col2X+32, y+15+i*5.8);
      });

    y+=44;

    // TABLA
    const ivaPct = data.ivaReducido ? 10.5 : 21;

    const tableBody = data.items.map((item) => {
      const base    = data.preciosConIva ? item.precio/(1+ivaPct/100) : item.precio;
      const conDesc = base*(1-(item.descItem||0)/100);
      const sub     = conDesc*item.qty;
      return [
        { content: item.codigo, styles: {fontStyle:'bold'} },       // col 0 Codigo
        { content: '', rawImage: _getProductImage(item, data.imageCache) },          // col 1 Foto
        { content: item.descripcion+(item.observaciones?'\n'+item.observaciones:''), styles:{fontSize:7} }, // col 2 Descripcion
        { content: item.color||'', styles:{textColor:item.color?VERDE_OSC:GRIS_BORDE, fontStyle:item.color?'bold':'normal'} }, // col 3 Color
        item.qty,                                                    // col 4
        fmtP(base),                                                  // col 5
        item.descItem ? item.descItem+'%' : '',                     // col 6
        { content: fmtP(sub), styles:{fontStyle:'bold'} }           // col 7
      ];
    });

    doc.autoTable({
      startY: y,
      head: [['Codigo', 'Foto', 'Descripcion', 'Color/Terminacion', 'Cant.', 'P.Unit.', 'Dto.', 'Subtotal']],
      body: tableBody,
      margin: { left: ML, right: MR },
      headStyles: { fillColor:NEGRO, textColor:BLANCO, fontStyle:'bold', fontSize:7.5, cellPadding:{top:4,bottom:4,left:3,right:2} },
      bodyStyles: { fillColor:BLANCO, fontSize:7.5, textColor:NEGRO, cellPadding:{top:3,bottom:3,left:3,right:2} },
      columnStyles: {
        0: { cellWidth: 22, textColor:VERDE_OSC },   // Codigo
        1: { cellWidth: 13, halign:'center', cellPadding:{top:2,bottom:2,left:2,right:2} }, // Foto
        2: { cellWidth: 'auto' },                    // Descripcion
        3: { cellWidth: 30 },                        // Color
        4: { cellWidth: 12, halign:'center' },       // Cant.
        5: { cellWidth: 24, halign:'right' },        // P.Unit.
        6: { cellWidth: 12, halign:'center', textColor:[200,80,40] }, // Dto.
        7: { cellWidth: 26, halign:'right' },        // Subtotal
      },
      didParseCell: (hook) => {
        if (hook.section === 'body') {
          hook.cell.styles.fillColor = BLANCO;
        }
      },
      didDrawCell: (hook) => {
        if (hook.section !== 'body' || hook.column.index !== 1) return;
        const img = hook.cell.raw && hook.cell.raw.rawImage;
        if (!img) return;
        try {
          const boxW = Math.max(5, Math.min(10, hook.cell.width - 3));
          const boxH = Math.max(5, Math.min(10, hook.cell.height - 3));
          const fit = _fitImage(img, boxW, boxH);
          const x = hook.cell.x + (hook.cell.width - fit.w) / 2;
          const yImg = hook.cell.y + (hook.cell.height - fit.h) / 2;
          doc.addImage(img, _imageType(img), x, yImg, fit.w, fit.h, undefined, 'FAST');
        } catch(_) {}
      },
      didDrawPage: (hook) => {
        _footer(doc, PW, PH, ML, MR, data.numero, hook.pageNumber, doc.getNumberOfPages());
      },
    });

    y = doc.lastAutoTable.finalY + 6;

    // TOTALES
    const totalesX=PW-MR-72, totalesW=72, t=data.totals;
    if (y+56>PH-20) { doc.addPage(); y=20; }

    doc.setFillColor(...GRIS_CLARO); doc.roundedRect(totalesX,y,totalesW,data.mostrarIva?31:25,3,3,'F');
    doc.setDrawColor(...GRIS_BORDE); doc.roundedRect(totalesX,y,totalesW,data.mostrarIva?31:25,3,3,'S');

    let ty=y+7;
    const drawRow=(lbl,val,bold,color)=>{
      doc.setFont('helvetica',bold?'bold':'normal'); doc.setFontSize(8); doc.setTextColor(...(color||NEGRO));
      doc.text(lbl,totalesX+4,ty); doc.text(val,totalesX+totalesW-4,ty,{align:'right'}); ty+=6;
    };
    drawRow('Subtotal bruto:',fmtP(t.subtotalBruto),false,[80,100,90]);
    if(t.montoDesc>0) drawRow((data.descType==='pct'?'Descuento ('+data.descGlobal+'%):':'Descuento:'),'- '+fmtP(t.montoDesc),false,[200,80,40]);
    drawRow('Subtotal neto:',fmtP(t.subtotalNeto),true,VERDE_OSC);
    if(data.mostrarIva){
      ty+=2;
      doc.setDrawColor(...GRIS_BORDE); doc.setLineWidth(0.2);
      doc.line(totalesX+3,ty-2,totalesX+totalesW-3,ty-2);
      ty+=4;
      drawRow('IVA ('+t.ivaPct+'%):',fmtP(t.ivaAmount),false,[80,100,90]);
    }
    const tfY=y+(data.mostrarIva?31:25)+3;
    doc.setFillColor(...NEGRO); doc.roundedRect(totalesX,tfY,totalesW,16,3,3,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(180,210,190);
    doc.text('TOTAL FINAL',totalesX+4,tfY+6.5);
    doc.setFontSize(13); doc.setTextColor(...BLANCO);
    doc.text(fmtP(t.total),totalesX+totalesW-4,tfY+11.5,{align:'right'});

    // OBSERVACIONES
    if(data.observaciones){
      const obsW=totalesX-ML-6;
      doc.setFillColor(255,251,235); doc.roundedRect(ML,y,obsW,30,3,3,'F');
      doc.setDrawColor(240,180,41); doc.setLineWidth(0.3); doc.roundedRect(ML,y,obsW,30,3,3,'S');
      doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(160,100,0);
      doc.text('OBSERVACIONES',ML+4,y+7);
      doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...NEGRO);
      doc.text(doc.splitTextToSize(data.observaciones,obsW-8).slice(0,3),ML+4,y+13);
    }

    // CONDICIONES
    const condY=tfY+22;
    if(data.condiciones && condY<PH-20){
      doc.setFillColor(...GRIS_CLARO); doc.roundedRect(ML,condY,PW-ML-MR,28,3,3,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(...VERDE_OSC);
      doc.text('CONDICIONES COMERCIALES',ML+4,condY+7);
      doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(...NEGRO);
      doc.text(doc.splitTextToSize(data.condiciones,PW-ML-MR-8).slice(0,4),ML+4,condY+13);
    }

    _footer(doc,PW,PH,ML,MR,data.numero,doc.internal.getCurrentPageInfo().pageNumber,doc.getNumberOfPages());

    const fn='Faroluz_Cotizacion_'+data.numero+'_'+(data.cliente.nombre||'cliente').replace(/\s+/g,'_')+'.pdf';
    doc.save(fn);
    toast('PDF generado correctamente','success');
  }



  function _fitImage(src, maxW, maxH) {
    const dim = _imageDimensions(src);
    if (!dim || !dim.w || !dim.h) return { w: maxW, h: maxH };
    const scale = Math.min(maxW / dim.w, maxH / dim.h);
    return { w: dim.w * scale, h: dim.h * scale };
  }

  function _imageDimensions(src) {
    try {
      const comma = (src || '').indexOf(',');
      if (comma < 0) return null;
      const bin = atob(src.slice(comma + 1));
      if (/^data:image\/png/i.test(src)) {
        return {
          w: _readU32(bin, 16),
          h: _readU32(bin, 20),
        };
      }
      if (/^data:image\/jpe?g/i.test(src)) {
        let i = 2;
        while (i < bin.length) {
          if (bin.charCodeAt(i) !== 0xFF) { i++; continue; }
          const marker = bin.charCodeAt(i + 1);
          const len = (bin.charCodeAt(i + 2) << 8) + bin.charCodeAt(i + 3);
          if (marker >= 0xC0 && marker <= 0xC3) {
            return {
              h: (bin.charCodeAt(i + 5) << 8) + bin.charCodeAt(i + 6),
              w: (bin.charCodeAt(i + 7) << 8) + bin.charCodeAt(i + 8),
            };
          }
          i += 2 + len;
        }
      }
    } catch(_) {}
    return null;
  }

  function _readU32(bin, offset) {
    return ((bin.charCodeAt(offset) << 24) >>> 0) +
      (bin.charCodeAt(offset + 1) << 16) +
      (bin.charCodeAt(offset + 2) << 8) +
      bin.charCodeAt(offset + 3);
  }

  function _getProductImage(item, imageCache) {
    try {
      if (!item || item.manual) return null;
      if (imageCache && imageCache[item.codigo]) return imageCache[item.codigo];
      if (typeof getImagenURL !== 'function') return null;
      const url = getImagenURL(item.codigo, item.categoria || '');
      return /^data:image\//i.test(url || '') ? url : null;
    } catch(_) { return null; }
  }

  function _imageType(src) {
    return /^data:image\/jpe?g/i.test(src || '') ? 'JPEG' : 'PNG';
  }

  function _footer(doc,PW,PH,ML,MR,numero,pageNum,total){
    doc.setFillColor(15,20,16); doc.rect(0,PH-10,PW,10,'F');
    doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(130,160,140);
    doc.text('FAROLUZ  -  www.faroluz.com.ar  -  Iluminacion Industrial y Decorativa',ML,PH-4);
    doc.text('Cotizacion #'+numero+'  -  Pag. '+pageNum+' de '+total,PW-MR,PH-4,{align:'right'});
  }

  function fmtP(n){
    return '$ '+Number(n||0).toLocaleString('es-AR',{minimumFractionDigits:2,maximumFractionDigits:2});
  }

  return { generate };
})();
