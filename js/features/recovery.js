// ============================================================================
// recovery.js — recuperar dados do Google Sheets para o Firestore
// ============================================================================

import { store } from '../services/firestore.js';
import { refresh } from '../actions.js';
import { notify, withLoader } from '../ui/feedback.js';
import { confirmDialog, noticeDialog, noticeList } from '../ui/dialog.js';

const $ = (id) => document.getElementById(id);

async function run() {
    const ok = await confirmDialog({
        title: 'Recuperar da planilha',
        message: 'Busca na planilha os registros que não existem no banco e importa. Nada que já existe é apagado ou sobrescrito.',
        okText: 'Recuperar',
    });
    if (!ok) return;

    try {
        const { adicionar, geral } = await withLoader(async () => {
            const adicionar = await store.importFromAdicionar();
            const geral = await store.recoverFromSheets();
            if (adicionar.total > 0 || geral.total > 0) await refresh();
            return { adicionar, geral };
        }, 'Buscando na planilha…');

        const total = geral.total + adicionar.total;
        if (total === 0) {
            noticeDialog('Recuperação concluída', '<p>O banco já está atualizado. Nenhum dado novo na planilha.</p>');
            return;
        }
        const rows = [];
        if (adicionar.total > 0) rows.push(['Da aba "Adicionar"', adicionar.total]);
        rows.push(
            ['Clientes', geral.clientes, !geral.clientes],
            ['Impressões', geral.impressoes, !geral.impressoes],
            ['Pagamentos', geral.pagamentos, !geral.pagamentos],
            ['Vínculos pagamento–impressão', geral.pagamentosImpressoes, !geral.pagamentosImpressoes],
            ['Total recuperado', total],
        );
        noticeDialog('Recuperação concluída', noticeList(rows));
    } catch (err) {
        console.error('[RECUPERACAO] erro:', err);
        notify.error(err.message || 'Não foi possível recuperar os dados da planilha.', null, 7000);
    }
}

export function initRecovery() {
    $('recoverSheetsBtn').addEventListener('click', run);
}
