// ============================================================================
// actions.js — operações sobre impressões (adicionar, editar, excluir, limpar)
// ============================================================================

import { store } from './services/firestore.js';
import { TIPO_NOMES } from './config.js';
import { state, emit } from './state.js';
import { notify, withLoader } from './ui/feedback.js';
import { confirmDialog } from './ui/dialog.js';
import { money, round2 } from './utils/format.js';

/** Recarrega as impressões do banco e avisa a interface. */
export async function refresh() {
    state.impressions = await store.loadImpressions();
    emit('data');
}

/** "Xerox P&B R$ 0.50" — formato gravado no banco (compatível com os dados antigos). */
export function tipoPrecoLabel(tipo) {
    if (!tipo) return 'Desconhecido';
    return `${TIPO_NOMES[tipo] || ''} R$ ${Number(state.prices[tipo] || 0).toFixed(2)}`;
}

export async function addImpression(data) {
    try {
        await withLoader(async () => {
            await store._syncAddImpression(data);
            await refresh();
        }, 'Salvando impressão…');
        notify.success('Impressão adicionada.');
        return true;
    } catch (err) {
        console.error('[IMPRESSAO] erro ao adicionar:', err);
        notify.error('Não foi possível adicionar a impressão. Tente de novo.');
        return false;
    }
}

export async function updateImpression(id, data) {
    try {
        await withLoader(async () => {
            await store.updateImpression(id, { ...data, tipoPreco: tipoPrecoLabel(data.tipoImpressao) });
            await refresh();
        }, 'Salvando alterações…');
        notify.success('Impressão atualizada.');
        return true;
    } catch (err) {
        console.error('[IMPRESSAO] erro ao atualizar:', err);
        notify.error('Não foi possível salvar as alterações.');
        return false;
    }
}

async function deleteImpression(id) {
    try {
        await withLoader(async () => {
            await store._syncDeleteImpression({ id });
            await refresh();
        }, 'Excluindo…');
        notify.success('Impressão excluída.');
    } catch (err) {
        console.error('[IMPRESSAO] erro ao excluir:', err);
        notify.error('Não foi possível excluir a impressão.');
    }
}

/** Pede confirmação; se a impressão já tem pagamento, explica o que acontece com o valor pago. */
export async function confirmDelete(id) {
    const imp = state.impressions.find((i) => i.id === id);
    if (!imp) return;

    const valorPago = Number(imp.valorPago) || 0;

    if (valorPago > 0) {
        const absorvivel = state.impressions
            .filter((i) => i.id !== id && i.clienteId === imp.clienteId)
            .reduce((soma, i) => soma + Math.max(0, Number(i.valorRestante ?? (i.valorTotal - i.valorPago)) || 0), 0);

        if (round2(absorvivel) < round2(valorPago)) {
            await confirmDialog({
                title: 'Exclusão bloqueada',
                message: `Esta impressão tem ${money(valorPago)} pagos e as outras impressões em aberto do cliente só absorvem ${money(absorvivel)}. Remova o pagamento no histórico antes de excluir.`,
                okText: 'Entendi',
                hideCancel: true,
            });
            return;
        }

        const ok = await confirmDialog({
            title: 'Excluir impressão com pagamento',
            message: `Esta impressão tem ${money(valorPago)} pagos. Esse valor será passado para as outras impressões em aberto do cliente. Excluir mesmo assim?`,
            okText: 'Excluir', danger: true,
        });
        if (ok) await deleteImpression(id);
        return;
    }

    const ok = await confirmDialog({
        title: 'Excluir impressão',
        message: `Excluir a impressão de ${imp.cliente}?`,
        okText: 'Excluir', danger: true,
    });
    if (ok) await deleteImpression(id);
}

export async function confirmClearAll() {
    const ok = await confirmDialog({
        title: 'Apagar todos os registros',
        message: 'Isso remove TODAS as impressões, clientes e pagamentos do banco de dados e da planilha de backup. Não dá para desfazer.',
        okText: 'Apagar tudo', danger: true, requireText: 'APAGAR',
    });
    if (!ok) return;
    try {
        await withLoader(async () => {
            await store._syncClearAll();
            await refresh();
        }, 'Apagando…');
        notify.success('Todos os registros foram apagados.');
    } catch (err) {
        console.error('[IMPRESSAO] erro ao limpar:', err);
        notify.error('Não foi possível apagar os registros.');
    }
}
