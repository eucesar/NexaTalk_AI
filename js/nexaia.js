// ============================================================
// NexaTalk AI - NexaIA (assistente que acompanha o cliente)
// ------------------------------------------------------------
// Balão da NexaIA presente em todas as telas do fluxo do
// usuário, com dicas contextuais e ações de IA sob demanda
// usando a mesma Gemini API da triagem.
// ============================================================

// Desenha o balão da NexaIA dentro do elemento indicado.
// opcoes: { acaoTexto: "texto do botão", aoClicar: função }
function nexaiaMostrar(idElemento, texto, opcoes) {
  const alvo = document.getElementById(idElemento);
  if (!alvo) return;
  opcoes = opcoes || {};

  let html =
    '<div class="nexaia">' +
      '<div class="nexaia-avatar"><i class="bi bi-robot"></i></div>' +
      '<div style="flex: 1;">' +
        '<div class="nexaia-nome"><i class="bi bi-stars"></i> NexaIA</div>' +
        '<div class="nexaia-texto" id="' + idElemento + 'Texto"></div>';

  if (opcoes.acaoTexto) {
    html += '<button type="button" class="nexaia-acao" id="' + idElemento + 'Acao">' + opcoes.acaoTexto + "</button>";
  }

  html += "</div></div>";
  alvo.innerHTML = html;

  document.getElementById(idElemento + "Texto").textContent = texto;

  if (opcoes.acaoTexto && opcoes.aoClicar) {
    document.getElementById(idElemento + "Acao").addEventListener("click", opcoes.aoClicar);
  }
}

// Troca apenas o texto de um balão já desenhado
function nexaiaTexto(idElemento, texto) {
  const el = document.getElementById(idElemento + "Texto");
  if (el) el.textContent = texto;
}

// Saudação de acordo com a hora do dia
function nexaiaSaudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

// Primeiro nome do usuário (mensagens mais pessoais)
function nexaiaPrimeiroNome(nome) {
  return (nome || "").trim().split(" ")[0] || "";
}

// Pergunta curta à Gemini (usada nas ações sob demanda)
async function nexaiaPerguntar(instrucao) {
  const resposta = await fetch(GEMINI_CONFIG.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_CONFIG.apiKey,
    },
    body: JSON.stringify({ contents: [{ parts: [{ text: instrucao }] }] }),
  });

  if (!resposta.ok) {
    throw new Error("Gemini API indisponível (" + resposta.status + ")");
  }

  const dados = await resposta.json();
  const texto =
    dados.candidates &&
    dados.candidates[0] &&
    dados.candidates[0].content &&
    dados.candidates[0].content.parts &&
    dados.candidates[0].content.parts[0] &&
    dados.candidates[0].content.parts[0].text;

  if (!texto) throw new Error("A IA não devolveu resposta.");
  return texto.trim();
}

function nexaiaBlobParaBase64(blob) {
  return new Promise(function (resolve, reject) {
    const leitor = new FileReader();
    leitor.onload = function () {
      const s = String(leitor.result || "");
      const virgula = s.indexOf(",");
      resolve(virgula >= 0 ? s.slice(virgula + 1) : s);
    };
    leitor.onerror = reject;
    leitor.readAsDataURL(blob);
  });
}

function nexaiaMimeAudio() {
  const tipos = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return "audio/webm";
  for (let i = 0; i < tipos.length; i++) {
    if (MediaRecorder.isTypeSupported(tipos[i])) return tipos[i];
  }
  return "audio/webm";
}

async function nexaiaTranscreverAudio(blob) {
  const base64 = await nexaiaBlobParaBase64(blob);
  const mime = (blob.type || "audio/webm").split(";")[0] || "audio/webm";
  const resposta = await fetch(GEMINI_CONFIG.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_CONFIG.apiKey,
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            text: "Transcreva o áudio em português brasileiro. " +
              "Responda APENAS com o que a pessoa falou, sem aspas, sem comentários. " +
              "Se não houver fala, responda exatamente: (não entendi)",
          },
          { inline_data: { mime_type: mime, data: base64 } },
        ],
      }],
    }),
  });
  if (!resposta.ok) {
    throw new Error("Gemini API indisponível (" + resposta.status + ")");
  }
  const dados = await resposta.json();
  const texto =
    dados.candidates &&
    dados.candidates[0] &&
    dados.candidates[0].content &&
    dados.candidates[0].content.parts &&
    dados.candidates[0].content.parts[0] &&
    dados.candidates[0].content.parts[0].text;
  if (!texto) throw new Error("A IA não devolveu transcrição.");
  return texto.trim().replace(/^["']|["']$/g, "");
}

function nexaiaCaminhoBase() {
  const p = (location.pathname || "").replace(/\\/g, "/");
  if (p.indexOf("/paginas/") >= 0 || p.indexOf("/operador/") >= 0) return "../";
  return "./";
}

function nexaiaAgoraTexto() {
  return new Date().toLocaleDateString("pt-BR") + " às " +
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function nexaiaUrlChat() {
  return nexaiaCaminhoBase() + "paginas/chat-nexaia.html";
}

async function nexaiaChatCarregar(uid) {
  if (!uid) return [];
  try {
    const doc = await db.collection("chats_nexaia").doc(uid).get();
    return doc.exists ? (doc.data().mensagens || []) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function nexaiaChatSalvar(uid, mensagens) {
  if (!uid) return;
  await db.collection("chats_nexaia").doc(uid).set({
    mensagens: (mensagens || []).slice(-40),
    atualizado_em: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

async function nexaiaChatMontarContexto(usuario) {
  const uid = usuario && usuario.uid;
  const nome = (usuario && usuario.displayName) || "Cliente";
  const email = (usuario && usuario.email) || "";
  let perfilTxt = "sem perfil de jogo ainda";
  let chamadosTxt = "nenhum chamado";
  let artigosTxt = "nenhum artigo publicado";

  try {
    const perfil = typeof jogoBuscarPerfil === "function" ? await jogoBuscarPerfil(uid) : null;
    if (perfil) {
      const nv = typeof jogoNivel === "function" ? jogoNivel(perfil.xp || 0, perfil.tipo || "cliente") : null;
      perfilTxt = "XP " + (perfil.xp || 0) +
        (nv ? " · nível " + (nv.titulo || nv.nome || "") : "") +
        " · chamados abertos: " + (perfil.chamados_abertos || 0) +
        " · resolvidos pela IA: " + (perfil.resolvidos_ia || 0);
    }
  } catch (e) {}

  try {
    const lista = await listarMeusAtendimentos(uid);
    chamadosTxt = lista.slice(0, 10).map(function (a) {
      return (a.protocolo || "?") + " | " + (a.status || "?") +
        " | área " + (a.area_atual || "?") +
        " | " + (((a.ia && a.ia.resumo) || a.descricao_original || "").slice(0, 90)) +
        (a.mensagem_operacao ? " | msg operação: " + String(a.mensagem_operacao).slice(0, 80) : "");
    }).join("\n") || "nenhum chamado";
  } catch (e) {}

  try {
    const snap = await db.collection("base_conhecimento").limit(8).get();
    const arts = [];
    snap.forEach(function (doc) {
      const d = doc.data();
      arts.push((d.titulo || "Artigo") + ": " + String(d.solucao || d.problema || "").slice(0, 120));
    });
    if (arts.length) artigosTxt = arts.join("\n");
  } catch (e) {}

  return (
    "Cliente: " + nome + " (" + email + ")\n" +
    "Perfil Nexa: " + perfilTxt + "\n\n" +
    "Chamados recentes:\n" + chamadosTxt + "\n\n" +
    "Artigos da Base Viva:\n" + artigosTxt + "\n\n" +
    "Como o app funciona: o cliente descreve o problema; a NexaIA faz triagem. " +
    "Dúvidas, 2ª via, horários e orientação simples a IA resolve sozinha. " +
    "Estorno, fraude, Procon, cancelamento e mudança de contrato vão para um operador humano. " +
    "O cliente acompanha em Meus Atendimentos. Status: Em análise, Resolvido pela IA, Concluído. " +
    "Você NÃO é um atendente humano: não invente estorno já feito. Oriente a abrir chamado se precisar de ação humana."
  );
}

async function nexaiaChatResponder(usuario, mensagens) {
  const contexto = await nexaiaChatMontarContexto(usuario);
  const historico = (mensagens || []).slice(-12).map(function (m) {
    return (m.papel === "eu" ? "Cliente" : "NexaIA") + ": " + m.texto;
  }).join("\n");

  return nexaiaPerguntar(
    "Você é a NexaIA, assistente conversacional do app NexaTalk AI (ITSM B2B). " +
    "Responda em português, cordial, objetiva, no máximo 900 caracteres. Use o contexto real abaixo. " +
    "Se o cliente perguntar de um protocolo, cite status e próximo passo. " +
    "Não finja ser humano. Sem markdown pesado.\n\nCONTEXTO:\n" + contexto +
    "\n\nCONVERSA:\n" + historico + "\n\nResposta da NexaIA:"
  );
}

async function nexaiaReescrever(texto, modo) {
  const origem = (texto || "").trim();
  if (origem.length < 3) throw new Error("Texto curto demais.");
  if (modo === "es") {
    return nexaiaPerguntar(
      "Traduza para espanhol (neutro da América Latina), mantendo números, protocolos e nomes. " +
      "Responda APENAS com a tradução, sem aspas.\n\n" + origem
    );
  }
  return nexaiaPerguntar(
    "Reescreva em português muito simples, frases curtas, vocabulário fácil (acessibilidade). " +
    "Mantenha todos os dados (valores, datas, protocolos). Responda APENAS com o texto, sem aspas.\n\n" + origem
  );
}

(function nexaiaPwaEFab() {
  const base = nexaiaCaminhoBase();
  if (!document.querySelector('link[rel="manifest"]')) {
    const l = document.createElement("link");
    l.rel = "manifest";
    l.href = base + "manifest.json";
    document.head.appendChild(l);
  }
  if (!document.querySelector('meta[name="theme-color"]')) {
    const m = document.createElement("meta");
    m.name = "theme-color";
    m.content = "#6d28d9";
    document.head.appendChild(m);
  }
  const apple = document.createElement("link");
  apple.rel = "apple-touch-icon";
  apple.href = base + "img/icon-nexa.png";
  document.head.appendChild(apple);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register(base + "sw.js").catch(function () {});
  }

  function iniciarFab() {
    if (!document.querySelector(".celular")) return;
    if (document.getElementById("paginaChat")) return;

    function colocar() {
      if (document.getElementById("nexaFab")) return;
      const a = document.createElement("a");
      a.id = "nexaFab";
      a.className = "nexa-fab";
      a.href = nexaiaUrlChat();
      a.title = "Falar com a NexaIA";
      a.innerHTML = '<i class="bi bi-chat-dots-fill"></i>';
      document.body.appendChild(a);
    }

    if (typeof auth !== "undefined" && auth.onAuthStateChanged) {
      auth.onAuthStateChanged(function (u) {
        if (u) colocar();
        else {
          const velho = document.getElementById("nexaFab");
          if (velho) velho.remove();
        }
      });
    } else {
      colocar();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarFab);
  } else {
    iniciarFab();
  }
})();

