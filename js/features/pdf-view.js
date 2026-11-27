// ============================================================================
// pdf-view.js — aba "Relatórios em PDF": escolha, prévia, geração
// ============================================================================

import { state, on } from '../state.js';
import { PDFGenerator, PDFUtils } from '../services/pdf-reports.js';
import { icon } from '../ui/icons.js';
import { notify } from '../ui/feedback.js';
import { money, esc, fmtDate, localDateKey, statusOf, STATUS_LABEL, buildSummary, byName, totals } from '../utils/format.js';

const $ = (id) => document.getElementById(id);

let sel = { impressaoId: '', cliente: '', inicio: '', fim: '' };
let lastUrl = null;

const tipo = () => document.querySelector('input[name="pdfTipo"]:checked').value;

function inPeriod(i) {
    const d = localDateKey(i.dataHora);
    return !(sel.inicio && d < sel.inicio) && !(sel.fim && d > sel.fim);
}

/** Impressões e título para o tipo atual; null em `lista` = falta escolher algo. */
function scope() {
    const all = state.impressions;
    switch (tipo()) {
        case 'completo': return { titulo: 'Relatório completo', lista: all };
        case 'resumo':   return { titulo: 'Resumo por cliente', lista: all };
        case 'unica': {
            const imp = all.find((i) => i.id === sel.impressaoId);
            return { titulo: imp ? `Comprovante — ${imp.cliente}` : 'Comprovante', lista: imp ? [imp] : null, aviso: 'Escolha uma impressão.' };
        }
        case 'cliente':
            return { titulo: sel.cliente ? `Histórico — ${sel.cliente}` : 'Por cliente', lista: sel.cliente ? all.filter((i) => i.cliente === sel.cliente) : null, aviso: 'Escolha um cliente.' };
        case 'periodo':
            return { titulo: 'Relatório por período', lista: sel.inicio || sel.fim ? all.filter(inPeriod) : null, aviso: 'Escolha a data inicial, a final ou as duas.' };
    }
}

const TIPO_SUB = {
    completo: 'Confira um resumo geral do seu negócio',
    resumo:   'Total, pago e saldo de cada cliente',
    cliente:  'Todas as impressões de uma pessoa',
    periodo:  'Impressões filtradas por data',
    unica:    'Comprovante de uma impressão específica',
};

function renderConfig() {
    const box = $('pdfConfigPanel');
    const all = state.impressions;
    const t = tipo();

    $('pdfTypeTitle').textContent = document.querySelector('input[name="pdfTipo"]:checked + .pdf-type-ico + .pdf-type-text strong').textContent;
    $('pdfTypeSub').textContent = TIPO_SUB[t];

    if (t === 'completo' || t === 'resumo') {
        box.innerHTML = '';
    } else if (t === 'unica') {
        box.innerHTML = `<div class="field"><label for="pdfImpressao">Impressão</label>
            <select id="pdfImpressao"><option value="">Escolha uma impressão</option>${
                [...all].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora)).map((i) =>
                    `<option value="${esc(i.id)}">${esc(i.cliente)} — ${money(i.valorTotal)} — ${STATUS_LABEL[statusOf(i)]} — ${fmtDate(i.dataHora)}</option>`).join('')
            }</select></div>`;
    } else if (t === 'cliente') {
        const nomes = [...new Set(all.map((i) => i.cliente).filter(Boolean))].sort(byName);
        box.innerHTML = `<div class="field"><label for="pdfCliente">Cliente</label>
            <select id="pdfCliente"><option value="">Escolha um cliente</option>${nomes.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join('')}</select></div>`;
    } else if (t === 'periodo') {
        box.innerHTML = `<div class="field-row">
            <div class="field"><label for="pdfInicio">De</label><input type="date" id="pdfInicio" value="${esc(sel.inicio)}"></div>
            <div class="field"><label for="pdfFim">Até</label><input type="date" id="pdfFim" value="${esc(sel.fim)}"></div></div>`;
    }
}

function renderPreview() {
    const box = $('pdfPreviewBox');
    const { titulo, lista, aviso } = scope();

    if (lista === null) { box.innerHTML = `<p class="pdf-preview-note">${esc(aviso)}</p>`; return; }
    if (!lista.length)  { box.innerHTML = `<p class="pdf-preview-note">Nenhuma impressão para este relatório.</p>`; return; }

    const t = totals(lista);
    const clientes = new Set(lista.map((i) => i.cliente)).size;
    const stat = (ico, k, v) => `<div>${icon(ico, 24)}<dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`;

    box.innerHTML = `
        <dl class="pdf-stats">
            ${stat('printer', 'Impressões', lista.length)}${stat('users', 'Clientes', clientes)}
            ${stat('circle-dollar-sign', 'Total', money(t.total))}${stat('wallet', 'Pago', money(t.pago))}
        </dl>
        <section class="pdf-fin" aria-label="${esc(titulo)}">
            <h4>${icon('trending-up', 20)}Resumo financeiro</h4>
            <dl class="pdf-fin-body"><div><dt>Em aberto</dt><dd class="${t.aberto > 0 ? 'is-open' : ''}">${money(t.aberto)}</dd></div><div><dt>Recebido</dt><dd>${money(t.pago)}</dd></div></dl>
            <ul class="pdf-rows">${lista.slice(0, 50).map((i) => `
                <li><span>${esc(i.cliente)}</span><span>${money(i.valorTotal)}</span><span class="chip chip-${statusOf(i)}">${STATUS_LABEL[statusOf(i)]}</span></li>`).join('')}
            </ul>
            ${lista.length > 50 ? `<p class="pdf-more">+ ${lista.length - 50} no PDF final.</p>` : ''}
        </section>`;
}

function refreshPanel() { renderConfig(); renderPreview(); }

function showBuilder(show) {
    $('pdfBuilder').hidden = !show;
    $('pdfFoot').hidden = !show;
    $('pdfResult').hidden = show;
    $('pdfResultFoot').hidden = show;
}

const visivel = () => location.hash.replace(/^#\/?/, '') === 'relatorios';

/** Ao entrar na aba: começa limpo, com os dados mais recentes. */
function entrar() {
    sel = { impressaoId: '', cliente: '', inicio: '', fim: '' };
    document.querySelector('input[name="pdfTipo"][value="completo"]').checked = true;
    showBuilder(true);
    refreshPanel();
}

async function generate() {
    if (!window.jspdf?.jsPDF) { notify.error('A biblioteca de PDF não carregou. Recarregue a página.'); return; }

    const { lista, aviso } = scope();
    if (lista === null) { notify.warning(aviso); return; }
    if (!lista.length)  { notify.warning('Nenhuma impressão para este relatório.'); return; }

    const btn = $('pdfGenerateBtn');
    btn.disabled = true;
    const label = btn.lastChild;
    const original = label.textContent;
    label.textContent = 'Gerando…';

    try {
        const t = tipo();
        const resumo = buildSummary(state.impressions);
        let result;
        if (t === 'completo')      result = await PDFGenerator.gerarRelatorioCompleto(lista, resumo);
        else if (t === 'unica')    result = PDFGenerator.gerarImpressaoUnica(lista[0]);
        else if (t === 'cliente')  result = PDFGenerator.gerarPorCliente(lista, sel.cliente);
        else if (t === 'periodo')  result = PDFGenerator.gerarPorPeriodo(lista, sel.inicio, sel.fim);
        else                       result = PDFGenerator.gerarResumoClientes(resumo, state.impressions);

        if (lastUrl) URL.revokeObjectURL(lastUrl);
        lastUrl = URL.createObjectURL(result.blob);
        $('pdfActionFilename').textContent = result.filename;
        $('pdfActionDownload').dataset.filename = result.filename;
        showBuilder(false);
    } catch (err) {
        console.error('[PDF] erro:', err);
        notify.error('Erro ao gerar o PDF: ' + err.message);
    } finally {
        btn.disabled = false;
        label.textContent = original;
    }
}

export function initPdf() {
    window.addEventListener('hashchange', () => { if (visivel()) entrar(); });
    on('data', () => { if (visivel() && !$('pdfBuilder').hidden) refreshPanel(); });
    if (visivel()) entrar();

    $('view-relatorios').addEventListener('change', (e) => {
        const t = e.target;
        if (t.name === 'pdfTipo') { sel = { impressaoId: '', cliente: '', inicio: '', fim: '' }; refreshPanel(); return; }
        if (t.id === 'pdfImpressao') sel.impressaoId = t.value;
        if (t.id === 'pdfCliente')   sel.cliente = t.value;
        if (t.id === 'pdfInicio')    sel.inicio = t.value;
        if (t.id === 'pdfFim')       sel.fim = t.value;
        renderPreview();
    });

    $('pdfGenerateBtn').addEventListener('click', generate);
    $('pdfBackBtn').addEventListener('click', () => showBuilder(true));
    $('pdfActionView').addEventListener('click', () => window.open(lastUrl, '_blank', 'noopener'));
    $('pdfActionDownload').addEventListener('click', (e) => {
        const a = document.createElement('a');
        a.href = lastUrl;
        a.download = e.currentTarget.dataset.filename || 'relatorio.pdf';
        a.click();
    });
}
