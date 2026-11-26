// ============================================================================
// format.js — formatação, datas, status e cálculos puros (sem DOM)
// ============================================================================

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 1234.5 → "R$ 1.234,50" */
export const money = (v) => BRL.format(Number(v) || 0);

/** Escapa texto para uso seguro dentro de innerHTML. */
export function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}

/** Arredonda para centavos (evita 0.1 + 0.2 = 0.30000000000000004). */
export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// ── Datas ────────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, '0');

export function fmtDateTime(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(', ', ' ');
}

/** "Xerox P&B R$ 0.50" (formato gravado) → { nome: 'Xerox P&B', preco: 0.5 }. */
export function splitTipoPreco(label) {
    const m = String(label || '').match(/^(.*?)\s*R\$\s*([\d.,]+)\s*$/);
    return m ? { nome: m[1].trim(), preco: parseFloat(m[2].replace(',', '.')) } : { nome: String(label || 'Desconhecido'), preco: null };
}

export function fmtDate(iso) {
    const d = new Date(iso);
    return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR');
}

/** Data local (AAAA-MM-DD) de um instante ISO — não a data em UTC. */
export function localDateKey(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Valor de <input type="datetime-local"> → ISO com o fuso local (ex.: …-03:00). */
export function datetimeLocalToISO(value) {
    if (!value) return new Date().toISOString();
    const [datePart, timePart] = value.split('T');
    const [year, month, day]   = datePart.split('-').map(Number);
    const [hour, minute]       = (timePart || '00:00').split(':').map(Number);
    const local = new Date(year, month - 1, day, hour, minute, 0, 0);
    const off   = local.getTimezoneOffset();
    const abs   = Math.abs(off);
    const sign  = off <= 0 ? '+' : '-';
    return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** ISO → valor de <input type="datetime-local"> no fuso local. */
export function isoToDatetimeLocal(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function nowDatetimeLocal() {
    return isoToDatetimeLocal(new Date().toISOString());
}

// ── Status e resumo ─────────────────────────────────────────────────────────

/** 'pago' | 'parcial' | 'pendente' a partir dos valores. */
export function statusOf(imp) {
    const total = Number(imp.valorTotal) || 0;
    const pago  = Number(imp.valorPago)  || 0;
    if (pago >= total && total > 0) return 'pago';
    if (pago > 0) return 'parcial';
    return 'pendente';
}

export const STATUS_LABEL = { pago: 'Pago', parcial: 'Parcial', pendente: 'Pendente' };
const STATUS_ORDER = { pago: 1, parcial: 2, pendente: 3 };

export const byName = (a, b) => (a || '').toLowerCase().localeCompare((b || '').toLowerCase(), 'pt-BR');

/** Ordem da tabela: pagas → parciais → pendentes; depois por nome. */
export function compareImpressions(a, b) {
    const d = STATUS_ORDER[statusOf(a)] - STATUS_ORDER[statusOf(b)];
    return d || byName(a.cliente, b.cliente);
}

/** Totais gerais para a faixa de resumo. */
export function totals(impressions) {
    let total = 0, pago = 0, semPagamento = 0;
    for (const i of impressions) {
        total += Number(i.valorTotal) || 0;
        pago  += Number(i.valorPago)  || 0;
        if (statusOf(i) === 'pendente') semPagamento++;
    }
    return { total: round2(total), pago: round2(pago), aberto: round2(Math.max(0, total - pago)), semPagamento };
}

/** Agrupa impressões por cliente (mesmo formato que o resumo antigo do Firestore). */
export function buildSummary(impressions) {
    const map = new Map();
    for (const imp of impressions) {
        if (!imp.clienteId) continue;
        let g = map.get(imp.clienteId);
        if (!g) {
            g = { id: imp.clienteId, cliente: imp.cliente, totalCompras: 0, folhasNormais: 0, folhasOffset: 0, valorAcumulado: 0, valorPagoTotal: 0 };
            map.set(imp.clienteId, g);
        }
        g.totalCompras   += 1;
        g.folhasNormais  += parseInt(imp.folhasNormais || 0, 10);
        g.folhasOffset   += parseInt(imp.folhasOffset  || 0, 10);
        g.valorAcumulado += Number(imp.valorTotal) || 0;
        g.valorPagoTotal += Number(imp.valorPago)  || 0;
    }
    return [...map.values()].map((g) => ({
        ...g,
        valorAcumulado: round2(g.valorAcumulado),
        valorPagoTotal: round2(g.valorPagoTotal),
        saldoDevedor:   round2(Math.max(0, g.valorAcumulado - g.valorPagoTotal)),
    }));
}

/** pagos → parciais → devedores; alfabético dentro de cada grupo. */
export function compareClients(a, b) {
    const rank = (c) => (c.saldoDevedor <= 0 ? 1 : c.valorPagoTotal > 0 ? 2 : 3);
    return rank(a) - rank(b) || byName(a.cliente, b.cliente);
}

// ── Cálculo do valor de uma impressão ───────────────────────────────────────

/**
 * total = folhas × preço do tipo + folhas offset × preço offset + canva + trabalho
 * Retorna também as linhas do detalhamento. Sem tipo escolhido, total = 0.
 */
export function calcTotal(input, prices, offsetPrice) {
    const tipo = parseInt(input.tipo, 10);
    if (!tipo) return { total: 0, items: [] };

    const normais = Number(input.folhasNormais) || 0;
    const offset  = Number(input.folhasOffset)  || 0;
    const canva   = Number(input.projetoCanva)  || 0;
    const trab    = Number(input.trabalho)      || 0;
    const preco   = Number(prices[tipo]) || 0;
    const precoOf = Number(offsetPrice) || 0;

    const items = [];
    if (normais > 0) items.push({ label: `${normais} folha${normais > 1 ? 's' : ''} × ${money(preco)}`, value: round2(normais * preco) });
    if (offset  > 0) items.push({ label: `${offset} offset × ${money(precoOf)}`,                          value: round2(offset * precoOf) });
    if (canva   > 0) items.push({ label: 'Projeto Canva', value: round2(canva) });
    if (trab    > 0) items.push({ label: 'Trabalho extra', value: round2(trab) });

    return { total: round2(items.reduce((s, i) => s + i.value, 0)), items };
}
