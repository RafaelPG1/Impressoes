// ============================================================================
// dialog.js — diálogos nativos <dialog>: abrir/fechar, confirmação, aviso
// ============================================================================

import { esc } from '../utils/format.js';

const $ = (id) => document.getElementById(id);

export function openDialog(dlg) {
    if (!dlg.open) dlg.showModal();
    document.body.classList.add('is-locked');
}

export function closeDialog(dlg, value) {
    if (dlg.open) dlg.close(value);
}

// <dialog> não propaga "close"; capturamos na fase de captura para liberar a rolagem.
document.addEventListener('close', () => {
    if (!document.querySelector('dialog[open]')) document.body.classList.remove('is-locked');
}, true);

// Qualquer [data-close] fecha o diálogo que o contém.
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-close]');
    if (btn) btn.closest('dialog')?.close('cancel');
});

/**
 * Confirmação. Resolve true/false.
 * requireText: o usuário precisa digitar esse texto para liberar o botão (ações irreversíveis).
 */
export function confirmDialog({ title, message, okText = 'Confirmar', danger = false, hideCancel = false, requireText = null }) {
    const dlg = $('dlgConfirm');
    const ok  = $('confirmOkBtn');
    const typeField = $('confirmTypeField');
    const typeInput = $('confirmTypeInput');

    $('confirmTitle').textContent   = title;
    $('confirmMessage').textContent = message;
    ok.textContent = okText;
    ok.className   = `btn ${danger ? 'btn-danger' : 'btn-primary'}`;
    $('confirmCancelBtn').hidden = hideCancel;

    typeField.hidden = !requireText;
    typeInput.value  = '';
    ok.disabled      = !!requireText;
    if (requireText) $('confirmTypeLabel').textContent = `Digite ${requireText} para confirmar`;

    const onInput = () => { ok.disabled = typeInput.value.trim().toUpperCase() !== requireText; };
    typeInput.addEventListener('input', onInput);

    dlg.returnValue = '';
    openDialog(dlg);
    (requireText ? typeInput : ok).focus();

    return new Promise((resolve) => {
        dlg.addEventListener('close', () => {
            typeInput.removeEventListener('input', onInput);
            resolve(dlg.returnValue === 'ok');
        }, { once: true });
    });
}

/** Aviso com conteúdo HTML já escapado pelo chamador. */
export function noticeDialog(title, bodyHtml) {
    $('noticeTitle').textContent = title;
    $('noticeBody').innerHTML = bodyHtml;
    openDialog($('dlgNotice'));
}

/** Monta <dl class="notice-list"> a partir de [rótulo, valor, zero?]. */
export function noticeList(rows) {
    return `<dl class="notice-list">${rows.map(([k, v, zero]) =>
        `<div><dt>${esc(k)}</dt><dd class="${zero ? 'is-zero' : ''}">${esc(v)}</dd></div>`).join('')}</dl>`;
}
