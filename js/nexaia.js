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
