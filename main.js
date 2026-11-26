// ============================================================================
// main.js — Sistema de Gerenciamento de Impressões
// ============================================================================

import { supabaseManager }                    from './firebase.js';
import { carregarResumoClientes, PaymentModalManager } from './resumoClientes.js';

// ─────────────────────────────────────────────────────────────────────────────
// UTILITÁRIOS DE DATA/HORA
// ─────────────────────────────────────────────────────────────────────────────

function datetimeLocalToISO(value) {
    if (!value) return new Date().toISOString();
    const [datePart, timePart]   = value.split('T');
    const [year, month, day]     = datePart.split('-').map(Number);
    const [hour, minute]         = (timePart || '00:00').split(':').map(Number);
    const local                  = new Date(year, month - 1, day, hour, minute, 0, 0);
    const off                    = local.getTimezoneOffset();
    const absOff                 = Math.abs(off);
    const sign                   = off <= 0 ? '+' : '-';
    const hh                     = String(Math.floor(absOff / 60)).padStart(2, '0');
    const mm                     = String(absOff % 60).padStart(2, '0');
    return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}` +
           `T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00${sign}${hh}:${mm}`;
}

function isoToDatetimeLocal(iso) {
    const d = new Date(iso);
    return [d.getFullYear(), d.getMonth()+1, d.getDate()]
        .map(n => String(n).padStart(2,'0')).join('-') + 'T' +
        [d.getHours(), d.getMinutes()].map(n => String(n).padStart(2,'0')).join(':');
}

// ─────────────────────────────────────────────────────────────────────────────
// SANITIZADORES
// ─────────────────────────────────────────────────────────────────────────────

function sanitize(val, fallback = '') {
    if (val === null || val === undefined) return fallback;
    const str = String(val);
    if (str === 'null' || str === 'undefined' || str === 'NaN') return fallback;
    return str;
}

function sanitizeNumeric(val, fallback = '') {
    if (val === null || val === undefined) return fallback;
    const s = String(val);
    if (!s || s === 'null' || s === 'undefined' || s === 'NaN') return fallback;
    return s;
}

function setInputValue(input, val, fallback = '') {
    if (!input) return;
    input.value = sanitize(val, fallback);
}

// ─────────────────────────────────────────────────────────────────────────────
// SISTEMA DE LOADING
// ─────────────────────────────────────────────────────────────────────────────

class ModernLoadingSystem {
    constructor() {
        this.overlay = document.getElementById('modernLoadingOverlay');
        this.visible = false;
    }
    show() { if (!this.visible) { this.overlay.classList.add('show');    this.visible = true;  } }
    hide() { if (this.visible)  { this.overlay.classList.remove('show'); this.visible = false; } }
}

// ─────────────────────────────────────────────────────────────────────────────
// SISTEMA DE ALERTAS
// ─────────────────────────────────────────────────────────────────────────────

class ModernAlertSystem {
    constructor() {
        this.container = document.getElementById('modernAlertContainer');
    }

    show(type, message, title = null, duration = 4000) {
        const ICONS  = { success: 'fa-check-circle', error: 'fa-exclamation-circle',
                         warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
        const TITLES = { success: title || 'Sucesso!', error: title || 'Erro!',
                         warning: title || 'Atenção!', info: title || 'Informação' };

        const el = document.createElement('div');
        el.className = `modern-alert ${type}`;
        el.innerHTML = `
            <div class="modern-alert-icon"><i class="fas ${ICONS[type]}"></i></div>
            <div class="modern-alert-content">
                <h4 class="modern-alert-title">${TITLES[type]}</h4>
                <p class="modern-alert-message">${message}</p>
            </div>
            <button class="modern-alert-close"><i class="fas fa-times"></i></button>`;

        this.container.appendChild(el);
        const timer = setTimeout(() => this._close(el), duration);
        el.querySelector('.modern-alert-close').addEventListener('click', () => {
            clearTimeout(timer); this._close(el);
        });
    }

    _close(el) { el.classList.add('hiding'); setTimeout(() => el.remove(), 300); }

    success(msg, title = null, dur = 3000) { this.show('success', msg, title, dur); }
    error(msg, title = null, dur = 4000)   { this.show('error',   msg, title, dur); }
    warning(msg, title = null, dur = 4000) { this.show('warning', msg, title, dur); }
    info(msg, title = null, dur = 3000)    { this.show('info',    msg, title, dur); }
}

// ─────────────────────────────────────────────────────────────────────────────
// REFRESH GLOBAL
// ─────────────────────────────────────────────────────────────────────────────

async function refreshAllData() {
    try {
        if (window.impressionManager) await window.impressionManager.loadFromSupabase();
        await carregarResumoClientes({ containerId: 'resumoClientes' });
    } catch (err) {
        console.error('[REFRESH] ❌', err);
        modernAlert.error('Erro ao atualizar dados');
    }
}
window.refreshAllData = refreshAllData;

// ─────────────────────────────────────────────────────────────────────────────
// PICKER SOMENTE-DATA
// ─────────────────────────────────────────────────────────────────────────────

function openDateOnlyPicker(displayInput, onConfirm, zIndex = 10002, theme = '') {
    const tryOpen = (tries = 200) => {
        const picker = window.customDateTimePicker;
        if (!picker) {
            if (tries > 0) setTimeout(() => tryOpen(tries - 1), 50);
            return;
        }

        let hidden = document.getElementById('_dateOnlyHiddenInput');
        if (!hidden) {
            hidden = document.createElement('input');
            hidden.type      = 'datetime-local';
            hidden.id        = '_dateOnlyHiddenInput';
            hidden.style.cssText =
                'position:fixed;left:-9999px;top:-9999px;opacity:0;pointer-events:none;';
            document.body.appendChild(hidden);
        }

        const pad = n => String(n).padStart(2, '0');
        const now = new Date();
        hidden.value = displayInput.dataset.isoDate
            ? displayInput.dataset.isoDate + 'T00:00'
            : `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T00:00`;

        const overlay  = document.getElementById('customDateTimeOverlay');
        const pickerEl = overlay?.querySelector('.custom-datetime-picker');

        const origConfirm = picker.confirm.bind(picker);
        const origClose   = picker.close.bind(picker);

        const restore = () => {
            pickerEl?.classList.remove('date-only-mode', 'theme-green', 'theme-cyan', 'theme-red');
            overlay?.classList.remove('theme-green', 'theme-cyan', 'theme-red');
            if (overlay) overlay.style.zIndex = '';
            picker.confirm = origConfirm;
            picker.close   = origClose;
        };

        picker.confirm = () => {
            if (!picker.selectedDate) { picker.close(); return; }
            const d   = picker.selectedDate;
            const iso = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
            displayInput.value           = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
            displayInput.dataset.isoDate = iso;
            restore();
            origClose();
            if (typeof onConfirm === 'function') onConfirm(iso);
        };

        picker.close = () => { restore(); origClose(); };

        if (overlay) overlay.style.zIndex = String(zIndex);
        picker.open(hidden);
        requestAnimationFrame(() => {
            pickerEl?.classList.add('date-only-mode');
            if (theme) {
                pickerEl?.classList.add(theme);
                overlay?.classList.add(theme);
            }
        });
    };
    tryOpen();
}

// ─────────────────────────────────────────────────────────────────────────────
// GERENCIADOR DE CÁLCULOS — Formulário de edição
// ─────────────────────────────────────────────────────────────────────────────

class EditCalculationManager {
    constructor() {
        this.currentImpressionId = null;
        this.loadedManualValue   = null;
        this.isManualImpression  = false;
        this._initElements();
        this._setupListeners();
        this._setupNumberFormatting();
        this.calculateTotal();
    }

    _initElements() {
        const el = id => document.getElementById(id);
        this.el = {
            tipo:            el('editTipoImpressao'),
            folhasNormais:   el('editFolhasNormais'),
            folhasOffset:    el('editFolhasOffset'),
            projetoCanva:    el('editProjetoCanva'),
            trabalho:        el('editTrabalho'),
            valorTotal:      el('editValorTotal'),
            precoTipo:       el('editPrecoTipo'),
            valorManual:     el('editValorTotalManual'),
            manualContainer: el('editValorTotalManualContainer'),
        };
        if (this.el.tipo?.options.length <= 1) this._populateTipoSelect();
    }

    _populateTipoSelect() {
        if (!this.el.tipo) return;
        this.el.tipo.innerHTML = [
            { v: '',  t: 'Selecione o tipo' },
            { v: '0', t: 'Desconhecido' },
            { v: '1', t: 'Xerox preto e branco' },
            { v: '2', t: 'Xerox Colorido' },
            { v: '3', t: 'Impressão digital' },
            { v: '4', t: 'Impressão Digital Colorido' },
        ].map(o => `<option value="${o.v}">${o.t}</option>`).join('');
    }

    _setupListeners() {
        this.el.tipo?.addEventListener('change', () => { this._showTypePrice(); this.calculateTotal(); });
        [this.el.folhasNormais, this.el.folhasOffset, this.el.projetoCanva, this.el.trabalho]
            .forEach(el => el?.addEventListener('input', () => this.calculateTotal()));
        this.el.valorManual?.addEventListener('input', () => {
            const v = parseFloat(this.el.valorManual.value);
            this.loadedManualValue = (!isNaN(v) && v > 0) ? v : null;
            this.calculateTotal();
        });
        this.el.valorManual?.addEventListener('focus', () => {
            if (!this.isManualImpression) return;
            ['folhasNormais','folhasOffset'].forEach(k => setInputValue(this.el[k], '0'));
            ['projetoCanva','trabalho'].forEach(k => setInputValue(this.el[k], '0.00'));
            if (this.el.tipo) this.el.tipo.value = '';
            this._showTypePrice();
        });
    }

    _setupNumberFormatting() {
        [this.el.folhasNormais, this.el.folhasOffset, this.el.projetoCanva, this.el.trabalho, this.el.valorManual]
            .forEach(field => {
                if (!field) return;
                field.addEventListener('focus', e => e.target.select());
                field.addEventListener('click', e => e.target.select());
                field.addEventListener('blur',  e => {
                    const raw = sanitizeNumeric(e.target.value, '');
                    if (!raw) {
                        e.target.value = '';
                        this.calculateTotal();
                        return;
                    }
                    const v = parseFloat(raw);
                    const isDecimal = [this.el.projetoCanva, this.el.trabalho, this.el.valorManual].includes(field);
                    e.target.value = isNaN(v) ? '' : (isDecimal ? v.toFixed(2) : Math.floor(v));
                    this.calculateTotal();
                });
            });
    }

    _allAutoFieldsZero() {
        return ['folhasNormais','folhasOffset','projetoCanva','trabalho']
            .every(k => (parseFloat(this.el[k]?.value) || 0) === 0);
    }

    isUsingManualValue() {
        return this.isManualImpression && this._allAutoFieldsZero() &&
               (parseFloat(this.el.valorManual?.value) || 0) > 0;
    }

    _showTypePrice() {
        const tipo = parseInt(this.el.tipo?.value);
        if (!tipo || tipo === 0) { if (this.el.precoTipo) this.el.precoTipo.style.display = 'none'; return; }
        const preco = priceManager?.getPrice(tipo) || 0;
        this.el.precoTipo.textContent  = `R$ ${Number(preco).toFixed(2)} por unidade`;
        this.el.precoTipo.style.display = 'block';
    }

    calculateTotal() {
        if (this.isManualImpression) {
            const allZero     = this._allAutoFieldsZero();
            const valorManual = parseFloat(this.el.valorManual?.value) || 0;
            if (allZero && valorManual > 0) {
                if (this.el.valorTotal) this.el.valorTotal.textContent = `R$ ${valorManual.toFixed(2)}`;
                if (!this.el.tipo?.value) this.el.tipo.value = '0';
                return valorManual;
            }
        }
        return this._calculateAutomatic();
    }

    _calculateAutomatic() {
        const tipo          = parseInt(this.el.tipo?.value);
        const folhasNormais = parseFloat(this.el.folhasNormais?.value) || 0;
        const folhasOffset  = parseFloat(this.el.folhasOffset?.value)  || 0;
        const projetoCanva  = parseFloat(this.el.projetoCanva?.value)  || 0;
        const trabalho      = parseFloat(this.el.trabalho?.value)      || 0;

        if (!tipo || tipo === 0) {
            if (this.el.valorTotal) this.el.valorTotal.textContent = 'R$ 0,00';
            return 0;
        }
        const precoTipo   = Number(priceManager?.getPrice(tipo))   || 0;
        const precoOffset = Number(priceManager?.getOffsetPrice())  || 0;
        const total       = folhasNormais * precoTipo + folhasOffset * precoOffset + projetoCanva + trabalho;
        if (this.el.valorTotal) this.el.valorTotal.textContent = `R$ ${total.toFixed(2)}`;
        return total;
    }

    loadImpression(impressao, id) {
        this.currentImpressionId = id;
        this.isManualImpression  =
            (!impressao.tipoImpressao || impressao.tipoImpressao === 0) &&
            impressao.folhasNormais === 0 && impressao.folhasOffset === 0 &&
            impressao.projetoCanva  === 0 && impressao.trabalho    === 0 &&
            impressao.valorTotal    > 0;

        if (this.isManualImpression) {
            setInputValue(this.el.tipo, '');
            setInputValue(this.el.folhasNormais, '0');
            setInputValue(this.el.folhasOffset,  '0');
            setInputValue(this.el.projetoCanva,  '0.00');
            setInputValue(this.el.trabalho,      '0.00');
            setInputValue(this.el.valorManual,   impressao.valorTotal.toFixed(2));
            this.loadedManualValue = impressao.valorTotal;
        } else {
            setInputValue(this.el.tipo,          sanitize(impressao.tipoImpressao, ''));
            setInputValue(this.el.folhasNormais,  sanitize(impressao.folhasNormais,  '0'));
            setInputValue(this.el.folhasOffset,   sanitize(impressao.folhasOffset,   '0'));
            setInputValue(this.el.projetoCanva,   (impressao.projetoCanva  || 0).toFixed(2));
            setInputValue(this.el.trabalho,       (impressao.trabalho      || 0).toFixed(2));
            setInputValue(this.el.valorManual,    '');
            this.loadedManualValue = null;
        }

        if (this.el.manualContainer)
            this.el.manualContainer.style.display = this.isManualImpression ? 'block' : 'none';
        this._showTypePrice();
        this.calculateTotal();
    }
}
window.EditCalculationManager = EditCalculationManager;

// ─────────────────────────────────────────────────────────────────────────────
// GERENCIADOR DE MODAIS
// ─────────────────────────────────────────────────────────────────────────────

const TIPO_NOMES = { 0: 'Desconhecido', 1: 'Xerox P&B', 2: 'Xerox Colorido', 3: 'Digital P&B', 4: 'Digital Colorido' };

class ModalManager {
    constructor() {
        this.confirmCallback = null;
        this.editingId       = null;
        this._initElements();
        this._setupListeners();
    }

    _initElements() {
        const el = id => document.getElementById(id);
        this.el = {
            confirmModal:  el('confirmModal'),
            editModal:     el('editModal'),
            addModal:      el('addModal'),
            confirmTitle:  el('confirmTitle'),
            confirmMsg:    el('confirmMessage'),
            editForm:      el('editForm'),
            addForm:       el('addForm'),
        };
    }

    _setupListeners() {
        document.getElementById('confirmCancelBtn')?.addEventListener('click', () => this.closeConfirm?.());
        document.getElementById('confirmOkBtn')?.addEventListener('click', () => {
            this.confirmCallback?.();
            this.confirmCallback = null;
            this.closeConfirm();
        });

        this.el.editForm?.addEventListener('submit',  e => this._handleEditSubmit(e));
        this.el.addForm?.addEventListener('submit',   e => this._handleAddSubmit(e));

        this.el.editModal?.querySelector('.btn-secondary')
            ?.addEventListener('click', () => this.closeEdit());
        this.el.addModal?.querySelector('.btn-secondary')
            ?.addEventListener('click', () => this.closeAdd());
    }

    showConfirm(title, message, callback) {
        this.el.confirmTitle.textContent = title;
        this.el.confirmMsg.textContent   = message;
        this.confirmCallback             = callback;
        const icon = document.getElementById('confirmIcon');
        if (icon) icon.className = 'fas fa-question-circle';
        const okBtn = document.getElementById('confirmOkBtn');
        if (okBtn) okBtn.innerHTML = '<i class="fas fa-check"></i> Confirmar';
        this.el.confirmModal.style.display = 'block';
    }

    closeConfirm() {
        this.el.confirmModal.style.display = 'none';
        this.confirmCallback = null;
    }

    showEdit(id, impressao) {
        this.editingId = id;
        setInputValue(this.el.editForm.querySelector('#editCliente'),  impressao.cliente);
        setInputValue(this.el.editForm.querySelector('#editDataHora'), isoToDatetimeLocal(impressao.dataHora));
        window.editCalculationManager?.loadImpression(impressao, id);
        this.el.editModal.style.display = 'block';
    }
    closeEdit() { this.el.editModal.style.display = 'none'; this.editingId = null; }

    showAdd() {
        const addCliente    = document.getElementById('addCliente');
        const addValorTotal = document.getElementById('addValorTotal');
        const addDataHora   = document.getElementById('addDataHora');
        setInputValue(addCliente,    '');
        setInputValue(addValorTotal, '');
        const now = new Date();
        setInputValue(addDataHora,
            new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
        this.el.addModal.style.display = 'block';
    }
    closeAdd()        { this.el.addModal.style.display   = 'none'; }
    closeModal(modal) { modal.style.display = 'none'; }

    async _handleEditSubmit(e) {
        e.preventDefault();
        if (!this.editingId) { modernAlert.error('Erro: ID da impressão não encontrado'); return; }

        const form        = e.target;
        const nomeCliente = form.querySelector('#editCliente').value.trim();
        const valorTotal  = window.editCalculationManager?.calculateTotal() || 0;

        if (!nomeCliente || !/[a-zA-ZÀ-ÿ]/.test(nomeCliente)) {
            modernAlert.error('Nome do cliente inválido'); return;
        }

        const isManual      = window.editCalculationManager?.isUsingManualValue();
        const tipoImpressao = isManual ? 0 : parseInt(form.querySelector('#editTipoImpressao').value);

        if (!isManual && (!tipoImpressao || tipoImpressao === 0)) {
            modernAlert.error('Selecione um tipo de impressão válido'); return;
        }

        const updatedData = {
            cliente:       nomeCliente,
            tipoImpressao,
            folhasNormais: isManual ? 0 : (parseInt(form.querySelector('#editFolhasNormais').value) || 0),
            folhasOffset:  isManual ? 0 : (parseInt(form.querySelector('#editFolhasOffset').value)  || 0),
            projetoCanva:  isManual ? 0 : (parseFloat(form.querySelector('#editProjetoCanva').value) || 0),
            trabalho:      isManual ? 0 : (parseFloat(form.querySelector('#editTrabalho').value)     || 0),
            valorTotal,
            dataHora:      datetimeLocalToISO(form.querySelector('#editDataHora').value),
        };

        const id = this.editingId;
        this.closeEdit();
        await window.impressionManager?.updateImpression(id, updatedData);
    }

    async _handleAddSubmit(e) {
        e.preventDefault();
        const form        = e.target;
        const nomeCliente = form.querySelector('#addCliente').value.trim();

        if (!nomeCliente || !/[a-zA-ZÀ-ÿ]/.test(nomeCliente)) {
            modernAlert.error('Nome inválido'); return;
        }

        const impressao = {
            cliente:         nomeCliente,
            tipoImpressao:   0,
            tipoPreco:       'Desconhecido',
            folhasNormais:   0, folhasOffset: 0, projetoCanva: 0, trabalho: 0,
            valorTotal:      parseFloat(form.querySelector('#addValorTotal').value),
            valorPago:       0,
            statusPagamento: 'pendente',
            dataHora:        datetimeLocalToISO(form.querySelector('#addDataHora').value),
            timestamp:       Date.now(),
        };
        this.closeAdd();
        await window.impressionManager?.addImpression(impressao);
    }

    getTypeText(tipo) { return TIPO_NOMES[tipo] || 'Desconhecido'; }
}
window.ModalManager = ModalManager;

// ─────────────────────────────────────────────────────────────────────────────
// GERENCIADOR DE IMPRESSÕES
// ─────────────────────────────────────────────────────────────────────────────

class ImpressionManager {
    constructor() {
        this.impressions = [];
        this._initElements();
        this._setupListeners();
    }

    _initElements() {
        this.el = {
            tableBody:    document.getElementById('impressoesTableBody'),
            clearTableBtn:document.getElementById('clearTableBtn'),
            addManualBtn: document.getElementById('addManualBtn'),
        };
    }

    _setupListeners() {
        this.el.clearTableBtn?.addEventListener('click', () => this.confirmClearAll());
        this.el.addManualBtn?.addEventListener('click',  () => modalManager.showAdd());
    }

    async loadFromSupabase() {
        try {
            modernLoading.show();
            this.impressions = await supabaseManager.loadImpressions();
            this.renderTable();
            window.filterModal?.refresh();
            modernLoading.hide();
        } catch (err) {
            modernLoading.hide();
            console.error('[IMPRESSION] ❌', err);
            modernAlert.error('Erro ao carregar impressões do banco');
        }
    }

    async addImpression(data) {
        try {
            modernLoading.show();
            await supabaseManager._syncAddImpression(data);
            modernAlert.success('Impressão adicionada com sucesso!');
            await new Promise(r => setTimeout(r, 500));
            await this.loadFromSupabase();
            await refreshAllData();
            modernLoading.hide();
        } catch (err) {
            modernLoading.hide();
            console.error('[IMPRESSION] ❌ Erro ao adicionar:', err);
            modernAlert.error('Erro ao adicionar impressão');
        }
    }

    async updateImpression(id, data) {
        try {
            modernLoading.show();
            const tipoPreco = data.tipoImpressao === 0
                ? 'Desconhecido'
                : `${modalManager.getTypeText(data.tipoImpressao)} R$ ${priceManager.getPrice(data.tipoImpressao).toFixed(2)}`;
            await supabaseManager.updateImpression(id, { ...data, tipoPreco });
            modernAlert.success('Impressão atualizada com sucesso!');
            await this.loadFromSupabase();
            await refreshAllData();
            modernLoading.hide();
        } catch (err) {
            modernLoading.hide();
            console.error('[IMPRESSION] ❌ Erro ao atualizar:', err);
            modernAlert.error('Erro ao atualizar impressão');
        }
    }

    async deleteImpression(id) {
        try {
            modernLoading.show();
            await supabaseManager._syncDeleteImpression({ id });
            modernAlert.success('Impressão excluída com sucesso!');
            await new Promise(r => setTimeout(r, 500));
            await this.loadFromSupabase();
            await carregarResumoClientes({ containerId: 'resumoClientes' });
            modernLoading.hide();
        } catch (err) {
            modernLoading.hide();
            console.error('[DELETE] ❌', err);
            modernAlert.error('Erro ao excluir impressão');
        }
    }

    async clearAllRecords() {
        try {
            modernLoading.show();
            await supabaseManager._syncClearAll();
            modernAlert.success('Todos os registros foram limpos!');
            await new Promise(r => setTimeout(r, 500));
            await this.loadFromSupabase();
            await carregarResumoClientes({ containerId: 'resumoClientes' });
            modernLoading.hide();
        } catch (err) {
            modernLoading.hide();
            console.error('[DELETE] ❌', err);
            modernAlert.error('Erro ao limpar registros');
        }
    }

    confirmDelete(id) {
        const imp = this.impressions.find(i => i.id === id);
        if (!imp) return;

        const valorPago = parseFloat(imp.valorPago) || 0;

        setTimeout(() => {
            const okBtn = document.getElementById('confirmOkBtn');
            if (okBtn) okBtn.innerHTML = '<i class="fas fa-check"></i> Confirmar';
        }, 10);

        if (valorPago > 0) {
            const pendentes = this.impressions.filter(i =>
                i.id !== id &&
                i.clienteId === imp.clienteId &&
                parseFloat(i.valorRestante ?? (i.valorTotal - i.valorPago)) > 0
            );

            const totalAbsorvivel = pendentes.reduce((soma, i) =>
                soma + parseFloat(i.valorRestante ?? (i.valorTotal - i.valorPago)), 0
            );

            if (totalAbsorvivel < valorPago) {
                const isParcial = imp.statusPagamento === 'parcial';
                modalManager.showConfirm(
                    '⚠️ Exclusão Bloqueada',
                    isParcial
                        ? `Esta impressão tem R$ ${valorPago.toFixed(2)} pago parcialmente mas não há impressões pendentes suficientes para absorver o valor (disponível: R$ ${totalAbsorvivel.toFixed(2)}). Remova o pagamento no histórico antes de excluir.`
                        : `Esta impressão está paga (R$ ${valorPago.toFixed(2)}) mas não há impressões pendentes suficientes para absorver o valor. Remova o pagamento no histórico antes de excluir.`,
                    null
                );
                setTimeout(() => {
                    const okBtn = document.getElementById('confirmOkBtn');
                    if (okBtn) okBtn.innerHTML = '<i class="fas fa-check"></i> Entendido';
                }, 10);
                return;
            }

            modalManager.showConfirm(
                imp.statusPagamento === 'parcial'
                    ? 'Atenção: Impressão com Pagamento Parcial'
                    : 'Atenção: Impressão com Pagamento',
                `Esta impressão tem R$ ${valorPago.toFixed(2)} pago. O valor será redistribuído para as outras impressões pendentes do cliente. Deseja continuar?`,
                () => this.deleteImpression(id)
            );
            setTimeout(() => {
                const okBtn = document.getElementById('confirmOkBtn');
                if (okBtn) okBtn.innerHTML = '<i class="fas fa-trash"></i> Apagar';
            }, 10);
            return;
        }

        modalManager.showConfirm(
            'Confirmar Exclusão',
            'Deseja excluir esta impressão?',
            () => this.deleteImpression(id)
        );
        setTimeout(() => {
            const okBtn = document.getElementById('confirmOkBtn');
            if (okBtn) okBtn.innerHTML = '<i class="fas fa-trash"></i> Apagar';
        }, 10);
    }

    confirmClearAll() {
        modalManager.showConfirm('Limpar Todos os Registros',
            'Isso irá excluir TODAS as impressões. Continuar?', () => this.clearAllRecords());
    }

    editImpression(id) {
        const imp = this.impressions.find(i => i.id === id);
        if (imp) modalManager.showEdit(id, imp);
    }

    renderTable() {
        if (!this.impressions.length) {
            this.el.tableBody.innerHTML = `
                <tr><td colspan="10" class="empty-state">
                    <i class="fas fa-print"></i>
                    <p>Nenhuma impressão registrada</p>
                </td></tr>`;
            return;
        }

        const ordenadas = [...this.impressions].sort((a, b) => {
            const pA = this._prioridade(a.valorPago, a.valorTotal);
            const pB = this._prioridade(b.valorPago, b.valorTotal);
            if (pA !== pB) return pA - pB;
            return (a.cliente || '').toLowerCase().localeCompare((b.cliente || '').toLowerCase(), 'pt-BR');
        });

        this.el.tableBody.innerHTML = '';
        ordenadas.forEach(imp => this._renderRow(imp));
    }

    _prioridade(valorPago, valorTotal) {
        if (valorPago >= valorTotal && valorTotal > 0) return 1;
        if (valorPago > 0)                             return 2;
        return 3;
    }

    _renderRow(imp) {
        const row        = document.createElement('tr');
        const valorTotal = parseFloat(imp.valorTotal) || 0;
        const valorPago  = parseFloat(imp.valorPago)  || 0;
        const isPaid     = valorPago >= valorTotal && valorTotal > 0;
        const isPartial  = valorPago > 0 && valorPago < valorTotal;
        const saldo      = valorTotal - valorPago;

        if (isPaid)         row.classList.add('paid-impression');
        else if (isPartial) row.classList.add('partial-impression');

        const fmt = (v, prefix = 'R$ ') =>
            v > 0 ? `${prefix}${parseFloat(v).toFixed(2)}` : `${prefix}0.00`;

        const statusClass = isPaid ? 'pago' : isPartial ? 'parcial' : 'ativo';
        const statusText  = isPaid ? 'Pago' : isPartial ? 'Parcial' : 'Pendente';
        const pagoClass   = isPaid ? 'status-pago' : isPartial ? 'status-parcial' : 'status-pendente';
        const restoClass  = saldo > 0 ? 'status-pendente' : 'status-pago';
        const dataFmt     = new Date(imp.dataHora).toLocaleString('pt-BR',
            { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });

        row.innerHTML = `
            <td><div class="client-name">${imp.cliente}</div></td>
            <td><div class="tipo-info"><div class="tipo-nome">${imp.tipoPreco}</div></div></td>
            <td><div class="folhas-display">${imp.folhasNormais > 0 ? imp.folhasNormais : 0}</div></td>
            <td><div class="folhas-display">${imp.folhasOffset  > 0 ? imp.folhasOffset  : 0}</div></td>
            <td><div class="folhas-display">${fmt(imp.projetoCanva)}</div></td>
            <td><div class="folhas-display">${fmt(imp.trabalho)}</div></td>
            <td>
                <div class="valor-info">
                    <div class="valor-total-display">R$ ${valorTotal.toFixed(2)}</div>
                    <div class="valor-pago-display">Pago: <span class="${pagoClass}">R$ ${valorPago.toFixed(2)}</span></div>
                    <div class="valor-pago-display">Resta: <span class="${restoClass}">R$ ${saldo.toFixed(2)}</span></div>
                </div>
            </td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td><div class="data-hora">${dataFmt}</div></td>
            <td>
                <div class="acoes">
                    <button class="btn-icon btn-edit"   data-id="${imp.id}" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-danger" data-id="${imp.id}" title="Excluir"><i class="fas fa-trash"></i></button>
                </div>
            </td>`;

        row.querySelector('.btn-edit')  .addEventListener('click', () => this.editImpression(imp.id));
        row.querySelector('.btn-danger').addEventListener('click', () => this.confirmDelete(imp.id));
        this.el.tableBody.appendChild(row);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GERENCIADOR DE PREÇOS
// ─────────────────────────────────────────────────────────────────────────────

class PriceManager {
    constructor() {
        this.prices      = { 1: 0.50, 2: 1.00, 3: 1.50, 4: 2.00 };
        this.offsetPrice = 0.50;
        this.isUnlocked  = false;
        this._listeners  = [];
        this._initElements();
        this._setupListeners();
        this._setupFormatting();
    }

    _initElements() {
        const el = id => document.getElementById(id);
        this.el = {
            lockBtn:      el('lockButton'),    lockIcon:        el('lockIcon'),
            preco1:       el('preco1'),         preco2:          el('preco2'),
            preco3:       el('preco3'),         preco4:          el('preco4'),
            precoOffset:  el('precoOffset'),    offsetLabel:     el('offsetPriceLabel'),
            offsetInfo:   el('offsetPriceInfo'),clearPricesBtn:  el('clearPricesBtn'),
            precoTipo:    el('precoTipo'),       tipoImpressao:   el('tipoImpressao'),
            pricesCard:   document.querySelector('.prices-card'),
        };
    }

    _setupListeners() {
        this.el.lockBtn?.addEventListener('click', () => this.toggleLock());
        this.el.clearPricesBtn?.addEventListener('click', () => this.confirmClearPrices());
        this._priceInputs().forEach(i => i?.addEventListener('input', () => this._updateFromInputs()));
        this.el.tipoImpressao?.addEventListener('change', () => this.showTypePrice());
        document.addEventListener('click', e => {
            if (this.isUnlocked && !this.el.pricesCard?.contains(e.target)) this.autoLock();
        });
    }

    _setupFormatting() {
        this._priceInputs().forEach(input => {
            if (!input) return;
            input.addEventListener('focus', e => { if (this.isUnlocked) e.target.select(); });
            input.addEventListener('click', e => { if (this.isUnlocked) e.target.select(); });
            input.addEventListener('blur',  e => {
                if (!this.isUnlocked) return;
                const v = parseFloat(e.target.value);
                e.target.value = (!v || v === 0) ? '0.50' : v.toFixed(2);
                this._updateFromInputs();
            });
        });
    }

    _priceInputs() {
        return [this.el.preco1, this.el.preco2, this.el.preco3, this.el.preco4, this.el.precoOffset];
    }

    onPriceChange(cb)  { this._listeners.push(cb); }
    _notifyChange()    { this._listeners.forEach(cb => cb()); }

    _updateInputsDOM() {
        const defaults = { 1: 0.50, 2: 1.00, 3: 1.50, 4: 2.00 };
        [1,2,3,4].forEach(i => {
            if (this.el[`preco${i}`]) {
                const v = parseFloat(this.prices[i] ?? defaults[i]) || defaults[i];
                this.el[`preco${i}`].value = v.toFixed(2);
            }
        });
        const offset = parseFloat(this.offsetPrice ?? 0.50) || 0.50;
        if (this.el.precoOffset)  this.el.precoOffset.value = offset.toFixed(2);
        if (this.el.offsetLabel)  this.el.offsetLabel.textContent = `(+R$ ${this.offsetPrice.toFixed(2)}/un)`;
        if (this.el.offsetInfo)   this.el.offsetInfo.textContent  = `+R$ ${this.offsetPrice.toFixed(2)}`;
    }

    _updateFromInputs() {
        if (!this.isUnlocked) return;
        this.prices = {
            1: parseFloat(this.el.preco1?.value)     || 0.50,
            2: parseFloat(this.el.preco2?.value)     || 1.00,
            3: parseFloat(this.el.preco3?.value)     || 1.50,
            4: parseFloat(this.el.preco4?.value)     || 2.00,
        };
        this.offsetPrice = parseFloat(this.el.precoOffset?.value) || 0.50;
        if (this.el.offsetLabel) this.el.offsetLabel.textContent = `+R$ ${this.offsetPrice.toFixed(2)}/un`;
        this.showTypePrice();
        calculationManager?.calculateTotal();
    }

    async toggleLock() {
        this.isUnlocked = !this.isUnlocked;
        this._setInputsReadonly(!this.isUnlocked);
        this.el.lockIcon.className = this.isUnlocked ? 'fas fa-unlock' : 'fas fa-lock';
        this.el.lockBtn.classList.toggle('unlocked', this.isUnlocked);
        if (!this.isUnlocked) await this.savePrices();
    }

    async autoLock() {
        if (!this.isUnlocked) return;
        this.isUnlocked = false;
        this._setInputsReadonly(true);
        this.el.lockIcon.className = 'fas fa-lock';
        this.el.lockBtn.classList.remove('unlocked');
        await this.savePrices();
    }

    _setInputsReadonly(readonly) {
        this._priceInputs().forEach(i => {
            if (!i) return;
            readonly ? i.setAttribute('readonly', true) : i.removeAttribute('readonly');
        });
    }

    async savePrices() {
        try {
            modernLoading.show();
            await supabaseManager.savePrices(this.prices, this.offsetPrice);
            this._notifyChange();
            modernAlert.success('Preços salvos com sucesso!');
            modernLoading.hide();
        } catch (err) {
            modernLoading.hide();
            console.error('[PRICE] ❌', err);
            modernAlert.error('Erro ao salvar preços');
        }
    }

    async loadFromSupabase() {
        try {
            const data = await supabaseManager.loadPrices();
            if (data) {
                this.prices      = { 1: parseFloat(data[1])||0.50, 2: parseFloat(data[2])||1.00,
                                     3: parseFloat(data[3])||1.50, 4: parseFloat(data[4])||2.00 };
                this.offsetPrice = parseFloat(data[5]) || 0.50;
            } else {
                this.prices      = { 1: 0.50, 2: 1.00, 3: 1.50, 4: 2.00 };
                this.offsetPrice = 0.50;
            }
            this._updateInputsDOM();
        } catch (err) {
            console.error('[PRICE] ❌', err);
            this.prices      = { 1: 0.50, 2: 1.00, 3: 1.50, 4: 2.00 };
            this.offsetPrice = 0.50;
            this._updateInputsDOM();
        }
    }

    async clearPrices() {
        try {
            modernLoading.show();
            this.prices      = { 1: 0.50, 2: 1.00, 3: 1.50, 4: 2.00 };
            this.offsetPrice = 0.50;
            this._updateInputsDOM();
            this.showTypePrice();
            await supabaseManager._syncResetPrices();
            this._notifyChange();
            calculationManager?.calculateTotal();
            modernAlert.success('Preços resetados com sucesso!');
            modernLoading.hide();
        } catch (err) {
            modernLoading.hide();
            console.error('[PRICE] ❌', err);
            modernAlert.error('Erro ao resetar preços');
        }
    }

    confirmClearPrices() {
        modalManager?.showConfirm('Limpar Preços', 'Resetar todos os preços?', () => this.clearPrices());
    }

    showTypePrice() {
        const tipo = this.el.tipoImpressao?.value;
        if (tipo) {
            this.el.precoTipo.textContent   = `R$ ${this.prices[parseInt(tipo)]?.toFixed(2)} por unidade`;
            this.el.precoTipo.style.display = 'block';
        } else {
            this.el.precoTipo.style.display = 'none';
        }
    }

    getPrice(type)   { return this.prices[type] || 0; }
    getOffsetPrice() { return this.offsetPrice; }
}

// ─────────────────────────────────────────────────────────────────────────────
// GERENCIADOR DE CÁLCULOS — Formulário principal
// ─────────────────────────────────────────────────────────────────────────────

class CalculationManager {
    constructor() {
        const el = id => document.getElementById(id);
        this.el = {
            tipo:         el('tipoImpressao'),  folhasNormais: el('folhasNormais'),
            folhasOffset: el('folhasOffset'),   projetoCanva:  el('projetoCanva'),
            trabalho:     el('trabalho'),        valorTotal:    el('valorTotal'),
            breakdown:    el('totalBreakdown'),
        };
        this._setupListeners();
    }

    _setupListeners() {
        this.el.tipo?.addEventListener('change', () => {
            priceManager.showTypePrice(); this.calculateTotal();
        });
        [this.el.folhasNormais, this.el.folhasOffset, this.el.projetoCanva, this.el.trabalho]
            .forEach(el => el?.addEventListener('input', () => this.calculateTotal()));
    }

    calculateTotal() {
        const tipo          = parseInt(this.el.tipo?.value);
        const folhasNormais = parseFloat(this.el.folhasNormais?.value) || 0;
        const folhasOffset  = parseFloat(this.el.folhasOffset?.value)  || 0;
        const projetoCanva  = parseFloat(this.el.projetoCanva?.value)  || 0;
        const trabalho      = parseFloat(this.el.trabalho?.value)      || 0;

        if (!tipo) {
            this.el.valorTotal.textContent = 'R$ 0,00';
            this.el.breakdown.innerHTML    = '<div class="calculation-empty">Selecione o tipo de impressão e preencha os campos</div>';
            return 0;
        }

        const precoTipo    = parseFloat(priceManager.getPrice(tipo))   || 0;
        const precoOffset  = parseFloat(priceManager.getOffsetPrice()) || 0;
        const custoNormais = folhasNormais * precoTipo;
        const custoOffset  = folhasOffset  * precoOffset;
        const total        = custoNormais  + custoOffset + projetoCanva + trabalho;

        this.el.valorTotal.textContent = `R$ ${total.toFixed(2)}`;

        const itens = [
            folhasNormais > 0 && `<div class="calculation-item"><span class="item-icon">📄</span><span class="item-formula">${folhasNormais} folhas × ${precoTipo.toFixed(2)}</span><span class="item-arrow">→</span><span class="item-result">${custoNormais.toFixed(2)}</span></div>`,
            folhasOffset  > 0 && `<div class="calculation-item"><span class="item-icon">🖨️</span><span class="item-formula">${folhasOffset} offset × ${precoOffset.toFixed(2)}</span><span class="item-arrow">→</span><span class="item-result">${custoOffset.toFixed(2)}</span></div>`,
            projetoCanva  > 0 && `<div class="calculation-item"><span class="item-icon">🎨</span><span class="item-formula">Projeto Canva</span><span class="item-arrow">→</span><span class="item-result">${projetoCanva.toFixed(2)}</span></div>`,
            trabalho      > 0 && `<div class="calculation-item"><span class="item-icon">💼</span><span class="item-formula">Trabalho</span><span class="item-arrow">→</span><span class="item-result">${trabalho.toFixed(2)}</span></div>`,
        ].filter(Boolean);

        this.el.breakdown.innerHTML = itens.length
            ? itens.join('') + `<div class="calculation-total-line"><span class="total-label">Total</span><span class="total-arrow">→</span><span class="total-result">R$ ${total.toFixed(2)}</span></div>`
            : '<div class="calculation-empty">Informe os valores para ver o cálculo</div>';

        return total;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GERENCIADOR DE FORMULÁRIO
// ─────────────────────────────────────────────────────────────────────────────

class FormManager {
    constructor() {
        this.STORAGE_KEY = 'impressaoForm_autoSave';
        this._initElements();
        this._setupListeners();
        this._loadSavedData();
    }

    _initElements() {
        const el = id => document.getElementById(id);
        this.el = {
            form:              el('impressaoForm'),
            nomeCliente:       el('nomeCliente'),
            tipoImpressao:     el('tipoImpressao'),
            folhasNormais:     el('folhasNormais'),
            folhasOffset:      el('folhasOffset'),
            projetoCanva:      el('projetoCanva'),
            trabalho:          el('trabalho'),
            clearFormBtn:      el('clearFormBtn'),
            nomeClienteError:  el('nomeClienteError'),
            folhasOffsetError: el('folhasOffsetError'),
        };
    }

    _setupListeners() {
        this.el.form?.addEventListener('submit', e => this._handleSubmit(e));
        this.el.clearFormBtn?.addEventListener('click', () => this.clearForm());

        this.el.nomeCliente?.addEventListener('input',   () => { this._validateClientName();  this._save(); });
        this.el.folhasOffset?.addEventListener('input',  () => { this._validateFolhasOffset(); this._save(); });
        this.el.folhasNormais?.addEventListener('input', () => { this._validateFolhasOffset(); this._save(); });
        [this.el.tipoImpressao, this.el.projetoCanva, this.el.trabalho]
            .forEach(el => el?.addEventListener(el === this.el.tipoImpressao ? 'change' : 'input', () => this._save()));

        this._setupNumberFormatting();
    }

    _setupNumberFormatting() {
        [this.el.folhasNormais, this.el.folhasOffset, this.el.projetoCanva, this.el.trabalho]
            .forEach(field => {
                if (!field) return;
                field.addEventListener('click', e => e.target.select());
                field.addEventListener('focus', e => e.target.select());
                field.addEventListener('blur',  e => {
                    const raw = sanitizeNumeric(e.target.value, '');
                    if (!raw) {
                        e.target.value = '';
                        calculationManager.calculateTotal();
                        this._save();
                        return;
                    }
                    const v = parseFloat(raw);
                    e.target.value = isNaN(v) ? '' : v.toFixed(2);
                    calculationManager.calculateTotal();
                    this._save();
                });
            });
    }

    _save() {
        try {
            const clean = v => {
                if (v === null || v === undefined) return '';
                const s = String(v).trim();
                return (s === 'null' || s === 'undefined' || s === 'NaN') ? '' : s;
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                nomeCliente:   clean(this.el.nomeCliente?.value),
                tipoImpressao: clean(this.el.tipoImpressao?.value),
                folhasNormais: clean(this.el.folhasNormais?.value),
                folhasOffset:  clean(this.el.folhasOffset?.value),
                projetoCanva:  clean(this.el.projetoCanva?.value),
                trabalho:      clean(this.el.trabalho?.value),
                timestamp:     Date.now(),
            }));
        } catch (_) {}
    }

    _loadSavedData() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (!saved) return;
            const data = JSON.parse(saved);
            if (data.timestamp && (Date.now() - data.timestamp) > 86400000) {
                this._clearStorage(); return;
            }
            setInputValue(this.el.nomeCliente,   sanitize(data.nomeCliente));
            setInputValue(this.el.tipoImpressao, sanitize(data.tipoImpressao));
            setInputValue(this.el.folhasNormais, sanitize(data.folhasNormais));
            setInputValue(this.el.folhasOffset,  sanitize(data.folhasOffset));
            setInputValue(this.el.projetoCanva,  sanitize(data.projetoCanva));
            setInputValue(this.el.trabalho,      sanitize(data.trabalho));
            if (data.tipoImpressao) priceManager.showTypePrice();
            calculationManager.calculateTotal();
        } catch (_) { this._clearStorage(); }
    }

    _clearStorage() {
        try { localStorage.removeItem(this.STORAGE_KEY); } catch (_) {}
    }

    _validateClientName() {
        const nome = this.el.nomeCliente.value.trim();
        const invalid = nome && !/[a-zA-ZÀ-ÿ]/.test(nome);
        this.el.nomeClienteError.textContent = invalid ? 'O nome deve ter pelo menos uma letra' : '';
        this.el.nomeCliente.classList.toggle('error', invalid);
        return !invalid;
    }

    _validateFolhasOffset() {
        const normais = parseInt(this.el.folhasNormais.value) || 0;
        const offset  = parseInt(this.el.folhasOffset.value)  || 0;
        const invalid = offset > normais;
        if (invalid) this.el.folhasOffset.value = String(normais ?? 0);
        this.el.folhasOffsetError.textContent = invalid ? 'Offset não pode ser maior que o total' : '';
        this.el.folhasOffset.classList.toggle('error', invalid);
        if (invalid) calculationManager.calculateTotal();
        return !invalid;
    }

    _validate(data) {
        if (!data.nome)                         { modernAlert.error('Digite o nome do cliente'); return false; }
        if (!/[a-zA-ZÀ-ÿ]/.test(data.nome))    { modernAlert.error('Nome deve ter pelo menos uma letra'); return false; }
        if (!data.tipo)                         { modernAlert.error('Selecione o tipo de impressão'); return false; }
        if (!data.folhasNormais && !data.folhasOffset && !data.projetoCanva && !data.trabalho)
            { modernAlert.error('Informe pelo menos uma folha, projeto ou trabalho'); return false; }
        if (data.folhasOffset > data.folhasNormais)
            { modernAlert.error('Offset não pode ser maior que total'); return false; }
        return true;
    }

    async _handleSubmit(e) {
        e.preventDefault();
        if (!this._validateClientName() || !this._validateFolhasOffset()) return;

        const data = {
            nome:          this.el.nomeCliente?.value.trim(),
            tipo:          parseInt(this.el.tipoImpressao?.value),
            folhasNormais: parseInt(this.el.folhasNormais?.value) || 0,
            folhasOffset:  parseInt(this.el.folhasOffset?.value)  || 0,
            projetoCanva:  parseFloat(this.el.projetoCanva?.value) || 0,
            trabalho:      parseFloat(this.el.trabalho?.value)     || 0,
        };
        if (!this._validate(data)) return;

        const valorTotal = calculationManager.calculateTotal();
        const impressao = {
            cliente:         data.nome,
            tipoImpressao:   data.tipo,
            tipoPreco:       `${TIPO_NOMES[data.tipo] || ''} R$ ${priceManager.getPrice(data.tipo).toFixed(2)}`,
            folhasNormais:   data.folhasNormais,
            folhasOffset:    data.folhasOffset,
            projetoCanva:    data.projetoCanva,
            trabalho:        data.trabalho,
            valorTotal,
            valorPago:       0,
            statusPagamento: 'pendente',
            dataHora:        new Date().toISOString(),
            timestamp:       Date.now(),
        };

        await impressionManager.addImpression(impressao);
        this.clearForm();
        this._clearStorage();
    }

    clearForm() {
        setInputValue(this.el.nomeCliente,   '');
        setInputValue(this.el.tipoImpressao, '');
        setInputValue(this.el.folhasNormais, '');
        setInputValue(this.el.folhasOffset,  '');
        setInputValue(this.el.projetoCanva,  '');
        setInputValue(this.el.trabalho,      '');

        this.el.nomeClienteError.textContent  = '';
        this.el.folhasOffsetError.textContent = '';
        this.el.nomeCliente.classList.remove('error');
        this.el.folhasOffset.classList.remove('error');
        priceManager.el.precoTipo.style.display      = 'none';
        calculationManager.el.valorTotal.textContent  = 'R$ 0,00';
        calculationManager.el.breakdown.innerHTML     =
            '<div class="calculation-empty">Selecione o tipo de impressão e preencha os campos</div>';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// CALENDÁRIO CUSTOMIZADO
// ─────────────────────────────────────────────────────────────────────────────

class CustomDateTimePicker {
    constructor() {
        this.overlay      = document.getElementById('customDateTimeOverlay');
        this.currentDate  = new Date();
        this.selectedDate = new Date();
        this.targetInput  = null;
        this._initElements();
        this._setupListeners();
        this.renderCalendar();
    }

    _initElements() {
        const el = id => document.getElementById(id);
        this.el = {
            overlay:      el('customDateTimeOverlay'),
            closeBtn:     el('closeDateTimePicker'),
            cancelBtn:    el('cancelDateTime'),
            confirmBtn:   el('confirmDateTime'),
            prevMonth:    el('prevMonth'),
            nextMonth:    el('nextMonth'),
            currentMonth: el('currentMonth'),
            calendarDays: el('calendarDays'),
            dateDisplay:  el('selectedDateDisplay'),
            hourInput:    el('hourInput'),
            minuteInput:  el('minuteInput'),
            nowBtn:       el('setNowBtn'),
        };
    }

    _setupListeners() {
        this.el.closeBtn.addEventListener('click',  () => this.close());
        this.el.cancelBtn.addEventListener('click', () => this.close());
        this.el.overlay.addEventListener('click',   e => { if (e.target === this.el.overlay) this.close(); });
        this.el.prevMonth.addEventListener('click',  () => this._changeMonth(-1));
        this.el.nextMonth.addEventListener('click',  () => this._changeMonth(1));
        this.el.confirmBtn.addEventListener('click', () => this.confirm());
        this.el.nowBtn.addEventListener('click',     () => this.setNow());

        this._setupTimeInput(this.el.hourInput,   23);
        this._setupTimeInput(this.el.minuteInput, 59);

        this.el.currentMonth.addEventListener('click', e => {
            if (e.target.classList.contains('year-pick-btn')) this._openYearPicker();
        });

        this._interceptDateTimeInputs();
    }

    _openYearPicker() {
        let ov = document.getElementById('yearPickerOverlay');
        if (!ov) {
            ov = document.createElement('div');
            ov.id = 'yearPickerOverlay';
            ov.className = 'year-picker-overlay';
            ov.innerHTML = `
                <div class="year-picker-modal">
                    <div class="year-picker-header">
                        <span>Selecionar ano</span>
                        <button class="year-picker-close" id="yearPickerClose"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="year-picker-scroll" id="yearPickerScroll"></div>
                </div>`;
            this.el.overlay.appendChild(ov);
            document.getElementById('yearPickerClose').addEventListener('click', () => this._closeYearPicker());
            ov.addEventListener('click', e => { if (e.target === ov) this._closeYearPicker(); });
        }

        const scroll = document.getElementById('yearPickerScroll');
        scroll.innerHTML = '';
        const curY   = this.currentDate.getFullYear();
        const maxY   = new Date().getFullYear();
        const startY = maxY;
        const endY   = 1950;
        let selEl = null;

        for (let y = startY; y >= endY; y--) {
            const item = document.createElement('div');
            item.className = 'year-picker-item';
            item.textContent = y;
            if (y === curY) { item.classList.add('selected'); selEl = item; }
            item.addEventListener('click', () => {
                this.currentDate.setFullYear(y);
                const maxDay = new Date(y, this.currentDate.getMonth() + 1, 0).getDate();
                this.currentDate.setDate(Math.min(this.currentDate.getDate(), maxDay));
                this.renderCalendar();
                this._closeYearPicker();
            });
            scroll.appendChild(item);
        }

        ov.classList.add('open');
        if (selEl) setTimeout(() => selEl.scrollIntoView({ block: 'center', behavior: 'instant' }), 10);
    }

    _closeYearPicker() {
        document.getElementById('yearPickerOverlay')?.classList.remove('open');
    }

    _setupTimeInput(input, max) {
        let buffer = '', lastTime = 0, complete = false;

        input.addEventListener('click',  e => { e.target.select(); buffer = ''; complete = false; });
        input.addEventListener('focus',  e => { e.target.select(); buffer = ''; complete = false; });
        input.addEventListener('keydown', e => {
            const now = Date.now();
            if (now - lastTime > 1000) { buffer = ''; complete = false; }

            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault();
                if (complete) { buffer = ''; complete = false; input.value = '00'; lastTime = now; this._updateDateDisplay(); return; }
                buffer = buffer === '' ? e.key : buffer + e.key;
                const v = parseInt(buffer);
                if (buffer.length === 1) {
                    input.value = v.toString().padStart(2, '0');
                } else {
                    if (v > max) { buffer = ''; complete = false; input.value = '00'; }
                    else         { input.value = v.toString().padStart(2, '0'); complete = true; }
                }
                lastTime = now; this._updateDateDisplay();
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault(); buffer = ''; complete = false; input.value = '00'; this._updateDateDisplay();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                let v = parseInt(input.value) || 0;
                v = e.key === 'ArrowUp' ? (v + 1 > max ? 0 : v + 1) : (v - 1 < 0 ? max : v - 1);
                input.value = v.toString().padStart(2, '0');
                buffer = ''; complete = false; this._updateDateDisplay();
            } else if (e.key !== 'Tab') { e.preventDefault(); }
        });
        input.addEventListener('input', e => e.preventDefault());
        input.style.transition = 'transform 0.1s ease';
    }

    _interceptDateTimeInputs() {
        document.querySelectorAll('input[type="datetime-local"]').forEach(input => {
            input.addEventListener('click', e => { e.preventDefault(); this.open(input); });
            input.addEventListener('focus', e => {
                e.preventDefault();
                setTimeout(() => { input.blur(); this.open(input); }, 0);
            });
        });
    }

    open(inputElement) {
        this.targetInput = inputElement;
        const date = inputElement.value ? new Date(inputElement.value) : new Date();
        this.selectedDate = date;
        this.currentDate  = new Date(date);
        this.el.hourInput.value   = date.getHours().toString().padStart(2, '00');
        this.el.minuteInput.value = date.getMinutes().toString().padStart(2, '00');
        this.renderCalendar();
        this._updateDateDisplay();
        this.el.overlay.classList.add('show');

        const pickerEl = this.el.overlay.querySelector('.custom-datetime-picker');
        pickerEl?.classList.remove('theme-green', 'theme-cyan', 'theme-red');
        this.el.overlay.classList.remove('theme-green', 'theme-cyan', 'theme-red');
        const parentModal = inputElement.closest?.('#addModal');
        if (parentModal?.id === 'addModal') {
            pickerEl?.classList.add('theme-green');
            this.el.overlay.classList.add('theme-green');
        }

        document.body.style.overflow = 'hidden';
    }

    close() {
        this._closeYearPicker();
        const pickerEl = this.el.overlay.querySelector('.custom-datetime-picker');
        pickerEl?.classList.remove('theme-green', 'theme-cyan', 'theme-red');
        this.el.overlay.classList.remove('theme-green', 'theme-cyan', 'theme-red');
        this.el.overlay.classList.remove('show');
        document.body.style.overflow = '';
        this.targetInput = null;
    }

    _changeMonth(dir) {
        this.currentDate.setMonth(this.currentDate.getMonth() + dir);
        this.renderCalendar();
    }

    renderCalendar() {
        const MONTHS  = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                         'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        const year    = this.currentDate.getFullYear();
        const month   = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDay  = new Date(year, month + 1, 0).getDate();
        const prevLast = new Date(year, month, 0).getDate();
        const today    = new Date();

        this.el.currentMonth.innerHTML =
            `${MONTHS[month]} <button class="year-pick-btn" type="button">${year}</button>`;

        this.el.calendarDays.innerHTML = '';

        for (let i = firstDay - 1; i >= 0; i--)
            this.el.calendarDays.appendChild(this._createDay(prevLast - i, true));

        for (let day = 1; day <= lastDay; day++) {
            const isToday    = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isSelected = day === this.selectedDate.getDate() && month === this.selectedDate.getMonth() && year === this.selectedDate.getFullYear();
            const btn = this._createDay(day, false, isToday, isSelected);
            btn.addEventListener('click', () => {
                this.selectedDate.setFullYear(year, month, day);
                this.renderCalendar();
                this._updateDateDisplay();
            });
            this.el.calendarDays.appendChild(btn);
        }

        const remaining = 42 - this.el.calendarDays.children.length;
        for (let day = 1; day <= remaining; day++)
            this.el.calendarDays.appendChild(this._createDay(day, true));
    }

    _createDay(day, isOther, isToday = false, isSelected = false) {
        const btn = document.createElement('button');
        btn.className = 'calendar-day'; btn.textContent = day; btn.type = 'button';
        if (isOther)    { btn.classList.add('other-month'); btn.disabled = true; }
        if (isToday)    btn.classList.add('today');
        if (isSelected) btn.classList.add('selected');
        return btn;
    }

    _updateDateDisplay() {
        const WD = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
        const MO = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
        const d  = this.selectedDate;
        const h  = this.el.hourInput.value.padStart(2,'0');
        const m  = this.el.minuteInput.value.padStart(2,'0');
        this.el.dateDisplay.textContent = `${WD[d.getDay()]} • ${d.getDate()} ${MO[d.getMonth()]} • ${h}:${m}`;
    }

    setNow() {
        const now = new Date();
        this.selectedDate = now; this.currentDate = new Date(now);
        this.el.hourInput.value   = now.getHours().toString().padStart(2,'0');
        this.el.minuteInput.value = now.getMinutes().toString().padStart(2,'0');
        this.renderCalendar();
        this._updateDateDisplay();
    }

    confirm() {
        if (!this.targetInput) return;
        const d = this.selectedDate;
        const pad = n => String(n).padStart(2,'0');
        setInputValue(this.targetInput,
            `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` +
            `T${this.el.hourInput.value.padStart(2,'00')}:${this.el.minuteInput.value.padStart(2,'00')}`
        );
        this.targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        this.close();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAG SCROLL — Tabela principal
// ─────────────────────────────────────────────────────────────────────────────

class DragScrollTable {
    constructor(selector) {
        this.el = document.querySelector(selector);
        if (!this.el) return;
        this.state = { isDown: false, startX: 0, scrollLeft: 0, velocity: 0, lastX: 0, lastTime: 0 };
        this._init();
    }

    _isInteractive(e) {
        return ['BUTTON','A','INPUT'].includes(e.target.tagName) ||
               e.target.closest('button') || e.target.closest('a');
    }

    _init() {
        const s = this.state;
        this.el.addEventListener('mousedown', e => {
            if (this._isInteractive(e)) return;
            s.isDown = true;
            this.el.style.userSelect = 'none';
            s.startX     = e.pageX - this.el.offsetLeft;
            s.scrollLeft = this.el.scrollLeft;
            s.lastX      = e.pageX; s.lastTime = Date.now(); s.velocity = 0;
            e.preventDefault();
        });
        this.el.addEventListener('mouseleave', () => { if (s.isDown) this._release(); });
        this.el.addEventListener('mouseup',    () => { if (s.isDown) this._release(); });
        this.el.addEventListener('mousemove',  e => {
            if (!s.isDown) return;
            e.preventDefault();
            this.el.scrollLeft = s.scrollLeft - (e.pageX - this.el.offsetLeft - s.startX) * 1.5;
            const now = Date.now(), dt = now - s.lastTime;
            if (dt > 0) s.velocity = (e.pageX - s.lastX) / dt;
            s.lastX = e.pageX; s.lastTime = now;
        });
        this.el.addEventListener('touchstart', e => {
            s.isDown = true;
            s.startX = e.touches[0].pageX - this.el.offsetLeft;
            s.scrollLeft = this.el.scrollLeft;
        }, { passive: true });
        this.el.addEventListener('touchend',  () => { s.isDown = false; });
        this.el.addEventListener('touchmove', e => {
            if (!s.isDown) return;
            this.el.scrollLeft = s.scrollLeft - (e.touches[0].pageX - this.el.offsetLeft - s.startX) * 1.5;
        }, { passive: true });
    }

    _release() {
        this.state.isDown        = false;
        this.el.style.userSelect = '';
        this._inertia();
    }

    _inertia() {
        let v = this.state.velocity * 50;
        const step = () => {
            if (Math.abs(v) < 0.5) return;
            this.el.scrollLeft -= v; v *= 0.95;
            requestAnimationFrame(step);
        };
        step();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER MODAL
// ─────────────────────────────────────────────────────────────────────────────

class FilterModal {
    constructor() {
        this.isOpen              = false;
        this.impressoesFiltradas = [];
        this._drag               = { isDown: false, startX: 0, scrollLeft: 0, velocity: 0, lastX: 0, lastTime: 0 };
        this._injectHTML();
        this._setupListeners();
        this._setupDragScroll();
        this._setupDatePickers();
    }

    _injectHTML() {
        const el = document.createElement('div');
        el.id        = 'filterModal';
        el.className = 'modal filter-modal-overlay';
        el.innerHTML = `
        <div class="modal-content filter-modal-content">
            <div class="modal-header filter-modal-header">
                <h3><i class="fas fa-filter"></i> Filtrar Impressões</h3>
                <span class="close" id="filterModalClose">&times;</span>
            </div>
            <div class="filter-modal-filters">
                <div class="filter-row">
                    <div class="filter-group">
                        <label><i class="fas fa-user"></i> Cliente</label>
                        <select id="filterCliente"><option value="">Todos os clientes</option></select>
                    </div>
                    <div class="filter-group">
                        <label><i class="fas fa-tag"></i> Status</label>
                        <select id="filterStatus">
                            <option value="">Todos os status</option>
                            <option value="pago">✅ Pago</option>
                            <option value="parcial">🔶 Parcial</option>
                            <option value="pendente">🔴 Pendente</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label><i class="fas fa-print"></i> Tipo de Impressão</label>
                        <select id="filterTipo">
                            <option value="">Todos os tipos</option>
                            <option value="Xerox P">Xerox P&B</option>
                            <option value="Colorido">Xerox Colorido</option>
                            <option value="Digital P">Digital P&B</option>
                            <option value="Digital Colorido">Digital Colorido</option>
                            <option value="Desconhecido">Desconhecido</option>
                        </select>
                    </div>
                </div>
                <div class="filter-row">
                    <div class="filter-group">
                        <label><i class="fas fa-calendar-alt"></i> Data Início</label>
                        <input type="text" id="filterDataInicio" placeholder="dd/mm/aaaa" readonly class="filter-date-input">
                    </div>
                    <div class="filter-group">
                        <label><i class="fas fa-calendar-check"></i> Data Fim</label>
                        <input type="text" id="filterDataFim" placeholder="dd/mm/aaaa" readonly class="filter-date-input">
                    </div>
                    <div class="filter-group filter-actions-group">
                        <button id="filterApplyBtn" class="btn btn-primary filter-apply-btn">
                            <i class="fas fa-filter"></i> Filtrar
                        </button>
                        <button id="filterClearBtn" class="btn btn-secondary filter-clear-btn">
                            <i class="fas fa-times"></i> Limpar
                        </button>
                    </div>
                </div>
            </div>
            <div class="filter-results-bar">
                <span id="filterCount" class="filter-count-all"><i class="fas fa-list"></i> Carregando...</span>
                <div class="filter-active-tags" id="filterActiveTags"></div>
            </div>
            <div class="filter-table-container">
                <div class="filter-table-scroll" id="filterTableScroll">
                    <table id="filterTable">
                        <thead><tr>
                            <th>Cliente</th><th>Tipo + Preço</th><th>Folhas Normais</th>
                            <th>Folhas Offset</th><th>Projeto Canva</th><th>Trabalho</th>
                            <th>Valor (Total/Pago/Resta)</th><th>Status</th><th>Data/Hora</th><th>Ações</th>
                        </tr></thead>
                        <tbody id="filterTableBody">
                            <tr><td colspan="10" class="empty-state">
                                <i class="fas fa-filter"></i>
                                <p>Aplique um filtro para ver os resultados</p>
                            </td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
        document.body.appendChild(el);
    }

    _setupDatePickers() {
        setTimeout(() => {
            ['filterDataInicio', 'filterDataFim'].forEach(id => {
                const input = document.getElementById(id);
                if (!input) return;
                const openPicker = () => {
                    openDateOnlyPicker(input, () => this.applyFilters(), 10002, 'theme-cyan');
                };
                input.addEventListener('click', openPicker);
                input.addEventListener('focus', () => { input.blur(); openPicker(); });
            });
        }, 300);
    }

    _setupDragScroll() {
        setTimeout(() => {
            const wrapper = document.getElementById('filterTableScroll');
            if (!wrapper) return;
            const d = this._drag;
            const isInteractive = e =>
                ['BUTTON','INPUT'].includes(e.target.tagName) ||
                e.target.closest('button') || e.target.closest('a');

            wrapper.addEventListener('mousedown', e => {
                if (isInteractive(e)) return;
                d.isDown = true; d.startX = e.pageX - wrapper.offsetLeft;
                d.scrollLeft = wrapper.scrollLeft; d.lastX = e.pageX;
                d.lastTime = Date.now(); d.velocity = 0;
                e.preventDefault();
            });
            wrapper.addEventListener('mouseleave', () => { if (d.isDown) { d.isDown = false; this._filterInertia(wrapper); } });
            wrapper.addEventListener('mouseup',    () => { if (d.isDown) { d.isDown = false; this._filterInertia(wrapper); } });
            wrapper.addEventListener('mousemove',  e => {
                if (!d.isDown) return; e.preventDefault();
                wrapper.scrollLeft = d.scrollLeft - (e.pageX - wrapper.offsetLeft - d.startX) * 1.5;
                const now = Date.now(), dt = now - d.lastTime;
                if (dt > 0) d.velocity = (e.pageX - d.lastX) / dt;
                d.lastX = e.pageX; d.lastTime = now;
            });
            wrapper.addEventListener('touchstart', e => {
                d.isDown = true; d.startX = e.touches[0].pageX - wrapper.offsetLeft; d.scrollLeft = wrapper.scrollLeft;
            }, { passive: true });
            wrapper.addEventListener('touchend',  () => { d.isDown = false; });
            wrapper.addEventListener('touchmove', e => {
                if (!d.isDown) return;
                wrapper.scrollLeft = d.scrollLeft - (e.touches[0].pageX - wrapper.offsetLeft - d.startX) * 1.5;
            }, { passive: true });
        }, 500);
    }

    _filterInertia(wrapper) {
        let v = this._drag.velocity * 50;
        const step = () => { if (Math.abs(v) < 0.5) return; wrapper.scrollLeft -= v; v *= 0.95; requestAnimationFrame(step); };
        step();
    }

    _setupListeners() {
        document.addEventListener('click', e => { if (e.target.id === 'filterModalClose') this.close(); });
        document.getElementById('openFilterModalBtn')?.addEventListener('click', () => this.open());
        document.getElementById('filterApplyBtn')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('filterClearBtn')?.addEventListener('click', () => this.clearFilters());
        ['filterCliente','filterStatus','filterTipo'].forEach(id =>
            document.getElementById(id)?.addEventListener('change', () => this.applyFilters())
        );
    }

    open() {
        this.isOpen = true;
        this._populateClienteSelect();
        this.applyFilters();
        document.getElementById('filterModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;
        document.getElementById('filterModal').style.display = 'none';
        document.body.style.overflow = '';
        this._resetFilterFields();
    }

    _resetFilterFields() {
        ['filterCliente','filterStatus','filterTipo'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const inicio = document.getElementById('filterDataInicio');
        const fim    = document.getElementById('filterDataFim');
        if (inicio) { inicio.value = ''; delete inicio.dataset.isoDate; }
        if (fim)    { fim.value    = ''; delete fim.dataset.isoDate;    }
        const countEl = document.getElementById('filterCount');
        const tagsEl  = document.getElementById('filterActiveTags');
        if (countEl) { countEl.innerHTML = ''; countEl.className = 'filter-count-all'; }
        if (tagsEl)  tagsEl.innerHTML = '';
    }

    _populateClienteSelect() {
        const select = document.getElementById('filterCliente');
        if (!select || !window.impressionManager) return;
        const current = select.value;
        const nomes = [...new Set(
            (window.impressionManager.impressions || []).map(i => i.cliente).filter(Boolean)
        )].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), 'pt-BR'));
        select.innerHTML = '<option value="">Todos os clientes</option>';
        nomes.forEach(nome => {
            const opt = document.createElement('option');
            opt.value = nome; opt.textContent = nome;
            if (nome === current) opt.selected = true;
            select.appendChild(opt);
        });
    }

    applyFilters() {
        const cliente   = document.getElementById('filterCliente')?.value  || '';
        const status    = document.getElementById('filterStatus')?.value   || '';
        const tipo      = document.getElementById('filterTipo')?.value     || '';
        const inicioISO = document.getElementById('filterDataInicio')?.dataset.isoDate || '';
        const fimISO    = document.getElementById('filterDataFim')?.dataset.isoDate    || '';
        const impressoes = window.impressionManager?.impressions || [];

        this.impressoesFiltradas = impressoes.filter(imp => {
            if (cliente && imp.cliente !== cliente) return false;
            if (status) {
                const vt = parseFloat(imp.valorTotal) || 0;
                const vp = parseFloat(imp.valorPago)  || 0;
                const s  = vp >= vt && vt > 0 ? 'pago' : vp > 0 ? 'parcial' : 'pendente';
                if (s !== status) return false;
            }
            if (tipo && !String(imp.tipoPreco || '').includes(tipo)) return false;
            if (inicioISO && (imp.dataHora || '').slice(0,10) < inicioISO) return false;
            if (fimISO    && (imp.dataHora || '').slice(0,10) > fimISO)    return false;
            return true;
        }).sort((a, b) => {
            const pA = a.valorPago >= a.valorTotal && a.valorTotal > 0 ? 1 : a.valorPago > 0 ? 2 : 3;
            const pB = b.valorPago >= b.valorTotal && b.valorTotal > 0 ? 1 : b.valorPago > 0 ? 2 : 3;
            if (pA !== pB) return pA - pB;
            return (a.cliente||'').toLowerCase().localeCompare((b.cliente||'').toLowerCase(),'pt-BR');
        });

        this._updateCounter(cliente, status, tipo, inicioISO, fimISO);
        this._renderFilterTable();
    }

    _updateCounter(cliente, status, tipo, inicio, fim) {
        const total    = window.impressionManager?.impressions?.length || 0;
        const filtrado = this.impressoesFiltradas.length;
        const countEl  = document.getElementById('filterCount');
        const tagsEl   = document.getElementById('filterActiveTags');
        if (!countEl) return;

        const temFiltro = cliente || status || tipo || inicio || fim;
        if (!temFiltro) {
            countEl.innerHTML = `<i class="fas fa-list"></i> Mostrando <strong>${total}</strong> impressão${total !== 1 ? 'ões' : ''}`;
            countEl.className = 'filter-count-all';
        } else if (!filtrado) {
            countEl.innerHTML = `<i class="fas fa-search"></i> Nenhum resultado encontrado`;
            countEl.className = 'filter-count-empty';
        } else {
            countEl.innerHTML = `<i class="fas fa-filter"></i> <strong>${filtrado}</strong> de <strong>${total}</strong> impressão${total !== 1 ? 'ões' : ''}`;
            countEl.className = 'filter-count-filtered';
        }

        if (tagsEl) {
            const fmtISO = iso => { if (!iso) return null; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; };
            tagsEl.innerHTML = [
                cliente && `👤 ${cliente}`, status  && `🏷️ ${status.charAt(0).toUpperCase()+status.slice(1)}`,
                tipo    && `🖨️ ${tipo}`,    inicio  && `📅 De: ${fmtISO(inicio)}`,
                fim     && `📅 Até: ${fmtISO(fim)}`,
            ].filter(Boolean).map(label => `<span class="filter-tag">${label}</span>`).join('');
        }
    }

    _renderFilterTable() {
        const tbody = document.getElementById('filterTableBody');
        if (!tbody) return;

        if (!this.impressoesFiltradas.length) {
            tbody.innerHTML = `<tr><td colspan="10" class="empty-state">
                <i class="fas fa-search"></i><p>Nenhuma impressão encontrada com esses filtros</p>
            </td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        this.impressoesFiltradas.forEach(imp => {
            const row        = document.createElement('tr');
            const valorTotal = parseFloat(imp.valorTotal) || 0;
            const valorPago  = parseFloat(imp.valorPago)  || 0;
            const isPaid     = valorPago >= valorTotal && valorTotal > 0;
            const isPartial  = valorPago > 0 && valorPago < valorTotal;
            const saldo      = valorTotal - valorPago;

            if (isPaid)         row.classList.add('paid-impression');
            else if (isPartial) row.classList.add('partial-impression');

            const stClass   = isPaid ? 'pago' : isPartial ? 'parcial' : 'ativo';
            const stText    = isPaid ? 'Pago' : isPartial ? 'Parcial' : 'Pendente';
            const pagoClass = isPaid ? 'status-pago' : isPartial ? 'status-parcial' : 'status-pendente';
            const dataFmt   = new Date(imp.dataHora).toLocaleString('pt-BR',
                { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });

            row.innerHTML = `
                <td><div class="client-name">${imp.cliente}</div></td>
                <td><div class="tipo-nome">${imp.tipoPreco}</div></td>
                <td><div class="folhas-display">${imp.folhasNormais > 0 ? imp.folhasNormais : 0}</div></td>
                <td><div class="folhas-display">${imp.folhasOffset  > 0 ? imp.folhasOffset  : 0}</div></td>
                <td><div class="folhas-display">${imp.projetoCanva > 0 ? `R$ ${imp.projetoCanva.toFixed(2)}` : 'R$ 0.00'}</div></td>
                <td><div class="folhas-display">${imp.trabalho     > 0 ? `R$ ${imp.trabalho.toFixed(2)}`     : 'R$ 0.00'}</div></td>
                <td>
                    <div class="valor-info">
                        <div class="valor-total-display">R$ ${valorTotal.toFixed(2)}</div>
                        <div class="valor-pago-display">Pago: <span class="${pagoClass}">R$ ${valorPago.toFixed(2)}</span></div>
                        <div class="valor-pago-display">Resta: <span class="${saldo > 0 ? 'status-pendente' : 'status-pago'}">R$ ${saldo.toFixed(2)}</span></div>
                    </div>
                </td>
                <td><span class="status-badge ${stClass}">${stText}</span></td>
                <td><div class="data-hora">${dataFmt}</div></td>
                <td>
                    <div class="acoes">
                        <button class="btn-icon btn-edit"   data-id="${imp.id}" title="Editar"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon btn-danger" data-id="${imp.id}" title="Excluir"><i class="fas fa-trash"></i></button>
                    </div>
                </td>`;

            row.querySelector('.btn-edit')  .addEventListener('click', () => { this.close(); window.impressionManager?.editImpression(imp.id); });
            row.querySelector('.btn-danger').addEventListener('click', () => { this.close(); window.impressionManager?.confirmDelete(imp.id); });
            tbody.appendChild(row);
        });
    }

    clearFilters() {
        this._resetFilterFields();
        this.applyFilters();
    }

    refresh() {
        if (this.isOpen) { this._populateClienteSelect(); this.applyFilters(); }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL HOLD TO CLOSE
// ─────────────────────────────────────────────────────────────────────────────

class ModalHoldToClose {
    constructor() {
        this.holdDuration = 1500;
        this._setup();
        this._setupUniversalX();
    }

    _setup() {
        // ✅ CORRIGIDO: inclui .pix-modal-overlay para o pixModal
        const allModals = document.querySelectorAll('.modal, .filter-modal-overlay, .pdf-action-modal-overlay, .pix-modal-overlay');

        allModals.forEach(modal => {
            let timer = null, progress = null, isHolding = false, startX = 0, startY = 0;

            modal.addEventListener('mousedown', e => {
                if (e.target !== modal) return;
                isHolding = true; startX = e.clientX; startY = e.clientY;
                progress = this._createProgress(e.clientX, e.clientY);
                document.body.appendChild(progress);
                this._animateProgress(progress);
                timer = setTimeout(() => this._closeModal(modal, progress), this.holdDuration);
            });

            const cancel = () => {
                if (!isHolding) return;
                isHolding = false;
                clearTimeout(timer); timer = null;
                progress?.remove(); progress = null;
            };

            modal.addEventListener('mouseup',   cancel);
            modal.addEventListener('mouseleave', cancel);
            modal.addEventListener('mousemove',  e => {
                if (isHolding && (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10))
                    cancel();
            });
        });
    }

    _setupUniversalX() {
        document.addEventListener('click', e => {
            const closeBtn = e.target.closest('.close, .close-modal');
            if (!closeBtn) return;
            // Inclui .pix-modal-overlay para o X do modal Pix
            const modal = closeBtn.closest('.modal, .filter-modal-overlay, .pdf-action-modal-overlay, .pix-modal-overlay');
            if (modal) this._closeModal(modal, null);
        });
    }

    _createProgress(x, y) {
        const el = document.createElement('div');
        el.className    = 'modal-hold-progress';
        el.style.cssText = `left:${x}px;top:${y}px`;
        el.innerHTML = `
            <div class="hold-progress-circle">
                <svg class="progress-ring" width="60" height="60">
                    <circle class="progress-ring-circle" stroke="white" stroke-width="3" fill="transparent" r="26" cx="30" cy="30"/>
                </svg>
                <div class="hold-progress-icon"><i class="fas fa-times"></i></div>
            </div>
            <div class="hold-progress-text">Segure para fechar</div>`;
        return el;
    }

    _animateProgress(el) {
        const circle = el.querySelector('.progress-ring-circle');
        if (!circle) return;
        const c = circle.r.baseVal.value * 2 * Math.PI;
        circle.style.strokeDasharray  = `${c} ${c}`;
        circle.style.strokeDashoffset = c;
        circle.getBoundingClientRect();
        circle.style.transition       = `stroke-dashoffset ${this.holdDuration}ms linear`;
        circle.style.strokeDashoffset = '0';
    }

    // Registra um modal criado dinamicamente (após o _setup inicial)
    _registerModal(modal) {
        let timer = null, progress = null, isHolding = false, startX = 0, startY = 0;

        modal.addEventListener('mousedown', e => {
            if (e.target !== modal) return;
            isHolding = true; startX = e.clientX; startY = e.clientY;
            progress = this._createProgress(e.clientX, e.clientY);
            document.body.appendChild(progress);
            this._animateProgress(progress);
            timer = setTimeout(() => this._closeModal(modal, progress), this.holdDuration);
        });

        const cancel = () => {
            if (!isHolding) return;
            isHolding = false;
            clearTimeout(timer); timer = null;
            progress?.remove(); progress = null;
        };

        modal.addEventListener('mouseup',    cancel);
        modal.addEventListener('mouseleave', cancel);
        modal.addEventListener('mousemove',  e => {
            if (isHolding && (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10))
                cancel();
        });
    }

    _closeModal(modal, progress) {
        progress?.remove();

        // pdfActionModal usa classList em vez de style.display
        if (modal.id === 'pdfActionModal') {
            modal.classList.remove('pdf-action-modal-show');
            window.pdfExportModal?._reopen();
        } else {
            modal.style.display = 'none';
        }

        if (document.activeElement instanceof HTMLElement &&
            modal.contains(document.activeElement)) {
            document.activeElement.blur();
        }

        // Verifica se ainda há modais abertos (inclui pdfActionModal e pixModal)
        const stillOpen = document.querySelectorAll(
            '.modal[style*="display: block"], .filter-modal-overlay[style*="display: block"], .pix-modal-overlay[style*="display: block"]'
        ).length + (document.getElementById('pdfActionModal')?.classList.contains('pdf-action-modal-show') ? 1 : 0);

        if (!stillOpen) document.body.style.overflow = '';

        const cleanups = {
            filterModal:         () => window.filterModal?._resetFilterFields(),
            paymentModal:        () => window.paymentModalManager?.resetModal(),
            editModal:           () => { if (window.modalManager) window.modalManager.editingId = null; },
            confirmModal:        () => { if (window.modalManager) window.modalManager.confirmCallback = null; },
            paymentHistoryModal: () => window.paymentModalManager?.closeHistoryModal(),
            pdfExportModal:      () => window.pdfExportModal?.close(),
            pixModal:            () => {},  // ✅ sem cleanup especial necessário
        };
        cleanups[modal.id]?.();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SISTEMA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

class ImpressionsSystem {
    async init() {
        if (!supabaseManager.isConfigured) {
            console.error('[SYSTEM] ❌ Firebase não configurado');
            modernAlert.error('Firebase não configurado', null, 5000);
            return;
        }
        modernAlert.info('Carregando dados...', null, 2000);
        try {
            await priceManager.loadFromSupabase();
            priceManager.onPriceChange(() => calculationManager?.calculateTotal());
            await impressionManager.loadFromSupabase();
            await carregarResumoClientes({ containerId: 'resumoClientes' });
            console.log('[SYSTEM] ✅ Sistema iniciado');
        } catch (err) {
            console.error('[SYSTEM] ❌', err);
            modernAlert.error('Erro ao carregar dados do banco', null, 5000);
        }

        this._setupRecoverButton();
    }

    _setupRecoverButton() {
        const btn = document.getElementById('recoverSheetsBtn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            modalManager.showConfirm(
                'Recuperar dados do Sheets',
                'Isso vai buscar registros do Google Sheets que não estão no Firebase e importá-los. Nenhum dado existente será apagado ou sobrescrito. Continuar?',
                () => this._runRecovery()
            );
        });
    }

    async _runRecovery() {
        try {
            modernLoading.show();
            const resultadoAdicionar = await supabaseManager.importFromAdicionar();
            const resultado          = await supabaseManager.recoverFromSheets();
            modernLoading.hide();

            if (resultadoAdicionar.total > 0 || resultado.total > 0) {
                await impressionManager.loadFromSupabase();
                await carregarResumoClientes({ containerId: 'resumoClientes' });
            }

            this._showRecoveryResult({
                ...resultado,
                total: resultado.total + resultadoAdicionar.total,
                adicionarImportados: resultadoAdicionar.total,
            });
        } catch (err) {
            modernLoading.hide();
            console.error('[RECOVERY] ❌', err);
            modernAlert.error(err.message || 'Erro ao recuperar dados do Sheets', null, 6000);
        }
    }

    _showRecoveryResult(r) {
        const modal   = document.getElementById('recoveryResultModal');
        const content = document.getElementById('recoveryResultContent');
        if (!modal || !content) return;

        if (r.total === 0) {
            content.innerHTML = `
                <div class="recovery-empty">
                    <i class="fas fa-check-circle"></i>
                    <p>Firebase já está atualizado!<br>Nenhum dado novo encontrado no Sheets.</p>
                </div>`;
        } else {
            const stat = (icon, label, value) => `
                <div class="recovery-stat">
                    <span class="recovery-stat-label"><i class="fas fa-${icon}"></i> ${label}</span>
                    <span class="recovery-stat-value${value === 0 ? ' zero' : ''}">${value}</span>
                </div>`;

            content.innerHTML = `
                ${r.adicionarImportados > 0 ? stat('plus-circle', 'Da aba Adicionar', r.adicionarImportados) : ''}
                ${stat('users',       'Clientes importados',          r.clientes)}
                ${stat('print',       'Impressões importadas',        r.impressoes)}
                ${stat('dollar-sign', 'Pagamentos importados',        r.pagamentos)}
                ${stat('link',        'Vínculos pagamento-impressão', r.pagamentosImpressoes)}
                <div class="recovery-total">
                    <div class="recovery-total-label">Total de registros recuperados</div>
                    <div class="recovery-total-value">${r.total}</div>
                </div>`;
        }

        modal.style.display = 'block';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTÂNCIAS GLOBAIS
// ─────────────────────────────────────────────────────────────────────────────

const modernLoading          = new ModernLoadingSystem();
const modernAlert            = new ModernAlertSystem();
const modalManager           = new ModalManager();
const priceManager           = new PriceManager();
const calculationManager     = new CalculationManager();
const editCalculationManager = new EditCalculationManager();
const formManager            = new FormManager();
const impressionManager      = new ImpressionManager();
const filterModal            = new FilterModal();

window.modernLoading          = modernLoading;
window.modernAlert            = modernAlert;
window.modalManager           = modalManager;
window.impressionManager      = impressionManager;
window.priceManager           = priceManager;
window.calculationManager     = calculationManager;
window.editCalculationManager = editCalculationManager;
window.filterModal            = filterModal;
window.openDateOnlyPicker     = openDateOnlyPicker;

// ─────────────────────────────────────────────────────────────────────────────
// LIMPEZA DE CACHE CORROMPIDO
// ─────────────────────────────────────────────────────────────────────────────

(function limparCacheCorrepto() {
    try {
        const KEY   = 'impressaoForm_autoSave';
        const saved = localStorage.getItem(KEY);
        if (!saved) return;
        const data = JSON.parse(saved);
        const ruim = Object.values(data).some(
            v => v === 'null' || v === 'undefined' || v === null || v === 'NaN' || v === undefined
        );
        if (ruim) {
            localStorage.removeItem(KEY);
            console.log('[SYSTEM] 🧹 Cache corrompido removido antes do FormManager');
        }
    } catch (_) {
        localStorage.removeItem('impressaoForm_autoSave');
    }
})();

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
// ── Modal PIX ──────────────────────────────────────────────────────────────

const pixModal          = document.getElementById('pixModal');
const openPixModalBtn   = document.getElementById('openPixModalBtn');
const pixModalClose     = document.getElementById('pixModalClose');
const pixModalCloseBtn  = document.getElementById('pixModalCloseBtn');
const pixUploadInput    = document.getElementById('pixQrUploadInput');
const pixUploadStatus   = document.getElementById('pixUploadStatus');
const pixQrImage        = document.getElementById('pixQrImage');
const pixQrPlaceholder  = document.getElementById('pixQrPlaceholder');
const pixRemoveBtn      = document.getElementById('pixRemoveBtn');
const pixStatusBadge    = document.getElementById('pixStatusBadge');
const pixUploadBtnText  = document.getElementById('pixUploadBtnText');
const pixDownloadBtn    = document.getElementById('pixDownloadBtn');

const _pixDoc = () => window._firestoreDoc(supabaseManager.db, 'config', 'pix');

// ── Atualiza UI conforme presença de imagem ─────────────────────────────────
const _pixUpdateUI = (hasImage) => {
    pixRemoveBtn?.classList.toggle('visible', !!hasImage);
    pixDownloadBtn?.classList.toggle('visible', !!hasImage);
    pixStatusBadge?.classList.toggle('hidden', !hasImage);
    if (pixUploadBtnText) {
        pixUploadBtnText.textContent = hasImage ? 'Trocar QR Code' : 'Adicionar QR Code';
    }
};

// Lógica de download
pixDownloadBtn?.addEventListener('click', () => {
    const src = pixQrImage?.src;
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = 'qrcode-pix.png';
    link.click();
});

// ── Carrega QR do Firestore ─────────────────────────────────────────────────
const loadPixQr = async () => {
    try {
        const snap = await window._firestoreGetDoc(_pixDoc());
        if (!snap.exists()) { _pixUpdateUI(false); return; }
        const src = snap.data().qrBase64 || null;
        if (src) {
            pixQrImage.src = src;
            pixQrImage.classList.add('loaded');
            pixQrImage.style.display       = 'block';
            pixQrPlaceholder.style.display = 'none';
            _pixUpdateUI(true);
        } else {
            pixQrImage.style.display       = 'none';
            pixQrImage.classList.remove('loaded');
            pixQrPlaceholder.style.display = 'flex';
            _pixUpdateUI(false);
        }
    } catch (err) {
        console.warn('[PIX] Erro ao carregar QR:', err.message);
        _pixUpdateUI(false);
    }
};

// ── Abre/fecha modal ────────────────────────────────────────────────────────
// ✅ CORRIGIDO: clique simples no fundo NÃO fecha — apenas o hold-to-close fecha
const openPixModal  = () => {
    pixModal.style.display       = 'block';
    document.body.style.overflow = 'hidden';
    loadPixQr();
};
const closePixModal = () => {
    pixModal.style.display       = 'none';
    document.body.style.overflow = '';
};

openPixModalBtn?.addEventListener('click',  openPixModal);
pixModalClose?.addEventListener('click',    closePixModal);
pixModalCloseBtn?.addEventListener('click', closePixModal);

// ── ESC fecha ────────────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (pixModal?.style.display === 'block') {
        closePixModal();
        e.stopImmediatePropagation();
    }
}, true);

// ── Upload ──────────────────────────────────────────────────────────────────
pixUploadInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        pixUploadStatus.textContent = '❌ Envie somente imagens';
        pixUploadStatus.className   = 'pix-upload-status error';
        pixUploadInput.value = ''; return;
    }
    if (file.size > 500 * 1024) {
        pixUploadStatus.textContent = '❌ Muito grande (máx 500 KB)';
        pixUploadStatus.className   = 'pix-upload-status error';
        pixUploadInput.value = ''; return;
    }

    pixUploadStatus.textContent = '⏳ Salvando...';
    pixUploadStatus.className   = 'pix-upload-status loading';

    try {
        const dataUrl = await new Promise((res, rej) => {
            const reader   = new FileReader();
            reader.onload  = () => res(reader.result);
            reader.onerror = () => rej(new Error('Falha ao ler arquivo'));
            reader.readAsDataURL(file);
        });

        await window._firestoreSetDoc(_pixDoc(), { qrBase64: dataUrl }, { merge: true });

        pixQrImage.src = dataUrl;
        pixQrImage.classList.add('loaded');
        pixQrImage.style.display       = 'block';
        pixQrPlaceholder.style.display = 'none';
        _pixUpdateUI(true);

        pixUploadStatus.textContent = '✅ QR Code atualizado!';
        pixUploadStatus.className   = 'pix-upload-status success';
        setTimeout(() => { pixUploadStatus.textContent = ''; pixUploadStatus.className = 'pix-upload-status'; }, 4000);

    } catch (err) {
        console.error('[PIX] Erro:', err);
        pixUploadStatus.textContent = '❌ ' + err.message;
        pixUploadStatus.className   = 'pix-upload-status error';
    }

    pixUploadInput.value = '';
});

// ── Remover — usa modal de confirmação do sistema ───────────────────────────
pixRemoveBtn?.addEventListener('click', () => {
    modalManager.showConfirm(
        'Remover QR Code Pix',
        'Deseja remover o QR Code? Ele precisará ser enviado novamente para funcionar.',
        async () => {
            pixUploadStatus.textContent = '⏳ Removendo...';
            pixUploadStatus.className   = 'pix-upload-status loading';
            try {
                await window._firestoreSetDoc(_pixDoc(), { qrBase64: null }, { merge: true });

                pixQrImage.src = '';
                pixQrImage.classList.remove('loaded');
                pixQrImage.style.display       = 'none';
                pixQrPlaceholder.style.display = 'flex';
                _pixUpdateUI(false);

                pixUploadStatus.textContent = '✅ Removido!';
                pixUploadStatus.className   = 'pix-upload-status success';
                setTimeout(() => { pixUploadStatus.textContent = ''; pixUploadStatus.className = 'pix-upload-status'; }, 3000);

            } catch (err) {
                console.error('[PIX] Erro ao remover:', err);
                pixUploadStatus.textContent = '❌ ' + err.message;
                pixUploadStatus.className   = 'pix-upload-status error';
            }
        }
    );
    setTimeout(() => {
        const okBtn     = document.getElementById('confirmOkBtn');
        const header    = document.querySelector('#confirmModal .modal-header');
        const icon      = document.getElementById('confirmIcon');
        if (okBtn)  okBtn.innerHTML = '<i class="fas fa-trash"></i> Remover';
        if (icon)   icon.className  = 'fas fa-qrcode';
        if (header) {
            header.style.background = 'linear-gradient(135deg, #091510, #0d2018)';
            header.style.borderBottom = '1px solid rgba(0,180,130,0.2)';
            const restore = () => {
                header.style.background   = '';
                header.style.borderBottom = '';
                document.getElementById('confirmModal')
                    ?.removeEventListener('click', restore);
            };
            document.getElementById('confirmCancelBtn')
                ?.addEventListener('click', restore, { once: true });
            okBtn?.addEventListener('click', restore, { once: true });
        }
    }, 10);
});

    console.log('[SYSTEM] 🚀 Iniciando aplicação...');

    // ── ESC fecha qualquer modal ou calendário aberto ──────────────────
    document.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;

        // 1. Year picker
        const yearPicker = document.getElementById('yearPickerOverlay');
        if (yearPicker?.classList.contains('open')) {
            window.customDateTimePicker?._closeYearPicker();
            return;
        }

        // 2. Calendário
        const calOverlay = document.getElementById('customDateTimeOverlay');
        if (calOverlay?.classList.contains('show')) {
            window.customDateTimePicker?.close();
            return;
        }

        // 3. pdfActionModal usa classList
        const pdfActionOv = document.getElementById('pdfActionModal');
        if (pdfActionOv?.classList.contains('pdf-action-modal-show')) {
            window.pdfExportModal?._closeActionModal();
            window.pdfExportModal?._reopen();
            return;
        }

        // 4. Modais normais
        const MODAL_ORDER = [
            'confirmModal',
            'paymentSuccessModal',
            'paymentHistoryModal',
            'paymentModal',
            'editModal',
            'addModal',
            'recoveryResultModal',
            'pdfExportModal',
            'filterModal',
        ];

        for (const id of MODAL_ORDER) {
            const el = document.getElementById(id);
            if (el && el.style.display === 'block') {
                el.style.display = 'none';
                const cleanups = {
                    filterModal:         () => window.filterModal?._resetFilterFields(),
                    paymentModal:        () => window.paymentModalManager?.resetModal(),
                    editModal:           () => { if (window.modalManager) window.modalManager.editingId = null; },
                    confirmModal:        () => { if (window.modalManager) window.modalManager.confirmCallback = null; },
                    paymentHistoryModal: () => window.paymentModalManager?.closeHistoryModal(),
                    pdfExportModal:      () => window.pdfExportModal?.close(),
                };
                cleanups[id]?.();
                const stillOpen = document.querySelectorAll(
                    '.modal[style*="display: block"], .filter-modal-overlay[style*="display: block"]'
                ).length;
                if (!stillOpen) document.body.style.overflow = '';
                return;
            }
        }

        // 5. paymentRemovedOverlay
        const removedOv = document.getElementById('paymentRemovedOverlay');
        if (removedOv?.classList.contains('show')) {
            window.closePaymentRemoved?.();
        }
    });

    document.querySelectorAll('input[type="number"]').forEach(input =>
        input.addEventListener('wheel', e => e.preventDefault(), { passive: false })
    );

    setTimeout(() => {
        new DragScrollTable('.table-scroll-wrapper');
        // ✅ ModalHoldToClose já cobre o pixModal via .pix-modal-overlay no seletor
        window._modalHoldToClose = new ModalHoldToClose();
        // ✅ REMOVIDO: initDateTimeHoldToClose substituído pelo hold-to-close do calendário via overlay nativo
        window.customDateTimePicker = new CustomDateTimePicker();
        console.log('[SYSTEM] ✅ Sistemas interativos iniciados');
    }, 500);

    new ImpressionsSystem().init();
});