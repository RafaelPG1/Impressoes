// ============================================================================
// RESUMO CLIENTES — versão Firebase (sem acesso direto ao Firestore aqui)
// ============================================================================

import { supabaseManager } from './firebase.js';

// ============================================================================
// RENDERIZAÇÃO DO RESUMO DE CLIENTES
// ============================================================================

export async function carregarResumoClientes(options = {}) {
    const {
        containerId = 'resumoClientes',
    } = options;

    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} não encontrado`);
        return;
    }

    if (!supabaseManager.isConfigured) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Firebase não configurado</p>
            </div>`;
        return;
    }

    try {
        let resumo = await supabaseManager.loadClientsSummary();

        if (!resumo || resumo.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>Nenhum cliente com impressões ainda</p>
                </div>`;
            return;
        }

        // Ordem: em dia → parcial → devedor, alfabético dentro de cada grupo
        resumo.sort((a, b) => {
            const getPriority = c => {
                if ((c.saldoDevedor || 0) <= 0)                                return 1; // quite
                if ((c.valorPagoTotal || 0) > 0 && (c.saldoDevedor || 0) > 0) return 2; // parcial
                return 3;                                                                  // devedor
            };
            const pA = getPriority(a), pB = getPriority(b);
            if (pA !== pB) return pA - pB;
            return (a.cliente || '').toLowerCase()
                .localeCompare((b.cliente || '').toLowerCase(), 'pt-BR');
        });

        container.innerHTML = resumo.map(c => renderClienteSummary(c)).join('');

    } catch (error) {
        console.error('❌ Erro ao carregar resumo de clientes:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar dados</p>
            </div>`;
        if (window.modernAlert) window.modernAlert.error('Erro ao carregar resumo de clientes');
    }
}

function renderClienteSummary(cliente) {
    const saldoDevedor   = cliente.saldoDevedor   || 0;
    const valorPagoTotal = cliente.valorPagoTotal  || 0;
    const valorAcumulado = cliente.valorAcumulado  || 0;

    // 3 estados de borda (definidos no style-parte2.css):
    //   .quite   → verde  — pagou tudo (saldoDevedor <= 0)
    //   .parcial → laranja — pagou algo mas ainda deve
    //   .devedor → cinza   — não pagou nada (valorPagoTotal = 0 e tem saldo)
    let statusClasse;
    if (saldoDevedor <= 0) {
        statusClasse = 'quite';
    } else if (valorPagoTotal > 0) {
        statusClasse = 'parcial';
    } else {
        statusClasse = 'devedor';
    }

    return `
        <div class="client-summary ${statusClasse}">
            <div class="client-summary-name">
                <i class="fas fa-user"></i>
                ${cliente.cliente}
            </div>
            <div class="client-summary-stats">
                <div class="client-summary-original">
                    <span class="summary-label">Total Original:</span>
                    <span class="summary-value original">R$ ${valorAcumulado.toFixed(2)}</span>
                </div>
                <div class="client-summary-total">
                    <span class="summary-label">Total em Aberto:</span>
                    <span class="summary-value ${saldoDevedor > 0 ? 'pending' : 'paid'}">R$ ${saldoDevedor.toFixed(2)}</span>
                </div>
                <div class="client-summary-count">
                    ${cliente.totalCompras} ${cliente.totalCompras === 1 ? 'impressão' : 'impressões'}
                </div>
                <div class="client-summary-folhas">
                    <span><i class="fas fa-file"></i> ${cliente.folhasNormais} folhas normais</span>
                    <span><i class="fas fa-file-alt"></i> ${cliente.folhasOffset} offset</span>
                </div>
                <div class="client-summary-debt">
                    ${saldoDevedor > 0 ? `
                        <div class="client-debt-value">
                            <i class="fas fa-exclamation-circle"></i>
                            Saldo Devedor: <strong>R$ ${saldoDevedor.toFixed(2)}</strong>
                        </div>` : `
                        <div class="client-paid-value">
                            <i class="fas fa-check-circle"></i>
                            <strong>Cliente em dia!</strong>
                        </div>`}
                    <div class="client-paid-value">
                        <i class="fas fa-dollar-sign"></i>
                        Total Pago: R$ ${valorPagoTotal.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>`;
}

// ============================================================================
// CUSTOM SELECT
// ============================================================================

class CustomSelect {
    constructor(containerId, options = {}) {
        this.containerId      = containerId;
        this.container        = document.getElementById(containerId);
        this.trigger          = null;
        this.dropdown         = null;
        this.optionsContainer = null;
        this.selectedValue    = '';
        this.options          = [];
        this.onChange         = options.onChange || (() => {});
        if (this.container) this.init();
    }

    init() {
        this.trigger          = this.container.querySelector('.custom-select-trigger');
        this.dropdown         = this.container.querySelector('.custom-select-dropdown');
        this.optionsContainer = this.container.querySelector('.custom-select-options');
        if (this.trigger && this.dropdown && this.optionsContainer) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        this.trigger.addEventListener('click', e => { e.stopPropagation(); this.toggleDropdown(); });
        document.addEventListener('click', e => {
            if (this.container && !this.container.contains(e.target)) this.closeDropdown();
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && this.isOpen()) this.closeDropdown();
        });
    }

    toggleDropdown() { this.isOpen() ? this.closeDropdown() : this.openDropdown(); }
    openDropdown()   { this.trigger?.classList.add('open');    this.dropdown?.classList.add('open');    }
    closeDropdown()  { this.trigger?.classList.remove('open'); this.dropdown?.classList.remove('open'); }
    isOpen()         { return this.dropdown?.classList.contains('open'); }

    loadOptions(options) { this.options = options; this.renderOptions(); }

    renderOptions() {
        if (!this.optionsContainer) return;

        let html = `
            <div class="custom-select-option custom-select-option-default" data-value="">
                <i class="fas fa-times-circle"></i> Selecione um cliente
            </div>`;

        html += this.options.length === 0
            ? `<div class="custom-select-empty">Nenhum cliente disponível</div>`
            : this.options.map(o => `
                <div class="custom-select-option" data-value="${o.value}">${o.label}</div>
            `).join('');

        this.optionsContainer.innerHTML = html;
        this.optionsContainer.querySelectorAll('.custom-select-option').forEach(el => {
            el.addEventListener('click', e => {
                this.selectOption(e.currentTarget.getAttribute('data-value'));
            });
        });
    }

    selectOption(value) {
        if (!value) { this.resetSelection(); this.closeDropdown(); this.onChange(''); return; }

        this.selectedValue = value;
        const opt = this.options.find(o => o.value === value);
        if (!opt) { this.resetSelection(); this.closeDropdown(); return; }

        const txt = this.trigger?.querySelector('.trigger-text');
        if (txt) txt.textContent = opt.label;

        this.optionsContainer?.querySelectorAll('.custom-select-option')
            .forEach(el => el.classList.remove('selected'));
        this.optionsContainer?.querySelector(`[data-value="${value}"]`)
            ?.classList.add('selected');

        this.closeDropdown();
        this.onChange(value);
    }

    resetSelection() {
        this.selectedValue = '';
        const txt = this.trigger?.querySelector('.trigger-text');
        if (txt) txt.textContent = 'Selecione um cliente';
        this.optionsContainer?.querySelectorAll('.custom-select-option')
            .forEach(el => el.classList.remove('selected'));
    }

    getValue()  { return this.selectedValue; }
    reset()     { this.resetSelection(); }
    reinit()    { this.container = document.getElementById(this.containerId); if (this.container) this.init(); }
}

// ============================================================================
// MODAL DE PAGAMENTO
// ============================================================================

export class PaymentModalManager {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.currentClienteId = null;
        this.paymentSelect    = null;
        this.historySelect    = null;
        setTimeout(() => this.initializeCustomSelects(), 100);
    }

    initializeCustomSelects() {
        this.paymentSelect = new CustomSelect('paymentClienteContainer', {
            onChange: value => this.onClienteChange(value)
        });
        this.historySelect = new CustomSelect('historyClienteContainer', {
            onChange: value => this.loadPaymentHistory(value)
        });
    }

    initializeElements() {
        this.elements = {
            modal:               document.getElementById('paymentModal'),
            btnShowModal:        document.getElementById('showPaymentModalBtn'),
            btnApply:            document.getElementById('applyPaymentBtn'),
            inputValue:          document.getElementById('paymentValue'),
            listImpressions:     document.getElementById('impressionsList'),
            debtInfo:            document.getElementById('clientDebtInfo'),
            debtValue:           document.getElementById('clientDebtValue'),
            paidValue:           document.getElementById('clientPaidValue'),
            totalOriginal:       document.getElementById('clientTotalOriginal'),
            closeButtons:        document.querySelectorAll('#paymentModal .close, #paymentModal .close-modal'),
            historyModal:        document.getElementById('paymentHistoryModal'),
            historyList:         document.getElementById('paymentHistoryList'),
            historyCloseButtons: document.querySelectorAll('#paymentHistoryModal .close, #paymentHistoryModal .close-modal'),
            successModal:        document.getElementById('paymentSuccessModal'),
            successClientName:   document.getElementById('successClientName'),
            successPaymentValue: document.getElementById('successPaymentValue'),
            successPaymentDate:  document.getElementById('successPaymentDate'),
            successCloseButtons: document.querySelectorAll('#paymentSuccessModal .close, #paymentSuccessModal .close-modal')
        };
    }

    setupEventListeners() {
        this.elements.btnShowModal?.addEventListener('click', () => this.showModal());
        this.elements.closeButtons?.forEach(b => b.addEventListener('click', () => this.closeModal()));
        this.elements.btnApply?.addEventListener('click', () => this.applyPayment());
        this.elements.historyCloseButtons?.forEach(b => b.addEventListener('click', () => this.closeHistoryModal()));
        this.elements.successCloseButtons?.forEach(b => b.addEventListener('click', () => this.closeSuccessModal()));
    }

    // ---------- Modal de Pagamento ----------

    async showModal() {
        if (!this.paymentSelect?.container) this.initializeCustomSelects();
        await this.loadClientes();
        this.resetModal();
        if (this.elements.modal) this.elements.modal.style.display = 'block';
    }

    closeModal() {
        if (this.elements.modal) this.elements.modal.style.display = 'none';
        this.resetModal();
    }

    resetModal() {
        this.paymentSelect?.reset();
        if (this.elements.inputValue)      this.elements.inputValue.value       = '';
        if (this.elements.debtInfo)        this.elements.debtInfo.style.display = 'none';
        if (this.elements.listImpressions) {
            this.elements.listImpressions.style.display = 'none';
            this.elements.listImpressions.innerHTML     = '';
        }
        this.currentClienteId = null;
    }

    // ---------- Carregamento de Clientes ----------

    async loadClientes() {
        try {
            const resumo    = await supabaseManager.loadClientsSummary();
            const comDebito = resumo.filter(c => c.saldoDevedor > 0);
            const options   = comDebito.map(c => ({
                value: c.id,
                label: `${c.cliente} — Deve: R$ ${c.saldoDevedor.toFixed(2)}`
            }));
            this.paymentSelect?.loadOptions(options);
            await this.loadClientesForHistory();
        } catch (err) {
            console.error('[MODAL] ❌ Erro ao carregar clientes:', err);
            if (window.modernAlert) window.modernAlert.error('Erro ao carregar clientes');
        }
    }

    async loadClientesForHistory() {
        try {
            const clientesComPagamentos = await supabaseManager.getClientesComPagamentos();
            const ids = [...new Set(clientesComPagamentos.map(p => p.cliente_id))];

            if (ids.length === 0) { this.historySelect?.loadOptions([]); return; }

            const resumo   = await supabaseManager.loadClientsSummary();
            const filtrado = resumo.filter(c => ids.includes(c.id));
            const options  = filtrado.map(c => ({
                value: c.id,
                label: `${c.cliente} — ${c.totalCompras} impressões`
            }));
            this.historySelect?.loadOptions(options);
        } catch (err) {
            console.error('[HISTORY] ❌ Erro ao carregar clientes para histórico:', err);
            this.historySelect?.loadOptions([]);
        }
    }

    // ---------- Seleção de Cliente ----------

    async onClienteChange(clienteId) {
        if (!clienteId) {
            if (this.elements.debtInfo)        this.elements.debtInfo.style.display        = 'none';
            if (this.elements.listImpressions) this.elements.listImpressions.style.display = 'none';
            if (this.elements.inputValue)      this.elements.inputValue.value               = '';
            this.currentClienteId = null;
            return;
        }

        this.currentClienteId = clienteId;
        try {
            const resumo  = await supabaseManager.loadClientsSummary();
            const cliente = resumo.find(c => c.id === clienteId);
            if (cliente) {
                if (this.elements.totalOriginal) this.elements.totalOriginal.textContent = `R$ ${cliente.valorAcumulado.toFixed(2)}`;
                if (this.elements.debtValue)     this.elements.debtValue.textContent     = `R$ ${cliente.saldoDevedor.toFixed(2)}`;
                if (this.elements.paidValue)     this.elements.paidValue.textContent     = `R$ ${cliente.valorPagoTotal.toFixed(2)}`;
                if (this.elements.debtInfo)      this.elements.debtInfo.style.display    = 'flex';
            }
        } catch (err) {
            console.error('[MODAL] ❌ Erro ao buscar dados do cliente:', err);
        }
    }

    // ---------- Aplicar Pagamento ----------

    async applyPayment() {
        const valorPagamento = parseFloat(this.elements.inputValue?.value || 0);

        if (!this.currentClienteId) {
            if (window.modernAlert) window.modernAlert.error('Selecione um cliente');
            return;
        }
        if (!valorPagamento || valorPagamento <= 0) {
            if (window.modernAlert) window.modernAlert.error('Informe um valor válido');
            return;
        }

        const resumo  = await supabaseManager.loadClientsSummary();
        const cliente = resumo.find(c => c.id === this.currentClienteId);

        if (cliente && valorPagamento > cliente.saldoDevedor) {
            if (window.modernAlert) window.modernAlert.error(
                `Valor (R$ ${valorPagamento.toFixed(2)}) maior que o saldo (R$ ${cliente.saldoDevedor.toFixed(2)})`
            );
            return;
        }

        const clienteIdToApply = this.currentClienteId;
        const nomeCliente      = cliente?.cliente || 'Cliente';
        this.closeModal();
        if (window.modernLoading) window.modernLoading.show();

        try {
            await supabaseManager._syncApplyPayment({
                clienteId:      clienteIdToApply,
                valorPagamento: valorPagamento,
                impressoesIds:  null
            });

            await new Promise(r => setTimeout(r, 500));
            if (window.impressionManager) await window.impressionManager.loadFromSupabase();
            await carregarResumoClientes({ containerId: 'resumoClientes' });
            await this.loadClientes();
            this.showSuccessModal(nomeCliente, valorPagamento);
        } catch (err) {
            console.error('[MODAL] ❌ Erro ao aplicar pagamento:', err);
            if (window.modernAlert) window.modernAlert.error('Erro ao aplicar pagamento');
        } finally {
            if (window.modernLoading) window.modernLoading.hide();
        }
    }

    // ---------- Modal de Sucesso ----------

    showSuccessModal(nomeCliente, valorPagamento) {
        const agora = new Date().toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        if (this.elements.successClientName)   this.elements.successClientName.textContent   = nomeCliente;
        if (this.elements.successPaymentValue) this.elements.successPaymentValue.textContent = `R$ ${valorPagamento.toFixed(2)}`;
        if (this.elements.successPaymentDate)  this.elements.successPaymentDate.textContent  = agora;
        if (this.elements.successModal)        this.elements.successModal.style.display      = 'block';
    }

    closeSuccessModal() {
        if (this.elements.successModal) this.elements.successModal.style.display = 'none';
    }

    // ---------- Modal de Histórico ----------

    showHistoryModal() {
        if (!this.historySelect?.container) this.initializeCustomSelects();
        if (this.elements.historyModal) this.elements.historyModal.style.display = 'block';
        this.loadClientesForHistory();
    }

    closeHistoryModal() {
        if (this.elements.historyModal) this.elements.historyModal.style.display = 'none';
        this.historySelect?.reset();
        if (this.elements.historyList) {
            this.elements.historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>Selecione um cliente para ver o histórico</p>
                </div>`;
        }
    }

    // ---------- Histórico de Pagamentos ----------

    async loadPaymentHistory(clienteId) {
        if (!clienteId) {
            if (this.elements.historyList) {
                this.elements.historyList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-receipt"></i>
                        <p>Selecione um cliente para ver o histórico</p>
                    </div>`;
            }
            return;
        }

        try {
            const pagamentos = await supabaseManager.getPagamentosDoCliente(clienteId);

            if (!pagamentos || pagamentos.length === 0) {
                if (this.elements.historyList) {
                    this.elements.historyList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <p>Nenhum pagamento registrado para este cliente</p>
                        </div>`;
                }
                return;
            }

            if (this.elements.historyList) {
                this.elements.historyList.innerHTML = pagamentos.map(pag => {
                    const dataFmt   = this.formatDateTime(pag.data_pagamento);
                    const diasPagos = pag.pagamentos_impressoes?.length || 0;
                    return `
                        <div class="payment-history-item">
                            <div class="payment-history-header">
                                <div class="payment-history-date">
                                    <i class="fas fa-calendar-check"></i> ${dataFmt}
                                </div>
                                <div class="payment-history-value">
                                    R$ ${parseFloat(pag.valor_total).toFixed(2)}
                                </div>
                            </div>
                            <div class="payment-history-details">
                                <span class="payment-history-type">
                                    <i class="fas fa-info-circle"></i> Aplicação Automática
                                </span>
                                <span class="payment-history-days">
                                    <i class="fas fa-print"></i>
                                    ${diasPagos} ${diasPagos === 1 ? 'impressão paga' : 'impressões pagas'}
                                </span>
                            </div>
                            <button class="btn-remove-payment"
                                data-payment-id="${pag.id}"
                                data-client-id="${clienteId}">
                                <i class="fas fa-trash-alt"></i> Remover Pagamento
                            </button>
                        </div>`;
                }).join('');

                this.elements.historyList.querySelectorAll('.btn-remove-payment').forEach(btn => {
                    btn.addEventListener('click', async e => {
                        const paymentId = e.currentTarget.getAttribute('data-payment-id');
                        const clientId  = e.currentTarget.getAttribute('data-client-id');
                        await this.confirmRemovePayment(paymentId, clientId);
                    });
                });
            }

        } catch (err) {
            console.error('[HISTORY] ❌ Erro ao carregar histórico:', err);
            if (this.elements.historyList) {
                this.elements.historyList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Erro ao carregar histórico</p>
                    </div>`;
            }
        }
    }

    // ---------- Remoção de Pagamento ----------

    async confirmRemovePayment(paymentId, clientId) {
        if (window.modalManager) {
            window.modalManager.showConfirm(
                'Remover Pagamento',
                'Tem certeza? Todas as impressões relacionadas serão recalculadas.',
                async () => await this.removePayment(paymentId, clientId)
            );
        }
    }

    async removePayment(paymentId, clientId) {
        if (window.modernLoading) window.modernLoading.show();
        try {
            const pagamentos    = await supabaseManager.getPagamentosDoCliente(clientId);
            const pagamento     = pagamentos.find(p => p.id === paymentId);
            const resumo        = await supabaseManager.loadClientsSummary();
            const cliente       = resumo.find(c => c.id === clientId);
            const nomeCliente   = cliente?.cliente || 'Cliente';
            const valorRemovido = pagamento ? parseFloat(pagamento.valor_total) : 0;

            await supabaseManager._syncRemovePayment({ paymentId, clienteId: clientId });

            await new Promise(r => setTimeout(r, 500));
            if (window.impressionManager) await window.impressionManager.loadFromSupabase();
            await carregarResumoClientes({ containerId: 'resumoClientes' });
            await this.loadPaymentHistory(clientId);
            await this.loadClientes();

            if (window.modernLoading) window.modernLoading.hide();
            if (typeof showPaymentRemoved === 'function') showPaymentRemoved(nomeCliente, valorRemovido);

        } catch (err) {
            console.error('[REMOVE] ❌ Erro ao remover pagamento:', err);
            if (window.modernAlert) window.modernAlert.error('Erro ao remover pagamento');
            if (window.modernLoading) window.modernLoading.hide();
        }
    }

    formatDateTime(dataHora) {
        return new Date(dataHora).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

let paymentModalManager = null;

document.addEventListener('DOMContentLoaded', () => {
    paymentModalManager = new PaymentModalManager();
    window.paymentModalManager = paymentModalManager;

    const summaryHeader = document.querySelector('.summary-card .card-header .header-actions');
    if (summaryHeader) {
        const historyBtn     = document.createElement('button');
        historyBtn.id        = 'showPaymentHistoryBtn';
        historyBtn.className = 'action-btn info-btn';
        historyBtn.innerHTML = '<i class="fas fa-history"></i> Histórico';
        historyBtn.addEventListener('click', () => paymentModalManager.showHistoryModal());
        summaryHeader.appendChild(historyBtn);
    }
});

export { paymentModalManager };