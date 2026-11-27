import test from 'node:test';
import assert from 'node:assert/strict';
import { derivar, uidDe, novoSalt, sha256Hex, normUsuario } from '../js/utils/crypto.js';

test('derivação é determinística e separa chave/token', async () => {
    const s = novoSalt();
    const a = await derivar('Rafael', 'senha-longa-123', s, 1000);
    const b = await derivar(' rafael ', 'senha-longa-123', s, 1000);
    assert.deepEqual(a, b);
    assert.match(a.chave, /^[0-9a-f]{64}$/);
    assert.match(a.token, /^[0-9a-f]{64}$/);
    assert.notEqual(a.chave, a.token);
});
test('senha, salt ou usuário diferentes → chave diferente', async () => {
    const s = novoSalt();
    const base = await derivar('r', 'abc12345678', s, 1000);
    assert.notEqual((await derivar('r', 'abc12345679', s, 1000)).chave, base.chave);
    assert.notEqual((await derivar('r', 'abc12345678', novoSalt(), 1000)).chave, base.chave);
    assert.notEqual((await derivar('x', 'abc12345678', s, 1000)).chave, base.chave);
});
test('uid ignora caixa/espaços; salts são aleatórios', async () => {
    assert.equal(await uidDe('Rafael '), await uidDe('rafael'));
    assert.notEqual(novoSalt(), novoSalt());
    assert.equal(normUsuario('  ÀB '), 'àb');
    assert.equal((await sha256Hex('abc')).slice(0, 8), 'ba7816bf');
});
