// ============================================================================
// clients.js — lista de clientes com saldo e atalhos de pagamento
// ============================================================================

import { state, on } from '../state.js';
import { openPayment, openHistory } from './payments.js';
import { icon } from '../ui/icons.js';
import { money, esc, buildSummary, compareClients } from '../utils/format.js';

const $ = (id) => document.getElementById(id);

function row(c) {
    const aberto = c.saldoDevedor > 0;
    const chipClass = !aberto ? 'pago' : c.valorPagoTotal > 0 ? 'parcial' : 'pendente';
    const chipText  = !aberto ? 'Em dia' : c.valorPagoTotal > 0 ? 'Pagou em parte' : 'Sem pagamento';

    return `
        <tr data-id="${esc(c.id)}">
            <td data-label="Cliente">
                <div class="client-cell">
                    <span class="client-avatar">${icon('user', 24)}</span>
                    <div>
                        <div class="cell-main">${esc(c.cliente)}</div>
                        <div class="client-state"><span class="chip chip-${chipClass}">${chipText}</span></div>
                    </div>
                </div>
            </td>
            <td class="col-num" data-label="Impressões">${c.totalCompras}</td>
            <td class="col-num" data-label="Folhas">
                ${c.folhasNormais}${c.folhasOffset ? `<div class="money-sub">${c.folhasOffset} offset</div>` : ''}
            </td>
            <td class="col-num" data-label="Total">${money(c.valorAcumulado)}</td>
            <td class="col-num" data-label="Pago">${money(c.valorPagoTotal)}</td>
            <td class="col-num ${aberto ? 'money-open' : 'money-ok'}" data-label="Em aberto">${money(c.saldoDevedor)}</td>
            <td>
                <div class="cell-actions">
                    ${aberto ? `<button type="button" class="btn btn-secondary btn-sm" data-action="pay">${icon('credit-card', 18)}Registrar pagamento</button>` : ''}
                    <button type="button" class="icon-btn" data-action="history" aria-label="Histórico de ${esc(c.cliente)}">${icon('history', 18)}</button>
                </div>
            </td>
        </tr>`;
}

export function renderClients() {
    const list = buildSummary(state.impressions).sort(compareClients);
    const body = $('clientesTableBody');

    if (!list.length) {
        body.innerHTML = `<tr><td colspan="7"><div class="empty">${icon('users', 40)}
            <strong>Nenhum cliente ainda</strong><span>Os clientes aparecem aqui quando você registra a primeira impressão.</span></div></td></tr>`;
        return;
    }
    body.innerHTML = list.map(row).join('');
}

export function initClients() {
    $('showPaymentBtn').addEventListener('click', () => openPayment());
    $('showHistoryBtn').addEventListener('click', () => openHistory());

    $('clientesTableBody').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = btn.closest('tr').dataset.id;
        if (btn.dataset.action === 'pay') openPayment(id);
        if (btn.dataset.action === 'history') openHistory(id);
    });

    on('data', renderClients);
}
