// ============================================================================
// allocate.js — distribuição de um pagamento entre impressões em aberto (pura)
// ============================================================================

import { round2, statusOf } from './format.js';

const resto = (i) => Math.max(0, round2((Number(i.valorTotal) || 0) - (Number(i.valorPago) || 0)));

/**
 * Aplica `valor` nas impressões com saldo, da menor dívida para a maior
 * (empate: data mais antiga, depois id). Não altera a entrada.
 * Retorna { updates: [{ id, aplicado, valorPago, valorRestante, statusPagamento }], sobra }.
 */
export function allocate(impressoes, valor) {
    let sobra = round2(valor);
    const updates = [];
    const ordem = impressoes
        .map((i) => ({ i, r: resto(i) }))
        .filter((x) => x.r > 0)
        .sort((a, b) => a.r - b.r
            || String(a.i.dataImpressao || '').localeCompare(String(b.i.dataImpressao || ''))
            || String(a.i.id).localeCompare(String(b.i.id)));

    for (const { i, r } of ordem) {
        if (sobra <= 0) break;
        const aplicado   = Math.min(sobra, r);
        const valorTotal = Number(i.valorTotal) || 0;
        const valorPago  = round2((Number(i.valorPago) || 0) + aplicado);
        updates.push({
            id: i.id, aplicado,
            valorPago,
            valorRestante:   Math.max(0, round2(valorTotal - valorPago)),
            statusPagamento: statusOf({ valorTotal, valorPago }),
        });
        sobra = round2(sobra - aplicado);
    }
    return { updates, sobra };
}
