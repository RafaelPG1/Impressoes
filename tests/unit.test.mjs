// Testes das funções puras. Rodar: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { calcTotal, statusOf, round2, buildSummary, totals, localDateKey, datetimeLocalToISO, splitTipoPreco } from '../js/utils/format.js';
import { allocate } from '../js/utils/allocate.js';

const P = { 1: 0.5, 2: 1, 3: 1.5, 4: 2 };

test('calcTotal: folhas + offset + canva + trabalho', () => {
    assert.equal(calcTotal({ tipo: 1, folhasNormais: 100, folhasOffset: 10, projetoCanva: 5, trabalho: 2.5 }, P, 0.5).total, 62.5);
    assert.equal(calcTotal({ tipo: 3, folhasNormais: 40, trabalho: 8 }, P, 0.5).total, 68);
    assert.equal(calcTotal({ tipo: 0, folhasNormais: 9 }, P, 0.5).total, 0);          // sem tipo = 0
});

test('round2 evita erro de ponto flutuante', () => {
    assert.equal(round2(0.1 + 0.2), 0.3);
    assert.equal(round2(1.005), 1.01);
});

test('statusOf', () => {
    assert.equal(statusOf({ valorTotal: 10, valorPago: 10 }), 'pago');
    assert.equal(statusOf({ valorTotal: 10, valorPago: 12 }), 'pago');
    assert.equal(statusOf({ valorTotal: 10, valorPago: 3 }), 'parcial');
    assert.equal(statusOf({ valorTotal: 10, valorPago: 0 }), 'pendente');
    assert.equal(statusOf({ valorTotal: 0, valorPago: 0 }), 'pendente');
});

test('buildSummary / totals', () => {
    const l = [
        { clienteId: 'a', cliente: 'Ana', valorTotal: 60, valorPago: 60, folhasNormais: 10 },
        { clienteId: 'a', cliente: 'Ana', valorTotal: 40, valorPago: 0, folhasNormais: 5 },
    ];
    const [a] = buildSummary(l);
    assert.deepEqual([a.valorAcumulado, a.valorPagoTotal, a.saldoDevedor, a.folhasNormais], [100, 60, 40, 15]);
    assert.deepEqual(totals(l), { total: 100, pago: 60, aberto: 40, semPagamento: 1 });
});

test('datas: ISO local ida e volta, sem deslocar o dia', () => {
    const iso = datetimeLocalToISO('2026-03-05T23:30');
    assert.equal(localDateKey(iso), '2026-03-05');
});

test('splitTipoPreco', () => {
    assert.deepEqual(splitTipoPreco('Xerox P&B R$ 0.50'), { nome: 'Xerox P&B', preco: 0.5 });
    assert.equal(splitTipoPreco('Desconhecido').preco, null);
});

// ── allocate: regra de pagamento ────────────────────────────────────────────
const I = (id, total, pago = 0, data = '2026-01-01') => ({ id, valorTotal: total, valorPago: pago, dataImpressao: data });

test('allocate: menor dívida primeiro, parcial na última', () => {
    const { updates, sobra } = allocate([I('a', 60), I('b', 24), I('c', 68)], 100);
    assert.deepEqual(updates.map((u) => [u.id, u.aplicado, u.statusPagamento]),
        [['b', 24, 'pago'], ['a', 60, 'pago'], ['c', 16, 'parcial']]);
    assert.equal(sobra, 0);
});

test('allocate: sobra quando o pagamento passa do saldo', () => {
    const { updates, sobra } = allocate([I('a', 10)], 15);
    assert.equal(updates[0].aplicado, 10);
    assert.equal(sobra, 5);
});

test('allocate: ignora quitadas, não muta a entrada, centavos exatos', () => {
    const entrada = [I('a', 10, 10), I('b', 0.3, 0.1)];
    const copia = JSON.stringify(entrada);
    const { updates, sobra } = allocate(entrada, 0.2);
    assert.equal(JSON.stringify(entrada), copia);
    assert.deepEqual([updates.length, updates[0].id, updates[0].valorPago, updates[0].statusPagamento, sobra], [1, 'b', 0.3, 'pago', 0]);
});

test('allocate: empate decide por data e depois por id (resultado estável)', () => {
    const { updates } = allocate([I('z', 10, 0, '2026-02-01'), I('y', 10, 0, '2026-01-01')], 10);
    assert.equal(updates[0].id, 'y');
});

test('allocate: pago acima do total não gera saldo negativo', () => {
    const { updates } = allocate([I('a', 10, 14), I('b', 5)], 5);
    assert.deepEqual(updates.map((u) => u.id), ['b']);
});
