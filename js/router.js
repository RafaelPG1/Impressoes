// ============================================================================
// router.js — navegação por hash (#/impressoes, #/clientes, #/ajustes)
// ============================================================================

import { icon } from './ui/icons.js';

const VIEWS = {
    impressoes: { title: 'Impressões',     icon: 'printer', sub: 'Registre, acompanhe e gerencie suas impressões' },
    clientes:   { title: 'Clientes',       icon: 'users',   sub: 'Gerencie seus clientes e histórico de pagamentos' },
    ajustes:    { title: 'Preços e dados', icon: 'tag',     sub: 'Configure os preços dos serviços e gerencie suas informações' },
};
const DEFAULT = 'impressoes';

function current() {
    const name = location.hash.replace(/^#\/?/, '');
    return VIEWS[name] ? name : DEFAULT;
}

function render() {
    const name = current();
    for (const key of Object.keys(VIEWS)) {
        document.getElementById(`view-${key}`).hidden = key !== name;
    }
    document.querySelectorAll('[data-view]').forEach((a) => {
        if (a.dataset.view === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const v = VIEWS[name];
    document.getElementById('viewTitle').textContent = v.title;
    document.getElementById('viewSub').textContent = v.sub;
    document.getElementById('viewIcon').innerHTML = icon(v.icon, 44);
    document.title = `${v.title} — Impressões`;
    window.scrollTo(0, 0);
}

export function initRouter() {
    window.addEventListener('hashchange', render);
    render();
}
