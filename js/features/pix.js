// ============================================================================
// pix.js — QR Code Pix (guardado no Firestore em config/pix)
// ============================================================================

import { pixStore } from '../services/firestore.js';
import { openDialog, confirmDialog } from '../ui/dialog.js';
import { notify } from '../ui/feedback.js';

const $ = (id) => document.getElementById(id);
const MAX_BYTES = 500 * 1024;

let currentSrc = null;
let statusTimer = null;

function setStatus(text, type = '') {
    const el = $('pixUploadStatus');
    el.textContent = text;
    el.dataset.type = type;
    clearTimeout(statusTimer);
    if (type === 'success') statusTimer = setTimeout(() => setStatus(''), 4000);
}

function render(src) {
    currentSrc = src || null;
    const img = $('pixQrImage');
    img.hidden = !src;
    if (src) img.src = src; else img.removeAttribute('src');
    $('pixQrPlaceholder').hidden = !!src;
    $('pixRemoveBtn').hidden = !src;
    $('pixDownloadBtn').hidden = !src;
    $('pixUploadBtnText').textContent = src ? 'Trocar QR Code' : 'Enviar QR Code';
}

async function load() {
    setStatus('');
    try {
        render(await pixStore.get());
    } catch (err) {
        console.warn('[PIX] erro ao carregar:', err.message);
        render(null);
        setStatus('Não foi possível carregar o QR Code.', 'error');
    }
}

export function openPix() {
    openDialog($('dlgPix'));
    load();
}

function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
        reader.readAsDataURL(file);
    });
}

async function upload(e) {
    const input = e.target;
    const file = input.files[0];
    input.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) { setStatus('Envie somente imagens.', 'error'); return; }
    if (file.size > MAX_BYTES)           { setStatus('Imagem grande demais (máximo 500 KB).', 'error'); return; }

    setStatus('Salvando…');
    try {
        const dataUrl = await readAsDataUrl(file);
        await pixStore.set(dataUrl);
        render(dataUrl);
        setStatus('QR Code atualizado.', 'success');
    } catch (err) {
        console.error('[PIX] erro ao salvar:', err);
        setStatus('Não foi possível salvar: ' + err.message, 'error');
    }
}

async function remove() {
    const ok = await confirmDialog({
        title: 'Remover QR Code Pix',
        message: 'O QR Code deixa de aparecer. Será preciso enviar a imagem de novo.',
        okText: 'Remover', danger: true,
    });
    if (!ok) return;
    setStatus('Removendo…');
    try {
        await pixStore.set(null);
        render(null);
        setStatus('QR Code removido.', 'success');
    } catch (err) {
        console.error('[PIX] erro ao remover:', err);
        setStatus('Não foi possível remover: ' + err.message, 'error');
    }
}

function download() {
    if (!currentSrc) return;
    const a = document.createElement('a');
    a.href = currentSrc;
    a.download = 'qrcode-pix.png';
    a.click();
}

export function initPix() {
    ['openPixBtn', 'openPixBtnMobile'].forEach((id) => $(id).addEventListener('click', openPix));
    $('pixQrUploadInput').addEventListener('change', upload);
    $('pixUploadLabel').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('pixQrUploadInput').click(); }
    });
    $('pixRemoveBtn').addEventListener('click', remove);
    $('pixDownloadBtn').addEventListener('click', download);
}
