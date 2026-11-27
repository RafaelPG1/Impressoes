// ============================================================================
// main.js — ponto de entrada
// ============================================================================

import { store } from './services/firestore.js';
import { requireLogin, initLogout, initTokenDialog, oferecerMigracao } from './features/auth-ui.js';
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
import { initPdf } from './features/pdf-view.js';
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

/** Drive = backup no Sheets. ping: responde sem expor dados e diz se o token confere. */
async function checkDrive() {
    try {
        const r = await store._sheets.get({ action: 'ping' }, 8000);
        if (r?.auth === 'ok')                    setConnection('ok', 'Conectado', 'driveStatus');
        else if (r?.auth === 'nao-configurado')  setConnection('error', 'Token não configurado', 'driveStatus');
        else if (r?.auth === 'invalido')         setConnection('error', 'Token inválido', 'driveStatus');
        else throw new Error('Apps Script desatualizado (sem ping)');
    } catch (err) {
        console.warn('[DRIVE] sem conexão:', err.message);
        setConnection('error', 'Sem conexão', 'driveStatus');
    }
}

async function start() {
    hydrateIcons();
    showToday();
    initLogout();
    initTokenDialog();
    await requireLogin();   // nada abaixo roda sem sessão
    checkDrive();

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

    await oferecerMigracao();
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
