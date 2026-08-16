// ============================================================
// NexaTalk AI - Central do Operador (Fase 5)
// ------------------------------------------------------------
// Sessão do operador, fila em tempo real (Firestore), ações do
// atendimento (validar área, responder, concluir) e o Copiloto
// NexaIA: insights da fila, plano de ação, resposta pronta e
// resolução com 1 clique — a IA faz o trabalho pesado.
// ============================================================

// ===================== SESSÃO (protótipo) =====================
// Acesso demonstrativo da equipe operacional. Na evolução, isto
// vira Firebase Auth com papel (custom claim) de operador.
const OPS_OPERADORES = [
  { email: "operador@nexatalk.com", senha: "nexa123", nome: "Ana Operadora", cargo: "Atendimento N1" },
  { email: "supervisor@nexatalk.com", senha: "nexa123", nome: "Carlos Supervisor", cargo: "Supervisão" },
];

function opsEntrar(email, senha) {
  const achado = OPS_OPERADORES.find(function (o) {
    return o.email === (email || "").trim().toLowerCase() && o.senha === senha;
  });
  if (!achado) return null;
  sessionStorage.setItem("nexatalk_operador", JSON.stringify({
    nome: achado.nome, email: achado.email, cargo: achado.cargo,
  }));
  return achado;
}

function opsOperadorAtual() {
  try {
    return JSON.parse(sessionStorage.getItem("nexatalk_operador"));
  } catch (e) {
    return null;
  }
}

function opsExigirLogin() {
  const op = opsOperadorAtual();
  if (!op) window.location.href = "login.html";
  return op;
}

function opsSair() {
  sessionStorage.removeItem("nexatalk_operador");
  window.location.href = "login.html";
}

// Iniciais para o avatar (ex: "Ana Operadora" -> "AO")
function opsIniciais(nome) {
  return (nome || "?").trim().split(/\s+/).slice(0, 2).map(function (p) {
    return p[0] ? p[0].toUpperCase() : "";
  }).join("");
}

// ===================== FILA (tempo real) =====================

// Assina a coleção inteira: qualquer chamado aberto pelo cliente
// aparece na fila do operador na hora, sem recarregar a página.
function opsAssinarAtendimentos(aoAtualizar, aoErrar) {
  return db.collection("atendimentos").onSnapshot(function (snap) {
    const lista = [];
    snap.forEach(function (doc) {
      lista.push(Object.assign({ id: doc.id }, doc.data()));
    });
    aoAtualizar(ordenarPorMaisRecente(lista));
  }, function (erro) {
    console.error(erro);
    if (aoErrar) aoErrar(erro);
  });
}

// Peso da prioridade para a ordenação inteligente da fila
function opsPesoPrioridade(a) {
  const p = ((a && a.prioridade) || "").toLowerCase();
  if (p.indexOf("alta") >= 0) return 3;
  if (p.indexOf("m") === 0) return 2; // média / medio
  if (p.indexOf("baixa") >= 0) return 1;
  return 0;
}

// Ordena por urgência: prioridade alta primeiro, frustração conta,
// concluídos vão para o fim. Empate = mais recente primeiro.
function opsOrdenarPorUrgencia(lista) {
  const copia = lista.slice();
  copia.sort(function (a, b) {
    const fa = atendimentoFinalizadoParaCliente(a.status) ? 1 : 0;
    const fb = atendimentoFinalizadoParaCliente(b.status) ? 1 : 0;
    if (fa !== fb) return fa - fb;

    const ua = opsPesoPrioridade(a) + (opsSentimentoNegativo(a) ? 0.5 : 0);
    const ub = opsPesoPrioridade(b) + (opsSentimentoNegativo(b) ? 0.5 : 0);
    if (ua !== ub) return ub - ua;

    const ta = a.data_criacao_ts ? a.data_criacao_ts.seconds : 0;
    const tb = b.data_criacao_ts ? b.data_criacao_ts.seconds : 0;
    return tb - ta;
  });
  return copia;
}

function opsSentimentoNegativo(a) {
  const s = ((a.ia && a.ia.sentimento) || "").toLowerCase();
  return s.indexOf("frustrad") >= 0 || s.indexOf("preocupad") >= 0;
}

function opsParseSlaMinutos(texto) {
  const t = (texto || "").toLowerCase().replace(/~/g, " ").trim();
  if (!t) return 24 * 60;
  const m = t.match(/(\d+(?:[.,]\d+)?)/);
  const num = m ? parseFloat(m[1].replace(",", ".")) : 24;
  if (/min/.test(t)) return Math.max(1, Math.round(num));
  if (/dia/.test(t)) return Math.round(num * 24 * 60);
  if (/hora/.test(t) || /h\b/.test(t)) return Math.round(num * 60);
  return Math.round(num * 60);
}

function opsSlaInfo(a) {
  if (!a || atendimentoFinalizadoParaCliente(a.status)) {
    return { estado: "ok", rotulo: "—", restanteMin: null };
  }
  const limite = opsParseSlaMinutos(a.ia && a.ia.sla_sugerido);
  const inicio = a.data_criacao_ts && a.data_criacao_ts.seconds
    ? a.data_criacao_ts.seconds * 1000
    : Date.now();
  const restanteMin = Math.round((inicio + limite * 60 * 1000 - Date.now()) / 60000);
  let estado = "ok";
  if (restanteMin <= 0) estado = "estourado";
  else if (restanteMin <= Math.max(30, limite * 0.2)) estado = "alerta";
  let rotulo;
  if (restanteMin <= 0) rotulo = "estourou " + Math.abs(restanteMin) + " min";
  else if (restanteMin < 60) rotulo = restanteMin + " min";
  else rotulo = Math.round(restanteMin / 60) + " h";
  return { estado: estado, rotulo: rotulo, restanteMin: restanteMin, limite: limite };
}

function opsChipSla(a) {
  const info = opsSlaInfo(a);
  if (info.rotulo === "—") return '<span class="sla-chip ok">—</span>';
  const icone = info.estado === "estourado" ? "bi-exclamation-octagon" :
    info.estado === "alerta" ? "bi-hourglass-split" : "bi-clock";
  return '<span class="sla-chip ' + info.estado + '"><i class="bi ' + icone + '"></i> ' + info.rotulo + "</span>";
}

function opsChurn(a) {
  const texto = ((a.descricao_original || "") + " " + ((a.ia && a.ia.observacao) || "") + " " +
    ((a.ia && a.ia.resumo) || "")).toLowerCase();
  const juridico = /procon|jur[ií]dic|processo|advogad|lgpd|anatel/.test(texto);
  const fraude = /fraude|clonad|invadid|acesso indevido|vazamento/.test(texto);
  const financeiro = /estorno|reembolso|cobran[cç]a (indevida|duplicada)|cancel/.test(texto);
  const ruim = opsSentimentoNegativo(a);
  const alta = ((a.prioridade || "").toLowerCase().indexOf("alta") >= 0);

  if (!(juridico || fraude || (financeiro && ruim) || (alta && ruim && financeiro))) return null;

  const passos = [];
  if (juridico) passos.push("Registrar o caso como risco legal e responder por escrito em até 1 hora.");
  if (fraude) passos.push("Acionar o protocolo de segurança da conta (bloquear acesso suspeito).");
  if (financeiro) passos.push("Oferecer crédito/compensação proporcional e confirmar o valor com o cliente.");
  passos.push("Ligar para o cliente em até 1 hora — retenção vale mais que o ticket.");
  passos.push("Não deixar o caso na fila sem dono: atribua a si e atualize o status.");

  return {
    titulo: fraude ? "Risco de fraude / perda de confiança" : "Risco de perda de cliente (churn)",
    motivo: juridico ? "Menção a Procon/jurídico" : financeiro ? "Cobrança/cancelamento + humor negativo" : "Prioridade alta e cliente insatisfeito",
    passos: passos.slice(0, 4),
  };
}

// ===================== AÇÕES DO OPERADOR =====================

function opsAgoraTexto() {
  return new Date().toLocaleDateString("pt-BR") + " às " +
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// Valida ou redireciona a área sugerida pela IA (D3)
async function opsValidarArea(id, dados) {
  const atualizacao = {
    area_validada: true,
    ultima_atualizacao_ts: firebase.firestore.FieldValue.serverTimestamp(),
    historico: firebase.firestore.FieldValue.arrayUnion({
      evento: dados.correta
        ? "Área validada pelo operador (IA acertou o encaminhamento)"
        : "Atendimento redirecionado para " + dados.novaArea,
      status: "Em análise",
      responsavel: dados.operador || "Operador",
      mensagem: dados.justificativa || "",
      data: opsAgoraTexto(),
    }),
  };
  if (!dados.correta && dados.novaArea) {
    atualizacao.area_atual = dados.novaArea;
    atualizacao.justificativa_redirecionamento = dados.justificativa || "";
  }
  await db.collection("atendimentos").doc(id).update(atualizacao);
}

// Assume / atribui o caso a um operador (sai da IA, entra o humano)
async function opsAtribuir(id, nomeOperador, eventoTexto) {
  await db.collection("atendimentos").doc(id).update({
    atribuido_a: nomeOperador,
    tratado_por: "operador",
    ultima_atualizacao_ts: firebase.firestore.FieldValue.serverTimestamp(),
    historico: firebase.firestore.FieldValue.arrayUnion({
      evento: eventoTexto || "Atendimento atribuído",
      status: "Em análise",
      responsavel: nomeOperador,
      mensagem: "Caso assumido por " + nomeOperador + ".",
      data: opsAgoraTexto(),
    }),
  });
}

// Envia resposta ao cliente sem encerrar (aparece na tela de
// detalhes do cliente como "Mensagem da operação")
async function opsResponderCliente(id, mensagem, nomeOperador) {
  await db.collection("atendimentos").doc(id).update({
    mensagem_operacao: mensagem,
    atribuido_a: nomeOperador,
    ultima_atualizacao_ts: firebase.firestore.FieldValue.serverTimestamp(),
    historico: firebase.firestore.FieldValue.arrayUnion({
      evento: "Resposta enviada ao cliente",
      status: "Em análise",
      responsavel: nomeOperador,
      mensagem: mensagem,
      data: opsAgoraTexto(),
    }),
  });
}

// Concluir usa concluirAtendimentoPeloOperador() do js/firebase.js

// ===================== APOIO VISUAL =====================

function opsBadgeStatus(status) {
  const s = (status || "").toLowerCase();
  if (s.indexOf("conclu") >= 0) return '<span class="status-badge status-concluido"><i class="bi bi-check-circle"></i> Concluído</span>';
  if (s.indexOf("resolvido") >= 0) return '<span class="status-badge status-ia"><i class="bi bi-robot"></i> Resolvido pela IA</span>';
  if (s.indexOf("recebido") >= 0) return '<span class="status-badge status-recebido"><i class="bi bi-inbox"></i> Recebido</span>';
  return '<span class="status-badge status-analise"><i class="bi bi-arrow-repeat"></i> Em análise</span>';
}

function opsBadgePrioridade(prioridade) {
  const p = (prioridade || "").toLowerCase();
  if (p.indexOf("alta") >= 0) return '<span class="badge-nivel alta"><i class="bi bi-lightning-charge"></i> Alta</span>';
  if (p.indexOf("m") === 0) return '<span class="badge-nivel media">Média</span>';
  if (p.indexOf("baixa") >= 0) return '<span class="badge-nivel baixa">Baixa</span>';
  return '<span class="badge-nivel baixa">—</span>';
}

function opsIconeSentimento(a) {
  const s = ((a.ia && a.ia.sentimento) || "").toLowerCase();
  if (s.indexOf("positiv") >= 0) return '<i class="bi bi-emoji-smile sent-icone sentimento-positivo" title="Positivo"></i>';
  if (s.indexOf("frustrad") >= 0) return '<i class="bi bi-emoji-angry sent-icone sentimento-frustrado" title="Frustrado"></i>';
  if (s.indexOf("preocupad") >= 0) return '<i class="bi bi-emoji-frown sent-icone sentimento-preocupado" title="Preocupado"></i>';
  return '<i class="bi bi-emoji-neutral sent-icone sentimento-neutro" title="Neutro"></i>';
}

// Porcentagem 0-100 (aceita fração 0.95)
function opsPorcentagem(valor) {
  let n = parseFloat(valor) || 0;
  if (n > 0 && n <= 1) n = n * 100;
  return Math.round(n);
}

// Pinta um donut (gauge circular) — mesmo visual da tela do cliente
function opsPintarDonut(id, pct, cor) {
  const el = document.getElementById(id);
  if (!el) return;
  const graus = Math.round((pct / 100) * 360);
  el.style.background = "conic-gradient(" + cor + " " + graus + "deg, rgba(255,255,255,0.08) " + graus + "deg)";
}

// Toast flutuante de feedback
function opsToast(texto, ehErro) {
  const antigo = document.querySelector(".ops-toast");
  if (antigo) antigo.remove();
  const el = document.createElement("div");
  el.className = "ops-toast" + (ehErro ? " erro" : "");
  el.innerHTML = '<i class="bi ' + (ehErro ? "bi-x-circle" : "bi-check-circle") + '"></i> ' + texto;
  document.body.appendChild(el);
  setTimeout(function () { el.remove(); }, 3800);
}

// Monta o HTML da sidebar (mesma em todas as telas do operador)
function opsMontarSidebar(telaAtiva) {
  const op = opsOperadorAtual() || { nome: "Operador", cargo: "" };
  return (
    '<aside class="ops-sidebar">' +
      '<div class="ops-logo">' +
        '<div class="icone"><i class="bi bi-robot"></i></div>' +
        '<div><div class="nome">NexaTalk AI</div><div class="sub">Central Operacional</div></div>' +
      "</div>" +
      '<nav class="ops-nav">' +
        '<div class="rotulo-nav">Operação</div>' +
        '<a href="fila.html" class="' + (telaAtiva === "fila" ? "ativo" : "") + '"><i class="bi bi-list-task"></i> Fila de Atendimentos</a>' +
        '<a href="comando.html" class="' + (telaAtiva === "comando" ? "ativo" : "") + '"><i class="bi bi-graph-up-arrow"></i> Centro de Comando</a>' +
        '<div class="rotulo-nav">Modo Jogo</div>' +
        '<a href="arena.html" class="' + (telaAtiva === "arena" ? "ativo" : "") + '"><i class="bi bi-trophy"></i> Arena ao Vivo</a>' +
        '<a href="perfil.html" class="' + (telaAtiva === "perfil" ? "ativo" : "") + '"><i class="bi bi-controller"></i> Meu Desempenho</a>' +
        '<a href="dojo.html" class="' + (telaAtiva === "dojo" ? "ativo" : "") + '"><i class="bi bi-mortarboard"></i> Dojo de Treinamento</a>' +
        '<div class="rotulo-nav">Inteligência</div>' +
        '<a href="conhecimento.html" class="' + (telaAtiva === "conhecimento" ? "ativo" : "") + '"><i class="bi bi-journal-bookmark"></i> Base de Conhecimento</a>' +
        '<div class="rotulo-nav">Atalhos</div>' +
        '<a href="../index.html"><i class="bi bi-phone"></i> App do Cliente</a>' +
        '<a href="ingestao.html" class="' + (telaAtiva === "ingestao" ? "ativo" : "") + '"><i class="bi bi-database-down"></i> Ingestão de Dados</a>' +
      "</nav>" +
      '<div class="rodape">' +
        '<div class="ops-chip-operador">' +
          '<div class="avatar">' + opsIniciais(op.nome) + "</div>" +
          '<div><div class="nome">' + op.nome + '</div><div class="cargo">' + (op.cargo || "Equipe NexaTalk") + "</div></div>" +
        "</div>" +
        '<a href="#" onclick="opsSair(); return false;" class="btn-roxo-claro" style="display:block; text-align:center; padding:10px; font-size:0.88rem;">' +
          '<i class="bi bi-box-arrow-right me-1"></i> Sair' +
        "</a>" +
      "</div>" +
    "</aside>"
  );
}

// ===================== RISCOS (análise local, sem custo de API) =====================
function opsRiscos(a) {
  const alertas = [];
  const texto = ((a.descricao_original || "") + " " + ((a.ia && a.ia.observacao) || "")).toLowerCase();

  if (/procon|jur[ií]dic|processo|advogad|lgpd/.test(texto)) {
    alertas.push({ nivel: "alto", texto: "Menção a Procon/jurídico — priorize e responda com cuidado formal." });
  }
  if (/fraude|clonad|invadid|acesso indevido|vazamento/.test(texto)) {
    alertas.push({ nivel: "alto", texto: "Possível fraude/segurança — siga o protocolo de segurança da conta." });
  }
  if (/estorno|reembolso|devolu[cç][aã]o|cobran[cç]a (indevida|duplicada)/.test(texto)) {
    alertas.push({ nivel: "medio", texto: "Caso financeiro sensível (estorno/reembolso) — confirme valores antes de responder." });
  }
  if (opsSentimentoNegativo(a)) {
    alertas.push({ nivel: "medio", texto: "Cliente " + ((a.ia && a.ia.sentimento) || "insatisfeito").toLowerCase() + " — use tom empático e objetivo." });
  }
  if (((a.prioridade || "").toLowerCase().indexOf("alta") >= 0)) {
    alertas.push({ nivel: "medio", texto: "Prioridade ALTA definida pela IA — SLA sugerido: " + ((a.ia && a.ia.sla_sugerido) || "o quanto antes") + "." });
  }
  const churn = opsChurn(a);
  if (churn) {
    alertas.unshift({ nivel: "alto", texto: churn.titulo + " — " + churn.motivo + ". Siga o playbook de retenção." });
  }
  if (alertas.length === 0) {
    alertas.push({ nivel: "ok", texto: "Nenhum risco detectado — caso tranquilo, pode seguir o plano de ação." });
  }
  return alertas;
}

// ===================== IA (Gemini via nexaiaPerguntar) =====================

function opsLinhaCaso(a) {
  return "- " + (a.protocolo || "?") +
    " | cliente: " + ((a.cliente && a.cliente.nome) || "?") +
    " | status: " + (a.status || "?") +
    " | prioridade: " + (a.prioridade || "?") +
    " | sentimento: " + ((a.ia && a.ia.sentimento) || "?") +
    " | assunto: " + (((a.ia && a.ia.resumo) || a.descricao_original || "").slice(0, 110));
}

// Insights gerais da fila (D2): o que atacar primeiro e por quê
async function opsInsightsFila(lista) {
  const linhas = lista.slice(0, 15).map(opsLinhaCaso).join("\n");
  return nexaiaPerguntar(
    "Você é a NexaIA, copiloto da equipe de atendimento da NexaTalk AI. " +
    "Analise a fila de atendimentos abaixo e devolva, em português, no máximo 4 linhas curtas no formato:\n" +
    "🎯 Atacar primeiro: <protocolo> — <motivo em poucas palavras>\n" +
    "⚠️ Atenção: <padrão de risco ou cliente insatisfeito, se houver>\n" +
    "📈 Padrão: <tendência ou tema repetido na fila, se houver>\n" +
    "💡 Dica: <uma sugestão prática para a equipe>\n" +
    "Sem introdução, sem despedida, sem markdown além dos emojis.\n\nFila:\n" + linhas
  );
}

// Plano de ação passo a passo para o operador resolver o caso (D3)
async function opsPlanoDeAcao(a) {
  const bruto = await nexaiaPerguntar(
    "Você é a NexaIA, copiloto do operador de atendimento da NexaTalk AI. " +
    "Monte um plano de ação para o OPERADOR resolver o caso abaixo. " +
    'Responda APENAS com JSON válido neste formato: {"passos": ["passo 1", "passo 2", "..."], "tom": "tom de voz recomendado na resposta em poucas palavras", "risco": "Baixo, Médio ou Alto"}. ' +
    "De 3 a 5 passos, cada um com no máximo 90 caracteres, começando com verbo de ação.\n\n" +
    "Caso:\n" +
    "Cliente: " + ((a.cliente && a.cliente.nome) || "?") + "\n" +
    "Mensagem: " + (a.descricao_original || "") + "\n" +
    "Resumo da IA: " + ((a.ia && a.ia.resumo) || "") + "\n" +
    "Intenção: " + (a.intencao || "") + " | Área: " + (a.area_atual || "") +
    " | Prioridade: " + (a.prioridade || "") + " | Sentimento: " + ((a.ia && a.ia.sentimento) || "")
  );
  const limpo = bruto.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(limpo);
  } catch (e) {
    return { passos: limpo.split("\n").filter(function (l) { return l.trim() !== ""; }).slice(0, 5), tom: "", risco: "" };
  }
}

// Gera a resposta final pronta para enviar ao cliente (D3)
async function opsGerarResposta(a, nomeOperador) {
  return nexaiaPerguntar(
    "Você é a NexaIA e vai escrever a resposta OFICIAL da empresa NexaTalk AI para o cliente. " +
    "Escreva em português, cordial e objetiva, resolvendo ou encaminhando claramente o caso abaixo. " +
    "Comece cumprimentando o cliente pelo primeiro nome, use passos numerados se for orientação, " +
    "máximo 600 caracteres, e assine como \"" + (nomeOperador || "Equipe NexaTalk") + " · Equipe NexaTalk AI\". " +
    "Responda APENAS com o texto da mensagem, sem aspas.\n\n" +
    "Cliente: " + ((a.cliente && a.cliente.nome) || "") + "\n" +
    "Mensagem do cliente: " + (a.descricao_original || "") + "\n" +
    "Resumo da IA: " + ((a.ia && a.ia.resumo) || "") + "\n" +
    "Próxima ação sugerida: " + ((a.ia && a.ia.proxima_acao) || "") + "\n" +
    "Área responsável: " + (a.area_atual || "")
  );
}

// Melhora o rascunho digitado pelo operador (D3)
async function opsMelhorarResposta(a, rascunho) {
  return nexaiaPerguntar(
    "Você é a NexaIA, copiloto de atendimento. Reescreva o rascunho do operador deixando-o " +
    "mais claro, cordial e profissional, mantendo todas as informações (valores, datas, números). " +
    "Português, máximo 600 caracteres. Responda APENAS com o texto reescrito, sem aspas.\n\n" +
    "Contexto do caso: " + ((a.ia && a.ia.resumo) || a.descricao_original || "") + "\n" +
    'Rascunho do operador: "' + rascunho + '"'
  );
}
