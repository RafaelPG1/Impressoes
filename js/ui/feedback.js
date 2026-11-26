// ============================================================================
// feedback.js — avisos (toasts) e indicador de carregamento
// ============================================================================

import { icon } from './icons.js';
import { esc } from '../utils/format.js';

const TOAST_ICON  = { success: 'circle-check', error: 'circle-alert', warning: 'triangle-alert', info: 'info' };
const TOAST_TITLE = { success: 'Pronto', error: 'Não foi possível', warning: 'Atenção', info: 'Aviso' };

export function toast(type, message, title = null, duration = 4000) {
    const host = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.dataset.type = type;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.innerHTML = `
        ${icon(TOAST_ICON[type], 20)}
        <div><div class="toast-title">${esc(title || TOAST_TITLE[type])}</div><div class="toast-msg">${esc(message)}</div></div>
        <button type="button" class="icon-btn" aria-label="Dispensar">${icon('x', 16)}</button>`;
    // Máx. 3 avisos; avisos antigos saem primeiro.
    while (host.children.length >= 3) host.firstElementChild.remove();
    host.appendChild(el);

    const close = () => {
        el.classList.add('is-leaving');
        setTimeout(() => el.remove(), 250);
    };
    const timer = setTimeout(close, duration);
    el.querySelector('button').addEventListener('click', () => { clearTimeout(timer); close(); });
}

export const notify = {
    success: (m, t, d = 3000) => toast('success', m, t, d),
    error:   (m, t, d = 5000) => toast('error',   m, t, d),
    warning: (m, t, d = 4500) => toast('warning', m, t, d),
    info:    (m, t, d = 3000) => toast('info',    m, t, d),
};

// Contador: operações aninhadas não escondem o loader antes da hora.
let pending = 0;
export const loader = {
    show(text = 'Carregando…') {
        pending++;
        document.getElementById('loaderText').textContent = text;
        document.getElementById('loader').hidden = false;
    },
    hide() {
        pending = Math.max(0, pending - 1);
        if (!pending) document.getElementById('loader').hidden = true;
    },
};

/** Executa fn mostrando o loader; sempre o esconde ao final. */
export async function withLoader(fn, text) {
    loader.show(text);
    try { return await fn(); } finally { loader.hide(); }
}
