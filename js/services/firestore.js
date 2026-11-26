// ============================================================================
// firestore.js — acesso ao Firestore (impressões, clientes, pagamentos, preços)
// ============================================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
    getFirestore, collection, doc, getDoc, getDocs,
    addDoc, setDoc, updateDoc, deleteDoc,
    query, where, orderBy, limit, writeBatch,
    serverTimestamp, Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

import { FIREBASE_CONFIG, SHEETS_URL, DEFAULT_PRICES } from '../config.js';
import { SheetsSync } from './sheets.js';
import { allocate } from '../utils/allocate.js';
import { round2, statusOf } from '../utils/format.js';

const normNome = (n) => String(n || '').trim().replace(/\s+/g, ' ').toLowerCase();

// ─────────────────────────────────────────────────────────────────────────────
// FIREBASE MANAGER — Classe principal
// ─────────────────────────────────────────────────────────────────────────────

class FirebaseManager {
    constructor() {
        this.app          = null;
        this.db           = null;
        this.isConfigured = false;
        this._sheets      = new SheetsSync();
        this._init();
    }

    _init() {
        if (!FIREBASE_CONFIG.apiKey) {
            console.error('[FIREBASE] ❌ Credenciais não configuradas.');
            return;
        }
        try {
            this.app          = initializeApp(FIREBASE_CONFIG);
            this.db           = getFirestore(this.app);
            this.isConfigured = true;
            console.log('[FIREBASE] ✅ Conectado ao Firestore');
        } catch (err) {
            console.error('[FIREBASE] ❌ Erro ao inicializar:', err);
        }
    }

    // ── Helpers internos ────────────────────────────────────────────────────

    _col(name)    { return collection(this.db, name); }
    _doc(col, id) { return doc(this.db, col, id); }

    _toDate(value) {
        if (!value)                     return new Date();
        if (value instanceof Timestamp) return value.toDate();
        if (value?.seconds)             return new Date(value.seconds * 1000);
        return new Date(value);
    }

    /** Grava em lotes de 450. shortcut: acima disso perde atomicidade; uso pessoal raramente passa. */
    async _commit(ops) {
        for (let i = 0; i < ops.length; i += 450) {
            const b = writeBatch(this.db);
            ops.slice(i, i + 450).forEach((fn) => fn(b));
            await b.commit();
        }
    }

    /** Vínculos pagamento–impressão de uma lista de pagamentos ('in' aceita até 30 por consulta). */
    async _relDocs(pagamentoIds) {
        const out = [];
        for (let i = 0; i < pagamentoIds.length; i += 30) {
            const snap = await getDocs(query(this._col('pagamentosImpressoes'),
                where('pagamentoId', 'in', pagamentoIds.slice(i, i + 30))));
            out.push(...snap.docs);
        }
        return out;
    }

    async _impressoesDoCliente(clienteId) {
        const snap = await getDocs(query(this._col('impressoes'), where('clienteId', '==', clienteId)));
        return snap.docs.map((d) => ({ id: d.id, ref: d.ref, ...d.data() }));
    }

    /** Documento do Firestore → objeto pronto para a planilha (datas em ISO, sem sentinelas). */
    _paraPlanilha(id, atual, extra = {}) {
        const m = { ...atual, ...extra };
        delete m.updatedAt;
        m.createdAt = this._toDate(atual.createdAt).toISOString();
        return this._sheets.formatImpressao(id, m);
    }

    // ── Clientes ────────────────────────────────────────────────────────────

    async _getOrCreateCliente(nome) {
        const nomeTrim = (nome || '').trim().replace(/\s+/g, ' ');
        if (!nomeTrim) throw new Error('Nome do cliente é obrigatório');

        // Compara sem diferenciar maiúsculas/espaços: "maria  souza" = "Maria Souza".
        const snap  = await getDocs(this._col('clientes'));
        const achou = snap.docs.find((d) => normNome(d.data().nome) === normNome(nomeTrim));
        if (achou) return { id: achou.id, ...achou.data() };

        const novoRef = await addDoc(this._col('clientes'), {
            nome: nomeTrim, telefone: `Aguardando cadastro - ${nomeTrim}`,
            ativo: true, createdAt: serverTimestamp(),
        });

        const clienteData = {
            nome: nomeTrim, telefone: `Aguardando cadastro - ${nomeTrim}`,
            ativo: true, createdAt: new Date().toISOString(),
        };
        this._sheets.upsert('Clientes', novoRef.id,
            this._sheets.formatCliente(novoRef.id, clienteData));

        return { id: novoRef.id, ...clienteData };
    }

    // ── Preços ──────────────────────────────────────────────────────────────

    async loadPrices() {
        if (!this.isConfigured) return null;
        try {
            const snap = await getDocs(this._col('precos'));
            if (snap.empty) {
                await this._syncResetPrices();
                return { 1: 0.50, 2: 1.00, 3: 1.50, 4: 2.00, 5: 0.50 };
            }
            const prices = {};
            snap.forEach(d => { prices[d.data().tipo] = parseFloat(d.data().valor); });
            return prices;
        } catch (err) {
            console.error('[FIREBASE] ❌ Erro ao carregar preços:', err);
            throw err;
        }
    }

    savePrices(prices, offsetPrice) { return this._syncSavePrices({ prices, offsetPrice }); }
    resetPrices()                   { return this._syncResetPrices(); }

    // ── Impressões ──────────────────────────────────────────────────────────

    async loadImpressions() {
        if (!this.isConfigured) return [];
        // Erros sobem: lista vazia por falha de rede não pode parecer "sem dados".
        const [impressoesSnap, clientesSnap] = await Promise.all([
            getDocs(this._col('impressoes')),
            getDocs(this._col('clientes')),
        ]);

        const clientesMap = {};
        clientesSnap.forEach(d => { clientesMap[d.id] = d.data().nome; });

        return impressoesSnap.docs.map(d => {
            const data = d.data();
            return {
                id:              d.id,
                cliente:         clientesMap[data.clienteId] || 'Desconhecido',
                clienteId:       data.clienteId,
                tipoImpressao:   data.tipoImpressao  || 0,
                tipoPreco:       data.tipoPreco       || 'Desconhecido',
                folhasNormais:   data.folhasNormais   || 0,
                folhasOffset:    data.folhasOffset    || 0,
                projetoCanva:    parseFloat(data.projetoCanva  || 0),
                trabalho:        parseFloat(data.trabalho      || 0),
                valorTotal:      parseFloat(data.valorTotal    || 0),
                valorPago:       parseFloat(data.valorPago     || 0),
                valorRestante:   parseFloat(data.valorRestante || 0),
                statusPagamento: data.statusPagamento || 'pendente',
                dataHora:        this._toDate(data.dataImpressao).toISOString(),
                timestamp:       this._toDate(data.createdAt ?? data.dataImpressao).getTime(),
            };
        }).sort((a, b) => b.timestamp - a.timestamp);
    }

    updateImpression(id, data) { return this._syncUpdateImpression({ id, impressionData: data }); }

    // ── Importa dados da aba Adicionar do Sheets → Firebase ─────────────────

    async importFromAdicionar() {
        if (!this.isConfigured) throw new Error('Firebase não configurado');

        console.log('[ADICIONAR] 🔄 Buscando dados da aba Adicionar...');

        let sheetsData;
        try {
            const resp = await fetch(`${SHEETS_URL}?action=getAdicionar`, {
                method:   'GET',
                redirect: 'follow',
            });
            sheetsData = await resp.json();
        } catch (err) {
            throw new Error('Erro ao buscar aba Adicionar: ' + err.message);
        }

        if (!sheetsData?.success) {
            throw new Error(sheetsData?.error || 'Erro na resposta do Sheets.');
        }

        const registros = sheetsData.data?.registros || [];
        if (registros.length === 0) {
            console.log('[ADICIONAR] Nenhum registro novo na aba Adicionar.');
            return { total: 0 };
        }

        console.log(`[ADICIONAR] ${registros.length} registro(s) encontrado(s).`);

        const TIPO_MAP = {
            'Xerox Preto e Branco':       1,
            'Xerox Colorido':             2,
            'Impressão Digital P&B':      3,
            'Impressão Digital Colorido': 4,
        };

        const prices = await this.loadPrices();   // uma vez só (antes era uma leitura por registro)
        const num    = (v) => Number(v) || 0;

        let importados = 0;
        for (const raw of registros) {
            try {
                const reg = { ...raw, folhas: num(raw.folhas), offset: num(raw.offset), canva: num(raw.canva), trabalho: num(raw.trabalho) };
                const tipoNum     = TIPO_MAP[reg.tipo] || 0;
                const precoTipo   = prices?.[tipoNum] || 0;
                const precoOffset = prices?.[5]       || 0;

                const totalCalculado = (reg.folhas * precoTipo) + (reg.offset * precoOffset) + reg.canva + reg.trabalho;
                const valorFinal     = round2(totalCalculado > 0 ? totalCalculado : num(reg.total));

                const tipoPreco = tipoNum > 0
                    ? `${reg.tipo} R$ ${precoTipo.toFixed(2)}`
                    : 'Desconhecido';

                let dataHora = new Date().toISOString();
                if (reg.dataHora && reg.dataHora !== '') {
                    const match = reg.dataHora.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
                    if (match) {
                        dataHora = new Date(
                            parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]),
                            parseInt(match[4]), parseInt(match[5]), parseInt(match[6])
                        ).toISOString();
                    }
                }

                await this._syncAddImpression({
                    cliente:         reg.nome,
                    tipoImpressao:   tipoNum,
                    tipoPreco,
                    folhasNormais:   reg.folhas,
                    folhasOffset:    reg.offset,
                    projetoCanva:    reg.canva,
                    trabalho:        reg.trabalho,
                    valorTotal:      valorFinal,
                    valorPago:       0,
                    statusPagamento: 'pendente',
                    dataHora,
                });
                importados++;
            } catch (err) {
                console.error(`[ADICIONAR] ❌ Erro ao importar "${raw.nome}":`, err.message);
            }
        }

        console.log(`[ADICIONAR] ✅ ${importados} impressão(ões) importada(s).`);
        return { total: importados };
    }

    // ── Operações internas ───────────────────────────────────────────────────

    async _syncAddImpression(impressionData) {
        if (!this.isConfigured) throw new Error('Firebase não configurado');

        const valorTotal      = round2(parseFloat(impressionData.valorTotal || 0));
        const valorPago       = round2(parseFloat(impressionData.valorPago  || 0));
        if (!Number.isFinite(valorTotal) || valorTotal < 0) throw new Error('Valor total inválido');
        const cliente         = await this._getOrCreateCliente(impressionData.cliente);
        const valorRestante   = round2(valorTotal - valorPago);
        const statusPagamento = impressionData.statusPagamento === 'ativo'
            ? 'pendente' : (impressionData.statusPagamento || 'pendente');

        const data = {
            clienteId:       cliente.id,
            tipoPreco:       impressionData.tipoPreco    || 'Desconhecido',
            folhasNormais:   impressionData.folhasNormais || 0,
            folhasOffset:    impressionData.folhasOffset  || 0,
            projetoCanva:    parseFloat(impressionData.projetoCanva || 0),
            trabalho:        parseFloat(impressionData.trabalho     || 0),
            valorTotal, valorPago, valorRestante, statusPagamento,
            dataImpressao:   impressionData.dataHora || new Date().toISOString(),
            observacao:      impressionData.observacao || '',
            createdAt:       serverTimestamp(),
        };
        if (impressionData.tipoImpressao && impressionData.tipoImpressao !== 0) {
            data.tipoImpressao = impressionData.tipoImpressao;
        }

        const ref = await addDoc(this._col('impressoes'), data);
        this._sheets.upsert('Impressoes', ref.id,
            this._sheets.formatImpressao(ref.id, { ...data, createdAt: new Date().toISOString() }));
        console.log('[FIREBASE] ✅ Impressão adicionada:', ref.id);
        return { id: ref.id, ...data };
    }

    async _syncUpdateImpression({ id, impressionData }) {
        if (!this.isConfigured) throw new Error('Firebase não configurado');

        const ref  = this._doc('impressoes', id);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error('Impressão não encontrada');
        const atual = snap.data();

        const valorTotal = round2(parseFloat(impressionData.valorTotal || 0));
        if (!Number.isFinite(valorTotal) || valorTotal < 0) throw new Error('Valor total inválido');

        // Novo total menor que o já pago: o excesso vai para outras impressões em aberto do cliente.
        const pagoAtual = round2(parseFloat(atual.valorPago || 0));
        const pagoNovo  = Math.min(pagoAtual, valorTotal);
        const excedente = round2(pagoAtual - pagoNovo);
        let realoc = { updates: [], sobra: 0 }, outras = [];
        if (excedente > 0) {
            outras = (await this._impressoesDoCliente(atual.clienteId)).filter((i) => i.id !== id);
            realoc = allocate(outras, excedente);
            if (realoc.sobra > 0) {
                throw new Error('O novo valor é menor que o já pago e o cliente não tem outra impressão em aberto para receber a diferença. Remova um pagamento no histórico antes de editar.');
            }
        }

        let clienteId = atual.clienteId;
        if (impressionData.cliente) {
            const cliente = await this._getOrCreateCliente(impressionData.cliente);
            if (cliente.id !== atual.clienteId && pagoAtual > 0) {
                throw new Error('Esta impressão já tem pagamento. Remova o pagamento no histórico antes de trocar o cliente.');
            }
            clienteId = cliente.id;
        }

        const status = statusOf({ valorTotal, valorPago: pagoNovo });
        const update = {
            clienteId,
            tipoImpressao:   impressionData.tipoImpressao || 0,
            tipoPreco:       impressionData.tipoPreco || 'Desconhecido',
            folhasNormais:   impressionData.folhasNormais || 0,
            folhasOffset:    impressionData.folhasOffset  || 0,
            projetoCanva:    parseFloat(impressionData.projetoCanva || 0),
            trabalho:        parseFloat(impressionData.trabalho     || 0),
            valorTotal,
            valorPago:       pagoNovo,
            valorRestante:   round2(valorTotal - pagoNovo),
            statusPagamento: status,
            updatedAt:       serverTimestamp(),
        };
        if (impressionData.dataHora) update.dataImpressao = impressionData.dataHora;
        if (status !== 'pago' && atual.dataQuitacao) update.dataQuitacao = '';
        if (pagoNovo === 0 && atual.dataPrimeiroPagamento) update.dataPrimeiroPagamento = '';

        const ops = [(b) => b.update(ref, update)];
        realoc.updates.forEach((u) => {
            const { id: oid, aplicado, ...campos } = u;
            ops.push((b) => b.update(this._doc('impressoes', oid), campos));
        });
        await this._commit(ops);

        // Planilha: linha completa (antes a edição apagava clienteId/datas do backup).
        this._sheets.upsert('Impressoes', id, this._paraPlanilha(id, atual, update));
        realoc.updates.forEach((u) => {
            const o = outras.find((x) => x.id === u.id);
            this._sheets.upsert('Impressoes', u.id, this._paraPlanilha(u.id, o, u));
        });
        console.log('[FIREBASE] ✅ Impressão atualizada:', id);
        return { id, ...update, excedenteRealocado: excedente };
    }

    // Excluir: o valor já pago nela passa para as outras impressões em aberto do cliente
    // (menor dívida primeiro). Tudo em um lote só: ou aplica tudo, ou nada.
    async _syncDeleteImpression({ id }) {
        if (!this.isConfigured) throw new Error('Firebase não configurado');

        const snap = await getDoc(this._doc('impressoes', id));
        if (!snap.exists()) {
            console.warn('[FIREBASE] Impressão não encontrada:', id);
            return true;
        }

        const { clienteId } = snap.data();
        const pagoNaImpressao = round2(parseFloat(snap.data().valorPago || 0));
        const outras = (await this._impressoesDoCliente(clienteId)).filter((i) => i.id !== id);

        const realoc = pagoNaImpressao > 0 ? allocate(outras, pagoNaImpressao) : { updates: [], sobra: 0 };
        if (realoc.sobra > 0) {
            throw new Error('As outras impressões do cliente não absorvem o valor já pago. Remova o pagamento no histórico antes.');
        }

        // Vínculos pagamento–impressão desta impressão ficariam órfãos.
        const relSnap = await getDocs(query(this._col('pagamentosImpressoes'), where('impressaoId', '==', id)));

        const agora = new Date().toISOString();
        const ops = [(b) => b.delete(this._doc('impressoes', id))];
        relSnap.docs.forEach((d) => ops.push((b) => b.delete(d.ref)));
        const extras = new Map();
        realoc.updates.forEach((u) => {
            const o = outras.find((x) => x.id === u.id);
            const { id: oid, aplicado, ...campos } = u;
            if (!o.dataPrimeiroPagamento) campos.dataPrimeiroPagamento = agora;
            if (campos.statusPagamento === 'pago' && !o.dataQuitacao) campos.dataQuitacao = agora;
            extras.set(oid, campos);
            ops.push((b) => b.update(this._doc('impressoes', oid), campos));
        });
        const orfao = outras.length === 0;
        if (orfao) ops.push((b) => b.delete(this._doc('clientes', clienteId)));
        await this._commit(ops);

        this._sheets.delete('Impressoes', id);
        relSnap.docs.forEach((d) => this._sheets.delete('Pagamentos_Impressoes', d.id));
        extras.forEach((campos, oid) => {
            const o = outras.find((x) => x.id === oid);
            this._sheets.upsert('Impressoes', oid, this._paraPlanilha(oid, o, campos));
        });
        if (orfao) this._sheets.delete('Clientes', clienteId);
        console.log('[FIREBASE] ✅ Impressão deletada:', id);
        return true;
    }

    async _syncClearAll() {
        if (!this.isConfigured) throw new Error('Firebase não configurado');

        const snaps = await Promise.all(
            ['impressoes', 'clientes', 'pagamentos', 'pagamentosImpressoes'].map((c) => getDocs(this._col(c))));
        const ops = snaps.flatMap((snap) => snap.docs.map((d) => (b) => b.delete(d.ref)));
        await this._commit(ops);   // em lotes: um batch único falha acima de 500 operações
        console.log('[FIREBASE] ✅ Todos os registros apagados');

        ['Clientes','Impressoes','Pagamentos','Pagamentos_Impressoes']
            .forEach(sheet => this._sheets.syncAll(sheet, []));
        return true;
    }

    async _syncSavePrices({ prices, offsetPrice }) {
        if (!this.isConfigured) throw new Error('Firebase não configurado');
        const batch = writeBatch(this.db);
        Object.entries(prices).forEach(([tipo, valor]) => {
            batch.set(this._doc('precos', String(tipo)),
                { tipo: parseInt(tipo), valor: parseFloat(valor) }, { merge: true });
        });
        batch.set(this._doc('precos', '5'),
            { tipo: 5, valor: parseFloat(offsetPrice), descricao: 'Folha Offset' }, { merge: true });
        await batch.commit();
        console.log('[FIREBASE] ✅ Preços salvos');
        return true;
    }

    async _syncResetPrices() {
        if (!this.isConfigured) throw new Error('Firebase não configurado');
        const batch = writeBatch(this.db);
        DEFAULT_PRICES.forEach(p => {
            batch.set(this._doc('precos', String(p.tipo)), p, { merge: true });
        });
        await batch.commit();
        console.log('[FIREBASE] ✅ Preços resetados');
        return true;
    }

    // ── Pagamentos ──────────────────────────────────────────────────────────

    // Aplica o pagamento às impressões em aberto do cliente (menor dívida primeiro).
    // Pagamento, vínculos e impressões entram no mesmo lote: não sobra pagamento "solto".
    async _syncApplyPayment({ clienteId, valorPagamento }) {
        if (!this.isConfigured) throw new Error('Firebase não configurado');

        const valor = round2(parseFloat(valorPagamento));
        if (!Number.isFinite(valor) || valor <= 0) throw new Error('Valor de pagamento inválido');

        const impressoes = await this._impressoesDoCliente(clienteId);
        const { updates, sobra } = allocate(impressoes, valor);
        if (!updates.length) throw new Error('Cliente sem impressão em aberto.');
        if (sobra > 0) throw new Error('O valor passa do saldo em aberto do cliente.');

        const agora  = new Date().toISOString();
        const pagRef = doc(this._col('pagamentos'));
        const pagDoc = {
            clienteId, valorTotal: valor, tipoAplicacao: 'automatico',
            observacao: 'Pagamento aplicado', dataPagamento: agora,
        };

        const ops = [(b) => b.set(pagRef, { ...pagDoc, createdAt: serverTimestamp() })];
        const planilha = [];
        for (const u of updates) {
            const imp = impressoes.find((i) => i.id === u.id);
            const { id: iid, aplicado, ...campos } = u;
            if (!imp.dataPrimeiroPagamento) campos.dataPrimeiroPagamento = agora;
            if (campos.statusPagamento === 'pago') campos.dataQuitacao = agora;
            const relRef = doc(this._col('pagamentosImpressoes'));
            const rel = { pagamentoId: pagRef.id, impressaoId: iid, valorAplicado: aplicado };
            ops.push((b) => b.update(this._doc('impressoes', iid), campos));
            ops.push((b) => b.set(relRef, rel));
            planilha.push({ iid, imp, campos, relId: relRef.id, rel });
        }
        await this._commit(ops);

        this._sheets.upsert('Pagamentos', pagRef.id,
            this._sheets.formatPagamento(pagRef.id, { ...pagDoc, createdAt: agora }));
        planilha.forEach(({ iid, imp, campos, relId, rel }) => {
            this._sheets.upsert('Impressoes', iid, this._paraPlanilha(iid, imp, campos));
            this._sheets.upsert('Pagamentos_Impressoes', relId, this._sheets.formatPagamentoImpressao(relId, rel));
        });

        console.log(`[PAGAMENTO] ✅ Aplicado R$ ${valor}`);
        return {
            pagamento: { id: pagRef.id }, totalUsado: valor, totalSobrando: 0,
            detalhes: updates.map((u) => ({ impressaoId: u.id, valorAplicado: u.aplicado, novoStatus: u.statusPagamento })),
        };
    }

    // Remove um pagamento e refaz a distribuição dos demais NO LUGAR: os pagamentos
    // continuam com o mesmo id e a mesma data (antes eram apagados e recriados com a data de hoje).
    // Tudo em um lote: se falhar, nada muda.
    async _syncRemovePayment({ paymentId, clienteId }) {
        if (!this.isConfigured) throw new Error('Firebase não configurado');

        const [pagSnap, impressoes] = await Promise.all([
            getDocs(query(this._col('pagamentos'), where('clienteId', '==', clienteId))),
            this._impressoesDoCliente(clienteId),
        ]);
        if (!pagSnap.docs.some((d) => d.id === paymentId)) throw new Error('Pagamento não encontrado.');

        const restantes = pagSnap.docs.filter((d) => d.id !== paymentId)
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => new Date(a.dataPagamento || 0) - new Date(b.dataPagamento || 0));
        const relAntigas = await this._relDocs(pagSnap.docs.map((d) => d.id));

        // Refaz do zero em memória: impressões sem pagamento + replay dos pagamentos que ficam.
        const estado = impressoes.map((i) => ({ ...i, valorPago: 0, primeira: '', quitacao: '' }));
        const novasRels = [];
        for (const pag of restantes) {
            const { updates } = allocate(estado, pag.valorTotal);
            for (const u of updates) {
                const e = estado.find((x) => x.id === u.id);
                e.valorPago = u.valorPago;
                if (!e.primeira) e.primeira = pag.dataPagamento || '';
                if (u.statusPagamento === 'pago') e.quitacao = pag.dataPagamento || '';
                novasRels.push({ pagamentoId: pag.id, impressaoId: u.id, valorAplicado: u.aplicado });
            }
        }

        const ops = [];
        const campos = estado.map((e) => {
            const total = round2(e.valorTotal || 0);
            const c = {
                valorPago: e.valorPago, valorRestante: Math.max(0, round2(total - e.valorPago)),
                statusPagamento: statusOf({ valorTotal: total, valorPago: e.valorPago }),
                dataPrimeiroPagamento: e.primeira, dataQuitacao: e.quitacao,
            };
            ops.push((b) => b.update(e.ref, c));
            return c;
        });
        relAntigas.forEach((d) => ops.push((b) => b.delete(d.ref)));
        const relNovas = novasRels.map((r) => {
            const ref = doc(this._col('pagamentosImpressoes'));
            ops.push((b) => b.set(ref, r));
            return { id: ref.id, r };
        });
        ops.push((b) => b.delete(this._doc('pagamentos', paymentId)));
        await this._commit(ops);

        estado.forEach((e, k) => this._sheets.upsert('Impressoes', e.id, this._paraPlanilha(e.id, e, campos[k])));
        relAntigas.forEach((d) => this._sheets.delete('Pagamentos_Impressoes', d.id));
        relNovas.forEach(({ id, r }) => this._sheets.upsert('Pagamentos_Impressoes', id, this._sheets.formatPagamentoImpressao(id, r)));
        this._sheets.delete('Pagamentos', paymentId);
        console.log('[REMOVE] ✅ Pagamento removido');
        return true;
    }

    // ── Métodos de compatibilidade para resumoClientes.js ───────────────────

    async getPagamentosDoCliente(clienteId) {
        if (!this.isConfigured) return [];

        const snap = await getDocs(
            query(this._col('pagamentos'), where('clienteId', '==', clienteId))
        );
        const docs = snap.docs
            .sort((a, b) => new Date(b.data().dataPagamento || 0) - new Date(a.data().dataPagamento || 0));

        const rels = await this._relDocs(docs.map((d) => d.id));   // uma consulta por 30 pagamentos, não uma por pagamento
        return docs.map((d) => {
            const pag = { id: d.id, ...d.data() };
            pag.pagamentos_impressoes = rels.filter((r) => r.data().pagamentoId === d.id).map((r) => ({
                impressao_id:   r.data().impressaoId,
                valor_aplicado: r.data().valorAplicado,
            }));
            pag.valor_total    = pag.valorTotal;
            pag.data_pagamento = pag.dataPagamento;
            pag.cliente_id     = pag.clienteId;
            return pag;
        });
    }

    async getClientesComPagamentos() {
        if (!this.isConfigured) return [];
        const snap = await getDocs(this._col('pagamentos'));
        return [...new Set(snap.docs.map(d => d.data().clienteId))].map(id => ({ cliente_id: id }));
    }

    // ── Recuperação Sheets → Firebase (merge seguro) ─────────────────────────

    async recoverFromSheets() {
        if (!this.isConfigured) throw new Error('Firebase não configurado');

        const _safeDate = (value) => {
            if (!value) return new Date();
            if (typeof value === 'string' && value.includes('seconds=')) {
                const match = value.match(/seconds=([\d.E]+)/);
                if (match) return new Date(parseFloat(match[1]) * 1000);
            }
            const d = new Date(value);
            return isNaN(d.getTime()) ? new Date() : d;
        };

        console.log('[RECOVERY] 🔄 Iniciando recuperação Sheets → Firebase...');

        let sheetsData;
        try {
            const resp = await fetch(`${SHEETS_URL}?action=getAll`, {
                method:   'GET',
                redirect: 'follow',
            });
            const text = await resp.text();

            if (text.includes('"message":"Apps Script ativo!"') || !text.includes('"data"')) {
                throw new Error('Deploy do Apps Script desatualizado. Acesse: ' + SHEETS_URL + '?action=getAll');
            }

            sheetsData = JSON.parse(text);
        } catch (err) {
            throw new Error('Erro ao buscar dados do Sheets: ' + err.message);
        }

        if (!sheetsData?.success) {
            throw new Error(sheetsData?.error || 'Resposta inválida do Google Sheets.');
        }
        if (!sheetsData.data || typeof sheetsData.data !== 'object') {
            throw new Error('Estrutura de dados inválida: campo "data" ausente na resposta do Sheets.');
        }

        const {
            clientes             = [],
            impressoes           = [],
            pagamentos           = [],
            pagamentosImpressoes = [],
        } = sheetsData.data;

        const [clientesSnap, impressoesSnap, pagamentosSnap, relSnap] = await Promise.all([
            getDocs(this._col('clientes')),
            getDocs(this._col('impressoes')),
            getDocs(this._col('pagamentos')),
            getDocs(this._col('pagamentosImpressoes')),
        ]);

        const existentes = {
            clientes:             new Set(clientesSnap.docs.map(d => d.id)),
            impressoes:           new Set(impressoesSnap.docs.map(d => d.id)),
            pagamentos:           new Set(pagamentosSnap.docs.map(d => d.id)),
            pagamentosImpressoes: new Set(relSnap.docs.map(d => d.id)),
        };

        const novos = {
            clientes:             clientes.filter(r => r.id && !existentes.clientes.has(r.id)),
            impressoes:           impressoes.filter(r => r.id && !existentes.impressoes.has(r.id)),
            pagamentos:           pagamentos.filter(r => r.id && !existentes.pagamentos.has(r.id)),
            pagamentosImpressoes: pagamentosImpressoes.filter(r => r.id && !existentes.pagamentosImpressoes.has(r.id)),
        };

        console.log('[RECOVERY] Novos registros encontrados:', {
            clientes:             novos.clientes.length,
            impressoes:           novos.impressoes.length,
            pagamentos:           novos.pagamentos.length,
            pagamentosImpressoes: novos.pagamentosImpressoes.length,
        });

        const total = Object.values(novos).reduce((s, arr) => s + arr.length, 0);
        if (total === 0) {
            return { total: 0, clientes: 0, impressoes: 0, pagamentos: 0, pagamentosImpressoes: 0 };
        }

        const BATCH_SIZE = 400;

        const importCollection = async (colName, registros, formatter) => {
            for (let i = 0; i < registros.length; i += BATCH_SIZE) {
                const chunk = registros.slice(i, i + BATCH_SIZE);
                const batch = writeBatch(this.db);
                chunk.forEach(r => { batch.set(this._doc(colName, r.id), formatter(r), { merge: false }); });
                await batch.commit();
                console.log(`[RECOVERY] ✅ ${colName}: importados ${Math.min(i + BATCH_SIZE, registros.length)}/${registros.length}`);
            }
        };

        if (novos.clientes.length > 0) {
            await importCollection('clientes', novos.clientes, r => ({
                nome:      r.nome     || '',
                telefone:  r.telefone || '',
                ativo:     r.ativo === 'false' ? false : true,
                createdAt: _safeDate(r.createdAt),
            }));
        }

        if (novos.impressoes.length > 0) {
            await importCollection('impressoes', novos.impressoes, r => ({
                clienteId:             r.clienteId                                                     || '',
                tipoImpressao:         parseInt(r.tipoImpressao)                                        || 0,
                tipoPreco:             r.tipoPreco                                                     || 'Desconhecido',
                folhasNormais:         parseInt(r.folhasNormais)                                        || 0,
                folhasOffset:          parseInt(r.folhasOffset)                                         || 0,
                projetoCanva:          parseFloat(r.projetoCanva)                                       || 0,
                trabalho:              parseFloat(r.trabalho)                                           || 0,
                valorTotal:            parseFloat(r.valorTotal)                                         || 0,
                valorPago:             parseFloat(r.valorPago)                                          || 0,
                valorRestante:         parseFloat(r.valorRestante)                                      || 0,
                statusPagamento:       r.statusPagamento                                               || 'pendente',
                dataImpressao:         r.dataImpressao                                                 || _safeDate(r.createdAt).toISOString(),
                dataPrimeiroPagamento: r.dataPrimeiroPagamento && r.dataPrimeiroPagamento !== '' ? r.dataPrimeiroPagamento : '',
                dataQuitacao:          r.dataQuitacao          && r.dataQuitacao          !== '' ? r.dataQuitacao          : '',
                observacao:            r.observacao                                                    || '',
                createdAt:             _safeDate(r.createdAt),
            }));
        }

        if (novos.pagamentos.length > 0) {
            await importCollection('pagamentos', novos.pagamentos, r => ({
                clienteId:     r.clienteId             || '',
                valorTotal:    parseFloat(r.valorTotal) || 0,
                tipoAplicacao: r.tipoAplicacao          || 'automatico',
                observacao:    r.observacao             || '',
                dataPagamento: r.dataPagamento          || '',
                createdAt:     _safeDate(r.createdAt),
            }));
        }

        if (novos.pagamentosImpressoes.length > 0) {
            await importCollection('pagamentosImpressoes', novos.pagamentosImpressoes, r => ({
                pagamentoId:   r.pagamentoId             || '',
                impressaoId:   r.impressaoId             || '',
                valorAplicado: parseFloat(r.valorAplicado) || 0,
            }));
        }

        console.log(`[RECOVERY] ✅ Recuperação concluída! ${total} registro(s) importado(s).`);
        return {
            total,
            clientes:             novos.clientes.length,
            impressoes:           novos.impressoes.length,
            pagamentos:           novos.pagamentos.length,
            pagamentosImpressoes: novos.pagamentosImpressoes.length,
        };
    }

} // ← fecha FirebaseManager

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

export const store = new FirebaseManager();

// QR Code do Pix (documento config/pix)
export const pixStore = {
    async get() {
        const snap = await getDoc(doc(store.db, 'config', 'pix'));
        return snap.exists() ? (snap.data().qrBase64 || null) : null;
    },
    set(dataUrl) {
        return setDoc(doc(store.db, 'config', 'pix'), { qrBase64: dataUrl }, { merge: true });
    },
};
