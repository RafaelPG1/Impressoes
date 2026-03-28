// ============================================================================
// pdf.js — Sistema de Exportação PDF
// Reescrito com jsPDF puro + autoTable
// Sem html2canvas, sem captura de tela, sem CSS externo
// ============================================================================

// ─── Utilitários ─────────────────────────────────────────────────────────────
const PDFUtils = {
    fmt: (v) => `R$ ${parseFloat(v || 0).toFixed(2)}`,
    fmtDate: (iso) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    },
    fmtDateShort: (iso) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('pt-BR');
    },
    statusLabel: (imp) => {
        const vp = parseFloat(imp.valorPago || 0);
        const vt = parseFloat(imp.valorTotal || 0);
        if (vp >= vt && vt > 0) return 'Pago';
        if (vp > 0) return 'Parcial';
        return 'Pendente';
    },
    statusColor: (imp) => {
        const l = PDFUtils.statusLabel(imp);
        if (l === 'Pago')    return [34, 197, 94];
        if (l === 'Parcial') return [202, 138, 4];
        return [239, 68, 68];
    },
    now: () => new Date().toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    }),
    slugDate: () => new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-'),
};

// ─── Paleta de cores ──────────────────────────────────────────────────────────
const C = {
    accent:     [99, 102, 241],
    accentSoft: [238, 242, 255],
    black:      [17, 24, 39],
    dark:       [55, 65, 81],
    mid:        [107, 114, 128],
    light:      [209, 213, 219],
    pale:       [249, 250, 251],
    white:      [255, 255, 255],
    green:      [34, 197, 94],   greenSoft:  [220, 252, 231],
    yellow:     [202, 138, 4],   yellowSoft: [254, 249, 195],
    red:        [239, 68, 68],   redSoft:    [254, 226, 226],
    blue:       [59, 130, 246],  blueSoft:   [219, 234, 254],
    teal:       [20, 184, 166],  tealSoft:   [204, 251, 241],
    gray:       [156, 163, 175], graySoft:   [243, 244, 246],
};

// ─── Constantes de layout ─────────────────────────────────────────────────────
const PAGE_W      = 210;
const PAGE_H      = 297;
const MARGIN      = 14;
const CONTENT_W   = PAGE_W - MARGIN * 2;
const HEADER_H    = 25;
const FOOTER_H    = 14;
const SAFE_BOTTOM = PAGE_H - FOOTER_H - 4;

// ─── Helper: cria doc jsPDF ───────────────────────────────────────────────────
function newDoc() {
    return new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// _fetchPieFromQuickChart
// ═══════════════════════════════════════════════════════════════════════════════
async function _fetchPieFromQuickChart(slices, sizePx = 300) {
    const active = slices.filter(s => s.value > 0);
    if (!active.length) return null;

    const total = active.reduce((s, sl) => s + sl.value, 0);

    const pctLabels = active.map(sl => {
        const p = Math.round((sl.value / total) * 100);
        return p >= 5 ? p + '%' : '';
    });

    const chartConfig = {
        type: 'doughnut',
        data: {
            labels:   pctLabels,
            datasets: [{
                data:            active.map(s => s.value),
                backgroundColor: active.map(s => s.color),
                borderWidth:     3,
                borderColor:     '#111111',
            }],
        },
        options: {
            cutoutPercentage: 55,
            animation:  { duration: 0 },
            legend:     { display: false },
            plugins: {
                datalabels: {
                    display:         true,
                    color:           '#ffffff',
                    font:            { size: 52, weight: 'bold', family: 'Arial' },
                    formatter:       '<<fn>>',
                    textShadowColor: 'rgba(0,0,0,0.8)',
                    textShadowBlur:  6,
                    anchor:          'center',
                    align:           'center',
                },
            },
        },
    };

    let configStr = JSON.stringify(chartConfig);
    configStr = configStr.replace(
        '"<<fn>>"',
        'function(val,ctx){return ctx.chart.data.labels[ctx.dataIndex];}'
    );

    const params = new URLSearchParams({
        c:                configStr,
        w:                600,
        h:                600,
        bkg:              'transparent',
        f:                'png',
        devicePixelRatio: 3,
    });

    const url = 'https://quickchart.io/chart?' + params.toString();

    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('QuickChart HTTP ' + resp.status);
        const blob    = await resp.blob();
        const dataURL = await new Promise((res, rej) => {
            const reader    = new FileReader();
            reader.onload   = () => res(reader.result);
            reader.onerror  = () => rej(new Error('FileReader falhou'));
            reader.readAsDataURL(blob);
        });
        return dataURL;
    } catch (err) {
        console.warn('[PDF] QuickChart falhou, usando fallback canvas:', err.message);
        return _renderPieFallback(slices, sizePx);
    }
}

function _renderPieFallback(slices, PIX = 300) {
    const DPR   = 2;
    const W     = PIX * DPR;
    const CX    = W / 2, CY = W / 2;
    const R_OUT = W / 2 - 8 * DPR;
    const R_IN  = R_OUT * 0.50;

    const canvas  = document.createElement('canvas');
    canvas.width  = W;
    canvas.height = W;
    const ctx     = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, W);

    const active  = slices.filter(s => s.value > 0);
    const total   = active.reduce((s, sl) => s + sl.value, 0);
    if (!total) return null;

    const GAP_RAD  = (2 * Math.PI) / 180;
    const totalArc = 2 * Math.PI - GAP_RAD * active.length;
    let   angle    = -Math.PI / 2;

    active.forEach(sl => {
        const sweep = (sl.value / total) * totalArc;
        ctx.beginPath();
        ctx.moveTo(CX + R_IN * Math.cos(angle), CY + R_IN * Math.sin(angle));
        ctx.arc(CX, CY, R_OUT, angle, angle + sweep);
        ctx.arc(CX, CY, R_IN,  angle + sweep, angle, true);
        ctx.closePath();
        ctx.fillStyle = sl.color;
        ctx.fill();
        angle += sweep + GAP_RAD;
    });

    ctx.beginPath();
    ctx.arc(CX, CY, R_IN, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    return canvas.toDataURL('image/png');
}

// ═══════════════════════════════════════════════════════════════════════════════
// drawHeader
// ═══════════════════════════════════════════════════════════════════════════════
function drawHeader(doc, titulo, subtitulo) {
    doc.setFillColor(...C.accent);
    doc.rect(0, 0, PAGE_W, 1.5, 'F');

    doc.setFillColor(...C.accentSoft);
    doc.rect(0, 1.5, 5, HEADER_H - 1.5, 'F');

    if (window._pdfIconDataURL) {
        doc.addImage(window._pdfIconDataURL, 'PNG', MARGIN, 8, 12, 12);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...C.black);
    doc.text(titulo || 'Relatorio', MARGIN + 16, 13);

    if (subtitulo) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...C.mid);
        doc.text(subtitulo, MARGIN + 16, 19);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.mid);
    doc.text('Gerado em: ' + PDFUtils.now(), PAGE_W - MARGIN, 10, { align: 'right' });
    doc.text('Sistema de Gerenciamento de Impressoes', PAGE_W - MARGIN, 16, { align: 'right' });

    doc.setDrawColor(...C.light);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, HEADER_H, PAGE_W - MARGIN, HEADER_H);
}

// ── Pré-carrega pdf.svg como dataURL para usar dentro do jsPDF ──────────────
function _preloadPdfIcon() {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width  = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 64, 64);
        window._pdfIconDataURL = canvas.toDataURL('image/png');
    };
    img.onerror = () => console.warn('[PDF] pdf.svg não encontrado');
    img.src = 'pdf.svg';
}
_preloadPdfIcon();

// ═══════════════════════════════════════════════════════════════════════════════
// drawFooter
// ═══════════════════════════════════════════════════════════════════════════════
function drawFooter(doc, pageNum, totalPages) {
    const y = PAGE_H - FOOTER_H;

    doc.setDrawColor(...C.light);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);

    doc.setFillColor(...C.accent);
    doc.rect(0, PAGE_H - 1.5, PAGE_W, 1.5, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...C.mid);
    doc.text('Sistema de Gerenciamento de Impressoes', MARGIN, PAGE_H - 6);
    doc.text(PDFUtils.now(), PAGE_W / 2, PAGE_H - 6, { align: 'center' });
    doc.text('Pagina ' + pageNum + ' de ' + totalPages, PAGE_W - MARGIN, PAGE_H - 6, { align: 'right' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// drawCard
// ═══════════════════════════════════════════════════════════════════════════════
function drawCard(doc, x, y, w, h, label, value, color, bg) {
    doc.setFillColor(...bg);
    doc.roundedRect(x, y, w, h, 2, 2, 'F');

    doc.setFillColor(...color);
    doc.roundedRect(x, y, w, 1.5, 1, 1, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...C.mid);
    doc.text(label, x + w / 2, y + 8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...color);
    doc.text(String(value), x + w / 2, y + 15, { align: 'center' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// drawMiniCards
// ═══════════════════════════════════════════════════════════════════════════════
function drawMiniCards(doc, y, cards) {
    const gap   = 3;
    const cardW = (CONTENT_W - gap * (cards.length - 1)) / cards.length;
    const cardH = 20;

    cards.forEach((card, i) => {
        const x = MARGIN + i * (cardW + gap);
        drawCard(doc, x, y, cardW, cardH, card.label, card.value, card.color, card.bg);
    });

    return y + cardH + 5;
}

// ═══════════════════════════════════════════════════════════════════════════════
// drawStatusCards — Pag. Tudo / Parciais / Pendentes
// ═══════════════════════════════════════════════════════════════════════════════
function drawStatusCards(doc, y, impressoes) {
    const cPago = impressoes.filter(i => {
        const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0);
        return vp >= vt && vt > 0;
    }).length;
    const cParc = impressoes.filter(i => {
        const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0);
        return vp > 0 && vp < vt;
    }).length;
    const cPend = impressoes.length - cPago - cParc;

    const gap   = 3;
    const cardW = (CONTENT_W - gap * 2) / 3;
    const cardH = 20;

    [
        { label: 'PAG. TUDO', value: String(cPago), color: C.green,  bg: C.greenSoft  },
        { label: 'PARCIAIS',  value: String(cParc), color: C.yellow, bg: C.yellowSoft },
        { label: 'PENDENTES', value: String(cPend), color: C.red,    bg: C.redSoft    },
    ].forEach((card, idx) => {
        drawCard(doc, MARGIN + idx * (cardW + gap), y, cardW, cardH, card.label, card.value, card.color, card.bg);
    });

    return y + cardH + 5;
}

// ═══════════════════════════════════════════════════════════════════════════════
// drawSectionTitle
// ═══════════════════════════════════════════════════════════════════════════════
function drawSectionTitle(doc, y, texto) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.accent);
    doc.text(texto, MARGIN, y);
    return y + 5;
}

// ═══════════════════════════════════════════════════════════════════════════════
// drawGraficoPizza
// ═══════════════════════════════════════════════════════════════════════════════
async function drawGraficoPizza(doc, x, y, w, h, impressoes) {
    const cPago = impressoes.filter(i => {
        const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0);
        return vp >= vt && vt > 0;
    }).length;
    const cParc = impressoes.filter(i => {
        const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0);
        return vp > 0 && vp < vt;
    }).length;
    const cPend = impressoes.length - cPago - cParc;

    const total = impressoes.length || 1;

    doc.setFillColor(250, 250, 252);
    doc.roundedRect(x, y, w, h, 3, 3, 'F');
    doc.setDrawColor(...C.light);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.dark);
    doc.text('Status das Impressoes', x + 6, y + 8);

    const slices = [
        { value: cPago, color: '#22c55e', label: 'Pago'     },
        { value: cParc, color: '#ca8a04', label: 'Parcial'  },
        { value: cPend, color: '#ef4444', label: 'Pendente' },
    ];

    const innerH    = h - 14;
    const innerY    = y + 14;
    const innerW    = w - 8;

    const pieSizeMM = Math.min(innerW * 0.55, innerH - 4);
    const piePX     = Math.round(pieSizeMM * (96 / 25.4));

    const pieDataURL = await _fetchPieFromQuickChart(slices, piePX * 2);

    const pieX = x + 4;
    const pieY = innerY + (innerH - pieSizeMM) / 2;

    if (pieDataURL) doc.addImage(pieDataURL, 'PNG', pieX, pieY, pieSizeMM, pieSizeMM);

    const legX = pieX + pieSizeMM + 6;
    const legW = w - pieSizeMM - 14;

    const entries = [
        { color: C.green,  softColor: C.greenSoft,  label: 'Pago',     value: cPago },
        { color: C.yellow, softColor: C.yellowSoft, label: 'Parcial',  value: cParc },
        { color: C.red,    softColor: C.redSoft,    label: 'Pendente', value: cPend },
    ];

    const entryH    = 16;
    const totalLegH = entries.length * entryH;
    let   legY      = innerY + (innerH - totalLegH) / 2;

    entries.forEach(entry => {
        const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : '0';

        doc.setFillColor(...entry.softColor);
        doc.roundedRect(legX, legY, legW - 2, 12, 2, 2, 'F');

        doc.setFillColor(...entry.color);
        doc.roundedRect(legX + 3, legY + 4, 3.5, 3.5, 0.7, 0.7, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...C.dark);
        doc.text(entry.label, legX + 9, legY + 6.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(...entry.color);
        doc.text(String(entry.value), legX + legW - 4, legY + 6.5, { align: 'right' });

        legY += entryH;
    });

    return y + h;
}

// ═══════════════════════════════════════════════════════════════════════════════
// drawGraficoBarras
// ═══════════════════════════════════════════════════════════════════════════════
function drawGraficoBarras(doc, x, y, w, h, impressoes) {
    const tv    = impressoes.reduce((s, i) => s + parseFloat(i.valorTotal || 0), 0);
    const tp    = impressoes.reduce((s, i) => s + parseFloat(i.valorPago  || 0), 0);
    const saldo = Math.max(0, tv - tp);

    doc.setFillColor(250, 250, 252);
    doc.roundedRect(x, y, w, h, 3, 3, 'F');
    doc.setDrawColor(...C.light);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...C.dark);
    doc.text('Resumo Financeiro', x + 6, y + 8);

    const barItems = [
        { label: 'Total Geral', value: tv,    max: tv || 1, color: C.accent  },
        { label: 'Total Pago',  value: tp,    max: tv || 1, color: C.green   },
        { label: 'Saldo',       value: saldo, max: tv || 1, color: C.yellow  },
    ];
    const barMaxW = w - 12;
    let barY = y + 14;
    barItems.forEach(b => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(...C.mid);
        doc.text(b.label, x + 6, barY);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...b.color);
        doc.text(PDFUtils.fmt(b.value), x + w - 4, barY, { align: 'right' });

        barY += 4;

        doc.setFillColor(...C.light);
        doc.roundedRect(x + 6, barY, barMaxW, 4, 1, 1, 'F');

        const fillW = Math.max(0, (b.value / b.max) * barMaxW);
        if (fillW > 0) {
            doc.setFillColor(...b.color);
            doc.roundedRect(x + 6, barY, fillW, 4, 1, 1, 'F');
        }

        barY += 9;
    });

    const mcY = y + h - 18;
    const mcW = (w - 14) / 2;
    const mcH = 12;

    [[PDFUtils.fmt(tp), 'Pago', C.green, C.greenSoft], [PDFUtils.fmt(saldo), 'Saldo', C.yellow, C.yellowSoft]].forEach(([val, lbl, col, bg], i) => {
        const mx = x + 4 + i * (mcW + 4);
        doc.setFillColor(...bg);
        doc.roundedRect(mx, mcY, mcW, mcH, 2, 2, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(...C.mid);
        doc.text(lbl, mx + mcW / 2, mcY + 4.5, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(...col);
        doc.text(val, mx + mcW / 2, mcY + 9.5, { align: 'center' });
    });

    return y + h;
}

// ═══════════════════════════════════════════════════════════════════════════════
// drawGraficos
// ═══════════════════════════════════════════════════════════════════════════════
async function drawGraficos(doc, y, impressoes, resumo) {
    const colW   = CONTENT_W / 2 - 4;
    const leftX  = MARGIN;
    const rightX = MARGIN + colW + 8;
    const boxH   = 68;

    await drawGraficoPizza(doc,  leftX,  y, colW, boxH, impressoes);
    drawGraficoBarras(doc, rightX, y, colW, boxH, impressoes);

    return y + boxH + 6;
}

// ═══════════════════════════════════════════════════════════════════════════════
// drawCards8
// ═══════════════════════════════════════════════════════════════════════════════
function drawCards8(doc, y, impressoes, resumo) {
    const tv      = impressoes.reduce((s, i) => s + parseFloat(i.valorTotal || 0), 0);
    const tp      = impressoes.reduce((s, i) => s + parseFloat(i.valorPago  || 0), 0);
    const saldo   = Math.max(0, tv - tp);
    const emDia   = resumo.filter(c => parseFloat(c.saldoDevedor || 0) <= 0).length;
    const devs    = resumo.length - emDia;
    const cPago   = impressoes.filter(i => { const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0); return vp >= vt && vt > 0; }).length;
    const cParc   = impressoes.filter(i => { const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0); return vp > 0 && vp < vt; }).length;
    const cPend   = impressoes.length - cPago - cParc;

    const colW  = CONTENT_W / 2 - 4;
    const leftX = MARGIN;

    const cards = [
        { label: 'IMPRESSOES',   value: String(impressoes.length), color: C.accent,  bg: C.accentSoft  },
        { label: 'CLIENTES',     value: String(resumo.length),     color: C.blue,    bg: C.blueSoft    },
        { label: 'TOTAL GERAL',  value: PDFUtils.fmt(tv),          color: C.yellow,  bg: C.yellowSoft  },
        { label: 'PAG. TUDO',    value: String(cPago),             color: C.green,   bg: C.greenSoft   },
        { label: 'SALDO ABERTO', value: PDFUtils.fmt(saldo),       color: C.red,     bg: C.redSoft     },
        { label: 'PARCIAIS',     value: String(cParc),             color: C.yellow,  bg: C.yellowSoft  },
        { label: 'TOTAL PAGO',   value: PDFUtils.fmt(tp),          color: C.blue,    bg: C.blueSoft    },
        { label: 'PENDENTES',    value: String(cPend),             color: C.red,     bg: C.redSoft     },
    ];

    const cardW = (colW - 4) / 2;
    const cardH = 20;
    const gap   = 3;

    cards.forEach((card, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x   = leftX + col * (cardW + gap);
        const cy  = y + row * (cardH + gap);
        drawCard(doc, x, cy, cardW, cardH, card.label, card.value, card.color, card.bg);
    });

    return y + 4 * (cardH + gap) + 2;
}

// ═══════════════════════════════════════════════════════════════════════════════
// buildTabelaClientes
// ═══════════════════════════════════════════════════════════════════════════════
function buildTabelaClientes(impressoes) {
    const por = {};
    impressoes.forEach(imp => {
        const cli = imp.cliente || '—';
        if (!por[cli]) por[cli] = { n: 0, f: 0, o: 0, c: 0, t2: 0, tot: 0, pago: 0 };
        por[cli].n    += 1;
        por[cli].f    += parseInt(imp.folhasNormais || 0);
        por[cli].o    += parseInt(imp.folhasOffset  || 0);
        por[cli].c    += parseFloat(imp.projetoCanva || 0);
        por[cli].t2   += parseFloat(imp.trabalho    || 0);
        por[cli].tot  += parseFloat(imp.valorTotal  || 0);
        por[cli].pago += parseFloat(imp.valorPago   || 0);
    });

    return Object.entries(por).map(([cli, d]) => {
        const dev  = Math.max(0, d.tot - d.pago);
        const stat = d.pago >= d.tot && d.tot > 0 ? 'Pago' : d.pago > 0 ? 'Parcial' : 'Pendente';
        return [
            cli,
            String(d.n),
            String(d.f),
            String(d.o),
            d.c  > 0 ? PDFUtils.fmt(d.c)  : '—',
            d.t2 > 0 ? PDFUtils.fmt(d.t2) : '—',
            d.tot.toFixed(2),
            d.pago.toFixed(2),
            dev.toFixed(2),
            stat
        ];
    });
}

// ─── Helper: badge de status ──────────────────────────────────────────────────
function _drawStatusBadge(doc, data, body, colIndex) {
    if (data.section !== 'body' || data.column.index !== colIndex) return;

    const status = body[data.row.index]?.[colIndex];
    if (!status) return;

    const bg =
        status === 'Pago'    ? C.green  :
        status === 'Parcial' ? C.yellow :
                               C.red;

    const badgeW = 20;
    const badgeH = 5.5;
    const bx = data.cell.x + (data.cell.width  - badgeW) / 2;
    const by = data.cell.y + (data.cell.height - badgeH) / 2;

    doc.setFillColor(...bg);
    doc.roundedRect(bx, by, badgeW, badgeH, 1.5, 1.5, 'F');

    doc.setTextColor(...C.white);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(status, bx + badgeW / 2, by + badgeH / 2 + 0.8, { align: 'center' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// drawTabela
// ═══════════════════════════════════════════════════════════════════════════════
function drawTabela(doc, startY, body) {
    doc.autoTable({
        startY,
        head: [[
            'Cliente', 'Impressoes', 'Folhas', 'Offset',
            'Canva', 'Trabalho', 'Total (R$)', 'Pago (R$)', 'Devendo (R$)', 'Status'
        ]],
        body,
        theme: 'plain',
        tableWidth: 'auto',
        margin: { left: MARGIN, right: MARGIN, top: HEADER_H + 2, bottom: FOOTER_H + 4 },
        styles: {
            fontSize: 7.5,
            font: 'helvetica',
            cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
            textColor: C.dark,
            lineColor: C.light,
            lineWidth: 0.2,
            overflow: 'linebreak',
            valign: 'middle',
            minCellHeight: 10,
        },
        headStyles: {
            fillColor: C.pale,
            textColor: C.mid,
            fontStyle: 'bold',
            fontSize: 7,
            lineColor: C.light,
            lineWidth: 0.3,
            cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
        },
        alternateRowStyles: { fillColor: C.pale },
        bodyStyles:         { fillColor: C.white },
        columnStyles: {
            0: { cellWidth: 24, fontStyle: 'bold' },
            1: { cellWidth: 17, halign: 'center' },
            2: { cellWidth: 12, halign: 'center' },
            3: { cellWidth: 12, halign: 'center' },
            4: { cellWidth: 15, halign: 'right'  },
            5: { cellWidth: 15, halign: 'right'  },
            6: { cellWidth: 19, halign: 'right', fontStyle: 'bold' },
            7: { cellWidth: 16, halign: 'right'  },
            8: { cellWidth: 19, halign: 'right', fontStyle: 'bold' },
            9: { cellWidth: 28, halign: 'center' },
        },
        didParseCell(data) {
            if (data.section !== 'body') return;
            if (data.column.index === 9) data.cell.text = [];
            if (data.column.index === 6) data.cell.styles.textColor = C.accent;
            if (data.column.index === 8) {
                const dev = parseFloat(body[data.row.index]?.[8] || 0);
                data.cell.styles.textColor = dev > 0 ? C.red : C.green;
            }
        },
        didDrawCell(data) {
            _drawStatusBadge(doc, data, body, 9);
        },
        showHead: 'everyPage',
        didDrawPage(data) {
            const pg  = doc.internal.getCurrentPageInfo().pageNumber;
            const tot = doc.internal.getNumberOfPages();
            drawHeader(doc, data.settings._pdfTitle || 'Relatorio', data.settings._pdfSubtitle || '');
            drawFooter(doc, pg, tot);
        },
    });

    return doc.lastAutoTable.finalY + 5;
}

// ═══════════════════════════════════════════════════════════════════════════════
// drawTabelaImpressoes
// ═══════════════════════════════════════════════════════════════════════════════
function drawTabelaImpressoes(doc, startY, impressoes, showCliente, titulo, subtitulo) {
    const body = impressoes.map(imp => {
        const vt  = parseFloat(imp.valorTotal || 0);
        const vp  = parseFloat(imp.valorPago  || 0);
        const row = [];
        if (showCliente) row.push(imp.cliente || '—');
        row.push(
            imp.tipoPreco || '—',
            imp.folhasNormais > 0 ? String(imp.folhasNormais) : '0',
            imp.folhasOffset  > 0 ? String(imp.folhasOffset)  : '0',
            imp.projetoCanva  > 0 ? PDFUtils.fmt(imp.projetoCanva) : '—',
            imp.trabalho      > 0 ? PDFUtils.fmt(imp.trabalho)     : '—',
            PDFUtils.fmt(vt),
            PDFUtils.fmt(vp),
            PDFUtils.fmt(Math.max(0, vt - vp)),
            PDFUtils.statusLabel(imp),
            PDFUtils.fmtDate(imp.dataHora)
        );
        return row;
    });

    const head = showCliente
        ? [['Cliente', 'Tipo', 'Folhas', 'Offset', 'Canva', 'Trabalho', 'Total', 'Pago', 'Resta', 'Status', 'Data']]
        : [['Tipo', 'Folhas', 'Offset', 'Canva', 'Trabalho', 'Total', 'Pago', 'Resta', 'Status', 'Data']];

    const siStatus = showCliente ? 9 : 8;
    const siTotal  = showCliente ? 6 : 5;

    const statusColStyle = {
        cellWidth: 28,
        halign: 'center',
    };

    const colStyles = showCliente
        ? {
            0:  { cellWidth: 22, fontStyle: 'bold' },
            1:  { cellWidth: 26 },
            2:  { cellWidth: 11, halign: 'center' },
            3:  { cellWidth: 11, halign: 'center' },
            4:  { cellWidth: 15, halign: 'right'  },
            5:  { cellWidth: 15, halign: 'right'  },
            6:  { cellWidth: 17, halign: 'right', fontStyle: 'bold' },
            7:  { cellWidth: 14, halign: 'right'  },
            8:  { cellWidth: 14, halign: 'right'  },
            9:  statusColStyle,
            10: { cellWidth: 'auto' },
          }
        : {
            0:  { cellWidth: 30 },
            1:  { cellWidth: 13, halign: 'center' },
            2:  { cellWidth: 13, halign: 'center' },
            3:  { cellWidth: 17, halign: 'right'  },
            4:  { cellWidth: 17, halign: 'right'  },
            5:  { cellWidth: 17, halign: 'right', fontStyle: 'bold' },
            6:  { cellWidth: 15, halign: 'right'  },
            7:  { cellWidth: 15, halign: 'right'  },
            8:  statusColStyle,
            9:  { cellWidth: 'auto' },
          };

    doc.autoTable({
        startY,
        head,
        body,
        theme: 'plain',
        margin: { left: MARGIN, right: MARGIN, top: HEADER_H + 2, bottom: FOOTER_H + 4 },
        styles: {
            fontSize: 7,
            font: 'helvetica',
            cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
            textColor: C.dark,
            lineColor: C.light,
            lineWidth: 0.2,
            overflow: 'linebreak',
            valign: 'middle',
            minCellHeight: 10,
        },
        headStyles: {
            fillColor: C.pale, textColor: C.mid, fontStyle: 'bold',
            fontSize: 6.5, lineColor: C.light, lineWidth: 0.3,
            cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
        },
        alternateRowStyles: { fillColor: C.pale },
        bodyStyles: { fillColor: C.white },
        columnStyles: colStyles,
        showHead: 'everyPage',
        didParseCell(data) {
            if (data.section !== 'body') return;
            if (data.column.index === siStatus) data.cell.text = [];
            if (data.column.index === siTotal)  data.cell.styles.textColor = C.accent;
        },
        didDrawCell(data) {
            _drawStatusBadge(doc, data, body, siStatus);
        },
        didDrawPage(data) {
            const pg  = doc.internal.getCurrentPageInfo().pageNumber;
            const tot = doc.internal.getNumberOfPages();
            drawHeader(doc, titulo || 'Relatorio', subtitulo || '');
            drawFooter(doc, pg, tot);
        },
    });

    return doc.lastAutoTable.finalY + 5;
}

// ═══════════════════════════════════════════════════════════════════════════════
// drawTabelaResumoClientes
// ═══════════════════════════════════════════════════════════════════════════════
function drawTabelaResumoClientes(doc, startY, resumo, titulo, subtitulo) {
    const body = resumo.map(cli => {
        const dev   = parseFloat(cli.saldoDevedor   || 0);
        const pago  = parseFloat(cli.valorPagoTotal || 0);
        const total = parseFloat(cli.valorAcumulado || 0);
        return [
            cli.cliente || '—',
            String(cli.totalCompras || 0),
            String(cli.folhasNormais || 0),
            String(cli.folhasOffset  || 0),
            cli.totalCanva    > 0 ? PDFUtils.fmt(cli.totalCanva)    : '—',
            cli.totalTrabalho > 0 ? PDFUtils.fmt(cli.totalTrabalho) : '—',
            PDFUtils.fmt(total),
            PDFUtils.fmt(pago),
            PDFUtils.fmt(dev),
            dev > 0 ? 'Pendente' : 'Pago'
        ];
    });

    doc.autoTable({
        startY,
        head: [['Cliente', 'Impressoes', 'Folhas', 'Offset', 'Canva', 'Trabalho', 'Total', 'Pago', 'Saldo Rest.', 'Status']],
        body,
        theme: 'plain',
        margin: { left: MARGIN, right: MARGIN, top: HEADER_H + 2, bottom: FOOTER_H + 4 },
        styles: {
            fontSize: 7.5, font: 'helvetica',
            cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
            textColor: C.dark, lineColor: C.light, lineWidth: 0.2,
            overflow: 'linebreak', valign: 'middle',
            minCellHeight: 10,
        },
        headStyles: {
            fillColor: C.pale, textColor: C.mid, fontStyle: 'bold',
            fontSize: 7, lineColor: C.light, lineWidth: 0.3,
            cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
        },
        alternateRowStyles: { fillColor: C.pale },
        bodyStyles: { fillColor: C.white },
        columnStyles: {
            0: { cellWidth: 28, fontStyle: 'bold' },
            1: { cellWidth: 17, halign: 'center' },
            2: { cellWidth: 12, halign: 'center' },
            3: { cellWidth: 12, halign: 'center' },
            4: { cellWidth: 16, halign: 'right'  },
            5: { cellWidth: 16, halign: 'right'  },
            6: { cellWidth: 18, halign: 'right', fontStyle: 'bold' },
            7: { cellWidth: 16, halign: 'right'  },
            8: { cellWidth: 16, halign: 'right', fontStyle: 'bold' },
            9: { cellWidth: 28, halign: 'center', fontStyle: 'bold' },
        },
        showHead: 'everyPage',
        didParseCell(data) {
            if (data.section !== 'body') return;
            if (data.column.index === 9) {
                data.cell.styles.textColor = data.cell.raw === 'Pago' ? C.green : C.red;
                data.cell.styles.fontStyle = 'bold';
            }
            if (data.column.index === 8) {
                const v = parseFloat(resumo[data.row.index]?.saldoDevedor || 0);
                data.cell.styles.textColor = v > 0 ? C.red : C.green;
            }
            if (data.column.index === 6) data.cell.styles.textColor = C.accent;
            if (data.column.index === 7) data.cell.styles.textColor = C.blue;
        },
        didDrawPage(data) {
            const pg  = doc.internal.getCurrentPageInfo().pageNumber;
            const tot = doc.internal.getNumberOfPages();
            drawHeader(doc, titulo || 'Resumo por Cliente', subtitulo || '');
            drawFooter(doc, pg, tot);
        },
    });

    return doc.lastAutoTable.finalY + 5;
}

// ─── finaliza rodapés ─────────────────────────────────────────────────────────
function applyFooters(doc, titulo, subtitulo) {
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        drawHeader(doc, titulo, subtitulo);
        drawFooter(doc, i, total);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDFGenerator
// ═══════════════════════════════════════════════════════════════════════════════
class PDFGenerator {

    static async gerarRelatorioCompleto(impressoes, resumo) {
        const titulo    = 'Relatorio Completo';
        const subtitulo = impressoes.length + ' impressao(oes) · ' + resumo.length + ' cliente(s)';
        const doc       = newDoc();

        drawHeader(doc, titulo, subtitulo);

        let y = HEADER_H + 4;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...C.accent);
        doc.text('Resumo Geral', MARGIN, y);
        y += 5;

        const cardsEndY = drawCards8(doc, y, impressoes, resumo);

        const colW   = CONTENT_W / 2 - 4;
        const rightX = MARGIN + colW + 8;
        const boxH   = 68;

        await drawGraficoPizza(doc, rightX, y, colW, boxH, impressoes);

        const g2Y = y + boxH + 4;
        const g2H = 62;
        drawGraficoBarras(doc, rightX, g2Y, colW, g2H, impressoes);

        y = Math.max(cardsEndY, g2Y + g2H + 5);

        y = drawSectionTitle(doc, y, 'Relatorio por Cliente');
        const body = buildTabelaClientes(impressoes);
        drawTabela(doc, y, body);

        applyFooters(doc, titulo, subtitulo);

        const blob     = doc.output('blob');
        const filename = 'relatorio_completo_' + PDFUtils.slugDate() + '.pdf';
        return { blob, filename };
    }

    static gerarImpressaoUnica(imp) {
        const titulo    = 'Comprovante de Impressao';
        const subtitulo = 'Cliente: ' + (imp.cliente || '—');
        const doc       = newDoc();
        drawHeader(doc, titulo, subtitulo);
        let y = HEADER_H + 4;

        const vt    = parseFloat(imp.valorTotal || 0);
        const vp    = parseFloat(imp.valorPago  || 0);
        const saldo = Math.max(0, vt - vp);

        y = drawMiniCards(doc, y, [
            { label: 'VALOR TOTAL',    value: PDFUtils.fmt(vt),          color: C.accent, bg: C.accentSoft },
            { label: 'VALOR PAGO',     value: PDFUtils.fmt(vp),          color: C.blue,   bg: C.blueSoft   },
            { label: 'SALDO RESTANTE', value: PDFUtils.fmt(saldo),       color: saldo > 0 ? C.red : C.green, bg: saldo > 0 ? C.redSoft : C.greenSoft },
            { label: 'STATUS',         value: PDFUtils.statusLabel(imp), color: PDFUtils.statusColor(imp), bg: C.pale },
        ]);

        y = drawSectionTitle(doc, y, 'Dados da Impressao');

        const detalhe = [
            ['Cliente',        imp.cliente    || '—'],
            ['Tipo',           imp.tipoPreco  || '—'],
            ['Folhas Normais', String(imp.folhasNormais || 0)],
            ['Folhas Offset',  String(imp.folhasOffset  || 0)],
            ['Canva',          imp.projetoCanva > 0 ? PDFUtils.fmt(imp.projetoCanva) : '—'],
            ['Trabalho',       imp.trabalho    > 0 ? PDFUtils.fmt(imp.trabalho)      : '—'],
            ['Data/Hora',      PDFUtils.fmtDate(imp.dataHora)],
            ['Status',         PDFUtils.statusLabel(imp)],
            ['Valor Total',    PDFUtils.fmt(vt)],
            ['Valor Pago',     PDFUtils.fmt(vp)],
            ['Saldo Restante', PDFUtils.fmt(saldo)],
        ];

        doc.autoTable({
            startY: y,
            body: detalhe,
            theme: 'plain',
            margin: { left: MARGIN, right: MARGIN, top: HEADER_H + 2, bottom: FOOTER_H + 4 },
            styles: {
                fontSize: 9, font: 'helvetica',
                cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
                textColor: C.dark, lineColor: C.light, lineWidth: 0.2,
                overflow: 'linebreak',
            },
            bodyStyles: { fillColor: C.white },
            alternateRowStyles: { fillColor: C.pale },
            columnStyles: {
                0: { cellWidth: 50, fontStyle: 'bold', textColor: C.mid },
                1: { cellWidth: 'auto' },
            },
            didParseCell(data) {
                if (data.section !== 'body' || data.column.index !== 1) return;
                if (data.row.index === 7) { data.cell.styles.textColor = PDFUtils.statusColor(imp); data.cell.styles.fontStyle = 'bold'; }
                if (data.row.index === 8)  data.cell.styles.textColor = C.accent;
                if (data.row.index === 9)  data.cell.styles.textColor = C.blue;
                if (data.row.index === 10) data.cell.styles.textColor = saldo > 0 ? C.red : C.green;
            },
            didDrawPage(data) {
                const pg  = doc.internal.getCurrentPageInfo().pageNumber;
                const tot = doc.internal.getNumberOfPages();
                drawHeader(doc, titulo, subtitulo);
                drawFooter(doc, pg, tot);
            },
        });

        applyFooters(doc, titulo, subtitulo);

        const blob     = doc.output('blob');
        const filename = 'impressao_' + (imp.cliente || 'cliente').replace(/\s+/g, '_') + '_' + PDFUtils.slugDate() + '.pdf';
        return { blob, filename };
    }

    static gerarPorCliente(impressoes, nomeCliente) {
        const titulo    = 'Historico — ' + nomeCliente;
        const subtitulo = impressoes.length + ' registro(s)';
        const doc       = newDoc();
        drawHeader(doc, titulo, subtitulo);
        let y = HEADER_H + 4;

        const tv = impressoes.reduce((s, i) => s + parseFloat(i.valorTotal || 0), 0);
        const tp = impressoes.reduce((s, i) => s + parseFloat(i.valorPago  || 0), 0);

        y = drawMiniCards(doc, y, [
            { label: 'REGISTROS',      value: String(impressoes.length),           color: C.accent, bg: C.accentSoft },
            { label: 'TOTAL GERAL',    value: PDFUtils.fmt(tv),                    color: C.green,  bg: C.greenSoft  },
            { label: 'TOTAL PAGO',     value: PDFUtils.fmt(tp),                    color: C.blue,   bg: C.blueSoft   },
            { label: 'SALDO RESTANTE', value: PDFUtils.fmt(Math.max(0, tv - tp)),  color: tv - tp > 0 ? C.red : C.green, bg: tv - tp > 0 ? C.redSoft : C.greenSoft },
        ]);

        // ── cards de status ──
        y = drawStatusCards(doc, y, impressoes);

        y = drawSectionTitle(doc, y, 'Impressoes de ' + nomeCliente);
        drawTabelaImpressoes(doc, y, impressoes, false, titulo, subtitulo);

        applyFooters(doc, titulo, subtitulo);

        const blob     = doc.output('blob');
        const filename = 'impressoes_' + nomeCliente.replace(/\s+/g, '_') + '_' + PDFUtils.slugDate() + '.pdf';
        return { blob, filename };
    }

    static gerarPorPeriodo(impressoes, dataInicio, dataFim) {
        const fr = d => d ? new Date(d).toLocaleDateString('pt-BR') : '—';
        const titulo    = 'Relatorio por Periodo';
        const subtitulo = 'De ' + fr(dataInicio) + ' ate ' + fr(dataFim) + ' — ' + impressoes.length + ' registro(s)';
        const doc       = newDoc();
        drawHeader(doc, titulo, subtitulo);
        let y = HEADER_H + 4;

        const tv = impressoes.reduce((s, i) => s + parseFloat(i.valorTotal || 0), 0);
        const tp = impressoes.reduce((s, i) => s + parseFloat(i.valorPago  || 0), 0);

        y = drawMiniCards(doc, y, [
            { label: 'REGISTROS',      value: String(impressoes.length),           color: C.yellow, bg: C.yellowSoft },
            { label: 'TOTAL GERAL',    value: PDFUtils.fmt(tv),                    color: C.green,  bg: C.greenSoft  },
            { label: 'TOTAL PAGO',     value: PDFUtils.fmt(tp),                    color: C.blue,   bg: C.blueSoft   },
            { label: 'SALDO RESTANTE', value: PDFUtils.fmt(Math.max(0, tv - tp)),  color: tv - tp > 0 ? C.red : C.green, bg: tv - tp > 0 ? C.redSoft : C.greenSoft },
        ]);

        // ── cards de status ──
        y = drawStatusCards(doc, y, impressoes);

        y = drawSectionTitle(doc, y, 'Impressoes no Periodo');
        const bodyPeriodo = buildTabelaClientes(impressoes);
        drawTabela(doc, y, bodyPeriodo);

        applyFooters(doc, titulo, subtitulo);

        const blob     = doc.output('blob');
        const filename = 'impressoes_periodo_' + PDFUtils.slugDate() + '.pdf';
        return { blob, filename };
    }

    static gerarResumoClientes(resumo) {
        const titulo    = 'Resumo por Cliente';
        const subtitulo = resumo.length + ' cliente(s)';
        const doc       = newDoc();
        drawHeader(doc, titulo, subtitulo);
        let y = HEADER_H + 4;

        const tg = resumo.reduce((s, c) => s + parseFloat(c.valorAcumulado || 0), 0);
        const tp = resumo.reduce((s, c) => s + parseFloat(c.valorPagoTotal || 0), 0);
        const td = resumo.reduce((s, c) => s + parseFloat(c.saldoDevedor   || 0), 0);

        const impressoesAll = window.impressionManager?.impressions || [];
        const cPagoR  = impressoesAll.filter(i => { const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0); return vp >= vt && vt > 0; }).length;
        const cParcR  = impressoesAll.filter(i => { const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0); return vp > 0 && vp < vt; }).length;
        const cPendR  = impressoesAll.length - cPagoR - cParcR;

        const gap1   = 3;
        const cardW1 = (CONTENT_W - gap1 * 3) / 4;
        const cardH  = 20;

        [
            { label: 'CLIENTES',    value: String(resumo.length), color: C.accent, bg: C.accentSoft },
            { label: 'TOTAL GERAL', value: PDFUtils.fmt(tg),      color: C.green,  bg: C.greenSoft  },
            { label: 'TOTAL PAGO',  value: PDFUtils.fmt(tp),      color: C.blue,   bg: C.blueSoft   },
            { label: 'TOTAL DEV.',  value: PDFUtils.fmt(td),      color: td > 0 ? C.red : C.green, bg: td > 0 ? C.redSoft : C.greenSoft },
        ].forEach((card, idx) => {
            drawCard(doc, MARGIN + idx * (cardW1 + gap1), y, cardW1, cardH, card.label, card.value, card.color, card.bg);
        });

        y += cardH + gap1;

        // ── cards de status ──
        y = drawStatusCards(doc, y, impressoesAll);

        y = drawSectionTitle(doc, y, 'Resumo Financeiro por Cliente');
        drawTabelaResumoClientes(doc, y, resumo, titulo, subtitulo);

        applyFooters(doc, titulo, subtitulo);

        const blob     = doc.output('blob');
        const filename = 'resumo_clientes_' + PDFUtils.slugDate() + '.pdf';
        return { blob, filename };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDFCustomSelect
// ═══════════════════════════════════════════════════════════════════════════════
class PDFCustomSelect {
    constructor({ containerId, placeholder, options, onChange }) {
        this._value       = '';
        this._onChange    = onChange || (() => {});
        this._placeholder = placeholder || '— Selecione —';
        this._options     = options || [];
        this._el          = null;
        this._open        = false;
        this._render(containerId);
    }

    _render(cid) {
        const p = document.getElementById(cid);
        if (!p) return;
        this._el = document.createElement('div');
        this._el.className = 'pdf-csel-wrapper';
        this._el.innerHTML = `
            <div class="pdf-csel-trigger" tabindex="0">
                <span class="pdf-csel-text">${this._placeholder}</span>
                <i class="fas fa-chevron-down pdf-csel-arrow"></i>
            </div>
            <div class="pdf-csel-dropdown">
                <div class="pdf-csel-list"></div>
            </div>`;
        p.appendChild(this._el);
        this._triggerEl  = this._el.querySelector('.pdf-csel-trigger');
        this._dropdownEl = this._el.querySelector('.pdf-csel-dropdown');
        this._listEl     = this._el.querySelector('.pdf-csel-list');
        this._arrowEl    = this._el.querySelector('.pdf-csel-arrow');
        this._textEl     = this._el.querySelector('.pdf-csel-text');
        this._buildList();
        this._triggerEl.addEventListener('click', e => { e.stopPropagation(); this._toggle(); });
        document.addEventListener('click', e => { if (!this._el.contains(e.target)) this._closeDropdown(); });
    }

    _buildList() {
        this._listEl.innerHTML = '';
        const def = document.createElement('div');
        def.className = 'pdf-csel-option pdf-csel-option-default';
        def.textContent = this._placeholder;
        def.addEventListener('click', () => this._select('', this._placeholder, def));
        this._listEl.appendChild(def);
        if (!this._options.length) {
            const e = document.createElement('div');
            e.className = 'pdf-csel-empty';
            e.innerHTML = '<i class="fas fa-inbox"></i> Nenhuma opcao';
            this._listEl.appendChild(e);
            return;
        }
        this._options.forEach(opt => {
            const item = document.createElement('div');
            item.className = 'pdf-csel-option';
            item.textContent = opt.label;
            item.dataset.value = opt.value;
            if (opt.value === this._value) item.classList.add('selected');
            item.addEventListener('click', () => this._select(opt.value, opt.label, item));
            this._listEl.appendChild(item);
        });
    }

    _select(v, l, el) {
        this._value = v;
        this._textEl.textContent = v ? l : this._placeholder;
        this._textEl.classList.toggle('pdf-csel-text-selected', !!v);
        this._listEl.querySelectorAll('.pdf-csel-option').forEach(o => o.classList.remove('selected'));
        if (v) el.classList.add('selected');
        this._closeDropdown();
        this._onChange(v);
    }

    _toggle()        { this._open ? this._closeDropdown() : this._openDropdown(); }
    _openDropdown()  { this._open = true;  this._dropdownEl.classList.add('open');    this._triggerEl.classList.add('open');    this._arrowEl.style.transform = 'rotate(180deg)'; }
    _closeDropdown() { this._open = false; this._dropdownEl.classList.remove('open'); this._triggerEl.classList.remove('open'); this._arrowEl.style.transform = 'rotate(0deg)';   }

    reset() {
        this._value = '';
        if (this._textEl) { this._textEl.textContent = this._placeholder; this._textEl.classList.remove('pdf-csel-text-selected'); }
        this._listEl?.querySelectorAll('.pdf-csel-option').forEach(o => o.classList.remove('selected'));
        this._closeDropdown();
    }
    getValue()  { return this._value; }
    destroy()   { this._el?.remove(); this._el = null; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDFExportModal
// ═══════════════════════════════════════════════════════════════════════════════
class PDFExportModal {
    constructor() {
        this._injected     = false;
        this._tipo         = 'completo';
        this._clienteSel   = '';
        this._dataIni      = '';
        this._dataFim      = '';
        this._impressaoSel = null;
        this._selCliente   = null;
        this._selImpressao = null;
        this._inject();
        this._setupListeners();
        this._injectActionModal();
    }

    _injectActionModal() {
        if (document.getElementById('pdfActionModal')) return;

        const el = document.createElement('div');
        el.id        = 'pdfActionModal';
        el.className = 'pdf-action-modal-overlay';
        el.innerHTML = `
            <div class="pdf-action-modal">
                <div class="pdf-action-modal-header">
                    <span class="close pdf-action-x-btn" id="pdfActionXBtn"></span>
                    <div class="pdf-action-modal-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <h3 class="pdf-action-modal-title">PDF gerado com sucesso!</h3>
                    <p class="pdf-action-modal-sub" id="pdfActionFilename"></p>
                </div>
                <div class="pdf-action-modal-body">
                    <div class="pdf-action-buttons">
                        <button class="pdf-action-btn pdf-action-btn-view" id="pdfActionView">
                            <i class="fas fa-eye"></i>
                            <span>Visualizar</span>
                            <small>Abre em nova aba</small>
                        </button>
                        <button class="pdf-action-btn pdf-action-btn-download" id="pdfActionDownload">
                            <i class="fas fa-download"></i>
                            <span>Baixar</span>
                            <small>Salva no dispositivo</small>
                        </button>
                    </div>
                    <div class="pdf-action-divider"></div>
                    <button class="pdf-action-close" id="pdfActionClose">
                        <i class="fas fa-times"></i> Fechar
                    </button>
                </div>
            </div>`;
        document.body.appendChild(el);

        document.getElementById('pdfActionClose').addEventListener('click', () => {
            this._closeActionModal(); this._reopen();
        });
        document.getElementById('pdfActionXBtn').addEventListener('click', () => {
            this._closeActionModal(); this._reopen();
        });

        setTimeout(() => {
            window._modalHoldToClose?._registerModal(el);
        }, 800);
    }

    _showActionModal(blob, filename) {
        const objectUrl = URL.createObjectURL(blob);

        const sub = document.getElementById('pdfActionFilename');
        if (sub) sub.textContent = filename;

        const viewBtn = document.getElementById('pdfActionView');
        const newViewBtn = viewBtn.cloneNode(true);
        viewBtn.parentNode.replaceChild(newViewBtn, viewBtn);
        newViewBtn.addEventListener('click', () => {
            window.open(objectUrl, '_blank');
            setTimeout(() => URL.revokeObjectURL(objectUrl), 120000);
        });

        const dlBtn = document.getElementById('pdfActionDownload');
        const newDlBtn = dlBtn.cloneNode(true);
        dlBtn.parentNode.replaceChild(newDlBtn, dlBtn);
        newDlBtn.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href     = objectUrl;
            a.download = filename;
            a.click();
            setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
            this._closeActionModal();
        });

        const overlay = document.getElementById('pdfActionModal');
        overlay.classList.add('pdf-action-modal-show');
        document.body.style.overflow = 'hidden';
    }

    _closeActionModal() {
        const overlay = document.getElementById('pdfActionModal');
        overlay.classList.remove('pdf-action-modal-show');
        document.body.style.overflow = '';
    }

    _inject() {
        if (this._injected) return;
        this._injected = true;
        const el = document.createElement('div');
        el.id = 'pdfExportModal';
        el.className = 'modal pdf-export-modal-overlay';
        el.innerHTML = `<div class="modal-content pdf-export-modal-content">
            <div class="modal-header pdf-export-header">
                <div class="pdf-export-header-left">
                    <div class="pdf-export-header-icon"><i class="fas fa-file-pdf"></i></div>
                    <div><h3>Exportar PDF</h3><p class="pdf-export-subtitle">Escolha o tipo de exportacao</p></div>
                </div>
                <span class="close" id="pdfExportClose"></span>
            </div>
            <div class="pdf-export-body">
                <div class="pdf-export-left">
                    <div class="pdf-export-section-label"><i class="fas fa-layer-group"></i> Tipo de Exportacao</div>
                    <div class="pdf-type-grid" id="pdfTypeGrid">
                        <button class="pdf-type-card pdf-type-card-featured active" data-tipo="completo">
                            <div class="pdf-type-icon" style="background:linear-gradient(135deg,#ef4444,#dc2626)"><i class="fas fa-file-invoice"></i></div>
                            <div class="pdf-type-info"><span class="pdf-type-name">Relatorio Completo</span><span class="pdf-type-desc">Cards + graficos + tabela</span></div>
                        </button>
                        <button class="pdf-type-card" data-tipo="unica">
                            <div class="pdf-type-icon" style="background:linear-gradient(135deg,#3b82f6,#2563eb)"><i class="fas fa-file-alt"></i></div>
                            <div class="pdf-type-info"><span class="pdf-type-name">Impressao Especifica</span><span class="pdf-type-desc">Comprovante de uma impressao</span></div>
                        </button>
                        <button class="pdf-type-card" data-tipo="cliente">
                            <div class="pdf-type-icon" style="background:linear-gradient(135deg,#10b981,#059669)"><i class="fas fa-user"></i></div>
                            <div class="pdf-type-info"><span class="pdf-type-name">Por Cliente</span><span class="pdf-type-desc">Impressoes de um cliente</span></div>
                        </button>
                        <button class="pdf-type-card" data-tipo="periodo">
                            <div class="pdf-type-icon" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed)"><i class="fas fa-calendar-alt"></i></div>
                            <div class="pdf-type-info"><span class="pdf-type-name">Por Periodo</span><span class="pdf-type-desc">Filtrado por data</span></div>
                        </button>
                        <button class="pdf-type-card" data-tipo="resumo">
                            <div class="pdf-type-icon" style="background:linear-gradient(135deg,#f59e0b,#b45309)"><i class="fas fa-chart-pie"></i></div>
                            <div class="pdf-type-info"><span class="pdf-type-name">Resumo por Cliente</span><span class="pdf-type-desc">Financeiro consolidado</span></div>
                        </button>
                    </div>
                </div>
                <div class="pdf-export-right">
                    <div class="pdf-export-section-label"><i class="fas fa-sliders-h"></i> Configuracoes</div>
                    <div id="pdfConfigPanel" class="pdf-config-panel"></div>
                    <div class="pdf-export-section-label" style="margin-top:12px"><i class="fas fa-eye"></i> Pre-visualizacao</div>
                    <div id="pdfPreviewBox" class="pdf-preview-box"><div class="pdf-preview-loading"><i class="fas fa-file-pdf"></i><span>Selecione o tipo</span></div></div>
                    <button id="pdfGenerateBtn" class="pdf-generate-btn"><i class="fas fa-cog"></i><span>Gerar PDF</span></button>
                </div>
            </div>
        </div>`;
        document.body.appendChild(el);

        setTimeout(() => {
            window._modalHoldToClose?._registerModal(el);
        }, 800);
    }

    _setupListeners() {
        document.addEventListener('click', e => {
            // ── BOTÃO PDF ──
            if (e.target.id === 'openPdfExportBtn' || e.target.closest('#openPdfExportBtn')) {
                this.open();
                return;
            }

            if (e.target.id === 'pdfExportClose' || e.target.closest('#pdfExportClose')) { this.close(); return; }
            const tc = e.target.closest('.pdf-type-card');
            if (tc && document.getElementById('pdfExportModal')?.style.display === 'block') { this._selectTipo(tc.dataset.tipo); return; }
            if (e.target.id === 'pdfGenerateBtn' || e.target.closest('#pdfGenerateBtn')) this._generate();
        });
        document.getElementById('pdfExportModal')?.addEventListener('click', e => {
            // NÃO fecha ao clicar fora — o fechamento é via ESC, X ou segurar mouse
        });
    }

    open() {
        this._destroySelects();
        this._clienteSel = ''; this._impressaoSel = null; this._dataIni = ''; this._dataFim = '';
        this._selectTipo('completo');
        document.getElementById('pdfExportModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    _reopen() {
        const tipoAtual = this._tipo || 'completo';
        this._destroySelects();
        document.querySelectorAll('.pdf-type-card').forEach(c => c.classList.toggle('active', c.dataset.tipo === tipoAtual));
        this._renderConfig(tipoAtual);
        this._renderPreview(tipoAtual);
        document.getElementById('pdfExportModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    close() {
        document.getElementById('pdfExportModal').style.display = 'none';
        document.body.style.overflow = '';
        this._destroySelects();
        this._tipo = 'completo'; this._clienteSel = ''; this._dataIni = ''; this._dataFim = ''; this._impressaoSel = null;
    }

    _destroySelects() {
        if (this._selCliente)   { this._selCliente.destroy();   this._selCliente   = null; }
        if (this._selImpressao) { this._selImpressao.destroy(); this._selImpressao = null; }
    }

    _selectTipo(tipo) {
        this._destroySelects();
        this._clienteSel = ''; this._impressaoSel = null; this._tipo = tipo;
        document.querySelectorAll('.pdf-type-card').forEach(c => c.classList.toggle('active', c.dataset.tipo === tipo));
        this._renderConfig(tipo);
        this._renderPreview(tipo);
    }

    _renderConfig(tipo) {
        const panel = document.getElementById('pdfConfigPanel');
        if (!panel) return;
        panel.innerHTML = '';
        const impressoes = window.impressionManager?.impressions || [];

        if (tipo === 'completo' || tipo === 'resumo') {
            panel.innerHTML = `<div class="pdf-config-info"><i class="fas fa-info-circle"></i><span>${tipo === 'completo' ? 'Relatorio completo com cards, graficos e tabela.' : 'Resumo financeiro por cliente.'}</span></div>`;
            return;
        }
        if (tipo === 'unica') {
            panel.innerHTML = '<div class="pdf-config-group"><label class="pdf-config-label">Selecione a impressao:</label><div id="pdfCselImpressaoContainer"></div></div>';
            this._selImpressao = new PDFCustomSelect({
                containerId: 'pdfCselImpressaoContainer',
                placeholder: '— Escolha uma impressao —',
                options: impressoes.map(i => ({
                    value: i.id,
                    label: i.cliente + ' — ' + PDFUtils.fmt(i.valorTotal) + ' — ' + PDFUtils.statusLabel(i) + ' — ' + PDFUtils.fmtDateShort(i.dataHora)
                })),
                onChange: val => { this._impressaoSel = val; this._renderPreview(tipo); }
            });
            return;
        }
        if (tipo === 'cliente') {
            panel.innerHTML = '<div class="pdf-config-group"><label class="pdf-config-label">Selecione o cliente:</label><div id="pdfCselClienteContainer"></div></div>';
            const clientes = [...new Set(impressoes.map(i => i.cliente).filter(Boolean))].sort();
            this._selCliente = new PDFCustomSelect({
                containerId: 'pdfCselClienteContainer',
                placeholder: '— Escolha um cliente —',
                options: clientes.map(c => ({ value: c, label: c })),
                onChange: val => { this._clienteSel = val; this._renderPreview(tipo); }
            });
            return;
        }
        if (tipo === 'periodo') {
            const fd = iso => { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
            panel.innerHTML = `<div class="pdf-periodo-row">
                <div class="pdf-config-group">
                    <label class="pdf-config-label">Data inicio:</label>
                    <div class="pdf-dp-input-wrapper">
                        <input type="text" id="pdfDataIniDisplay" class="pdf-dp-text-input" placeholder="dd/mm/aaaa" readonly value="${fd(this._dataIni)}">
                        <i class="fas fa-calendar-alt pdf-dp-input-icon"></i>
                    </div>
                </div>
                <div class="pdf-config-group">
                    <label class="pdf-config-label">Data fim:</label>
                    <div class="pdf-dp-input-wrapper">
                        <input type="text" id="pdfDataFimDisplay" class="pdf-dp-text-input" placeholder="dd/mm/aaaa" readonly value="${fd(this._dataFim)}">
                        <i class="fas fa-calendar-alt pdf-dp-input-icon"></i>
                    </div>
                </div>
            </div>`;
            setTimeout(() => {
                const ie = document.getElementById('pdfDataIniDisplay');
                const fe = document.getElementById('pdfDataFimDisplay');
                const op = (el, isIni) => window.openDateOnlyPicker?.(el, iso => {
                    if (isIni) window.pdfExportModal._dataIni = iso;
                    else       window.pdfExportModal._dataFim = iso;
                    window.pdfExportModal._renderPreview('periodo');
                }, 19999, 'theme-red');
                ie?.addEventListener('click',  () => op(ie, true));
                fe?.addEventListener('click',  () => op(fe, false));
                ie?.addEventListener('focus',  () => { ie.blur(); op(ie, true);  });
                fe?.addEventListener('focus',  () => { fe.blur(); op(fe, false); });
            }, 50);
        }
    }

    _renderPreview(tipo) {
        const box = document.getElementById('pdfPreviewBox');
        if (!box) return;
        const impressoes = window.impressionManager?.impressions || [];
        let lista = [], tituloDoc = '', stats = [], aviso = '';
        const mk = (s, v, c) => ({ label: s, value: v, color: c });

        if (tipo === 'completo') {
            lista = impressoes; tituloDoc = 'Relatorio Completo';
            const tv = lista.reduce((s, i) => s + parseFloat(i.valorTotal || 0), 0);
            const tp = lista.reduce((s, i) => s + parseFloat(i.valorPago  || 0), 0);
            const cl = [...new Set(impressoes.map(i => i.cliente).filter(Boolean))];
            const cP  = lista.filter(i => { const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0); return vp >= vt && vt > 0; }).length;
            const cPa = lista.filter(i => { const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0); return vp > 0 && vp < vt; }).length;
            const cPe = lista.length - cP - cPa;
            stats = [mk('Impressoes', String(lista.length), '#6366f1'), mk('Clientes', String(cl.length), '#3b82f6'), mk('Total', PDFUtils.fmt(tv), '#22c55e'), mk('Pago', PDFUtils.fmt(tp), '#3b82f6'), mk('Saldo', PDFUtils.fmt(Math.max(0, tv - tp)), '#ef4444'), mk('Pag. Tudo', String(cP), '#22c55e'), mk('Parciais', String(cPa), '#eab308'), mk('Pendentes', String(cPe), '#ef4444')];
        } else if (tipo === 'unica') {
            const imp = impressoes.find(i => i.id === this._impressaoSel);
            if (!imp) { aviso = 'Selecione uma impressao.'; }
            else {
                tituloDoc = 'Comprovante — ' + imp.cliente; lista = [imp];
                const vt = parseFloat(imp.valorTotal || 0), vp = parseFloat(imp.valorPago || 0);
                stats = [mk('Cliente', imp.cliente, '#6366f1'), mk('Valor', PDFUtils.fmt(vt), '#22c55e'), mk('Pago', PDFUtils.fmt(vp), '#3b82f6'), mk('Status', PDFUtils.statusLabel(imp), 'rgb(' + PDFUtils.statusColor(imp).join(',') + ')')];
            }
        } else if (tipo === 'cliente') {
            if (!this._clienteSel) { aviso = 'Selecione um cliente.'; }
            else {
                lista = impressoes.filter(i => i.cliente === this._clienteSel); tituloDoc = 'Historico — ' + this._clienteSel;
                const tv = lista.reduce((s, i) => s + parseFloat(i.valorTotal || 0), 0);
                const tp = lista.reduce((s, i) => s + parseFloat(i.valorPago  || 0), 0);
                const cP  = lista.filter(i => { const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0); return vp >= vt && vt > 0; }).length;
                const cPa = lista.filter(i => { const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0); return vp > 0 && vp < vt; }).length;
                const cPe = lista.length - cP - cPa;
                stats = [mk('Registros', String(lista.length), '#6366f1'), mk('Total', PDFUtils.fmt(tv), '#22c55e'), mk('Pago', PDFUtils.fmt(tp), '#3b82f6'), mk('Saldo', PDFUtils.fmt(Math.max(0, tv - tp)), '#ef4444'), mk('Pag. Tudo', String(cP), '#22c55e'), mk('Parciais', String(cPa), '#eab308'), mk('Pendentes', String(cPe), '#ef4444')];
            }
        } else if (tipo === 'periodo') {
            lista = impressoes.filter(i => {
                const d = (i.dataHora || '').slice(0, 10);
                if (this._dataIni && d < this._dataIni) return false;
                if (this._dataFim && d > this._dataFim) return false;
                return true;
            });
            tituloDoc = 'Relatorio por Periodo';
            if (!this._dataIni && !this._dataFim) aviso = 'Selecione as datas.';
            const tv = lista.reduce((s, i) => s + parseFloat(i.valorTotal || 0), 0);
            const tp = lista.reduce((s, i) => s + parseFloat(i.valorPago  || 0), 0);
            const cP  = lista.filter(i => { const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0); return vp >= vt && vt > 0; }).length;
            const cPa = lista.filter(i => { const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0); return vp > 0 && vp < vt; }).length;
            const cPe = lista.length - cP - cPa;
            stats = [mk('Registros', String(lista.length), '#eab308'), mk('Total', PDFUtils.fmt(tv), '#22c55e'), mk('Pago', PDFUtils.fmt(tp), '#3b82f6'), mk('Saldo', PDFUtils.fmt(Math.max(0, tv - tp)), '#ef4444'), mk('Pag. Tudo', String(cP), '#22c55e'), mk('Parciais', String(cPa), '#eab308'), mk('Pendentes', String(cPe), '#ef4444')];
        } else if (tipo === 'resumo') {
            lista = impressoes; tituloDoc = 'Resumo por Cliente';
            const cl = [...new Set(impressoes.map(i => i.cliente).filter(Boolean))];
            const tv = lista.reduce((s, i) => s + parseFloat(i.valorTotal || 0), 0);
            const tp = lista.reduce((s, i) => s + parseFloat(i.valorPago  || 0), 0);
            const cP  = lista.filter(i => { const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0); return vp >= vt && vt > 0; }).length;
            const cPa = lista.filter(i => { const vp = parseFloat(i.valorPago || 0), vt = parseFloat(i.valorTotal || 0); return vp > 0 && vp < vt; }).length;
            const cPe = lista.length - cP - cPa;
            stats = [mk('Clientes', String(cl.length), '#6366f1'), mk('Total', PDFUtils.fmt(tv), '#22c55e'), mk('Pago', PDFUtils.fmt(tp), '#3b82f6'), mk('Saldo', PDFUtils.fmt(Math.max(0, tv - tp)), '#ef4444'), mk('Pag. Tudo', String(cP), '#22c55e'), mk('Parciais', String(cPa), '#eab308'), mk('Pendentes', String(cPe), '#ef4444')];
        }

        if (aviso) {
            box.innerHTML = `<div class="pdf-preview-loading"><i class="fas fa-info-circle" style="color:#6366f1"></i><span>${aviso}</span></div>`;
            return;
        }

        const mr = imp => {
            const status = PDFUtils.statusLabel(imp);
            const cor = status === 'Pago' ? '#22c55e' : status === 'Parcial' ? '#eab308' : '#ef4444';
            return `<div class="pdf-preview-table-row">
                <span class="pprow-client">${imp.cliente || '—'}</span>
                <span class="pprow-val">${PDFUtils.fmt(imp.valorTotal)}</span>
                <span class="pprow-status" style="color:${cor}">${status}</span>
            </div>`;
        };

        const VISIBLE = 3, vis = lista.slice(0, VISIBLE), rest = lista.slice(VISIBLE), temMais = rest.length > 0;
        box.innerHTML = `<div class="pdf-preview-inner">
            <div class="pdf-preview-doc-header">
                <div class="pdf-preview-doc-icon"><i class="fas fa-file-pdf"></i></div>
                <div>
                    <div class="pdf-preview-doc-title">${tituloDoc}</div>
                    <div class="pdf-preview-doc-sub">A4 Retrato &middot; ${PDFUtils.now()}</div>
                </div>
            </div>
            <div class="pdf-preview-stats">
                ${stats.map(s => `<div class="pdf-preview-stat" style="border-left:3px solid ${s.color}">
                    <span class="pdf-preview-stat-label">${s.label}</span>
                    <span class="pdf-preview-stat-value" style="color:${s.color}">${s.value}</span>
                </div>`).join('')}
            </div>
            ${lista.length > 0 ? `<div class="pdf-preview-table-mock">
                <div class="pdf-preview-table-header"><span>PREVIA</span><span>${lista.length} linha(s)</span></div>
                ${vis.map(mr).join('')}
                ${temMais ? `<div class="pdf-preview-expand-rows" id="pdfExpandRows" style="display:none">
                    <div class="pdf-preview-expand-scroll">${rest.map(mr).join('')}</div>
                </div>
                <button class="pdf-preview-more-btn" id="pdfExpandBtn">
                    <i class="fas fa-chevron-down pdf-expand-icon"></i><span class="pdf-expand-label">+ ${rest.length} mais</span>
                </button>` : ''}
            </div>` : ''}
        </div>`;

        if (temMais) {
            const btn   = box.querySelector('#pdfExpandBtn');
            const rows  = box.querySelector('#pdfExpandRows');
            const icon  = box.querySelector('.pdf-expand-icon');
            const label = box.querySelector('.pdf-expand-label');
            let exp = false;
            btn.addEventListener('click', () => {
                exp = !exp;
                rows.style.display        = exp ? 'block' : 'none';
                icon.style.transform      = exp ? 'rotate(180deg)' : 'rotate(0deg)';
                label.textContent         = exp ? 'Recolher' : '+ ' + rest.length + ' mais';
            });
        }
    }

    async _generate() {
        if (!window.jspdf) { window.modernAlert?.error('jsPDF nao carregado.'); return; }

        const btn = document.getElementById('pdfGenerateBtn');
        if (btn) { btn.dataset.generating = 'true'; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Gerando...</span>'; }

        try {
            const impressoes = window.impressionManager?.impressions || [];
            const tipo       = this._tipo;
            let result       = null;

            if (tipo === 'completo') {
                if (!impressoes.length) { window.modernAlert?.warning('Nenhuma impressao.'); return; }
                const resumo = await window.supabaseManager?.loadClientsSummary() || [];
                result = await PDFGenerator.gerarRelatorioCompleto(impressoes, resumo);

            } else if (tipo === 'unica') {
                const imp = impressoes.find(i => i.id === this._impressaoSel);
                if (!imp) { window.modernAlert?.error('Selecione uma impressao.'); return; }
                result = PDFGenerator.gerarImpressaoUnica(imp);

            } else if (tipo === 'cliente') {
                if (!this._clienteSel) { window.modernAlert?.error('Selecione um cliente.'); return; }
                const lista = impressoes.filter(i => i.cliente === this._clienteSel);
                if (!lista.length) { window.modernAlert?.warning('Nenhuma impressao.'); return; }
                result = PDFGenerator.gerarPorCliente(lista, this._clienteSel);

            } else if (tipo === 'periodo') {
                const lista = impressoes.filter(i => {
                    const d = (i.dataHora || '').slice(0, 10);
                    if (this._dataIni && d < this._dataIni) return false;
                    if (this._dataFim && d > this._dataFim) return false;
                    return true;
                });
                if (!lista.length) { window.modernAlert?.warning('Nenhuma impressao no periodo.'); return; }
                result = PDFGenerator.gerarPorPeriodo(lista, this._dataIni, this._dataFim);

            } else if (tipo === 'resumo') {
                const resumo = await window.supabaseManager?.loadClientsSummary() || [];
                if (!resumo.length) { window.modernAlert?.warning('Nenhum cliente.'); return; }
                result = PDFGenerator.gerarResumoClientes(resumo);
            }

            if (result) {
                this._showActionModal(result.blob, result.filename);
            }

        } catch (err) {
            console.error('[PDF]', err);
            window.modernAlert?.error('Erro: ' + err.message);
        } finally {
            if (btn) { btn.dataset.generating = ''; btn.innerHTML = '<i class="fas fa-cog"></i> <span>Gerar PDF</span>'; }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Inicialização
// ═══════════════════════════════════════════════════════════════════════════════
let pdfExportModal = null;
function initPDFExport() {
    if (!window.jspdf) { setTimeout(initPDFExport, 1000); return; }
    pdfExportModal        = new PDFExportModal();
    window.pdfExportModal = pdfExportModal;
    console.log('[PDF] Sistema iniciado');
}
document.addEventListener('DOMContentLoaded', () => setTimeout(initPDFExport, 800));