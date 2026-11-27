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
    firestore.rules     regras finais (Etapa 3)
    firestore.rules.transicao   regras temporárias para migrar dados antigos
    apps-script/Codigo.gs       script da planilha (cole no editor do Apps Script)

## Testes

Automáticos (Node 22, sem dependências):

    node --test tests/unit.test.mjs tests/crypto.test.mjs tests/appsscript.test.mjs

`appsscript.test.mjs` é uma SIMULAÇÃO: roda `apps-script/Codigo.gs` com uma planilha falsa em memória. Prova a lógica, não o comportamento real do Google. Nada aqui testa o Firestore real nem as regras: veja ETAPA3-RELATORIO.md, "Testes manuais".

## Login e segurança (Firestore apenas)

Não usa Firebase Authentication. Isto NÃO é autenticação robusta. Como funciona:

1. Usuário + senha passam por PBKDF2-SHA256 (600 mil iterações, sal aleatório) no navegador.
2. O resultado tem 64 bytes: 32 viram a "chave" de dados, 32 viram o "token" do backup.
3. Os dados ficam em `dados/{chave}/...`. As regras só liberam esse caminho e proíbem listar `/dados`. A chave tem 256 bits: não dá para adivinhar.
4. O banco guarda só o sal (`acessos/{uid}`). Não guarda senha nem hash da senha. Login = derivar a chave e checar se `dados/{chave}/meta/conta` existe.
5. Cadastro único: as regras só deixam criar o usuário enquanto `config/instalado` não existir.

Limites e riscos:

- O Firestore não sabe quem chama. Quem obtiver a chave (senha, ou a sessão salva no navegador) tem acesso total. Script malicioso na página (XSS) pode ler a sessão em `sessionStorage`/`localStorage`.
- O bloqueio após 5 tentativas é só no navegador. Quem fala direto com a API do Firestore ignora. A defesa real contra força bruta é a senha longa (mínimo 10; prefira uma frase de 4 ou mais palavras) e o custo do PBKDF2. Quem já conhece o sal (público) pode testar senhas fora do site; cada tentativa custa 600 mil iterações.
- Não há troca de senha: a chave muda com a senha, então trocar exige migrar todos os dados. Perdeu a senha, perdeu o acesso (os dados continuam no banco e na planilha).
- Um atacante pode, antes de você, criar o usuário no primeiro acesso ou travar o cadastro. Cadastre logo depois de publicar as regras.
- A chave web do Firebase continua pública (normal). As regras são a única barreira; não foram testadas num Firestore real.
- Não há Content-Security-Policy: não foi possível testar com o Firebase real, e uma CSP errada quebra o app.

Para segurança de verdade, use Firebase Authentication (e-mail e senha) com `request.auth.uid` nas regras.

### Publicar as regras (ordem importa)

1. Com dados antigos na raiz: publique `firestore.rules.transicao`, abra o app, crie o usuário e aceite "Migrar dados antigos" (copia, não apaga, pode repetir).
2. Confira os dados. Publique `firestore.rules` (finais). Os dados antigos da raiz ficam inacessíveis; apague-os pelo console quando tiver certeza.
3. Sem dados antigos: publique direto `firestore.rules`.

## Firebase

Config em `js/config.js` (`FIREBASE_CONFIG`). A chave web do Firebase não é segredo. Veja "Login e segurança".

Remover um pagamento refaz a distribuição a partir dos pagamentos registrados. Impressões marcadas como pagas sem um pagamento correspondente (dados antigos ou importados) voltam a ficar em aberto.

Coleções (dentro de `dados/{chave}/`): `impressoes`, `clientes`, `pagamentos`, `pagamentosImpressoes`, `precos` (docs 1 a 5; 5 é offset), `config/pix`, `meta/conta`.

## Google Sheets (Apps Script)

O código está em `apps-script/Codigo.gs`. Tudo exige um token; o script guarda só o hash dele. O token sai da sua senha (botão "Token do backup" no app) e não vai para o GitHub.

1. No Apps Script, cole o conteúdo de `Codigo.gs` (substitui o atual).
2. No app, entre e clique em "Token do backup". Cole em `TOKEN_INICIAL`, rode `configurarToken()` e apague o token do código.
3. Implantar > Gerenciar implantações > editar > Nova versão. O acesso do Web App precisa ser "Qualquer pessoa" (o navegador não envia credencial do Google); a barreira é o token.
4. Enquanto o token não estiver configurado, o script recusa tudo (o indicador mostra "Token não configurado").

Limites: o Apps Script não vê a origem da requisição, então não dá para restringir ao seu site. O token vai no corpo do POST e na URL do GET (aparece em logs do Google e do navegador). Trocou a senha ou suspeita de vazamento: rode `configurarToken()` com o novo token. As gravações são `no-cors`: o navegador não lê a resposta, então falha de backup não aparece na tela; só o indicador (ping) mostra o estado.

### Recuperar da planilha

- Cada registro da aba "Adicionar" ganha um id permanente (coluna J, estreita). No banco vira o documento `adc_<id>`: importar duas vezes não cria duas impressões.
- A aba "Adicionar" não apaga mais ao ler. A linha só sai depois de gravada no banco. Se a limpeza falhar, a próxima recuperação só a limpa.
- As demais abas importam só ids novos e válidos; ids repetidos na planilha entram uma vez.
- Se você apagar no app uma impressão que veio da aba e a limpeza da planilha tinha falhado, a linha pode voltar na próxima recuperação.

## Regras de cálculo

Total = folhas × preço do tipo + folhas offset × preço offset + Canva + trabalho. Folhas offset são subconjunto das folhas. Pagamento é aplicado às impressões em aberto do cliente, da menor dívida para a maior.
