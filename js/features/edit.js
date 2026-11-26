// ============================================================================
// edit.js — diálogos "Valor avulso" (nova) e "Editar impressão"
// ============================================================================

import { state, on } from '../state.js';
import { addImpression, updateImpression } from '../actions.js';
import { openDialog, closeDialog } from '../ui/dialog.js';
import { TIPO_NOMES } from '../config.js';
import {
    calcTotal, money, esc, round2, datetimeLocalToISO, isoToDatetimeLocal, nowDatetimeLocal,
} from '../utils/format.js';

const $ = (id) => document.getElementById(id);
const HAS_LETTER = /[a-zA-ZÀ-ÿ]/;

// ── Valor avulso ─────────────────────────────────────────────────────────────

export function openAdd() {
    $('addForm').reset();
    $('addDataHora').value = nowDatetimeLocal();
    $('addError').textContent = '';
    openDialog($('dlgAdd'));
    $('addCliente').focus();
}

async function submitAdd(e) {
    e.preventDefault();
    const nome  = $('addCliente').value.trim();
    const valor = parseFloat($('addValorTotal').value);
    const data  = $('addDataHora').value;

    let erro = '';
    if (!nome || !HAS_LETTER.test(nome)) erro = 'Digite o nome do cliente (com pelo menos uma letra).';
    else if (!Number.isFinite(valor) || valor <= 0) erro = 'Informe um valor maior que zero.';
    else if (!data) erro = 'Informe a data e a hora.';
    $('addError').textContent = erro;
    if (erro) return;

    closeDialog($('dlgAdd'));
    await addImpression({
        cliente: nome, tipoImpressao: 0, tipoPreco: 'Desconhecido',
        folhasNormais: 0, folhasOffset: 0, projetoCanva: 0, trabalho: 0,
        valorTotal: round2(valor), valorPago: 0, statusPagamento: 'pendente',
        dataHora: datetimeLocalToISO(data), timestamp: Date.now(),
    });
}

// ── Edição ───────────────────────────────────────────────────────────────────

let editingId = null;
let isManual = false;   // impressão registrada só com valor total

const ed = {};

function readEdit() {
    return {
        tipo: ed.tipo.value, folhasNormais: ed.normais.value, folhasOffset: ed.offset.value,
        projetoCanva: ed.canva.value, trabalho: ed.trabalho.value,
    };
}

const allAutoZero = () => ['normais', 'offset', 'canva', 'trabalho'].every((k) => (parseFloat(ed[k].value) || 0) === 0);
const manualValue = () => parseFloat(ed.manual.value) || 0;
const usingManual = () => isManual && allAutoZero() && manualValue() > 0;

function renderEditTotal() {
    if (usingManual()) {
        ed.total.textContent = money(manualValue());
        ed.breakdown.innerHTML = '';
        ed.preco.textContent = '';
        return manualValue();
    }
    const { total, items } = calcTotal(readEdit(), state.prices, state.offsetPrice);
    ed.total.textContent = money(total);
    ed.breakdown.innerHTML = items.map((i) => `<li><span>${esc(i.label)}</span><span>${money(i.value)}</span></li>`).join('');
    const t = parseInt(ed.tipo.value, 10);
    ed.preco.textContent = t ? `${money(state.prices[t])} por folha` : '';
    return total;
}

export function openEdit(id) {
    const imp = state.impressions.find((i) => i.id === id);
    if (!imp) return;
    editingId = id;

    isManual = !imp.tipoImpressao && !imp.folhasNormais && !imp.folhasOffset
        && !imp.projetoCanva && !imp.trabalho && imp.valorTotal > 0;

    $('editCliente').value  = imp.cliente || '';
    $('editDataHora').value = isoToDatetimeLocal(imp.dataHora);
    $('editError').textContent = '';

    ed.tipo.value    = isManual ? '' : String(imp.tipoImpressao || '');
    ed.normais.value = imp.folhasNormais || 0;
    ed.offset.value  = imp.folhasOffset  || 0;
    ed.canva.value   = (imp.projetoCanva || 0).toFixed(2);
    ed.trabalho.value = (imp.trabalho    || 0).toFixed(2);
    ed.manual.value  = isManual ? Number(imp.valorTotal).toFixed(2) : '';
    $('editManualField').hidden = !isManual;

    renderEditTotal();
    openDialog($('dlgEdit'));
    $('editCliente').focus();
}

async function submitEdit(e) {
    e.preventDefault();
    const nome = $('editCliente').value.trim();
    const manual = usingManual();
    const tipo = manual ? 0 : parseInt(ed.tipo.value, 10) || 0;
    const nums = [ed.normais, ed.offset, ed.canva, ed.trabalho].map((i) => parseFloat(i.value) || 0);

    let erro = '';
    if (!nome || !HAS_LETTER.test(nome)) erro = 'Digite o nome do cliente (com pelo menos uma letra).';
    else if (!manual && !tipo) erro = 'Escolha o tipo de impressão.';
    else if (nums.some((n) => n < 0)) erro = 'Os valores não podem ser negativos.';
    else if (!manual && nums[1] > nums[0]) erro = 'As folhas offset não podem passar do total de folhas.';
    else if (!$('editDataHora').value) erro = 'Informe a data e a hora.';
    $('editError').textContent = erro;
    if (erro) return;

    const valorTotal = renderEditTotal();
    const id = editingId;
    closeDialog($('dlgEdit'));
    await updateImpression(id, {
        cliente: nome, tipoImpressao: tipo,
        folhasNormais: manual ? 0 : Math.floor(nums[0]), folhasOffset: manual ? 0 : Math.floor(nums[1]),
        projetoCanva: manual ? 0 : nums[2], trabalho: manual ? 0 : nums[3],
        valorTotal, dataHora: datetimeLocalToISO($('editDataHora').value),
    });
}

export function initEdit() {
    Object.assign(ed, {
        tipo: $('editTipoImpressao'), normais: $('editFolhasNormais'), offset: $('editFolhasOffset'),
        canva: $('editProjetoCanva'), trabalho: $('editTrabalho'), manual: $('editValorTotalManual'),
        total: $('editValorTotal'), breakdown: $('editTotalBreakdown'), preco: $('editPrecoTipo'),
    });
    ed.tipo.innerHTML = '<option value="">Selecione o tipo</option>' +
        [1, 2, 3, 4].map((t) => `<option value="${t}">${esc(TIPO_NOMES[t])}</option>`).join('');

    $('addForm').addEventListener('submit', submitAdd);
    $('editForm').addEventListener('submit', submitEdit);
    $('editForm').addEventListener('input', renderEditTotal);
    $('editForm').addEventListener('change', renderEditTotal);
    // Mexer no valor avulso zera os campos automáticos (mesmo comportamento anterior).
    ed.manual.addEventListener('focus', () => {
        if (!isManual) return;
        ed.normais.value = 0; ed.offset.value = 0; ed.canva.value = '0.00'; ed.trabalho.value = '0.00'; ed.tipo.value = '';
        renderEditTotal();
    });
    on('prices', () => { if ($('dlgEdit').open) renderEditTotal(); });
}
