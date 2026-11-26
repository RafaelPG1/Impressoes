# Impressões

Controle de impressões, clientes e pagamentos. Site estático (HTML, CSS e JavaScript puro, sem build), com dados no Firestore e cópia opcional em Google Sheets.

## Como rodar

Não abra `index.html` com duplo clique: módulos ES exigem servidor.

    python -m http.server 8000

Abra http://localhost:8000. No GitHub Pages: Settings > Pages > Deploy from branch, pasta raiz. O arquivo `.nojekyll` já está incluso.

## Estrutura

    index.html          casca da aplicação e todos os diálogos
    css/                tokens, base, layout, componentes, telas, diálogos
    js/
      main.js           inicialização
      config.js         Firebase, URL do Sheets, preços padrão
      state.js          estado em memória e eventos
      actions.js        refresh de dados
      router.js         rotas por hash (#/impressoes, #/clientes, #/ajustes)
      services/         firestore.js, sheets.js, pdf-reports.js
      features/         uma pasta de tela/ação: form, records, clients, payments, prices, pix, pdf-dialog, recovery, edit
      ui/               diálogos, avisos, ícones
      utils/format.js   cálculo de total, resumo por cliente, formatação
    assets/             favicon, ícone PDF, fontes (woff2)
    vendor/             jsPDF e jspdf-autotable (cópia local)
    firestore.rules     regras de referência

## Firebase

Config em `js/config.js` (`FIREBASE_CONFIG`). A chave web do Firebase não é segredo, mas sem login qualquer pessoa com ela acessa o banco. Para uso pessoal, o mínimo é ativar Firebase Auth e exigir `request.auth != null` nas regras. O app ainda não tem tela de login.

Coleções: `impressoes`, `clientes`, `pagamentos`, `pagamentosImpressoes`, `precos` (docs 1 a 5; 5 é offset), `config/pix`.

## Google Sheets

`SHEETS_URL` em `js/config.js` aponta para um Apps Script. As chamadas são `no-cors`: o navegador não lê a resposta, então falha de sincronização não aparece na tela.

## Regras de cálculo

Total = folhas × preço do tipo + folhas offset × preço offset + Canva + trabalho. Folhas offset são subconjunto das folhas. Pagamento é aplicado às impressões em aberto do cliente, da menor dívida para a maior.
