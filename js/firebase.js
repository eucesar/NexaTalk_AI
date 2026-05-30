// ============================================================
// NexaTalk AI - Conexão com o Firebase (Auth + Firestore)
// ------------------------------------------------------------
// Inicializa o Firebase e oferece funções de:
//  - Autenticação (criar conta, entrar, sair)
//  - Banco de dados (salvar e listar atendimentos)
// ============================================================

// Inicializa o app do Firebase
firebase.initializeApp(FIREBASE_CONFIG);

// Referências aos serviços
const db = firebase.firestore();
const auth = firebase.auth();

// ===================== AUTENTICAÇÃO =====================

// Cria uma nova conta (e salva o usuário também no Firestore)
async function criarConta(nome, email, senha) {
  const credencial = await auth.createUserWithEmailAndPassword(email, senha);
  await credencial.user.updateProfile({ displayName: nome });

  // Guarda o usuário na coleção "usuarios" (sincronizado com o banco)
  await db.collection("usuarios").doc(credencial.user.uid).set({
    nome: nome,
    email: email,
    criado_em: firebase.firestore.FieldValue.serverTimestamp(),
  });

  return credencial.user;
}

// Faz login com e-mail e senha
async function entrar(email, senha) {
  const credencial = await auth.signInWithEmailAndPassword(email, senha);
  return credencial.user;
}

// Sai da conta
async function sair() {
  await auth.signOut();
}

// Traduz os erros do Firebase para mensagens amigáveis em português
function traduzErroAuth(codigo) {
  const mensagens = {
    "auth/invalid-email": "E-mail inválido.",
    "auth/missing-password": "Informe a senha.",
    "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
    "auth/email-already-in-use": "Este e-mail já está cadastrado.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
    "auth/operation-not-allowed": "Ative o login por e-mail/senha no Firebase (Authentication).",
    "auth/configuration-not-found": "Ative o Authentication no Firebase (Authentication > Sign-in method > E-mail/senha).",
    "auth/network-request-failed": "Falha de conexão. Verifique sua internet.",
  };
  return mensagens[codigo] || "Ocorreu um erro. Tente novamente.";
}

// ===================== FIRESTORE =====================

// Salva um atendimento e devolve o ID gerado pelo Firestore
async function salvarAtendimento(dados) {
  const referencia = await db.collection("atendimentos").add(dados);
  return referencia.id;
}

// Lista os atendimentos do usuário logado (ordenados do mais novo p/ o mais antigo)
async function listarMeusAtendimentos(usuarioId) {
  const consulta = await db
    .collection("atendimentos")
    .where("usuario_id", "==", usuarioId)
    .get();

  const lista = [];
  consulta.forEach(function (doc) {
    lista.push(Object.assign({ id: doc.id }, doc.data()));
  });

  // Ordena pela data de criação (mais recentes primeiro)
  lista.sort(function (a, b) {
    const ta = a.data_criacao_ts ? a.data_criacao_ts.seconds : 0;
    const tb = b.data_criacao_ts ? b.data_criacao_ts.seconds : 0;
    return tb - ta;
  });

  return lista;
}

// Gera um número de protocolo no formato #ATD-ANO-XXXXX
function gerarProtocolo() {
  const ano = new Date().getFullYear();
  const numero = Math.floor(10000 + Math.random() * 90000); // 5 dígitos
  return "#ATD-" + ano + "-" + numero;
}

// Garante porcentagem como inteiro 0-100 (aceita fração como 0.95)
function porcentagemInteira(valor) {
  let n = parseFloat(valor) || 0;
  if (n > 0 && n <= 1) n = n * 100;
  return Math.round(n);
}

// ============================================================
// Monta o documento RICO e PADRONIZADO do atendimento.
// Usado tanto na triagem (resolvido pela IA) quanto na tela de
// confirmação (encaminhado), garantindo a MESMA estrutura no
// banco para as telas do operador lerem sem erro.
// ============================================================
function montarAtendimento(dados) {
  const a = dados.analise || {};
  const nome = dados.nome || "";
  const contato = dados.contato || "";
  const descricao = dados.descricao || "";
  const dataTexto = dados.dataTexto || new Date().toLocaleString("pt-BR");
  const status = dados.status || "Em análise";
  const ehEmail = contato.includes("@");
  const carimbo = firebase.firestore.FieldValue.serverTimestamp();

  // Histórico/timeline conforme o desfecho
  const historico = [
    {
      evento: "Atendimento aberto pelo cliente",
      status: "Recebido",
      responsavel: nome || "Cliente",
      mensagem: descricao,
      data: dataTexto,
    },
  ];
  if (status === "Resolvido pela IA") {
    historico.push({
      evento: "Resolvido automaticamente pela IA",
      status: "Resolvido pela IA",
      responsavel: "IA (" + GEMINI_CONFIG.model + ")",
      mensagem: a.resposta_automatica || a.resumo || "",
      data: dataTexto,
    });
  } else {
    historico.push({
      evento: "Mensagem analisada pela IA",
      status: "Em análise",
      responsavel: "IA (" + GEMINI_CONFIG.model + ")",
      mensagem: a.resumo || "",
      data: dataTexto,
    });
  }

  return {
    // Identificação
    protocolo: dados.protocolo,
    usuario_id: dados.usuarioId || "",
    canal: "Portal Web",
    origem: "cliente",

    // Dados do cliente (visão do operador - D3)
    cliente: {
      nome: nome,
      contato: contato,
      email: ehEmail ? contato : "",
      telefone: ehEmail ? "" : contato,
    },

    // Mensagem original
    descricao_original: descricao,

    // Análise da IA (bloco completo e enriquecido)
    ia: {
      resumo: a.resumo || "",
      intencao: a.intencao || "",
      encaminhamento_sugerido: a.encaminhamento || "",
      prioridade: a.prioridade || "",
      confianca: porcentagemInteira(a.confianca),
      tempo_estimado: a.tempo_estimado || "",
      observacao: a.observacao || "",
      categoria: a.categoria || "",
      subcategoria: a.subcategoria || "",
      sentimento: a.sentimento || "",
      tags: a.tags || [],
      dados_detectados: a.dados_detectados || "",
      resposta_sugerida: a.resposta_sugerida || "",
      proxima_acao: a.proxima_acao || "",
      complexidade: a.complexidade || "",
      tempo_espera_fila: a.tempo_espera_fila || "",
      sla_sugerido: a.sla_sugerido || "",
      probabilidade_primeira_resposta: porcentagemInteira(a.probabilidade_primeira_resposta),
      auto_resolvivel: a.auto_resolvivel || false,
      resposta_automatica: a.resposta_automatica || "",
      modelo: GEMINI_CONFIG.model,
      analisado_em: dataTexto,
    },

    // Campos rasos para a LISTA do operador (D2)
    intencao: a.intencao || "",
    prioridade: a.prioridade || "",
    status: status,

    // Validação / atribuição pelo operador (D3)
    area_atual: a.encaminhamento || "",
    area_validada: false,
    justificativa_redirecionamento: "",
    atribuido_a: "",
    mensagem_operacao: "",

    // Datas
    data_criacao: dataTexto,
    data_criacao_ts: carimbo,
    ultima_atualizacao_ts: carimbo,

    // Histórico / Timeline (D4)
    historico: historico,
  };
}
