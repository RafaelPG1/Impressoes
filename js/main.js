// ============================================================================
// main.js — ponto de entrada
// ============================================================================

import { store } from './services/firestore.js';
import { SHEETS_URL } from './config.js';
import { refresh } from './actions.js';
import { notify } from './ui/feedback.js';
import { hydrateIcons } from './ui/icons-hydrate.js';
import { initRouter } from './router.js';
import { initPrices, loadPrices } from './features/prices.js';
import { initForm } from './features/form.js';
import { initRecords } from './features/records.js';
import { initEdit } from './features/edit.js';
import { initClients } from './features/clients.js';
import { initPayments } from './features/payments.js';
import { initPix } from './features/pix.js';
import { initPdf } from './features/pdf-dialog.js';
import { initRecovery } from './features/recovery.js';
import { confirmClearAll } from './actions.js';

const $ = (id) => document.getElementById(id);

function setConnection(state, text, id = 'connStatus') {
    const el = $(id);
    el.dataset.state = state;
    el.querySelector('.conn-text').textContent = text;
}

function showToday() {
    $('todayText').textContent = new Date().toLocaleDateString('pt-BR');
}

/** Drive = backup no Google Sheets. GET no Apps Script: responde JSON quando o deploy está ativo. */
async function checkDrive() {
    try {
        const resp = await fetch(SHEETS_URL, { signal: AbortSignal.timeout(8000) });
        await resp.json();
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        setConnection('ok', 'Conectado', 'driveStatus');
    } catch (err) {
        console.warn('[DRIVE] sem conexão:', err.message);
        setConnection('error', 'Sem conexão', 'driveStatus');
    }
}

async function start() {
    checkDrive();
    hydrateIcons();
    showToday();

    initRouter();
    initPrices();
    initEdit();
    initRecords();
    initClients();
    initPayments();
    initPix();
    initPdf();
    initRecovery();
    $('clearAllBtn').addEventListener('click', confirmClearAll);

    if (!store.isConfigured) {
        setConnection('error', 'Não configurado');
        notify.error('Firebase não configurado. Veja js/config.js.', null, 8000);
        initForm();
        return;
    }

    initForm();          // precisa dos preços para o total, então roda depois de iniciar os módulos
    try {
        await loadPrices();
        await refresh();
        setConnection('ok', 'Conectado');
    } catch (err) {
        console.error('[APP] erro ao carregar:', err);
        setConnection('error', 'Sem conexão');
        notify.error('Não foi possível carregar os dados do banco.', null, 7000);
    }
}

start();
