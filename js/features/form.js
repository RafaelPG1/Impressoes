// ============================================================================
// form.js — formulário "Nova impressão": cálculo ao vivo, validação, rascunho
// ============================================================================

import { state, on } from '../state.js';
import { addImpression, tipoPrecoLabel } from '../actions.js';
import { notify } from '../ui/feedback.js';
import { calcTotal, money, esc } from '../utils/format.js';

const $ = (id) => document.getElementById(id);
const DRAFT_KEY = 'impressaoForm_autoSave';
const DRAFT_TTL = 24 * 60 * 60 * 1000;
const HAS_LETTER = /[a-zA-ZÀ-ÿ]/;

const el = {};

const selectedTipo = () => document.querySelector('input[name="tipoImpressao"]:checked')?.value || '';

function readForm() {
    return {
        nome:          el.nome.value.trim(),
        tipo:          parseInt(selectedTipo(), 10) || 0,
        folhasNormais: parseInt(el.normais.value, 10) || 0,
        folhasOffset:  parseInt(el.offset.value, 10)  || 0,
        projetoCanva:  parseFloat(el.canva.value)     || 0,
        trabalho:      parseFloat(el.trabalho.value)  || 0,
    };
}

function renderTotal() {
    const d = readForm();
    const { total, items } = calcTotal(
        { tipo: d.tipo, folhasNormais: d.folhasNormais, folhasOffset: d.folhasOffset, projetoCanva: d.projetoCanva, trabalho: d.trabalho },
        state.prices, state.offsetPrice,
    );
    el.total.textContent = money(total);
    el.breakdown.innerHTML = items.map((i) => `<li><span>${esc(i.label)}</span><span>${money(i.value)}</span></li>`).join('');
    return total;
}

function validateName(show = true) {
    const nome = el.nome.value.trim();
    const bad = nome !== '' && !HAS_LETTER.test(nome);
    if (show) {
        el.nomeError.textContent = bad ? 'O nome precisa ter pelo menos uma letra.' : '';
        el.nome.classList.toggle('is-invalid', bad);
    }
    return !bad;
}

function validateOffset() {
    const n = parseInt(el.normais.value, 10) || 0;
    const o = parseInt(el.offset.value, 10)  || 0;
    const bad = o > n;
    el.offsetError.textContent = bad ? 'As folhas offset não podem passar do total de folhas.' : '';
    el.offset.classList.toggle('is-invalid', bad);
    return !bad;
}

// ── Rascunho (localStorage) ──────────────────────────────────────────────────

function saveDraft() {
    try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
            nome: el.nome.value, tipo: selectedTipo(), normais: el.normais.value, offset: el.offset.value,
            canva: el.canva.value, trabalho: el.trabalho.value, ts: Date.now(),
        }));
    } catch { /* armazenamento indisponível: ignora */ }
}

function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignora */ }
}

function loadDraft() {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        const d = JSON.parse(raw);
        if (!d.ts || Date.now() - d.ts > DRAFT_TTL) { clearDraft(); return; }
        const clean = (v) => (v == null || v === 'null' || v === 'undefined' || v === 'NaN') ? '' : String(v);
        el.nome.value = clean(d.nome);
        el.normais.value = clean(d.normais);
        el.offset.value = clean(d.offset);
        el.canva.value = clean(d.canva);
        el.trabalho.value = clean(d.trabalho);
        const radio = document.querySelector(`input[name="tipoImpressao"][value="${CSS.escape(clean(d.tipo))}"]`);
        if (radio) radio.checked = true;
    } catch { clearDraft(); }
}

export function clearForm() {
    el.form.reset();
    el.nomeError.textContent = '';
    el.offsetError.textContent = '';
    el.nome.classList.remove('is-invalid');
    el.offset.classList.remove('is-invalid');
    el.tipoField.classList.remove('is-invalid');
    clearDraft();
    renderTotal();
}

async function submit(e) {
    e.preventDefault();
    const d = readForm();

    if (!d.nome)                { notify.warning('Digite o nome do cliente.'); el.nome.focus(); return; }
    if (!validateName())        { el.nome.focus(); return; }
    if (!d.tipo)                { el.tipoField.classList.add('is-invalid'); notify.warning('Escolha o tipo de impressão.'); return; }
    if (!d.folhasNormais && !d.folhasOffset && !d.projetoCanva && !d.trabalho) {
        notify.warning('Informe pelo menos folhas, projeto Canva ou trabalho extra.'); el.normais.focus(); return;
    }
    if (d.folhasNormais < 0 || d.folhasOffset < 0 || d.projetoCanva < 0 || d.trabalho < 0) {
        notify.warning('Os valores não podem ser negativos.'); return;
    }
    if (!validateOffset())      { el.offset.focus(); return; }

    const valorTotal = renderTotal();
    el.submit.disabled = true;
    const ok = await addImpression({
        cliente: d.nome, tipoImpressao: d.tipo, tipoPreco: tipoPrecoLabel(d.tipo),
        folhasNormais: d.folhasNormais, folhasOffset: d.folhasOffset,
        projetoCanva: d.projetoCanva, trabalho: d.trabalho,
        valorTotal, valorPago: 0, statusPagamento: 'pendente',
        dataHora: new Date().toISOString(), timestamp: Date.now(),
    });
    el.submit.disabled = false;
    if (ok) { clearForm(); el.nome.focus(); }
}

export function initForm() {
    Object.assign(el, {
        form: $('impressaoForm'), nome: $('nomeCliente'), nomeError: $('nomeClienteError'),
        normais: $('folhasNormais'), offset: $('folhasOffset'), offsetError: $('folhasOffsetError'),
        canva: $('projetoCanva'), trabalho: $('trabalho'), total: $('valorTotal'),
        breakdown: $('totalBreakdown'), submit: $('submitBtn'), tipoField: document.querySelector('.type-field'),
    });

    loadDraft();
    renderTotal();

    el.form.addEventListener('submit', submit);
    $('clearFormBtn').addEventListener('click', () => { clearForm(); el.nome.focus(); });

    el.form.addEventListener('input', (e) => {
        if (e.target === el.nome) validateName();
        if (e.target === el.normais || e.target === el.offset) validateOffset();
        renderTotal();
        saveDraft();
    });
    el.form.addEventListener('change', (e) => {
        if (e.target.name === 'tipoImpressao') el.tipoField.classList.remove('is-invalid');
        renderTotal();
        saveDraft();
    });
    el.form.addEventListener('wheel', (e) => { if (e.target.type === 'number') e.target.blur(); }, { passive: true });

    on('prices', renderTotal);
}
