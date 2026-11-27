// SIMULAÇÃO: roda apps-script/Codigo.gs em Node (vm) com um Google Sheets falso em memória.
// Prova a lógica do código; NÃO prova o comportamento do Google (lock, formatos, deploy).
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';

const TOKEN = 'a'.repeat(64);
const src = fs.readFileSync(new URL('../apps-script/Codigo.gs', import.meta.url), 'utf8');

function novoAmbiente({ tokenCfg = TOKEN, lockOcupado = false } = {}) {
  const abas = {};
  const mkSheet = (nome) => {
    const g = []; // g[r-1][c-1]
    const fmt = [];
    const cell = (r, c) => (g[r - 1] ||= [])[c - 1];
    const sheet = {
      nome, g, fmt,
      getName: () => nome,
      getLastRow: () => { let l = 0; g.forEach((row, i) => { if (row && row.some((v) => v !== undefined && v !== '')) l = i + 1; }); return l; },
      getLastColumn: () => Math.max(1, ...g.map((r) => (r ? r.length : 0))),
      getRange(r, c = 1, nr = 1, nc = 1) {
        if (typeof r === 'string') { // "A:A"
          const x = sheet.getRange(1, 1);
          return new Proxy(x, { get: (t, k) => (k === 'getValues' ? () => g.map((row) => [row ? row[0] ?? '' : '']) : t[k]) });
        }
        const rng = {
          getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => cell(r + i, c + j) ?? '')),
          setValues(v) { v.forEach((row, i) => row.forEach((x, j) => { ((g[r - 1 + i] ||= [])[c - 1 + j] = x); })); return px; },
          setValue(x) { (g[r - 1] ||= [])[c - 1] = x; return px; },
          getValue: () => cell(r, c) ?? '',
          setNumberFormats(f) { fmt.push({ r, c, f }); return px; },
        };
        const px = new Proxy(rng, { get: (t, k) => (k in t ? t[k] : () => px) });
        return px;
      },
      deleteRow(n) { g.splice(n - 1, 1); },
      deleteRows(n, q) { g.splice(n - 1, q); },
      getDataRange: () => sheet.getRange(1, 1, Math.max(1, sheet.getLastRow()), sheet.getLastColumn()),
      appendRow(v) { g.push(v); },
    };
    return new Proxy(sheet, { get: (t, k) => (k in t ? t[k] : () => sheet.getRange(1, 1)) });
  };
  ['Clientes', 'Impressoes', 'Pagamentos', 'Pagamentos_Impressoes', 'Adicionar'].forEach((n) => { abas[n] = mkSheet(n); });
  const props = {};
  if (tokenCfg) props.TOKEN_HASH = createHash('sha256').update(tokenCfg).digest('hex');
  const ctx = {
    Logger: { log(m) { if (process.env.DBG) console.log('LOG', m); } },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' },
      computeDigest: (_a, t) => [...createHash('sha256').update(t).digest()].map((b) => (b > 127 ? b - 256 : b)),
      getUuid: () => randomUUID(),
      formatDate: () => '01/01/2026 10:00:00',
    },
    Session: { getScriptTimeZone: () => 'UTC' },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props[k] ?? null, setProperty: (k, v) => { props[k] = v; } }) },
    LockService: { getScriptLock: () => ({ waitLock() { if (lockOcupado) throw new Error('timeout'); }, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ t, setMimeType() { return this; } }) },
    SpreadsheetApp: {
      BorderStyle: { SOLID: 1 },
      getActiveSpreadsheet: () => ({ getSheetByName: (n) => abas[n] || null, insertSheet: (n) => (abas[n] = mkSheet(n)), setActiveSheet() {}, moveActiveSheet() {} }),
      getActive: () => ({ toast() {} }),
    },
  };
  vm.createContext(ctx); vm.runInContext(src, ctx);
  const j = (o) => JSON.parse(o.t);
  return {
    abas, props, ctx,
    post: (p) => j(ctx.doPost({ postData: { contents: typeof p === 'string' ? p : JSON.stringify(p) } })),
    get: (p) => j(ctx.doGet({ parameter: p })),
  };
}
const up = (extra = {}) => ({ token: TOKEN, action: 'upsert', sheetName: 'Clientes', id: 'c1', data: { nome: 'Ana' }, ...extra });

test('sem token / token errado / script sem token configurado → recusa', () => {
  const a = novoAmbiente();
  assert.equal(a.post({ ...up(), token: undefined }).success, false);
  assert.equal(a.post({ ...up(), token: 'b'.repeat(64) }).error, 'Não autorizado.');
  assert.equal(a.abas.Clientes.g.length, 0);
  assert.equal(a.get({ action: 'getAll' }).success, false);
  assert.equal(a.get({ action: 'getAdicionar', token: 'x' }).success, false);
  const b = novoAmbiente({ tokenCfg: null });
  assert.match(b.post(up()).error, /não configurado/);
});
test('ping revela só o estado do token, sem dados', () => {
  const a = novoAmbiente();
  assert.deepEqual(a.get({ action: 'ping', token: TOKEN }), { success: true, auth: 'ok' });
  assert.equal(a.get({ action: 'ping', token: 'zz' }).auth, 'invalido');
  assert.equal(novoAmbiente({ tokenCfg: null }).get({ action: 'ping' }).auth, 'nao-configurado');
});
test('upsert válido grava; repetir não duplica', () => {
  const a = novoAmbiente();
  assert.equal(a.post(up()).success, true);
  assert.equal(a.post(up({ data: { nome: 'Ana 2' } })).success, true);
  const rows = a.abas.Clientes.g.filter((r) => r && r[0] === 'c1');
  assert.equal(rows.length, 1); assert.equal(rows[0][1], 'Ana 2');
});
test('validação: aba, id, ação, JSON, tamanho, data', () => {
  const a = novoAmbiente();
  assert.equal(a.post(up({ sheetName: '__proto__' })).success, false);
  assert.equal(a.post(up({ sheetName: 'Adicionar' })).success, false);
  assert.equal(a.post(up({ id: 'a/b' })).success, false);
  assert.equal(a.post(up({ id: 'x'.repeat(65) })).success, false);
  assert.equal(a.post(up({ action: 'drop' })).success, false);
  assert.equal(a.post('{nao json').success, false);
  assert.equal(a.post(up({ data: [1] })).success, false);
  assert.equal(a.post('x'.repeat(2000001)).success, false);
  assert.ok(a.abas.Clientes.g.length <= 1, 'no máximo o cabeçalho');
});
test('números viram número; texto longo é cortado; fórmula vira texto (formato @)', () => {
  const a = novoAmbiente();
  a.post(up({ sheetName: 'Impressoes', id: 'i1', data: { clienteId: '=HYPERLINK("x")', valorTotal: 'abc', folhasNormais: '7', observacao: 'o'.repeat(5000) } }));
  const r = a.abas.Impressoes.g.find((x) => x && x[0] === 'i1');
  assert.equal(r[8], 0); assert.equal(r[4], 7); assert.equal(r[15].length, 1000);
  const f = a.abas.Impressoes.fmt.find((x) => x.f[0][1] === '@');
  assert.ok(f, 'células de texto com formato @'); assert.equal(f.f[0][0], '@');
  assert.equal(f.f[0][8], 'General');
});
test('syncAll exige confirmação, valida ids e deduplica', () => {
  const a = novoAmbiente();
  a.post(up());
  const base = { token: TOKEN, action: 'syncAll', sheetName: 'Clientes', id: 'bulk' };
  assert.match(a.post({ ...base, data: [] }).error, /confirm/);
  assert.equal(a.abas.Clientes.g.filter((r) => r && r[0] === 'c1').length, 1, 'não apagou sem confirm');
  assert.equal(a.post({ ...base, confirm: 'SUBSTITUIR_ABA', data: [{ id: 'ok' }, { id: '../x' }] }).success, false);
  assert.equal(a.abas.Clientes.g.filter((r) => r && r[0] === 'c1').length, 1, 'inválido não altera nada');
  const r = a.post({ ...base, confirm: 'SUBSTITUIR_ABA', data: [{ id: 'd1', nome: 'A' }, { id: 'd1', nome: 'B' }, { id: 'd2' }] });
  assert.equal(r.count, 2);
});
test('lock ocupado → erro, nada gravado', () => {
  const a = novoAmbiente({ lockOcupado: true });
  assert.match(a.post(up()).error, /ocupada/);
  assert.equal(a.abas.Clientes.g.length, 0);
});
function linhaAdicionar(a, n, nome, uid) {
  const g = a.abas.Adicionar.g;
  (g[n - 1] ||= [])[1] = nome; g[n - 1][2] = 'Xerox Colorido'; g[n - 1][3] = 3; g[n - 1][4] = 0; g[n - 1][5] = 0; g[n - 1][6] = 0; g[n - 1][7] = 3; g[n - 1][8] = '01/01/2026 10:00:00';
  if (uid) g[n - 1][9] = uid;
}
test('getAdicionar não apaga, atribui uid permanente e é estável', () => {
  const a = novoAmbiente();
  linhaAdicionar(a, 16, 'João'); linhaAdicionar(a, 17, 'Ex: modelo'); linhaAdicionar(a, 18, 'Maria');
  const r1 = a.get({ action: 'getAdicionar', token: TOKEN }).data.registros;
  assert.equal(r1.length, 2);
  assert.ok(r1.every((x) => /^[0-9a-f-]{36}$/.test(x.uid)));
  assert.equal(a.abas.Adicionar.g.length, 18, 'linhas intactas');
  const r2 = a.get({ action: 'getAdicionar', token: TOKEN }).data.registros;
  assert.deepEqual(r2.map((x) => x.uid), r1.map((x) => x.uid), 'mesmo uid na 2ª leitura');
});
test('confirmarAdicionar remove só os uids informados', () => {
  const a = novoAmbiente();
  linhaAdicionar(a, 16, 'A'); linhaAdicionar(a, 17, 'B'); linhaAdicionar(a, 18, 'C');
  const rs = a.get({ action: 'getAdicionar', token: TOKEN }).data.registros;
  const r = a.get({ action: 'confirmarAdicionar', token: TOKEN, uids: rs[0].uid + ',' + rs[2].uid + ',lixo' });
  assert.equal(r.removidas, 2);
  const resto = a.get({ action: 'getAdicionar', token: TOKEN }).data.registros;
  assert.deepEqual(resto.map((x) => x.nome), ['B']);
  assert.equal(a.get({ action: 'confirmarAdicionar', token: TOKEN, uids: 'lixo' }).success, false);
});
test('uploadPixQr e autorizarDrive não existem mais', () => {
  assert.ok(!/uploadPixQr|DriveApp/.test(src));
  assert.equal(novoAmbiente().post({ token: TOKEN, action: 'uploadPixQr' }).success, false);
});
