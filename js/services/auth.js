// ============================================================================
// auth.js — login simples só com Firestore (sem Firebase Authentication)
//
// NÃO é autenticação robusta. Funciona assim: usuário+senha → PBKDF2 → "chave".
// Os dados ficam em dados/{chave}/…; as regras do Firestore só liberam esse
// caminho (e a chave tem 256 bits, impossível de adivinhar). Quem não sabe a
// senha não chega aos dados; quem sabe (ou roubar a chave da sessão) tem acesso
// total. Limites e riscos: README, seção "Segurança".
// ============================================================================

import { writeBatch, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { store } from './firestore.js';
import { derivar, uidDe, novoSalt, PBKDF2_ITER, normUsuario } from '../utils/crypto.js';

const K_SESSAO = 'impressoes.sessao';
const K_TENTATIVAS = 'impressoes.tentativas';
const DIAS_MANTER = 30;
export const SENHA_MIN = 10;

const GENERICO = 'Usuário ou senha inválidos.';
const safe = (fn) => { try { return fn(); } catch { return null; } };
const lerJSON = (st, k) => safe(() => JSON.parse(st.getItem(k)));

// ── Bloqueio por tentativas (só no navegador: quem mexer no localStorage ou usar
//    outro cliente ignora isso — não substitui limite no servidor) ──────────────
export function bloqueioRestante() {
    const t = lerJSON(localStorage, K_TENTATIVAS);
    return t?.ate > Date.now() ? Math.ceil((t.ate - Date.now()) / 1000) : 0;
}
function falhou() {
    const t = lerJSON(localStorage, K_TENTATIVAS) || { n: 0 };
    t.n += 1;
    if (t.n >= 5) t.ate = Date.now() + Math.min(15 * 60, 30 * 2 ** (t.n - 5)) * 1000;
    safe(() => localStorage.setItem(K_TENTATIVAS, JSON.stringify(t)));
}
const limparFalhas = () => safe(() => localStorage.removeItem(K_TENTATIVAS));

// ── Sessão ───────────────────────────────────────────────────────────────────
function guardar(sessao, manter) {
    safe(() => localStorage.removeItem(K_SESSAO));
    safe(() => sessionStorage.removeItem(K_SESSAO));
    const st = manter ? localStorage : sessionStorage;
    const s = { ...sessao, exp: manter ? Date.now() + DIAS_MANTER * 864e5 : null };
    safe(() => st.setItem(K_SESSAO, JSON.stringify(s)));
}

export function sair(recarregar = true) {
    safe(() => localStorage.removeItem(K_SESSAO));
    safe(() => sessionStorage.removeItem(K_SESSAO));
    store.setChave(null);
    if (recarregar) location.reload();
}

const contaRef = (chave) => doc(store.db, 'dados', chave, 'meta', 'conta');

/** Restaura sessão salva e confere no banco que a chave ainda é válida. */
export async function restaurar() {
    const s = lerJSON(sessionStorage, K_SESSAO) || lerJSON(localStorage, K_SESSAO);
    if (!s?.chave || (s.exp && s.exp < Date.now())) { sair(false); return null; }
    try {
        if (!(await getDoc(contaRef(s.chave))).exists()) { sair(false); return null; }
    } catch (err) {
        // Sem rede ≠ sessão inválida: mantém a sessão, o carregamento de dados mostra o erro.
        if (err?.code !== 'permission-denied') { store.setChave(s.chave, s.token); return s; }
        sair(false); return null;
    }
    store.setChave(s.chave, s.token);
    return s;
}

export async function instalado() {
    try { return (await getDoc(doc(store.db, 'config', 'instalado'))).exists(); }
    catch { return false; }
}

function validar(usuario, senha) {
    if (!/^[\p{L}\p{N}._-]{3,40}$/u.test(normUsuario(usuario))) throw new Error('Usuário: 3 a 40 letras, números, ponto, hífen ou _.');
    if (String(senha).length < SENHA_MIN) throw new Error(`Senha: mínimo de ${SENHA_MIN} caracteres.`);
}

export async function entrar(usuario, senha, manter) {
    const espera = bloqueioRestante();
    if (espera) throw new Error(`Muitas tentativas. Aguarde ${espera}s.`);
    if (!usuario || !senha) throw new Error(GENERICO);

    const uid = await uidDe(usuario);
    let acesso;
    try { acesso = await getDoc(doc(store.db, 'acessos', uid)); }
    catch (err) { throw new Error('Sem conexão com o banco. Tente de novo.'); }
    if (!acesso.exists()) { falhou(); throw new Error(GENERICO); }

    const { salt, iter } = acesso.data();
    const { chave, token } = await derivar(usuario, senha, salt, iter);
    let ok;
    try { ok = (await getDoc(contaRef(chave))).exists(); }
    catch (err) { throw new Error('Sem conexão com o banco. Tente de novo.'); }
    if (!ok) { falhou(); throw new Error(GENERICO); }

    limparFalhas();
    store.setChave(chave, token);
    guardar({ chave, token, uid }, manter);
    return { chave, token, uid };
}

/** Cadastro único: as regras só permitem enquanto config/instalado não existir. */
export async function cadastrar(usuario, senha, manter) {
    validar(usuario, senha);
    if (await instalado()) throw new Error('Já existe um usuário cadastrado. O cadastro é único.');

    const uid = await uidDe(usuario);
    const salt = novoSalt();
    const { chave, token } = await derivar(usuario, senha, salt, PBKDF2_ITER);
    const agora = new Date().toISOString();

    const b = writeBatch(store.db);
    b.set(doc(store.db, 'acessos', uid), { salt, iter: PBKDF2_ITER, criadoEm: agora });
    b.set(contaRef(chave), { criadoEm: agora });
    b.set(doc(store.db, 'config', 'instalado'), { em: agora, uid });
    try { await b.commit(); }
    catch (err) {
        if (err?.code === 'permission-denied') throw new Error('Cadastro recusado pelas regras do Firestore (já instalado ou regras não publicadas).');
        throw new Error('Não foi possível cadastrar: ' + (err?.message || err));
    }
    store.setChave(chave, token);
    guardar({ chave, token, uid }, manter);
    return { chave, token, uid };
}

export const sessaoAtual = () => lerJSON(sessionStorage, K_SESSAO) || lerJSON(localStorage, K_SESSAO);
