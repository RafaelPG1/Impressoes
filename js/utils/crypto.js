// ============================================================================
// crypto.js — derivação de chaves a partir de usuário + senha (WebCrypto)
//
// A senha NUNCA é guardada nem enviada. Dela sai (PBKDF2-SHA256, salt aleatório
// por usuário) um bloco de 64 bytes:
//   • 32 primeiros → "chave" de dados: vira o caminho dados/{chave}/… no Firestore
//   • 32 últimos   → "token" do backup: enviado ao Apps Script (que guarda só o hash)
// Quem não tem a senha não consegue calcular o caminho, então não acessa os dados.
// Isto NÃO é autenticação de verdade: é um segredo-no-caminho (veja README).
// ============================================================================

export const PBKDF2_ITER = 600000;

const enc = new TextEncoder();
const subtle = () => globalThis.crypto.subtle;

export const bytesToHex = (buf) =>
    Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');

export const hexToBytes = (hex) =>
    Uint8Array.from(hex.match(/../g) || [], (h) => parseInt(h, 16));

export const normUsuario = (u) => String(u || '').normalize('NFKC').trim().toLowerCase();

export function novoSalt() {
    return bytesToHex(globalThis.crypto.getRandomValues(new Uint8Array(16)));
}

/** id público do usuário (documento acessos/{uid}); só identifica, não autentica. */
export async function uidDe(usuario) {
    return bytesToHex(await subtle().digest('SHA-256', enc.encode('usuario:' + normUsuario(usuario))));
}

export async function sha256Hex(texto) {
    return bytesToHex(await subtle().digest('SHA-256', enc.encode(texto)));
}

/** → { chave, token } (hex de 64 caracteres cada). */
export async function derivar(usuario, senha, saltHex, iter = PBKDF2_ITER) {
    const base = await subtle().importKey('raw', enc.encode(String(senha).normalize('NFKC')),
        'PBKDF2', false, ['deriveBits']);
    const salt = new Uint8Array([...hexToBytes(saltHex), ...enc.encode(normUsuario(usuario))]);
    const bits = await subtle().deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, base, 512);
    const hex = bytesToHex(bits);
    return { chave: hex.slice(0, 64), token: hex.slice(64) };
}
