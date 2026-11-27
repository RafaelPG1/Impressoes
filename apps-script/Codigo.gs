// =============================================================================
// GOOGLE APPS SCRIPT — Sistema de Impressões (Etapa 3: endurecido)
//
// Segurança (leia o README do projeto):
//  • Toda ação exige um TOKEN. O script guarda só o hash (Propriedades do script).
//    O token é derivado da senha do app: nunca fica no código nem no GitHub.
//  • Um Web App "qualquer pessoa" não vê cabeçalhos/origem da requisição, então
//    NÃO dá para validar o site de origem. O token é a única barreira.
//  • O token vai na requisição (corpo no POST; na URL no GET). Quem o capturar pode
//    usá-lo. Troca de token: rode configurarToken() de novo.
//
// CONFIGURAR (uma vez):
//  1. Abra o app, entre, clique em "Token do backup" e copie o token.
//  2. Cole em TOKEN_INICIAL abaixo, rode configurarToken() no editor.
//  3. APAGUE o token de TOKEN_INICIAL e salve. Depois: Implantar → Gerenciar
//     implantações → editar → Nova versão (senão o deploy antigo continua ativo).
// =============================================================================

const TOKEN_INICIAL = "";   // cole aqui só durante a configuração; apague depois

const PROP_TOKEN_HASH = "TOKEN_HASH";
const MAX_PAYLOAD     = 2000000;   // caracteres do corpo POST
const MAX_LINHAS_SYNC = 20000;
const MAX_ADICIONAR   = 500;
const ID_RE           = /^[A-Za-z0-9_-]{1,64}$/;
const UID_RE          = /^[0-9a-f-]{36}$/;

function configurarToken() {
  const t = String(TOKEN_INICIAL || "").trim();
  if (!/^[0-9a-f]{64}$/.test(t)) {
    throw new Error("Cole em TOKEN_INICIAL o token de 64 caracteres (hex) mostrado no app.");
  }
  PropertiesService.getScriptProperties().setProperty(PROP_TOKEN_HASH, sha256Hex(t));
  Logger.log("✅ Token configurado. Agora apague TOKEN_INICIAL do código e publique nova versão.");
}

function sha256Hex(texto) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, texto, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ("0" + (b & 0xff).toString(16)).slice(-2); }).join("");
}

function iguais(a, b) {            // comparação em tempo constante
  if (a.length !== b.length) return false;
  var r = 0;
  for (var i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** "ok" | "nao-configurado" | "invalido" */
function checarToken(token) {
  const guardado = PropertiesService.getScriptProperties().getProperty(PROP_TOKEN_HASH);
  if (!guardado) return "nao-configurado";
  if (typeof token !== "string" || !/^[0-9a-f]{64}$/.test(token)) return "invalido";
  return iguais(sha256Hex(token), guardado) ? "ok" : "invalido";
}

function comLock(fn) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(20000); }
  catch (e) { return { success: false, error: "Planilha ocupada, tente de novo." }; }
  try { return fn(); } finally { lock.releaseLock(); }
}

// ── Sanitização ──────────────────────────────────────────────────────────────
const CAMPOS_NUM = {
  tipoImpressao: 1, folhasNormais: 1, folhasOffset: 1, projetoCanva: 1, trabalho: 1,
  valorTotal: 1, valorPago: 1, valorRestante: 1, valorAplicado: 1
};

function limpar(sheetName, data) {
  const out = {};
  if (!data || typeof data !== "object" || Array.isArray(data)) return out;
  HEADERS[sheetName].forEach(function (campo) {
    var v = data[campo];
    if (v === undefined || v === null) return;
    if (CAMPOS_NUM[campo]) {
      v = Number(v);
      out[campo] = isFinite(v) ? v : 0;
    } else {
      out[campo] = String(v).slice(0, campo === "observacao" ? 1000 : 300);
    }
  });
  return out;
}

/** Escreve uma linha; textos entram como "texto simples" (formato @), então "=…" nunca vira fórmula. */
function gravarLinha(sheet, linha, valores) {
  const r = sheet.getRange(linha, 1, 1, valores.length);
  r.setNumberFormats([valores.map(function (v) { return typeof v === "string" ? "@" : "General"; })]);
  r.setValues([valores]);
}


// =============================================================================
// HEADERS DAS ABAS
// =============================================================================

const HEADERS = {
  Clientes: ["id", "nome", "telefone", "ativo", "createdAt"],
  Impressoes: [
    "id", "clienteId", "tipoImpressao", "tipoPreco",
    "folhasNormais", "folhasOffset", "projetoCanva", "trabalho",
    "valorTotal", "valorPago", "valorRestante", "statusPagamento",
    "dataImpressao", "dataPrimeiroPagamento", "dataQuitacao",
    "observacao", "createdAt"
  ],
  Pagamentos: [
    "id", "clienteId", "valorTotal", "tipoAplicacao",
    "observacao", "dataPagamento", "createdAt"
  ],
  Pagamentos_Impressoes: ["id", "pagamentoId", "impressaoId", "valorAplicado"]
};

function mapRow(sheetName, id, data) {
  switch (sheetName) {
    case "Clientes":
      return [id, data.nome||"", data.telefone||"", data.ativo!==undefined?String(data.ativo):"true", data.createdAt||""];
    case "Impressoes":
      return [id, data.clienteId||"", data.tipoImpressao||0, data.tipoPreco||"Desconhecido",
              data.folhasNormais||0, data.folhasOffset||0, data.projetoCanva||0, data.trabalho||0,
              data.valorTotal||0, data.valorPago||0, data.valorRestante||0, data.statusPagamento||"pendente",
              data.dataImpressao||"", data.dataPrimeiroPagamento||"", data.dataQuitacao||"",
              data.observacao||"", data.createdAt||""];
    case "Pagamentos":
      return [id, data.clienteId||"", data.valorTotal||0, data.tipoAplicacao||"automatico",
              data.observacao||"", data.dataPagamento||"", data.createdAt||""];
    case "Pagamentos_Impressoes":
      return [id, data.pagamentoId||"", data.impressaoId||"", data.valorAplicado||0];
    default:
      return null;
  }
}

function ensureHeaders(sheet, sheetName) {
  const firstRow = sheet.getRange(1, 1, 1, HEADERS[sheetName].length).getValues()[0];
  if (!firstRow[0]) {
    const range = sheet.getRange(1, 1, 1, HEADERS[sheetName].length);
    range.setValues([HEADERS[sheetName]]);
    range.setFontWeight("bold");
    range.setBackground("#1B3A6B");
    range.setFontColor("#FFFFFF");
  }
}

function findRowById(sheet, id) {
  const data = sheet.getRange("A:A").getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) return i + 1;
  }
  return null;
}

function upsertRow(sheet, sheetName, id, rowValues) {
  const existing = findRowById(sheet, id);
  if (existing) {
    gravarLinha(sheet, existing, rowValues);
  } else {
    gravarLinha(sheet, sheet.getLastRow() + 1, rowValues);
  }
}

function deleteRowById(sheet, id) {
  const row = findRowById(sheet, id);
  if (row) sheet.deleteRow(row);
}

// =============================================================================
// ESTILIZAR ABAS DE DADOS
// =============================================================================

function estilizarAbasDados() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abas = [
    { nome: "Clientes",              cor: "#E8F4FD" },
    { nome: "Impressoes",            cor: "#EAF7EA" },
    { nome: "Pagamentos",            cor: "#FEF9E7" },
    { nome: "Pagamentos_Impressoes", cor: "#F4ECF7" },
  ];

  abas.forEach(({ nome, cor }) => {
    const sheet = ss.getSheetByName(nome);
    if (!sheet) return;
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 1 || lastCol < 1) return;
    if (lastRow >= 2) {
      for (let i = 2; i <= lastRow; i++) {
        const bg = i % 2 === 0 ? cor : shadeColor(cor, -5);
        sheet.getRange(i, 1, 1, lastCol).setBackground(bg);
      }
    }
    sheet.getRange(1, 1, lastRow, lastCol).setBorder(
      true, true, true, true, true, true,
      "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID
    );
    Logger.log(`Aba ${nome} estilizada.`);
  });
}

function shadeColor(hex, percent) {
  const num = parseInt(hex.replace("#",""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + percent));
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// =============================================================================
// ABA RESUMO
// =============================================================================

function buildResumo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let resumoSheet = ss.getSheetByName("Resumo");
  if (!resumoSheet) {
    resumoSheet = ss.insertSheet("Resumo", 0);
  } else {
    ss.setActiveSheet(resumoSheet);
    ss.moveActiveSheet(1);
  }

  resumoSheet.clearContents();
  resumoSheet.clearFormats();

  const clientesSheet   = ss.getSheetByName("Clientes");
  const impressoesSheet = ss.getSheetByName("Impressoes");
  if (!clientesSheet || !impressoesSheet) return;

  const clientesData   = clientesSheet.getDataRange().getValues();
  const impressoesData = impressoesSheet.getDataRange().getValues();

  if (clientesData.length <= 1 || impressoesData.length <= 1) {
    resumoSheet.getRange("A1").setValue("Nenhum dado disponível ainda.");
    return;
  }

  const clienteMap = {};
  for (let i = 1; i < clientesData.length; i++) {
    const row = clientesData[i];
    if (row[0]) clienteMap[String(row[0])] = String(row[1] || "");
  }

  const agrupado = {};
  for (let i = 1; i < impressoesData.length; i++) {
    const row = impressoesData[i];
    if (!row[0]) continue;
    const cid           = String(row[1] || "");
    const folhasNormais = Number(row[4]) || 0;
    const folhasOffset  = Number(row[5]) || 0;
    const projetoCanva  = Number(row[6]) || 0;
    const trabalho      = Number(row[7]) || 0;
    const valorTotal    = Number(row[8]) || 0;
    const valorPago     = Number(row[9]) || 0;
    const valorRestante = Number(row[10]) || 0;
    const status        = String(row[11] || "pendente");
    const tipoPreco     = String(row[3] || "");

    if (!agrupado[cid]) {
      agrupado[cid] = {
        nome: clienteMap[cid] || "Desconhecido",
        totalImpressoes: 0,
        folhasNormais: 0, folhasOffset: 0,
        projetoCanva: 0, trabalho: 0,
        valorTotal: 0, valorPago: 0, valorRestante: 0,
        pagas: 0, parciais: 0, pendentes: 0,
        tiposUsados: new Set()
      };
    }

    const g = agrupado[cid];
    g.totalImpressoes++;
    g.folhasNormais += folhasNormais;
    g.folhasOffset  += folhasOffset;
    g.projetoCanva  += projetoCanva;
    g.trabalho      += trabalho;
    g.valorTotal    += valorTotal;
    g.valorPago     += valorPago;
    g.valorRestante += valorRestante;
    if (tipoPreco) g.tiposUsados.add(tipoPreco.split(" R$")[0]);
    if (status === "pago") g.pagas++;
    else if (status === "parcial") g.parciais++;
    else g.pendentes++;
  }

  const clientes = Object.values(agrupado);
  if (clientes.length === 0) {
    resumoSheet.getRange("A1").setValue("Nenhum cliente com impressões ainda.");
    return;
  }

  clientes.sort((a, b) => {
    const devA = a.valorRestante > 0.009 ? 0 : 1;
    const devB = b.valorRestante > 0.009 ? 0 : 1;
    if (devA !== devB) return devA - devB;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  const titulo = resumoSheet.getRange("A1:J1");
  titulo.merge();
  titulo.setValue("RESUMO POR CLIENTE — Sistema de Gerenciamento de Impressões");
  titulo.setBackground("#1B3A6B");
  titulo.setFontColor("#FFFFFF");
  titulo.setFontWeight("bold");
  titulo.setFontSize(13);
  titulo.setHorizontalAlignment("center");
  titulo.setVerticalAlignment("middle");
  resumoSheet.setRowHeight(1, 40);
  resumoSheet.setRowHeight(2, 10);

  const cabecalhos = [
    "Cliente", "Impressões", "Folhas Normais", "Folhas Offset",
    "Projeto Canva (R$)", "Trabalho (R$)", "Total Original (R$)",
    "Total Pago (R$)", "Saldo Devedor (R$)", "Status"
  ];
  const headerRange = resumoSheet.getRange(3, 1, 1, cabecalhos.length);
  headerRange.setValues([cabecalhos]);
  headerRange.setBackground("#2E6DB4");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(11);
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  resumoSheet.setRowHeight(3, 32);

  let linha = 4;
  clientes.forEach((c, idx) => {
    const isDevedor = c.valorRestante > 0.009;
    const bg = idx % 2 === 0
      ? (isDevedor ? "#FFF3F3" : "#F0FFF4")
      : (isDevedor ? "#FFE8E8" : "#E8F5E9");

    let statusTxt;
    if (!isDevedor) statusTxt = "Em dia ✓";
    else if (c.parciais > 0) statusTxt = "Parcial";
    else statusTxt = "Pendente";

    const row = [
      c.nome, c.totalImpressoes, c.folhasNormais, c.folhasOffset,
      c.projetoCanva.toFixed(2), c.trabalho.toFixed(2),
      c.valorTotal.toFixed(2), c.valorPago.toFixed(2),
      c.valorRestante.toFixed(2), statusTxt
    ];

    const dataRange = resumoSheet.getRange(linha, 1, 1, row.length);
    dataRange.setValues([row]);
    dataRange.setBackground(bg);
    dataRange.setFontSize(11);
    dataRange.setVerticalAlignment("middle");
    dataRange.setBorder(true, true, true, true, true, true, "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID);
    resumoSheet.setRowHeight(linha, 28);
    resumoSheet.getRange(linha, 1).setHorizontalAlignment("left").setFontWeight("bold");
    resumoSheet.getRange(linha, 2, 1, 9).setHorizontalAlignment("center");

    const saldoCell = resumoSheet.getRange(linha, 9);
    saldoCell.setFontWeight("bold");
    saldoCell.setFontColor(isDevedor ? "#C0392B" : "#1A7A4A");

    const statusCell = resumoSheet.getRange(linha, 10);
    statusCell.setFontWeight("bold");
    if (statusTxt === "Em dia ✓") statusCell.setFontColor("#1A7A4A");
    else if (statusTxt === "Parcial") statusCell.setFontColor("#E67E22");
    else statusCell.setFontColor("#C0392B");

    linha++;
  });

  const tot = clientes.reduce((acc, c) => {
    acc.imp += c.totalImpressoes;
    acc.nor += c.folhasNormais;
    acc.off += c.folhasOffset;
    acc.can += c.projetoCanva;
    acc.tra += c.trabalho;
    acc.vt  += c.valorTotal;
    acc.vp  += c.valorPago;
    acc.vr  += c.valorRestante;
    return acc;
  }, {imp:0,nor:0,off:0,can:0,tra:0,vt:0,vp:0,vr:0});

  const totalRange = resumoSheet.getRange(linha + 1, 1, 1, 10);
  totalRange.setValues([[
    "TOTAL GERAL", tot.imp, tot.nor, tot.off,
    tot.can.toFixed(2), tot.tra.toFixed(2),
    tot.vt.toFixed(2), tot.vp.toFixed(2), tot.vr.toFixed(2),
    clientes.length + " cliente(s)"
  ]]);
  totalRange.setBackground("#1B3A6B");
  totalRange.setFontColor("#FFFFFF");
  totalRange.setFontWeight("bold");
  totalRange.setFontSize(11);
  totalRange.setHorizontalAlignment("center");
  totalRange.setBorder(true, true, true, true, true, true, "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID);
  resumoSheet.getRange(linha + 1, 1).setHorizontalAlignment("left");
  resumoSheet.setRowHeight(linha + 1, 32);

  resumoSheet.setColumnWidth(1, 180);
  resumoSheet.setColumnWidth(2, 100);
  resumoSheet.setColumnWidth(3, 120);
  resumoSheet.setColumnWidth(4, 110);
  resumoSheet.setColumnWidth(5, 130);
  resumoSheet.setColumnWidth(6, 110);
  resumoSheet.setColumnWidth(7, 140);
  resumoSheet.setColumnWidth(8, 120);
  resumoSheet.setColumnWidth(9, 130);
  resumoSheet.setColumnWidth(10, 110);
  resumoSheet.setFrozenRows(3);
  headerRange.setBorder(true, true, true, true, true, true, "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID);
  Logger.log("Resumo atualizado: " + clientes.length + " cliente(s)");
}

// =============================================================================
// RECEPTOR POST (sincronização Firestore → planilha)
// =============================================================================

const COR_ABA = { Clientes: "#E8F4FD", Impressoes: "#EAF7EA", Pagamentos: "#FEF9E7", Pagamentos_Impressoes: "#F4ECF7" };

function erro(msg) { return jsonResponse({ success: false, error: msg }); }

function doPost(e) {
  try {
    const corpo = e && e.postData && e.postData.contents;
    if (!corpo || corpo.length > MAX_PAYLOAD) return erro("Requisição inválida.");
    var payload;
    try { payload = JSON.parse(corpo); } catch (x) { return erro("JSON inválido."); }
    if (!payload || typeof payload !== "object") return erro("Requisição inválida.");

    const auth = checarToken(payload.token);
    if (auth !== "ok") return erro(auth === "nao-configurado" ? "Token não configurado no script." : "Não autorizado.");

    const action = payload.action;
    if (action === "refreshResumo") {
      return jsonResponse(comLock(function () { buildResumo(); return { success: true, action: action }; }));
    }

    const sheetName = payload.sheetName, id = payload.id, data = payload.data;
    if (["upsert", "delete", "syncAll"].indexOf(action) < 0) return erro("Ação inválida.");
    if (typeof sheetName !== "string" || !Object.prototype.hasOwnProperty.call(HEADERS, sheetName)) return erro("Aba inválida.");
    if (action !== "syncAll" && !(typeof id === "string" && ID_RE.test(id))) return erro("id inválido.");

    return jsonResponse(comLock(function () {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
      if (!sheet) return { success: false, error: "Aba não encontrada." };
      ensureHeaders(sheet, sheetName);
      const cor = COR_ABA[sheetName] || "#FFFFFF";
      const afeta = sheetName === "Clientes" || sheetName === "Impressoes";

      if (action === "upsert") {
        if (!data || typeof data !== "object" || Array.isArray(data)) return { success: false, error: "'data' inválido." };
        const row = mapRow(sheetName, id, limpar(sheetName, data));
        upsertRow(sheet, sheetName, id, row);
        const rowNum = findRowById(sheet, id);
        if (rowNum) {
          sheet.getRange(rowNum, 1, 1, row.length)
            .setBackground(rowNum % 2 === 0 ? cor : shadeColor(cor, -5))
            .setBorder(true, true, true, true, true, true, "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID);
        }
        if (afeta) buildResumo();
        return { success: true, action: action, sheetName: sheetName, id: id };
      }

      if (action === "delete") {
        deleteRowById(sheet, id);
        if (afeta) buildResumo();
        return { success: true, action: action, sheetName: sheetName, id: id };
      }

      // syncAll APAGA a aba e regrava: só com confirmação explícita
      if (payload.confirm !== "SUBSTITUIR_ABA") return { success: false, error: "syncAll exige confirm." };
      if (!Array.isArray(data) || data.length > MAX_LINHAS_SYNC) return { success: false, error: "'data' deve ser array (máx. " + MAX_LINHAS_SYNC + ")." };
      const porId = {};
      for (var i = 0; i < data.length; i++) {
        const it = data[i];
        if (!it || typeof it.id !== "string" || !ID_RE.test(it.id)) return { success: false, error: "Item com id inválido; nada foi alterado." };
        porId[it.id] = it;                       // duplicados: o último vence
      }
      const rows = Object.keys(porId).map(function (k) { return mapRow(sheetName, k, limpar(sheetName, porId[k])); });
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
      if (rows.length > 0) {
        const r = sheet.getRange(2, 1, rows.length, rows[0].length);
        r.setNumberFormats(rows.map(function (l) { return l.map(function (v) { return typeof v === "string" ? "@" : "General"; }); }));
        r.setValues(rows);
        r.setBorder(true, true, true, true, true, true, "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID);
      }
      if (afeta) buildResumo();
      return { success: true, action: action, sheetName: sheetName, count: rows.length };
    }));
  } catch (err) {
    Logger.log("doPost: " + err);
    return erro("Erro interno.");
  }
}

// =============================================================================
// RECEPTOR GET (leitura + importação da aba Adicionar)
// =============================================================================

function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    const action = p.action;

    if (action === "ping") {                      // status de conexão: não expõe dados
      const a = checarToken(p.token);
      return jsonResponse({ success: true, auth: a });
    }
    if (!action) return jsonResponse({ success: true, message: "Apps Script ativo!" });

    const auth = checarToken(p.token);
    if (auth !== "ok") return erro(auth === "nao-configurado" ? "Token não configurado no script." : "Não autorizado.");

    if (action === "getAll")            return jsonResponse(acaoGetAll());
    if (action === "getAdicionar")      return jsonResponse(comLock(acaoGetAdicionar));
    if (action === "confirmarAdicionar") return jsonResponse(comLock(function () { return acaoConfirmarAdicionar(p.uids); }));
    if (action === "refreshResumo")     return jsonResponse(comLock(function () { buildResumo(); return { success: true }; }));
    return erro("Ação inválida.");
  } catch (err) {
    Logger.log("doGet: " + err);
    return erro("Erro interno.");
  }
}

function acaoGetAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  function sheetToObjects(sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    const headers = data[0].map(String);
    const rows = [];
    for (var i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;
      const obj = {};
      for (var j = 0; j < headers.length; j++) obj[headers[j]] = row[j] !== undefined && row[j] !== null ? String(row[j]) : "";
      rows.push(obj);
    }
    return rows;
  }
  return { success: true, data: {
    clientes: sheetToObjects("Clientes"), impressoes: sheetToObjects("Impressoes"),
    pagamentos: sheetToObjects("Pagamentos"), pagamentosImpressoes: sheetToObjects("Pagamentos_Impressoes")
  } };
}

/** Só LÊ. Garante um uid por linha (grava na coluna J) e devolve; NÃO apaga nada. */
function acaoGetAdicionar() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_ADICIONAR);
  if (!aba) return { success: false, error: "Aba Adicionar não encontrada." };
  const lastRow = aba.getLastRow();
  const registros = [];
  if (lastRow >= REG_INICIO_LINHA) {
    const n = lastRow - REG_INICIO_LINHA + 1;
    const dados = aba.getRange(REG_INICIO_LINHA, REG_COL_NOME, n, 9).getValues();   // B..J
    for (var i = 0; i < dados.length && registros.length < MAX_ADICIONAR; i++) {
      const row = dados[i];
      if (!row[0] || String(row[0]).indexOf("Ex:") === 0) continue;
      var uid = String(row[8] || "");
      if (!UID_RE.test(uid)) {
        uid = Utilities.getUuid();
        aba.getRange(REG_INICIO_LINHA + i, REG_COL_UID).setValue(uid);
      }
      registros.push({
        uid: uid, nome: String(row[0]).slice(0, 300), tipo: String(row[1] || "").slice(0, 100),
        folhas: parseFloat(row[2]) || 0, offset: parseFloat(row[3]) || 0,
        canva: parseFloat(row[4]) || 0, trabalho: parseFloat(row[5]) || 0,
        total: parseFloat(row[6]) || 0, dataHora: String(row[7] || "").slice(0, 40)
      });
    }
  }
  return { success: true, data: { registros: registros } };
}

/** Remove da aba só as linhas cujo uid o app confirmou ter gravado no banco. */
function acaoConfirmarAdicionar(uidsParam) {
  const uids = String(uidsParam || "").split(",").filter(function (u) { return UID_RE.test(u); });
  if (uids.length === 0 || uids.length > 50) return { success: false, error: "uids inválidos." };
  const set = {}; uids.forEach(function (u) { set[u] = true; });
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_ADICIONAR);
  if (!aba) return { success: false, error: "Aba Adicionar não encontrada." };
  const lastRow = aba.getLastRow();
  var removidas = 0;
  if (lastRow >= REG_INICIO_LINHA) {
    const col = aba.getRange(REG_INICIO_LINHA, REG_COL_UID, lastRow - REG_INICIO_LINHA + 1, 1).getValues();
    for (var i = col.length - 1; i >= 0; i--) {          // de baixo p/ cima: índices não mudam
      if (set[String(col[i][0])]) { aba.deleteRow(REG_INICIO_LINHA + i); removidas++; }
    }
  }
  return { success: true, removidas: removidas };
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// =============================================================================
// ABA "Adicionar" — Constantes
// =============================================================================

const ABA_ADICIONAR = "Adicionar";

const PRECO_INICIO_LINHA = 3;
const PRECO_COL_TIPO     = 2;
const PRECO_COL_VALOR    = 3;

const TIPO_PARA_LINHA = {
  "Xerox Preto e Branco":       3,
  "Xerox Colorido":             4,
  "Impressão Digital P&B":      5,
  "Impressão Digital Colorido": 6,
};
const OFFSET_LINHA = 7;

const FORM_LINHA         = 11;
const FORM_COL_NOME      = 2;
const FORM_COL_TIPO      = 3;
const FORM_COL_FOLHAS    = 4;
const FORM_COL_OFFSET    = 5;
const FORM_COL_CANVA     = 6;
const FORM_COL_TRABALHO  = 7;
const FORM_COL_VALOR_TOT = 8;
const FORM_COL_CONFIRMAR = 9;

const RESET_LINHA     = 11;
const RESET_COL_CHECK = 12;

const REM_TITULO_LINHA  = 13;
const REM_CAB_LINHA     = 14;
const FORM_LINHA_REM    = 15;
const FORM_COL_REMOVER  = 11;
const FORM_COL_CONF_REM = 12;

const REG_INICIO_LINHA  = 16;
const REG_COL_NOME      = 2;
const REG_COL_TIPO      = 3;
const REG_COL_FOLHAS    = 4;
const REG_COL_OFFSET    = 5;
const REG_COL_CANVA     = 6;
const REG_COL_TRABALHO  = 7;
const REG_COL_VALOR_TOT = 8;
const REG_COL_DATAHORA  = 9;
const REG_COL_UID       = 10;   // coluna J (estreita): id único e permanente de cada registro

// =============================================================================
// HELPERS
// =============================================================================

function getPrecoTipo(sheet, tipo) {
  const linhaPreco = TIPO_PARA_LINHA[tipo];
  if (!linhaPreco) return 0;
  return parseFloat(sheet.getRange(linhaPreco, PRECO_COL_VALOR).getValue()) || 0;
}

function getPrecoOffset(sheet) {
  return parseFloat(sheet.getRange(OFFSET_LINHA, PRECO_COL_VALOR).getValue()) || 0;
}

function calcularValorTotal(sheet, tipo, folhas, offset, canva, trabalho) {
  const precoTipo   = getPrecoTipo(sheet, tipo);
  const precoOffset = getPrecoOffset(sheet);
  return (folhas * precoTipo) + (offset * precoOffset) + canva + trabalho;
}

// =============================================================================
// TRIGGER onEdit
// =============================================================================

function onEdit(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== ABA_ADICIONAR) return;

  const linha = e.range.getRow();
  const col   = e.range.getColumn();

  if (linha === FORM_LINHA && [FORM_COL_TIPO, FORM_COL_FOLHAS, FORM_COL_OFFSET, FORM_COL_CANVA, FORM_COL_TRABALHO].includes(col)) {
    recalcularValorTotal(sheet);
    return;
  }

  if (col === PRECO_COL_VALOR && linha >= PRECO_INICIO_LINHA && linha <= 7) {
    recalcularValorTotal(sheet);
    return;
  }

  if (linha === FORM_LINHA && col === FORM_COL_CONFIRMAR && e.value === "TRUE") {
    registrarImpressao(sheet);
    return;
  }

  if (linha === FORM_LINHA_REM && col === FORM_COL_CONF_REM && e.value === "TRUE") {
    executarRemocao(sheet);
    return;
  }

  if (linha === RESET_LINHA && col === RESET_COL_CHECK && e.value === "TRUE") {
    resetarRemocao(sheet);
    return;
  }
}

// =============================================================================
// RESETAR CAMPO DE REMOÇÃO
// =============================================================================

function resetarRemocao(sheet) {
  sheet.getRange(FORM_LINHA_REM, FORM_COL_REMOVER).setValue("");
  sheet.getRange(FORM_LINHA_REM, FORM_COL_CONF_REM).setValue(false);
  sheet.getRange(FORM_LINHA, FORM_COL_NOME, 1, 7).setValues([["", "", 0, 0, 0, 0, 0]]);
  sheet.getRange(FORM_LINHA, FORM_COL_CONFIRMAR).setValue(false);
  sheet.getRange(RESET_LINHA, RESET_COL_CHECK).setValue(false);
}

// =============================================================================
// EXECUTAR REMOÇÃO
// =============================================================================

function executarRemocao(sheet) {
  const opcao = sheet.getRange(FORM_LINHA_REM, FORM_COL_REMOVER).getValue();

  if (opcao === "Remover linha") {
    const ultimaLinha = sheet.getLastRow();
    if (ultimaLinha >= REG_INICIO_LINHA) {
      for (let i = ultimaLinha; i >= REG_INICIO_LINHA; i--) {
        const val = sheet.getRange(i, REG_COL_NOME).getValue();
        if (val && !String(val).startsWith("Ex:")) {
          sheet.deleteRow(i);
          Logger.log("Linha " + i + " removida.");
          break;
        }
      }
    }
  } else if (opcao === "Remover tudo") {
    const ultimaLinha = sheet.getLastRow();
    if (ultimaLinha >= REG_INICIO_LINHA) {
      sheet.deleteRows(REG_INICIO_LINHA, ultimaLinha - REG_INICIO_LINHA + 1);
      Logger.log("Todas as linhas de registro removidas.");
    }
  }

  sheet.getRange(FORM_LINHA_REM, FORM_COL_REMOVER).setValue("");
  sheet.getRange(FORM_LINHA_REM, FORM_COL_CONF_REM).setValue(false);
}

// =============================================================================
// RECALCULAR VALOR TOTAL
// =============================================================================

function recalcularValorTotal(sheet) {
  const dadosForm   = sheet.getRange(FORM_LINHA, FORM_COL_NOME, 1, 8).getValues()[0];
  const dadosPrecos = sheet.getRange(PRECO_INICIO_LINHA, PRECO_COL_VALOR, 5, 1).getValues();

  const tipo     = dadosForm[FORM_COL_TIPO    - FORM_COL_NOME];
  const folhas   = parseFloat(dadosForm[FORM_COL_FOLHAS   - FORM_COL_NOME]) || 0;
  const offset   = parseFloat(dadosForm[FORM_COL_OFFSET   - FORM_COL_NOME]) || 0;
  const canva    = parseFloat(dadosForm[FORM_COL_CANVA    - FORM_COL_NOME]) || 0;
  const trabalho = parseFloat(dadosForm[FORM_COL_TRABALHO - FORM_COL_NOME]) || 0;

  const linhaPreco  = TIPO_PARA_LINHA[tipo];
  const precoTipo   = linhaPreco ? (parseFloat(dadosPrecos[linhaPreco - PRECO_INICIO_LINHA][0]) || 0) : 0;
  const precoOffset = parseFloat(dadosPrecos[OFFSET_LINHA - PRECO_INICIO_LINHA][0]) || 0;

  const total = (folhas * precoTipo) + (offset * precoOffset) + canva + trabalho;
  sheet.getRange(FORM_LINHA, FORM_COL_VALOR_TOT).setValue(total);
}

// =============================================================================
// REGISTRAR IMPRESSÃO
// =============================================================================

function registrarImpressao(sheet) {
  const dadosForm   = sheet.getRange(FORM_LINHA, FORM_COL_NOME, 1, 7).getValues()[0];
  const dadosPrecos = sheet.getRange(PRECO_INICIO_LINHA, PRECO_COL_VALOR, 5, 1).getValues();

  const nome     = dadosForm[0];
  const tipo     = dadosForm[1];
  const folhas   = parseFloat(dadosForm[2]) || 0;
  const offset   = parseFloat(dadosForm[3]) || 0;
  const canva    = parseFloat(dadosForm[4]) || 0;
  const trabalho = parseFloat(dadosForm[5]) || 0;

  if (!nome || !tipo || folhas <= 0) {
    sheet.getRange(FORM_LINHA, FORM_COL_CONFIRMAR).setValue(false);
    const msgs = [];
    if (!nome)       msgs.push("Nome");
    if (!tipo)       msgs.push("Tipo de Impressão");
    if (folhas <= 0) msgs.push("Folhas (mínimo 1)");
    SpreadsheetApp.getActive().toast(
      "⚠️ Campos obrigatórios não preenchidos: " + msgs.join(", "),
      "❌ Não foi possível registrar", 6
    );
    return;
  }

  const linhaPreco  = TIPO_PARA_LINHA[tipo];
  const precoTipo   = linhaPreco ? (parseFloat(dadosPrecos[linhaPreco - PRECO_INICIO_LINHA][0]) || 0) : 0;
  const precoOffset = parseFloat(dadosPrecos[OFFSET_LINHA - PRECO_INICIO_LINHA][0]) || 0;
  const total       = (folhas * precoTipo) + (offset * precoOffset) + canva + trabalho;

  const dataFmt = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

  let proximaLinha = REG_INICIO_LINHA;
  const ultimaLinha = sheet.getLastRow();
  for (let i = REG_INICIO_LINHA; i <= ultimaLinha + 1; i++) {
    if (!sheet.getRange(i, REG_COL_NOME).getValue()) { proximaLinha = i; break; }
  }

  sheet.getRange(proximaLinha, REG_COL_NOME, 1, 8).setValues([[
    nome, tipo, folhas, offset, canva, trabalho, total, dataFmt
  ]]);

  sheet.getRange(proximaLinha, REG_COL_UID).setValue(Utilities.getUuid());

  const novaLinhaRange = sheet.getRange(proximaLinha, REG_COL_NOME, 1, 8);
  novaLinhaRange.setBackground(proximaLinha % 2 === 0 ? "#F8F9FA" : "#FFFFFF");
  novaLinhaRange.setHorizontalAlignment("center");
  novaLinhaRange.setBorder(true, true, true, true, true, true, "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange(proximaLinha, REG_COL_VALOR_TOT).setNumberFormat("R$ 0.00");

  sheet.getRange(FORM_LINHA, FORM_COL_NOME, 1, 8).setValues([["", "", 0, 0, 0, 0, 0, false]]);
  sheet.getRange(FORM_LINHA, FORM_COL_NOME).activate();
}

// =============================================================================
// CRIAR/RESETAR A ABA ADICIONAR
// =============================================================================

function criarAbaAdicionar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let aba = ss.getSheetByName(ABA_ADICIONAR);
  if (aba) ss.deleteSheet(aba);
  aba = ss.insertSheet(ABA_ADICIONAR);

  aba.getRange("B1:D1").merge()
    .setValue("💰 TABELA DE PREÇOS")
    .setBackground("#1B3A6B").setFontColor("#FFFFFF")
    .setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center");
  aba.setRowHeight(1, 35);

  aba.getRange("B2:D2").setValues([["Tipo", "Preço", "Unidade"]])
    .setBackground("#2E6DB4").setFontColor("#FFFFFF")
    .setFontWeight("bold").setHorizontalAlignment("center");
  aba.getRange("B2:D2").setBorder(true, true, true, true, true, true, "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID);
  aba.setRowHeight(2, 28);

  const precos = [
    ["Xerox Preto e Branco",       0.50, "R$/unidade"],
    ["Xerox Colorido",             1.00, "R$/unidade"],
    ["Impressão Digital P&B",      1.50, "R$/unidade"],
    ["Impressão Digital Colorido", 2.00, "R$/unidade"],
    ["Folha Offset",               0.50, "R$/unidade"],
  ];
  const coresPreco = ["#EBF3FB","#FFFFFF","#EBF3FB","#FFFFFF","#EBF3FB"];
  precos.forEach((row, i) => {
    const r = aba.getRange(3 + i, 2, 1, 3);
    r.setValues([row]).setBackground(coresPreco[i]).setHorizontalAlignment("center");
    r.setBorder(true, true, true, true, true, true, "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID);
    aba.setRowHeight(3 + i, 26);
  });
  aba.getRange("C3:C7").setNumberFormat("R$ 0.00");
  aba.setRowHeight(8, 20);

  aba.getRange("B9:I9").merge()
    .setValue("📝 TABELA DE PREENCHIMENTO")
    .setBackground("#1B3A6B").setFontColor("#FFFFFF")
    .setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center");
  aba.getRange("B9:I9").setBorder(true, true, true, true, true, true, "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID);
  aba.setRowHeight(9, 35);

  aba.getRange(10, 2, 1, 8).setValues([[
    "Nome", "Tipo de Impressão", "Folhas", "Folha Offset",
    "Projeto Canva", "Trabalho", "Valor Total", "✅ Confirmar"
  ]]).setBackground("#2E6DB4").setFontColor("#FFFFFF")
    .setFontWeight("bold").setHorizontalAlignment("center").setWrap(true);
  aba.getRange(10, 2, 1, 8).setBorder(true, true, true, true, true, true, "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID);
  aba.setRowHeight(10, 40);

  aba.getRange(9, 11, 1, 2).merge()
    .setValue("🔄 RESETAR SELEÇÕES")
    .setBackground("#1A5276").setFontColor("#FFFFFF")
    .setFontWeight("bold").setFontSize(10).setHorizontalAlignment("center");
  aba.getRange(10, 11).setValue("Limpar tudo")
    .setBackground("#2E86C1").setFontColor("#FFFFFF")
    .setFontWeight("bold").setHorizontalAlignment("center").setWrap(true);
  aba.getRange(10, 12).setValue("✅ Confirmar")
    .setBackground("#2E86C1").setFontColor("#FFFFFF")
    .setFontWeight("bold").setHorizontalAlignment("center").setWrap(true);
  aba.getRange(11, 11).setValue("Marque para resetar →")
    .setBackground("#D6EAF8").setFontColor("#1A5276")
    .setFontSize(9).setHorizontalAlignment("center").setWrap(true);
  aba.getRange(11, 12).insertCheckboxes()
    .setBackground("#D6EAF8").setHorizontalAlignment("center");
  aba.getRange(9, 11, 3, 2).setBorder(true, true, true, true, true, true, "#1A5276", SpreadsheetApp.BorderStyle.SOLID);

  aba.setRowHeight(11, 45);
  aba.getRange(11, 2, 1, 8).setBorder(true, true, true, true, true, true, "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID);

  const nomeCell = aba.getRange(11, FORM_COL_NOME);
  nomeCell.setBackground("#FFFDE7");
  nomeCell.clearDataValidations();
  nomeCell.clearNote();

  const validacaoTipo = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      "Xerox Preto e Branco","Xerox Colorido",
      "Impressão Digital P&B","Impressão Digital Colorido"
    ], true).setAllowInvalid(false).build();
  aba.getRange(11, FORM_COL_TIPO).setDataValidation(validacaoTipo).setBackground("#FFFDE7");

  [FORM_COL_FOLHAS, FORM_COL_OFFSET].forEach(col => {
    aba.getRange(11, col).setValue(0).setBackground("#FFFDE7").setHorizontalAlignment("center");
  });
  [FORM_COL_CANVA, FORM_COL_TRABALHO].forEach(col => {
    aba.getRange(11, col).setValue(0).setBackground("#FFFDE7")
      .setHorizontalAlignment("center").setNumberFormat("R$ 0.00");
  });

  aba.getRange(11, FORM_COL_VALOR_TOT).setValue(0)
    .setBackground("#E8F5E9").setHorizontalAlignment("center")
    .setNumberFormat("R$ 0.00").setFontWeight("bold");
  aba.getRange(11, FORM_COL_CONFIRMAR).insertCheckboxes()
    .setBackground("#E8F5E9").setHorizontalAlignment("center");

  aba.setRowHeight(12, 20);
  aba.getRange(9, 10, 7, 1).setBackground(null).clearContent();
  aba.getRange(9, 10, 7, 1).setBorder(false, false, false, false, false, false);

  aba.setRowHeight(12, 10);
  aba.getRange(13, 11, 1, 2).merge()
    .setValue("🗑️ REMOVER REGISTROS")
    .setBackground("#7B1A1A").setFontColor("#FFFFFF")
    .setFontWeight("bold").setFontSize(10).setHorizontalAlignment("center");
  aba.setRowHeight(13, 32);

  aba.getRange(14, 11).setValue("🗑️ Ação")
    .setBackground("#C0392B").setFontColor("#FFFFFF")
    .setFontWeight("bold").setHorizontalAlignment("center").setWrap(true);
  aba.getRange(14, 12).setValue("✅ Confirmar")
    .setBackground("#C0392B").setFontColor("#FFFFFF")
    .setFontWeight("bold").setHorizontalAlignment("center").setWrap(true);
  aba.setRowHeight(14, 35);

  const validacaoRemover = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Remover linha", "Remover tudo"], true)
    .setAllowInvalid(false).build();
  aba.getRange(15, FORM_COL_REMOVER).setDataValidation(validacaoRemover)
    .setBackground("#FDECEA").setHorizontalAlignment("center");
  aba.getRange(15, FORM_COL_CONF_REM).insertCheckboxes()
    .setBackground("#FDECEA").setHorizontalAlignment("center");
  aba.setRowHeight(15, 40);
  aba.getRange(13, 11, 3, 2).setBorder(true, true, true, true, true, true, "#8B0000", SpreadsheetApp.BorderStyle.SOLID);

  aba.getRange("B13:I13").merge()
    .setValue("📋 IMPRESSÕES REGISTRADAS")
    .setBackground("#1B3A6B").setFontColor("#FFFFFF")
    .setFontWeight("bold").setFontSize(11).setHorizontalAlignment("center");
  aba.getRange("B13:I13").setBorder(true, true, true, true, true, true, "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID);
  aba.setRowHeight(13, 35);

  aba.getRange(14, 2, 1, 8).setValues([[
    "Nome", "Tipo de Impressão", "Folhas", "Folha Offset",
    "Projeto Canva", "Trabalho", "Valor Total", "Data/Hora"
  ]]).setBackground("#2E6DB4").setFontColor("#FFFFFF")
    .setFontWeight("bold").setHorizontalAlignment("center").setWrap(true);
  aba.getRange(14, 2, 1, 8).setBorder(true, true, true, true, true, true, "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID);
  aba.setRowHeight(14, 40);

  aba.getRange(15, 2, 1, 8).setValues([[
    "Ex: João Silva", "Xerox Preto e Branco", 10, 0, 0, 0, 5.00, "Ex: 16/03/2026 14:30:00"
  ]]).setBackground("#F5F5F5").setFontColor("#9E9E9E")
    .setFontStyle("italic").setHorizontalAlignment("center");
  aba.getRange(15, 2, 1, 8).setBorder(true, true, true, true, true, true, "#BDBDBD", SpreadsheetApp.BorderStyle.SOLID);
  aba.getRange(15, REG_COL_VALOR_TOT).setNumberFormat("R$ 0.00");
  aba.setRowHeight(15, 26);

  aba.setColumnWidth(1,  20);
  aba.setColumnWidth(2,  160);
  aba.setColumnWidth(3,  180);
  aba.setColumnWidth(4,  70);
  aba.setColumnWidth(5,  80);
  aba.setColumnWidth(6,  100);
  aba.setColumnWidth(7,  100);
  aba.setColumnWidth(8,  110);
  aba.setColumnWidth(9,  130);
  aba.setColumnWidth(10, 8);
  aba.setColumnWidth(11, 130);
  aba.setColumnWidth(12, 120);
  aba.setFrozenRows(0);

  estilizarAbasDados();
  Logger.log("Aba 'Adicionar' criada com sucesso!");
}