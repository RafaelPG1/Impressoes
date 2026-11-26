// ============================================================================
// config.js — configuração central (Firebase, planilha de backup, constantes)
// ============================================================================

// Chave pública do app web Firebase. Ela identifica o projeto, não é segredo:
// a proteção dos dados vem das regras do Firestore (veja firestore.rules e README).
export const FIREBASE_CONFIG = {
    apiKey:            'AIzaSyCpfX_7zA8dnuhL-ZGpWW0wuoq1hHEMMOI',
    authDomain:        'impressoes-e6683.firebaseapp.com',
    projectId:         'impressoes-e6683',
    storageBucket:     'impressoes-e6683.firebasestorage.app',
    messagingSenderId: '843068470381',
    appId:             '1:843068470381:web:8920056823355889453b64',
};

export const FIREBASE_SDK_VERSION = '10.12.0';

// Web App do Google Apps Script que recebe o backup para a planilha.
export const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbx6-2PqtT3W-okQWp-Ff2KNddWxH3oa5W3sjnZh8QSB4liZDn8VmXBBB6h7N0vI2F3r/exec';

// Preços iniciais. O tipo 5 é a folha offset (valor somado por folha offset).
export const DEFAULT_PRICES = [
    { tipo: 1, valor: 0.50, descricao: 'Xerox P&B' },
    { tipo: 2, valor: 1.00, descricao: 'Xerox Colorido' },
    { tipo: 3, valor: 1.50, descricao: 'Digital P&B' },
    { tipo: 4, valor: 2.00, descricao: 'Digital Colorido' },
    { tipo: 5, valor: 0.50, descricao: 'Folha Offset' },
];

export const TIPO_NOMES = {
    0: 'Desconhecido',
    1: 'Xerox P&B',
    2: 'Xerox Colorido',
    3: 'Digital P&B',
    4: 'Digital Colorido',
};
