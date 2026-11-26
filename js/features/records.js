// ============================================================================
// records.js — faixa de totais, filtros e tabela de registros
// ============================================================================

import { state, on } from '../state.js';
import { confirmDelete } from '../actions.js';
import { openEdit, openAdd } from './edit.js';
import { icon } from '../ui/icons.js';
import {
    money, esc, fmtDateTime, localDateKey, statusOf, STATUS_LABEL,
    compareImpressions, totals, byName, splitTipoPreco,
} from '../utils/format.js';

const $ = (id) => document.getElementById(id);

const PAGE_SIZE = 10;
let page = 1;

const filterIds = ['filterCliente', 'filterStatus', 'filterTipo', 'filterDataInicio', 'filterDataFim'];

function currentFilters() {
    return {
        cliente: $('filterCliente').value,
        status:  $('filterStatus').value,
        tipo:    $('filterTipo').value,
        inicio:  $('filterDataInicio').value,
        fim:     $('filterDataFim').value,
    };
}

export function applyFilters(list, f = currentFilters()) {
    return list.filter((imp) => {
        if (f.cliente && imp.cliente !== f.cliente) return false;
        if (f.status && statusOf(imp) !== f.status) return false;
        if (f.tipo !== '' && String(imp.tipoImpressao || 0) !== f.tipo) return false;
        const dia = localDateKey(imp.dataHora);
        if (f.inicio && dia < f.inicio) return false;
        if (f.fim && dia > f.fim) return false;
        return true;
    });
}

/** Linha de tendência real: acumulado das impressões em ordem de data. Com menos de 2 pontos, não desenha. */
function spark(id, vals) {
    const el = $(id);
    if (vals.length < 2) { el.innerHTML = ''; return; }
    const min = Math.min(...vals), r = (Math.max(...vals) - min) || 1;
    const d = 'M' + vals.map((v, i) => `${(i / (vals.length - 1) * 120).toFixed(1)} ${(36 - (v - min) / r * 32).toFixed(1)}`).join(' L');
    el.innerHTML = `<path class="area" d="${d} L120 40 L0 40Z"/><path d="${d}"/>`;
}

function renderSparks() {
    const asc = [...state.impressions].sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
    let t = 0, p = 0, pend = 0;
    const tot = [], pag = [], abe = [], pen = [];
    for (const i of asc) {
        t += Number(i.valorTotal) || 0;
        p += Number(i.valorPago) || 0;
        if (statusOf(i) === 'pendente') pend++;
        tot.push(t); pag.push(p); abe.push(Math.max(0, t - p)); pen.push(pend);
    }
    spark('sparkTotal', tot); spark('sparkPago', pag); spark('sparkAberto', abe); spark('sparkPendentes', pen);
}

function renderKpis() {
    const t = totals(state.impressions);
    $('kpiTotal').textContent = money(t.total);
    $('kpiPago').textContent = money(t.pago);
    $('kpiAberto').textContent = money(t.aberto);
    $('kpiAberto').classList.toggle('has-debt', t.aberto > 0);
    $('kpiPendentes').textContent = String(t.semPagamento);
    renderSparks();
}

/** Mantém os clientes do filtro e a lista de sugestões dos campos de nome. */
function renderClientOptions() {
    const nomes = [...new Set(state.impressions.map((i) => i.cliente).filter(Boolean))].sort(byName);

    const sel = $('filterCliente');
    const current = sel.value;
    sel.innerHTML = '<option value="">Todos os clientes</option>' +
        nomes.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
    sel.value = nomes.includes(current) ? current : '';

    $('clientesList').innerHTML = nomes.map((n) => `<option value="${esc(n)}"></option>`).join('');
}

function row(imp) {
    const status = statusOf(imp);
    const total = Number(imp.valorTotal) || 0;
    const pago  = Number(imp.valorPago)  || 0;
    const resta = Math.max(0, total - pago);

    const tipo = splitTipoPreco(imp.tipoPreco);
    const folhas = [];
    if (imp.folhasNormais > 0) folhas.push(`${imp.folhasNormais} folha${imp.folhasNormais > 1 ? 's' : ''}`);
    if (imp.folhasOffset  > 0) folhas.push(`${imp.folhasOffset} offset`);

    const extras = [];
    if (imp.projetoCanva > 0) extras.push(`Canva ${money(imp.projetoCanva)}`);
    if (imp.trabalho     > 0) extras.push(`Trabalho ${money(imp.trabalho)}`);

    return `
        <tr data-id="${esc(imp.id)}">
            <td data-label="Cliente">
                <div class="cell-main">${esc(imp.cliente)}</div>
                <div class="cell-sub">${esc(fmtDateTime(imp.dataHora))}</div>
            </td>
            <td data-label="Serviço">
                <div class="cell-main">${esc(tipo.nome)}</div>
                <div class="cell-sub">${esc([tipo.preco != null ? `${money(tipo.preco)}/folha` : '', ...folhas].filter(Boolean).join(' · ') || 'Sem folhas')}</div>
                ${extras.length ? `<div class="cell-sub">${esc(extras.join(' · '))}</div>` : ''}
            </td>
            <td class="col-num" data-label="Valores">
                <div class="money-total">${money(total)}</div>
                <div class="money-sub">Pago ${money(pago)}</div>
                <div class="money-sub ${resta > 0 ? 'money-open' : ''}">Resta ${money(resta)}</div>
            </td>
            <td data-label="Status"><span class="chip chip-${status}">${STATUS_LABEL[status]}</span></td>
            <td>
                <div class="cell-actions">
                    <button type="button" class="icon-btn" data-action="edit" aria-label="Editar impressão de ${esc(imp.cliente)}">${icon('pencil', 18)}</button>
                    <button type="button" class="icon-btn is-danger" data-action="delete" aria-label="Excluir impressão de ${esc(imp.cliente)}">${icon('trash-2', 18)}</button>
                </div>
            </td>
        </tr>`;
}

export function renderTable() {
    const all = state.impressions;
    const filters = currentFilters();
    const hasFilter = Object.values(filters).some(Boolean);
    const list = applyFilters(all, filters).sort(compareImpressions);

    $('filterClearBtn').hidden = !hasFilter;
    $('recordsCount').textContent = all.length
        ? (hasFilter ? `${list.length} de ${all.length}` : `${all.length} registro${all.length > 1 ? 's' : ''}`)
        : '';

    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    page = Math.min(page, pages);
    const from = (page - 1) * PAGE_SIZE;
    const shown = list.slice(from, from + PAGE_SIZE);

    $('pagerInfo').textContent = !list.length ? ''
        : list.length <= PAGE_SIZE
            ? `Mostrando ${list.length} de ${list.length} registro${list.length > 1 ? 's' : ''}`
            : `Mostrando ${from + 1}–${from + shown.length} de ${list.length} registros`;
    $('pager').hidden = !list.length;
    $('pageNow').textContent = String(page);
    $('pagePrev').disabled = page <= 1;
    $('pageNext').disabled = page >= pages;

    const body = $('impressoesTableBody');
    if (!list.length) {
        const msg = all.length
            ? ['Nenhum registro com esses filtros', 'Ajuste ou limpe os filtros para ver mais.']
            : ['Nenhuma impressão registrada', 'Use o formulário ao lado para registrar a primeira.'];
        body.innerHTML = `<tr><td colspan="5">
            <div class="empty">${icon('printer', 40)}<strong>${msg[0]}</strong><span>${msg[1]}</span></div>
        </td></tr>`;
        return;
    }
    body.innerHTML = shown.map(row).join('');
}

export function renderRecords() {
    renderKpis();
    renderClientOptions();
    renderTable();
}

export function initRecords() {
    filterIds.forEach((id) => $(id).addEventListener('change', () => { page = 1; renderTable(); }));
    $('filterClearBtn').addEventListener('click', () => {
        filterIds.forEach((id) => { $(id).value = ''; });
        page = 1;
        renderTable();
    });
    $('addManualBtn').addEventListener('click', openAdd);
    $('pagePrev').addEventListener('click', () => { page--; renderTable(); });
    $('pageNext').addEventListener('click', () => { page++; renderTable(); });

    $('impressoesTableBody').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = btn.closest('tr').dataset.id;
        if (btn.dataset.action === 'edit') openEdit(id);
        if (btn.dataset.action === 'delete') confirmDelete(id);
    });

    on('data', renderRecords);
}
