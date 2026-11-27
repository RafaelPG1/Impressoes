// ============================================================================
// auth-ui.js — tela de login/cadastro, logout, token do backup, migração
// ============================================================================

import { getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { store } from '../services/firestore.js';
import { entrar, cadastrar, restaurar, instalado, sair, sessaoAtual } from '../services/auth.js';
import { confirmDialog, noticeDialog, noticeList } from '../ui/dialog.js';
import { notify, withLoader } from '../ui/feedback.js';
import { esc } from '../utils/format.js';

const $ = (id) => document.getElementById(id);

function mostrarApp() {
    $('authScreen').hidden = true;
    $('app').hidden = false;
    $('authPass').value = ''; $('authPass2').value = '';
}

/** Resolve quando há sessão válida (restaurada ou recém-criada). */
export async function requireLogin() {
    if (!store.isConfigured) { mostrarApp(); return; }
    if (await restaurar()) { mostrarApp(); return; }

    const form = $('authForm');
    let modoCadastro = false;
    const setModo = (cad) => {
        modoCadastro = cad;
        $('authPass2Field').hidden = !cad;
        $('authPass').autocomplete = cad ? 'new-password' : 'current-password';
        $('authSub').textContent = cad ? 'Criar o usuário (cadastro único)' : 'Entre para continuar';
        $('authSubmit').textContent = cad ? 'Criar usuário' : 'Entrar';
        $('authToggle').textContent = cad ? 'Já tenho usuário' : 'Primeiro acesso? Criar usuário';
        $('authError').textContent = '';
    };
    setModo(false);
    $('authScreen').hidden = false;
    $('authUser').focus();
    instalado().then((ja) => { $('authToggle').hidden = ja; });
    $('authToggle').addEventListener('click', () => setModo(!modoCadastro));

    return new Promise((resolve) => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usuario = $('authUser').value, senha = $('authPass').value, manter = $('authKeep').checked;
            $('authError').textContent = '';
            if (modoCadastro && senha !== $('authPass2').value) { $('authError').textContent = 'As senhas não conferem.'; return; }
            $('authSubmit').disabled = true;
            try {
                await withLoader(() => (modoCadastro ? cadastrar : entrar)(usuario, senha, manter),
                    modoCadastro ? 'Criando usuário…' : 'Verificando…');
                mostrarApp();
                resolve();
            } catch (err) {
                $('authError').textContent = err.message;
            } finally {
                $('authSubmit').disabled = false;
            }
        });
    });
}

export function initLogout() {
    ['logoutBtn', 'logoutBtnMobile'].forEach((id) => $(id).addEventListener('click', () => sair()));
}

/** Mostra o token que o Apps Script precisa (derivado da senha; nunca vai para o código). */
export function initTokenDialog() {
    $('tokenBtn').addEventListener('click', () => {
        const t = sessaoAtual()?.token;
        if (!t) { notify.error('Entre de novo para gerar o token.'); return; }
        noticeDialog('Token do backup (Google Sheets)',
            `<p>Cole este token em <code>TOKEN_INICIAL</code> no Apps Script, rode <code>configurarToken()</code> e <strong>apague</strong> o token do código. Quem tiver este token escreve na sua planilha: não compartilhe.</p>
             <div class="token-box" id="tokenBox">${esc(t)}</div>
             <p><button type="button" class="btn btn-ghost" id="copyTokenBtn">Copiar</button></p>`);
        $('copyTokenBtn').addEventListener('click', async () => {
            try { await navigator.clipboard.writeText(t); notify.success('Token copiado.'); }
            catch { notify.error('Não foi possível copiar. Selecione o texto e copie.'); }
        });
    });
}

/** Dados da versão antiga (raiz do Firestore) → dados/{chave}. Só aparece se ainda houver dados legíveis. */
export async function oferecerMigracao() {
    const marca = store._doc('meta', 'migrado');
    try { if ((await getDoc(marca)).exists()) return false; } catch { return false; }
    if (!(await store.temDadosNaRaiz())) return false;

    const ok = await confirmDialog({
        title: 'Migrar dados antigos',
        message: 'Há dados da versão sem login. Copiar para a sua conta? Nada é apagado nem sobrescrito; pode repetir sem duplicar. Depois, publique as regras finais do Firestore (firestore.rules).',
        okText: 'Migrar',
    });
    if (!ok) return false;
    try {
        const r = await withLoader(() => store.migrarDaRaiz(), 'Migrando dados…');
        await setDoc(marca, { em: new Date().toISOString(), ...r });
        noticeDialog('Migração concluída', noticeList([
            ['Clientes', r.clientes], ['Impressões', r.impressoes], ['Pagamentos', r.pagamentos],
            ['Vínculos', r.pagamentosImpressoes], ['Preços', r.precos]]));
        return true;
    } catch (err) {
        console.error('[MIGRACAO]', err);
        notify.error('Falha na migração: ' + (err.message || err), null, 8000);
        return false;
    }
}
