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

    _calcStatus(valorPago, valorTotal) {
        if (valorPago >= valorTotal && valorTotal > 0) return 'pago';
        if (valorPago > 0) return 'parcial';
        return 'pendente';
    }

    // ── Clientes ────────────────────────────────────────────────────────────

    async _getOrCreateCliente(nome) {
        const nomeTrim = (nome || '').trim();
        if (!nomeTrim) throw new Error('Nome do cliente é obrigatório');

        const snap = await getDocs(
            query(this._col('clientes'), where('nome', '==', nomeTrim), limit(1))
        );
        if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };

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
            return null;
        }
    }

    savePrices(prices, offsetPrice) { return this._syncSavePrices({ prices, offsetPrice }); }
    resetPrices()                   { return this._syncResetPrices(); }

    // ── Impressões ──────────────────────────────────────────────────────────

    async loadImpressions() {
        if (!this.isConfigured) return [];
        try {
            const [impressoesSnap, clientesSnap] = await Promise.all([
                getDocs(query(this._col('impressoes'), orderBy('createdAt', 'desc'))),
                getDocs(this._col('clientes')),
            ]);
            if (impressoesSnap.empty) return [];

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
                    timestamp:       this._toDate(data.createdAt).getTime(),
                };
            });
        } catch (err) {
            console.error('[FIREBASE] ❌ Erro ao carregar impressões:', err);
            return [];
        }
    }

    updateImpression(id, data) { return this._syncUpdateImpression({ id, impressionData: data }); }

    // ── Resumo de clientes ───────────────────────────────────────────────────

    async loadClientsSummary() {
        if (!this.isConfigured) return [];
        try {
            const [clientesSnap, impressoesSnap] = await Promise.all([
                getDocs(this._col('clientes')),
                getDocs(this._col('impressoes')),
            ]);
            if (clientesSnap.empty) return [];

            const clientes = {};
            clientesSnap.forEach(d => { clientes[d.id] = { id: d.id, ...d.data() }; });

            const agrupado = {};
            impressoesSnap.forEach(d => {
                const imp = d.data();
                const cid = imp.clienteId;
                if (!cid || !clientes[cid]) return;

                if (!agrupado[cid]) {
                    agrupado[cid] = {
                        id: cid, cliente: clientes[cid].nome, telefone: clientes[cid].telefone || '',
                        totalCompras: 0, folhasNormais: 0, folhasOffset: 0,
                        valorAcumulado: 0, valorPagoTotal: 0, saldoDevedor: 0,
                    };
                }

                const g = agrupado[cid];
                g.totalCompras   += 1;
                g.folhasNormais  += parseInt(imp.folhasNormais || 0);
                g.folhasOffset   += parseInt(imp.folhasOffset  || 0);
                g.valorAcumulado += parseFloat(imp.valorTotal  || 0);
                g.valorPagoTotal += parseFloat(imp.valorPago   || 0);
            });

            return Object.values(agrupado)
                .filter(g => g.totalCompras > 0)
                .map(g => ({
                    ...g,
                    saldoDevedor:   parseFloat(Math.max(0, g.valorAcumulado - g.valorPagoTotal).toFixed(2)),
                    valorAcumulado: parseFloat(g.valorAcumulado.toFixed(2)),
                    valorPagoTotal: parseFloat(g.valorPagoTotal.toFixed(2)),
                }));
        } catch (err) {
            console.error('[FIREBASE] ❌ Erro ao carregar resumo:', err);
            return [];
        }
    }

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

        let importados = 0;
        for (const reg of registros) {
            try {
                const tipoNum     = TIPO_MAP[reg.tipo] || 0;
                const prices      = await this.loadPrices();
                const precoTipo   = prices?.[tipoNum] || 0;
                const precoOffset = prices?.[5]       || 0;

                const totalCalculado = (reg.folhas * precoTipo) + (reg.offset * precoOffset) + reg.canva + reg.trabalho;
                const valorFinal     = totalCalculado > 0 ? totalCalculado : (reg.total || 0);

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
                console.error(`[ADICIONAR] ❌ Erro ao importar "${reg.nome}":`, err.message);
            }
        }

        console.log(`[ADICIONAR] ✅ ${importados} impressão(ões) importada(s).`);
        return { total: importados };
    }

    // ── Operações internas ───────────────────────────────────────────────────

    async _syncAddImpression(impressionData) {
        if (!this.isConfigured) throw new Error('Firebase não configurado');

        const cliente         = await this._getOrCreateCliente(impressionData.cliente);
        const valorTotal      = parseFloat(impressionData.valorTotal || 0);
        const valorPago       = parseFloat(impressionData.valorPago  || 0);
        const valorRestante   = parseFloat((valorTotal - valorPago).toFixed(2));
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

        const update = {
            tipoPreco:       impressionData.tipoPreco       || 'Desconhecido',
            folhasNormais:   impressionData.folhasNormais    || 0,
            folhasOffset:    impressionData.folhasOffset     || 0,
            projetoCanva:    parseFloat(impressionData.projetoCanva || 0),
            trabalho:        parseFloat(impressionData.trabalho     || 0),
            valorTotal:      parseFloat(impressionData.valorTotal   || 0),
            statusPagamento: impressionData.statusPagamento  || 'pendente',
            updatedAt:       serverTimestamp(),
        };

        const snapAtual = await getDoc(this._doc('impressoes', id));
        if (snapAtual.exists()) {
            const valorPagoAtual = parseFloat(snapAtual.data().valorPago || 0);
            update.valorRestante = Math.max(0, parseFloat((update.valorTotal - valorPagoAtual).toFixed(2)));
            update.valorPago     = valorPagoAtual;
        }
        if (impressionData.dataHora)
            update.dataImpressao = impressionData.dataHora;
        if (impressionData.tipoImpressao && impressionData.tipoImpressao !== 0)
            update.tipoImpressao = impressionData.tipoImpressao;
        if (impressionData.cliente) {
            const cliente    = await this._getOrCreateCliente(impressionData.cliente);
            update.clienteId = cliente.id;
        }

        await updateDoc(this._doc('impressoes', id), update);
        this._sheets.upsert('Impressoes', id, this._sheets.formatImpressao(id, update));
        console.log('[FIREBASE] ✅ Impressão atualizada:', id);
        return { id, ...update };
    }

    // ── DELEÇÃO CORRIGIDA ────────────────────────────────────────────────────
    // Se a impressão deletada tinha valorPago > 0, redistribui esse crédito
    // para as demais impressões pendentes do mesmo cliente (menor valor primeiro).

    async _syncDeleteImpression({ id }) {
        if (!this.isConfigured) throw new Error('Firebase não configurado');

        const snap = await getDoc(this._doc('impressoes', id));
        if (!snap.exists()) {
            console.warn('[FIREBASE] Impressão não encontrada:', id);
            return true;
        }

        const impData       = snap.data();
        const { clienteId } = impData;
        const valorPagoNaImpressao = parseFloat(impData.valorPago || 0);

        // 1. Deleta a impressão
        await deleteDoc(this._doc('impressoes', id));
        this._sheets.delete('Impressoes', id);
        console.log('[FIREBASE] ✅ Impressão deletada:', id);

        // 2. Se havia valor pago nela, redistribui para as outras impressões do cliente
        if (valorPagoNaImpressao > 0) {
            console.log(`[DELETE] 💰 Redistribuindo R$ ${valorPagoNaImpressao.toFixed(2)} para outras impressões do cliente ${clienteId}`);

            const outrasSnap = await getDocs(
                query(this._col('impressoes'), where('clienteId', '==', clienteId))
            );

            // Filtra apenas as que ainda têm saldo devedor, ordena pelo menor valor restante primeiro
            const pendentes = outrasSnap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(imp => {
                    const resto = parseFloat(imp.valorRestante ?? (imp.valorTotal - imp.valorPago) ?? 0);
                    return resto > 0;
                })
                .sort((a, b) => {
                    const restoA = parseFloat(a.valorRestante ?? (a.valorTotal - a.valorPago) ?? 0);
                    const restoB = parseFloat(b.valorRestante ?? (b.valorTotal - b.valorPago) ?? 0);
                    return restoA - restoB; // menor valor primeiro (igual ao _syncApplyPayment)
                });

            if (pendentes.length > 0) {
                let restante = valorPagoNaImpressao;
                const batch  = writeBatch(this.db);

                for (const imp of pendentes) {
                    if (restante <= 0) break;

                    const valorTotal  = parseFloat(imp.valorTotal  || 0);
                    const pagoAntes   = parseFloat(imp.valorPago   || 0);
                    const restoImp    = parseFloat(imp.valorRestante ?? (valorTotal - pagoAntes));
                    if (restoImp <= 0) continue;

                    const aplicado      = Math.min(restante, restoImp);
                    const novoValorPago = parseFloat((pagoAntes + aplicado).toFixed(2));
                    const novoResto     = parseFloat((restoImp  - aplicado).toFixed(2));
                    const novoStatus    = this._calcStatus(novoValorPago, valorTotal);

                    const updateData = {
                        valorPago:       novoValorPago,
                        valorRestante:   novoResto,
                        statusPagamento: novoStatus,
                    };

                    // Marca primeiro pagamento se ainda não tinha
                    if (!imp.dataPrimeiroPagamento && novoValorPago > 0) {
                        updateData.dataPrimeiroPagamento = new Date().toISOString();
                    }
                    // Marca quitação se ficou pago
                    if (novoStatus === 'pago' && !imp.dataQuitacao) {
                        updateData.dataQuitacao = new Date().toISOString();
                    }

                    batch.update(this._doc('impressoes', imp.id), updateData);
                    this._sheets.upsert('Impressoes', imp.id,
                        this._sheets.formatImpressao(imp.id, { ...imp, ...updateData }));

                    console.log(`[DELETE] ✅ Redistribuído R$ ${aplicado.toFixed(2)} → impressão ${imp.id} (novo status: ${novoStatus})`);
                    restante = parseFloat((restante - aplicado).toFixed(2));
                }

                await batch.commit();
                console.log(`[DELETE] ✅ Redistribuição concluída. Sobra: R$ ${restante.toFixed(2)}`);
            } else {
                console.log('[DELETE] ℹ️ Nenhuma impressão pendente para receber o crédito redistribuído.');
            }
        }

        // 3. Se não há mais impressões para esse cliente, remove o cliente órfão
        const restantesSnap = await getDocs(
            query(this._col('impressoes'), where('clienteId', '==', clienteId), limit(1))
        );
        if (restantesSnap.empty) {
            await deleteDoc(this._doc('clientes', clienteId));
            this._sheets.delete('Clientes', clienteId);
            console.log('[FIREBASE] ✅ Cliente órfão removido:', clienteId);
        }

        return true;
    }

    async _syncClearAll() {
        if (!this.isConfigured) throw new Error('Firebase não configurado');

        const [impressoesSnap, clientesSnap, pagamentosSnap, relSnap] = await Promise.all([
            getDocs(this._col('impressoes')),
            getDocs(this._col('clientes')),
            getDocs(this._col('pagamentos')),
            getDocs(this._col('pagamentosImpressoes')),
        ]);

        const batch = writeBatch(this.db);
        [impressoesSnap, clientesSnap, pagamentosSnap, relSnap]
            .forEach(snap => snap.forEach(d => batch.delete(d.ref)));
        await batch.commit();
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

    async _syncApplyPayment({ clienteId, valorPagamento, impressoesIds = null }) {
        if (!this.isConfigured) throw new Error('Firebase não configurado');

        const valorOriginal = parseFloat(valorPagamento);
        let   restante      = valorOriginal;

        let impressoes;
        if (impressoesIds?.length > 0) {
            const refs = await Promise.all(impressoesIds.map(id => getDoc(this._doc('impressoes', id))));
            impressoes = refs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() }));
        } else {
            const snap = await getDocs(
                query(this._col('impressoes'), where('clienteId', '==', clienteId))
            );
            impressoes = snap.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(d => {
                    const resto = parseFloat(d.valorRestante ?? (d.valorTotal - d.valorPago) ?? 0);
                    return resto > 0 || parseFloat(d.valorPago || 0) < parseFloat(d.valorTotal || 0);
                })
                .sort((a, b) => {
                    const restoA = parseFloat(a.valorRestante ?? a.valorTotal - a.valorPago ?? 0);
                    const restoB = parseFloat(b.valorRestante ?? b.valorTotal - b.valorPago ?? 0);
                    return restoA - restoB;
                });
        }

        if (!impressoes.length) {
            console.warn('[PAGAMENTO] Nenhuma impressão pendente');
            return { totalUsado: 0, totalSobrando: restante };
        }

        const pagRef = await addDoc(this._col('pagamentos'), {
            clienteId, valorTotal: valorOriginal,
            tipoAplicacao: impressoesIds ? 'manual' : 'automatico',
            observacao:    'Pagamento aplicado',
            dataPagamento: new Date().toISOString(),
            createdAt:     serverTimestamp(),
        });
        this._sheets.upsert('Pagamentos', pagRef.id,
            this._sheets.formatPagamento(pagRef.id, {
                clienteId, valorTotal: valorOriginal,
                tipoAplicacao: impressoesIds ? 'manual' : 'automatico',
                observacao:    'Pagamento aplicado',
                dataPagamento: new Date().toISOString(),
                createdAt:     new Date().toISOString(),
            }));

        const batch    = writeBatch(this.db);
        const detalhes = [];

        for (const imp of impressoes) {
            if (restante <= 0) break;

            const valorTotal   = parseFloat(imp.valorTotal  || 0);
            const pagoAntes    = parseFloat(imp.valorPago   || 0);
            const restoImp     = parseFloat(imp.valorRestante ?? (valorTotal - pagoAntes));
            if (restoImp <= 0) continue;

            const aplicado      = Math.min(restante, restoImp);
            const novoValorPago = parseFloat((pagoAntes + aplicado).toFixed(2));
            const novoResto     = parseFloat((restoImp  - aplicado).toFixed(2));
            const novoStatus    = this._calcStatus(novoValorPago, valorTotal);

            const updateData = { valorPago: novoValorPago, valorRestante: novoResto, statusPagamento: novoStatus };
            if (!imp.dataPrimeiroPagamento && novoValorPago > 0)
                updateData.dataPrimeiroPagamento = new Date().toISOString();
            if (novoStatus === 'pago')
                updateData.dataQuitacao = new Date().toISOString();

            batch.update(this._doc('impressoes', imp.id), updateData);

            const relRef = doc(this._col('pagamentosImpressoes'));
            batch.set(relRef, { pagamentoId: pagRef.id, impressaoId: imp.id, valorAplicado: aplicado });

            this._sheets.upsert('Impressoes', imp.id,
                this._sheets.formatImpressao(imp.id, { ...imp, ...updateData }));
            this._sheets.upsert('Pagamentos_Impressoes', relRef.id,
                this._sheets.formatPagamentoImpressao(relRef.id,
                    { pagamentoId: pagRef.id, impressaoId: imp.id, valorAplicado: aplicado }));

            detalhes.push({ impressaoId: imp.id, valorAplicado: aplicado, novoStatus });
            restante = parseFloat((restante - aplicado).toFixed(2));

            if (novoStatus === 'parcial') break;
        }

        await batch.commit();
        const totalUsado = parseFloat((valorOriginal - restante).toFixed(2));
        console.log(`[PAGAMENTO] ✅ Usado: R$ ${totalUsado} | Sobra: R$ ${restante}`);
        return { pagamento: { id: pagRef.id }, totalUsado, totalSobrando: restante, detalhes };
    }

    async _syncRemovePayment({ paymentId, clienteId }) {
        if (!this.isConfigured) throw new Error('Firebase não configurado');

        const todosSnap = await getDocs(
            query(this._col('pagamentos'), where('clienteId', '==', clienteId))
        );
        const pagamentosRestantes = todosSnap.docs
            .filter(d => d.id !== paymentId)
            .map(d => ({ id: d.id, ref: d.ref, ...d.data() }))
            .sort((a, b) => new Date(a.dataPagamento || 0) - new Date(b.dataPagamento || 0));

        const impSnap    = await getDocs(
            query(this._col('impressoes'), where('clienteId', '==', clienteId))
        );
        const resetBatch = writeBatch(this.db);
        impSnap.forEach(d => {
            const total     = parseFloat(d.data().valorTotal || 0);
            const resetData = {
                valorPago: 0, valorRestante: total,
                statusPagamento: 'pendente', dataPrimeiroPagamento: null, dataQuitacao: null,
            };
            resetBatch.update(d.ref, resetData);
            this._sheets.upsert('Impressoes', d.id,
                this._sheets.formatImpressao(d.id, { ...d.data(), ...resetData,
                    dataPrimeiroPagamento: '', dataQuitacao: '' }));
        });
        await resetBatch.commit();

        const relSnap  = await getDocs(
            query(this._col('pagamentosImpressoes'), where('pagamentoId', '==', paymentId))
        );
        const delBatch = writeBatch(this.db);
        relSnap.forEach(d => { delBatch.delete(d.ref); this._sheets.delete('Pagamentos_Impressoes', d.id); });
        await delBatch.commit();

        await deleteDoc(this._doc('pagamentos', paymentId));
        this._sheets.delete('Pagamentos', paymentId);
        console.log('[REMOVE] ✅ Pagamento removido');

        if (pagamentosRestantes.length > 0) {
            const valoresParaReaplicar = pagamentosRestantes.map(p => ({
                valor: parseFloat(p.valorTotal), data: p.dataPagamento,
            }));

            for (const pag of pagamentosRestantes) {
                const oldRel = await getDocs(
                    query(this._col('pagamentosImpressoes'), where('pagamentoId', '==', pag.id))
                );
                const b = writeBatch(this.db);
                oldRel.forEach(d => { b.delete(d.ref); this._sheets.delete('Pagamentos_Impressoes', d.id); });
                await b.commit();
                await deleteDoc(pag.ref);
                this._sheets.delete('Pagamentos', pag.id);
            }

            for (const item of valoresParaReaplicar) {
                await this._syncApplyPayment({ clienteId, valorPagamento: item.valor, impressoesIds: null });
            }
        }
        console.log('[REMOVE] ✅ Remoção concluída');
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

        const pagamentos = [];
        for (const d of docs) {
            const pag     = { id: d.id, ...d.data() };
            const relSnap = await getDocs(
                query(this._col('pagamentosImpressoes'), where('pagamentoId', '==', d.id))
            );
            pag.pagamentos_impressoes = relSnap.docs.map(r => ({
                impressao_id:   r.data().impressaoId,
                valor_aplicado: r.data().valorAplicado,
            }));
            pag.valor_total    = pag.valorTotal;
            pag.data_pagamento = pag.dataPagamento;
            pag.cliente_id     = pag.clienteId;
            pagamentos.push(pag);
        }
        return pagamentos;
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
            console.log('[RECOVERY] Resposta bruta do Sheets:', JSON.stringify(sheetsData));
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
                dataImpressao:         r.dataImpressao                                                 || '',
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

    // ── Limpar Firebase apenas (teste) ──────────────────────────────────────

    async clearFirebaseOnly() {
        if (!this.isConfigured) throw new Error('Firebase não configurado');

        const [clientesSnap, impressoesSnap, pagamentosSnap, relSnap] = await Promise.all([
            getDocs(this._col('clientes')),
            getDocs(this._col('impressoes')),
            getDocs(this._col('pagamentos')),
            getDocs(this._col('pagamentosImpressoes')),
        ]);

        const batch = writeBatch(this.db);
        [clientesSnap, impressoesSnap, pagamentosSnap, relSnap]
            .forEach(snap => snap.forEach(d => batch.delete(d.ref)));
        await batch.commit();

        console.log('[TEST] ✅ Firebase limpo (Sheets preservado)');
        return true;
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
