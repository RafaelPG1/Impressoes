// ============================================================================
// prices.js — tabela de preços (visualizar, editar, salvar, restaurar)
// ============================================================================

import { store } from '../services/firestore.js';
import { state, emit, setPrices, on } from '../state.js';
import { notify, withLoader } from '../ui/feedback.js';
import { confirmDialog } from '../ui/dialog.js';
import { money } from '../utils/format.js';

const $ = (id) => document.getElementById(id);
const FIELDS = ['preco1', 'preco2', 'preco3', 'preco4', 'precoOffset'];

let editing = false;

function currentValues() {
    return {
        1: state.prices[1], 2: state.prices[2], 3: state.prices[3], 4: state.prices[4], offset: state.offsetPrice,
    };
}

/** Escreve os preços do estado nos campos e nos rótulos do formulário. */
export function renderPrices() {
    const v = currentValues();
    [1, 2, 3, 4].forEach((t) => { $(`preco${t}`).value = Number(v[t]).toFixed(2); });
    $('precoOffset').value = Number(v.offset).toFixed(2);

    document.querySelectorAll('.type-price[data-price]').forEach((el) => {
        el.textContent = `${money(state.prices[el.dataset.price])} / folha`;
    });
    $('offsetPriceLabel').textContent = `(+${money(state.offsetPrice)})`;
}

function setEditing(on_) {
    editing = on_;
    FIELDS.forEach((id) => { $(id).readOnly = !on_; });
    $('priceForm').classList.toggle('is-editing', on_);
    $('editPricesBtn').hidden   = on_;
    $('cancelPricesBtn').hidden = !on_;
    $('savePricesBtn').hidden   = !on_;
    if (on_) $('preco1').focus();
}

async function save() {
    const read = (id) => parseFloat($(id).value);
    const values = FIELDS.map(read);
    if (values.some((n) => !Number.isFinite(n) || n <= 0)) {
        notify.warning('Informe um preço maior que zero em todos os campos.');
        return;
    }
    const prices = { 1: values[0], 2: values[1], 3: values[2], 4: values[3] };
    const offset = values[4];

    try {
        await withLoader(() => store.savePrices(prices, offset), 'Salvando preços…');
        state.prices = prices;
        state.offsetPrice = offset;
        setEditing(false);
        renderPrices();
        emit('prices');
        notify.success('Preços salvos.');
    } catch (err) {
        console.error('[PRECOS] erro ao salvar:', err);
        notify.error('Não foi possível salvar os preços.');
    }
}

async function reset() {
    const ok = await confirmDialog({
        title: 'Restaurar preços padrão',
        message: 'Todos os preços voltam aos valores iniciais. As impressões já registradas não mudam.',
        okText: 'Restaurar',
    });
    if (!ok) return;
    try {
        await withLoader(() => store.resetPrices(), 'Restaurando…');
        setPrices(null);
        setEditing(false);
        renderPrices();
        emit('prices');
        notify.success('Preços restaurados.');
    } catch (err) {
        console.error('[PRECOS] erro ao restaurar:', err);
        notify.error('Não foi possível restaurar os preços.');
    }
}

export async function loadPrices() {
    try {
        setPrices(await store.loadPrices());
    } catch (err) {
        console.error('[PRECOS] erro ao carregar:', err);
        setPrices(null);
    }
    renderPrices();
    emit('prices');
}

export function initPrices() {
    $('editPricesBtn').addEventListener('click', () => setEditing(true));
    $('cancelPricesBtn').addEventListener('click', () => { renderPrices(); setEditing(false); });
    $('savePricesBtn').addEventListener('click', save);
    $('resetPricesBtn').addEventListener('click', reset);
    $('priceForm').addEventListener('submit', (e) => { e.preventDefault(); save(); });
    $('priceForm').addEventListener('keydown', (e) => { if (e.key === 'Escape' && editing) { renderPrices(); setEditing(false); } });
    on('prices', renderPrices);
}
