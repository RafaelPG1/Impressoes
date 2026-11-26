import { icon } from './icons.js';

/** Insere o ícone nomeado em data-icon no início de cada elemento (uma única vez). */
export function hydrateIcons(root = document) {
    root.querySelectorAll('[data-icon]:not([data-icon-done])').forEach((el) => {
        const size = Number(el.dataset.iconSize) || (el.classList.contains('icon-btn') ? 20 : 18);
        el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon, size));
        el.dataset.iconDone = '1';
    });
}
