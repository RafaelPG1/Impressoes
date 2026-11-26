// ============================================================================
// state.js — estado em memória + eventos simples
// ============================================================================

import { DEFAULT_PRICES } from './config.js';

export const state = {
    impressions: [],                 // lista carregada do Firestore
    prices: { 1: 0.5, 2: 1, 3: 1.5, 4: 2 },
    offsetPrice: 0.5,
};

const listeners = {};

export function on(event, fn) {
    (listeners[event] ||= []).push(fn);
}

export function emit(event) {
    (listeners[event] || []).forEach((fn) => fn());
}

export function setPrices(map) {
    for (const p of DEFAULT_PRICES) {
        const v = parseFloat(map?.[p.tipo]);
        const value = Number.isFinite(v) && v > 0 ? v : p.valor;
        if (p.tipo === 5) state.offsetPrice = value; else state.prices[p.tipo] = value;
    }
}
