// ============================================================================
// payments.js — registrar pagamento e histórico (remoção recalcula tudo)
// ============================================================================

import { store } from '../services/firestore.js';
import { state } from '../state.js';
import { refresh } from '../actions.js';
import { notify, withLoader } from '../ui/feedback.js';
import { openDialog, closeDialog, confirmDialog, noticeDialog, noticeList } from '../ui/dialog.js';
import { money, esc, fmtDateTime, buildSummary, byName, round2 } from '../utils/format.js';

const $ = (id) => document.getElementById(id);

const summary = () => buildSummary(state.impressions);

// ── Registrar pagamento ──────────────────────────────────────────────────────

function fillPaymentClients(selectedId = '') {
    const devedores = summary().filter((c) => c.saldoDevedor > 0).sort((a, b) => byName(a.cliente, b.cliente));
    const sel = $('paymentCliente');
    sel.innerHTML = '<option value="">Selecione um cliente</option>' + devedores.map((c) =>
        `<option value="${esc(c.id)}">${esc(c.cliente)} — deve ${money(c.saldoDevedor)}</option>`).join('');
    $('paymentEmpty').hidden = devedores.length > 0;
    sel.value = devedores.some((c) => c.id === selectedId) ? selectedId : '';
}

function showDebt() {
    const c = summary().find((x) => x.id === $('paymentCliente').value);
    $('clientDebtInfo').hidden = !c;
    if (!c) return;
    $('clientTotalOriginal').textContent = money(c.valorAcumulado);
    $('clientPaidValue').textContent     = money(c.valorPagoTotal);
    $('clientDebtValue').textContent     = money(c.saldoDevedor);
}

export function openPayment(clienteId = '') {
    fillPaymentClients(clienteId);
    $('paymentValue').value = '';
    $('paymentError').textContent = '';
    showDebt();
    openDialog($('dlgPayment'));
    (clienteId ? $('paymentValue') : $('paymentCliente')).focus();
}

async function applyPayment() {
    const clienteId = $('paymentCliente').value;
    const valor = round2(parseFloat($('paymentValue').value));
    const c = summary().find((x) => x.id === clienteId);

    let erro = '';
    if (!c) erro = 'Selecione um cliente.';
    else if (!Number.isFinite(valor) || valor <= 0) erro = 'Informe um valor maior que zero.';
    else if (valor > c.saldoDevedor) erro = `O valor passa do saldo em aberto (${money(c.saldoDevedor)}).`;
    $('paymentError').textContent = erro;
    if (erro) return;

    closeDialog($('dlgPayment'));
    try {
        await withLoader(async () => {
            await store._syncApplyPayment({ clienteId, valorPagamento: valor, impressoesIds: null });
            await refresh();
        }, 'Registrando pagamento…');
        noticeDialog('Pagamento registrado', noticeList([
            ['Cliente', c.cliente], ['Valor pago', money(valor)], ['Data e hora', fmtDateTime(new Date().toISOString())],
        ]));
    } catch (err) {
        console.error('[PAGAMENTO] erro ao aplicar:', err);
        notify.error('Não foi possível registrar o pagamento.');
    }
}

// ── Histórico ────────────────────────────────────────────────────────────────

async function fillHistoryClients(selectedId = '') {
    let ids = [];
    try {
        ids = (await store.getClientesComPagamentos()).map((p) => p.cliente_id);
    } catch (err) {
        console.error('[HISTORICO] erro ao carregar clientes:', err);
    }
    const clientes = summary().filter((c) => ids.includes(c.id)).sort((a, b) => byName(a.cliente, b.cliente));
    const sel = $('historyCliente');
    sel.innerHTML = (clientes.length ? '<option value="">Selecione um cliente</option>' : '<option value="">Nenhum cliente com pagamentos</option>') +
        clientes.map((c) => `<option value="${esc(c.id)}">${esc(c.cliente)}</option>`).join('');
    sel.value = clientes.some((c) => c.id === selectedId) ? selectedId : '';
}

const emptyHistory = (msg) => `<div class="empty"><strong>${esc(msg)}</strong></div>`;

async function renderHistory() {
    const clienteId = $('historyCliente').value;
    const box = $('paymentHistoryList');
    if (!clienteId) { box.innerHTML = emptyHistory('Escolha um cliente para ver os pagamentos.'); return; }

    try {
        const pagamentos = await store.getPagamentosDoCliente(clienteId);
        if (!pagamentos.length) { box.innerHTML = emptyHistory('Nenhum pagamento registrado para este cliente.'); return; }

        box.innerHTML = pagamentos.map((p) => {
            const n = p.pagamentos_impressoes?.length || 0;
            return `
            <div class="history-item" data-id="${esc(p.id)}">
                <div>
                    <div class="history-value">${money(p.valor_total)}</div>
                    <div class="history-meta">${esc(fmtDateTime(p.data_pagamento))} · ${n} ${n === 1 ? 'impressão paga' : 'impressões pagas'}</div>
                </div>
                <button type="button" class="btn btn-ghost btn-sm" data-action="remove">Remover</button>
            </div>`;
        }).join('');
    } catch (err) {
        console.error('[HISTORICO] erro:', err);
        box.innerHTML = emptyHistory('Não foi possível carregar o histórico.');
    }
}

export async function openHistory(clienteId = '') {
    $('paymentHistoryList').innerHTML = emptyHistory('Carregando…');
    openDialog($('dlgHistory'));
    await fillHistoryClients(clienteId);
    await renderHistory();
}

async function removePayment(paymentId) {
    const clienteId = $('historyCliente').value;
    const ok = await confirmDialog({
        title: 'Remover pagamento',
        message: 'O valor volta a ficar em aberto e os outros pagamentos do cliente são reaplicados do zero. Remover?',
        okText: 'Remover', danger: true,
    });
    if (!ok) return;

    const nome = summary().find((c) => c.id === clienteId)?.cliente || 'Cliente';
    try {
        let valorRemovido = 0;
        await withLoader(async () => {
            const pag = (await store.getPagamentosDoCliente(clienteId)).find((p) => p.id === paymentId);
            valorRemovido = pag ? parseFloat(pag.valor_total) : 0;
            await store._syncRemovePayment({ paymentId, clienteId });
            await refresh();
        }, 'Removendo pagamento…');
        await fillHistoryClients(clienteId);
        await renderHistory();
        noticeDialog('Pagamento removido', noticeList([['Cliente', nome], ['Valor removido', money(valorRemovido)]]));
    } catch (err) {
        console.error('[PAGAMENTO] erro ao remover:', err);
        notify.error('Não foi possível remover o pagamento.');
    }
}

export function initPayments() {
    $('paymentCliente').addEventListener('change', () => { showDebt(); $('paymentError').textContent = ''; });
    $('applyPaymentBtn').addEventListener('click', applyPayment);
    $('dlgPayment').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.id === 'paymentValue') { e.preventDefault(); applyPayment(); }
    });

    $('historyCliente').addEventListener('change', renderHistory);
    $('paymentHistoryList').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="remove"]');
        if (btn) removePayment(btn.closest('.history-item').dataset.id);
    });
}
