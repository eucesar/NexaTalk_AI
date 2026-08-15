// ============================================================
// NexaTalk AI - Modo Jogo (gamificação com Firebase + IA)
// ------------------------------------------------------------
// Perfis de jogo para CLIENTES e OPERADORES: XP, níveis com
// títulos, conquistas, avaliação de qualidade da tratativa
// pela NexaIA (empatia / clareza / detalhe) e feed de eventos
// em tempo real para a Arena ao Vivo.
//
// Coleções no Firestore:
//  - perfis_jogo/{id} : xp, contadores e somas de qualidade
//      id do operador = "op_" + email normalizado
//      id do cliente  = uid do Firebase Auth
//  - eventos_jogo     : feed do que acontece (quem ganhou XP)
// ============================================================

// ===================== NÍVEIS =====================
const JOGO_XP_NIVEIS = [0, 100, 300, 700, 1200, 2000];

const JOGO_TITULOS_OPERADOR = [
  "Recruta do Suporte", "Agente em Ascensão", "Guardião de Clientes",
  "Especialista Nexa", "Mestre das Tratativas", "Lenda do Atendimento",
];

const JOGO_TITULOS_CLIENTE = [
  "Iniciante Nexa", "Explorador", "Cliente Estrela",
  "Parceiro Nexa", "Embaixador", "Lenda Nexa",
];

// Calcula nível, título e progresso até o próximo nível
function jogoNivel(xp, tipo) {
  const titulos = tipo === "cliente" ? JOGO_TITULOS_CLIENTE : JOGO_TITULOS_OPERADOR;
  xp = xp || 0;
  let idx = 0;
  for (let i = 0; i < JOGO_XP_NIVEIS.length; i++) {
    if (xp >= JOGO_XP_NIVEIS[i]) idx = i;
  }
  const base = JOGO_XP_NIVEIS[idx];
  const proximo = idx < JOGO_XP_NIVEIS.length - 1 ? JOGO_XP_NIVEIS[idx + 1] : null;
  const progresso = proximo === null ? 100 : Math.min(100, Math.round(((xp - base) / (proximo - base)) * 100));
  return {
    numero: idx + 1,
    titulo: titulos[idx],
    xpBase: base,
    xpProximo: proximo,
    progresso: progresso,
    maximo: proximo === null,
  };
}

// Id do perfil do operador a partir do e-mail
function jogoIdOperador(email) {
  return "op_" + (email || "").toLowerCase().replace(/[^a-z0-9]/g, "_");
}

function jogoClamp(valor) {
  let n = parseFloat(valor) || 0;
  if (n > 0 && n <= 1) n = n * 100;
  return Math.max(0, Math.min(100, Math.round(n)));
}

// ===================== XP E FEED =====================

// Dá XP, atualiza contadores e publica no feed da Arena.
// Nunca lança erro: gamificação jamais quebra o fluxo principal.
async function jogoDarXp(dados) {
  if (!dados || !dados.id) return;
  try {
    const atualizacao = {
      tipo: dados.tipo,
      nome: dados.nome || "Jogador",
      xp: firebase.firestore.FieldValue.increment(dados.xp || 0),
      ultima_acao: dados.acao || "",
      ultima_acao_ts: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if (dados.cargo) atualizacao.cargo = dados.cargo;
    Object.keys(dados.contadores || {}).forEach(function (campo) {
      atualizacao[campo] = firebase.firestore.FieldValue.increment(dados.contadores[campo]);
    });
    await db.collection("perfis_jogo").doc(dados.id).set(atualizacao, { merge: true });

    await db.collection("eventos_jogo").add({
      tipo: dados.tipo,
      nome: dados.nome || "Jogador",
      texto: dados.acao || "",
      xp: dados.xp || 0,
      icone: dados.icone || "bi-stars",
      criado_em: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error("Gamificação (XP):", e);
  }
}

// Soma uma avaliação de qualidade (IA) ao perfil do operador
async function jogoRegistrarAvaliacao(idPerfil, av, protocolo) {
  if (!idPerfil || !av) return;
  try {
    await db.collection("perfis_jogo").doc(idPerfil).set({
      soma_empatia: firebase.firestore.FieldValue.increment(av.empatia),
      soma_clareza: firebase.firestore.FieldValue.increment(av.clareza),
      soma_detalhe: firebase.firestore.FieldValue.increment(av.detalhe),
      avaliacoes: firebase.firestore.FieldValue.increment(1),
      ultimas_avaliacoes: firebase.firestore.FieldValue.arrayUnion({
        protocolo: protocolo || "",
        empatia: av.empatia,
        clareza: av.clareza,
        detalhe: av.detalhe,
        comentario: av.comentario || "",
        data: new Date().toLocaleDateString("pt-BR") + " às " +
          new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      }),
    }, { merge: true });
  } catch (e) {
    console.error("Gamificação (avaliação):", e);
  }
}

// Médias de qualidade do perfil (null se ainda não há avaliações)
function jogoMedias(p) {
  const n = (p && p.avaliacoes) || 0;
  if (n === 0) return null;
  const empatia = Math.round((p.soma_empatia || 0) / n);
  const clareza = Math.round((p.soma_clareza || 0) / n);
  const detalhe = Math.round((p.soma_detalhe || 0) / n);
  return { empatia: empatia, clareza: clareza, detalhe: detalhe, geral: Math.round((empatia + clareza + detalhe) / 3) };
}

// ===================== LEITURA (tempo real) =====================

function jogoAssinarPerfil(id, aoAtualizar) {
  return db.collection("perfis_jogo").doc(id).onSnapshot(function (doc) {
    aoAtualizar(doc.exists ? doc.data() : null);
  }, function (e) {
    console.error(e);
    aoAtualizar(null);
  });
}

// Ranking dos operadores (ordenado por XP, ao vivo)
function jogoAssinarRanking(aoAtualizar) {
  return db.collection("perfis_jogo").onSnapshot(function (snap) {
    const lista = [];
    snap.forEach(function (doc) {
      const p = Object.assign({ id: doc.id }, doc.data());
      if (p.tipo === "operador") lista.push(p);
    });
    lista.sort(function (a, b) { return (b.xp || 0) - (a.xp || 0); });
    aoAtualizar(lista);
  }, function (e) { console.error(e); });
}

// Feed de eventos (últimos acontecimentos, ao vivo)
function jogoAssinarFeed(aoAtualizar) {
  return db.collection("eventos_jogo")
    .orderBy("criado_em", "desc")
    .limit(14)
    .onSnapshot(function (snap) {
      const lista = [];
      snap.forEach(function (doc) {
        lista.push(Object.assign({ id: doc.id }, doc.data()));
      });
      aoAtualizar(lista);
    }, function (e) { console.error(e); });
}

async function jogoBuscarPerfil(id) {
  try {
    const doc = await db.collection("perfis_jogo").doc(id).get();
    return doc.exists ? doc.data() : null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

// "há 3 min", "agora", "há 2 h"...
function jogoTempoRelativo(ts) {
  if (!ts || !ts.seconds) return "agora";
  const seg = Math.max(0, Math.floor(Date.now() / 1000 - ts.seconds));
  if (seg < 60) return "agora";
  if (seg < 3600) return "há " + Math.floor(seg / 60) + " min";
  if (seg < 86400) return "há " + Math.floor(seg / 3600) + " h";
  return "há " + Math.floor(seg / 86400) + " d";
}

// ===================== AVALIAÇÃO DE QUALIDADE (IA) =====================

// A NexaIA audita a resposta final: empatia, clareza e detalhe.
// Se a Gemini falhar (cota/chave), usa uma estimativa local para
// a gamificação nunca parar.
async function jogoAvaliarTratativa(caso, mensagem) {
  try {
    const bruto = await nexaiaPerguntar(
      "Você é a NexaIA, auditora de qualidade de atendimento da NexaTalk AI. " +
      "Avalie a resposta final enviada ao cliente em três critérios: " +
      "empatia (acolhimento e simpatia), clareza (fácil de entender) e detalhe (completa e específica para o caso). " +
      'Responda APENAS com JSON válido: {"empatia": inteiro 0-100, "clareza": inteiro 0-100, "detalhe": inteiro 0-100, "comentario": "feedback direto ao operador, máximo 110 caracteres"}\n\n' +
      "Caso do cliente: " + (caso.descricao_original || "") + "\n" +
      'Resposta enviada: "' + mensagem + '"'
    );
    const j = JSON.parse(bruto.replace(/```json/gi, "").replace(/```/g, "").trim());
    return {
      empatia: jogoClamp(j.empatia),
      clareza: jogoClamp(j.clareza),
      detalhe: jogoClamp(j.detalhe),
      comentario: (j.comentario || "").slice(0, 140),
      origem: "ia",
    };
  } catch (e) {
    console.error("Avaliação IA indisponível, usando estimativa local:", e);
    return jogoAvaliacaoLocal(caso, mensagem);
  }
}

// Heurística local de qualidade (fallback sem API)
function jogoAvaliacaoLocal(caso, mensagem) {
  const m = mensagem || "";
  let empatia = 55, clareza = 55, detalhe = 50;

  const primeiroNome = (((caso.cliente && caso.cliente.nome) || "").trim().split(" ")[0] || "").toLowerCase();
  if (primeiroNome && m.toLowerCase().indexOf(primeiroNome) >= 0) empatia += 15;
  if (/obrigad|agradec|estamos aqui|conte con|qualquer d[uú]vida/i.test(m)) empatia += 12;
  if (/\d\.|passo/i.test(m)) { clareza += 15; detalhe += 12; }
  if (m.length > 180) detalhe += 15;
  else if (m.length > 90) detalhe += 8;
  if (m.length < 420) clareza += 10;

  return {
    empatia: Math.min(95, empatia),
    clareza: Math.min(95, clareza),
    detalhe: Math.min(95, detalhe),
    comentario: "Avaliação estimada localmente (IA indisponível agora).",
    origem: "local",
  };
}

// ===================== CONQUISTAS =====================

function jogoConquistasOperador(p, medias) {
  p = p || {};
  return [
    { emoji: "🎯", nome: "Primeira Tratativa", desc: "Conclua 1 atendimento", ok: (p.casos_concluidos || 0) >= 1 },
    { emoji: "🔥", nome: "Em Chamas", desc: "Conclua 5 atendimentos", ok: (p.casos_concluidos || 0) >= 5 },
    { emoji: "🚀", nome: "Máquina de Resolver", desc: "Conclua 15 atendimentos", ok: (p.casos_concluidos || 0) >= 15 },
    { emoji: "🧙", nome: "Mago da NexaIA", desc: "Resolva 3 casos com 1 clique", ok: (p.magicos || 0) >= 3 },
    { emoji: "🗺️", nome: "Roteador Preciso", desc: "Valide 5 encaminhamentos da IA", ok: (p.areas_validadas || 0) >= 5 },
    { emoji: "⚡", nome: "Comunicador", desc: "Envie 10 respostas a clientes", ok: (p.respostas_enviadas || 0) >= 10 },
    { emoji: "💜", nome: "Coração de Ouro", desc: "Empatia média ≥ 80 (3+ avaliações)", ok: !!medias && (p.avaliacoes || 0) >= 3 && medias.empatia >= 80 },
    { emoji: "💎", nome: "Cristalino", desc: "Clareza média ≥ 80 (3+ avaliações)", ok: !!medias && (p.avaliacoes || 0) >= 3 && medias.clareza >= 80 },
    { emoji: "🥋", nome: "Faixa Preta do Dojo", desc: "Complete 5 treinos no simulador", ok: (p.treinos || 0) >= 5 },
    { emoji: "📚", nome: "Autor da Base Viva", desc: "Publique 3 artigos na base de conhecimento", ok: (p.artigos_publicados || 0) >= 3 },
  ];
}

function jogoConquistasCliente(p) {
  p = p || {};
  return [
    { emoji: "🌱", nome: "Primeiro Chamado", desc: "Abra seu 1º atendimento", ok: (p.chamados_abertos || 0) >= 1 },
    { emoji: "🤖", nome: "Amigo da NexaIA", desc: "Resolva 3 chamados com a IA", ok: (p.resolvidos_ia || 0) >= 3 },
    { emoji: "📣", nome: "Voz Ativa", desc: "Abra 5 atendimentos", ok: (p.chamados_abertos || 0) >= 5 },
    { emoji: "🏆", nome: "Veterano Nexa", desc: "Alcance 300 XP", ok: (p.xp || 0) >= 300 },
  ];
}

// ===================== APOIO VISUAL =====================

// Pinta um anel/donut de progresso (mesmo visual do restante do app)
function jogoPintarDonut(id, pct, cor) {
  const el = document.getElementById(id);
  if (!el) return;
  const graus = Math.round((pct / 100) * 360);
  el.style.background = "conic-gradient(" + cor + " " + graus + "deg, rgba(255,255,255,0.08) " + graus + "deg)";
}

function jogoIniciais(nome) {
  return (nome || "?").trim().split(/\s+/).slice(0, 2).map(function (p) {
    return p[0] ? p[0].toUpperCase() : "";
  }).join("");
}
