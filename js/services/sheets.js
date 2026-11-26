// ============================================================================
// sheets.js — backup silencioso para o Google Sheets (via Apps Script)
// ============================================================================

import { SHEETS_URL } from '../config.js';

export class SheetsSync {
    constructor() {
        this.url     = SHEETS_URL;
        this.enabled = true;
    }

    async _send(payload) {
        if (!this.enabled) return;
        try {
            // no-cors: a resposta é opaca, então só dá para saber se a requisição saiu.
            await fetch(this.url, {
                method:  'POST',
                mode:    'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload),
            });
            console.log(`[SHEETS] enviado: ${payload.action} → ${payload.sheetName}`);
        } catch (err) {
            console.warn('[SHEETS] falha ao sincronizar:', err.message);
        }
    }

    upsert(sheet, id, data)   { return this._send({ action: 'upsert',  sheetName: sheet, id, data }); }
    delete(sheet, id)         { return this._send({ action: 'delete',  sheetName: sheet, id, data: null }); }
    syncAll(sheet, registros) { return this._send({ action: 'syncAll', sheetName: sheet, id: 'bulk', data: registros }); }

    formatCliente(id, d) {
        return {
            id, nome: d.nome || '', telefone: d.telefone || '',
            ativo:     d.ativo !== undefined ? String(d.ativo) : 'true',
            createdAt: d.createdAt || new Date().toISOString(),
        };
    }

    formatImpressao(id, d) {
        return {
            id,
            clienteId:             d.clienteId             || '',
            tipoImpressao:         d.tipoImpressao         || 0,
            tipoPreco:             d.tipoPreco             || 'Desconhecido',
            folhasNormais:         d.folhasNormais         || 0,
            folhasOffset:          d.folhasOffset          || 0,
            projetoCanva:          d.projetoCanva          || 0,
            trabalho:              d.trabalho              || 0,
            valorTotal:            d.valorTotal            || 0,
            valorPago:             d.valorPago             || 0,
            valorRestante:         d.valorRestante         || 0,
            statusPagamento:       d.statusPagamento       || 'pendente',
            dataImpressao:         d.dataImpressao         || '',
            dataPrimeiroPagamento: d.dataPrimeiroPagamento || '',
            dataQuitacao:          d.dataQuitacao          || '',
            observacao:            d.observacao            || '',
            createdAt:             d.createdAt             || new Date().toISOString(),
        };
    }

    formatPagamento(id, d) {
        return {
            id, clienteId: d.clienteId || '', valorTotal: d.valorTotal || 0,
            tipoAplicacao: d.tipoAplicacao || 'automatico', observacao: d.observacao || '',
            dataPagamento: d.dataPagamento || '', createdAt: d.createdAt || new Date().toISOString(),
        };
    }

    formatPagamentoImpressao(id, d) {
        return {
            id, pagamentoId: d.pagamentoId || '', impressaoId: d.impressaoId || '',
            valorAplicado: d.valorAplicado || 0,
        };
    }
}
