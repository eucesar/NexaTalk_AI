// ============================================================
// NexaTalk AI - Integração com a Gemini API
// ------------------------------------------------------------
// Recebe a descrição que o cliente escreveu e pede para a IA
// devolver uma análise estruturada (resumo, intenção,
// encaminhamento, prioridade, confiança, tempo e observação).
// ============================================================

async function analisarComIA(descricao) {
  // Instrução enviada para a IA. Pedimos a resposta em JSON
  // para conseguir preencher a tela e enriquecer o banco de dados.
  // Os campos extras (resposta_sugerida, sentimento, categoria, tags,
  // dados_detectados, proxima_acao) serão usados pela área do operador.
  const prompt = `
Você é o assistente de triagem de atendimentos da empresa NexaTalk AI.
Analise a mensagem de um cliente e responda APENAS com um JSON válido,
sem texto antes ou depois, exatamente neste formato:

{
  "resumo": "resumo objetivo da solicitação em 1 ou 2 frases",
  "intencao": "categoria curta (ex: Cancelamento de Pedido, Cobrança, Suporte, Troca, Informações, Financeiro + Comercial)",
  "encaminhamento": "área responsável sugerida (ex: Logística e Pedidos, Financeiro, Suporte Técnico, Comercial)",
  "observacao": "observação curta sobre o caso, riscos ou pontos de atenção",
  "prioridade": "Baixa, Média ou Alta",
  "confianca": número inteiro de 0 a 100 representando a confiança da análise,
  "tempo_estimado": "estimativa de tempo de resolução (ex: Entre 30 min e 2 horas)",
  "categoria": "categoria principal (ex: Financeiro, Logística, Suporte, Comercial)",
  "subcategoria": "detalhe da categoria (ex: Contestação de cobrança, Cancelamento)",
  "sentimento": "estado do cliente: Positivo, Neutro, Preocupado ou Frustrado",
  "tags": ["lista", "de", "palavras-chave", "do", "caso"],
  "dados_detectados": "dados úteis citados pelo cliente, como número de pedido, fatura ou valores (texto curto; vazio se não houver)",
  "resposta_sugerida": "sugestão de resposta cordial e objetiva que o operador poderá enviar ao cliente",
  "proxima_acao": "próxima ação recomendada para a equipe responsável",
  "complexidade": "Baixa, Média ou Alta (esforço para resolver o caso)",
  "tempo_espera_fila": "estimativa de espera na fila até iniciar o atendimento (ex: ~5 min, ~15 min, ~30 min)",
  "sla_sugerido": "prazo limite sugerido para resolução (ex: 24 horas, 48 horas)",
  "probabilidade_primeira_resposta": número inteiro de 0 a 100 (sem fração, ex: 95) indicando a chance de resolver já na primeira resposta,
  "auto_resolvivel": true ou false (use true APENAS se for uma dúvida simples, informativa ou de baixo risco que possa ser resolvida na hora com uma resposta direta, sem precisar de atendente humano. Use false para casos sensíveis como cobranças, cancelamentos, reclamações, problemas financeiros, jurídicos ou que exijam acesso a sistemas internos),
  "resposta_automatica": "se auto_resolvivel for true, escreva aqui a solução/resposta direta, clara e cordial para o cliente; se for false, deixe string vazia"
}

Importante: "confianca" e "probabilidade_primeira_resposta" devem ser números inteiros de 0 a 100 (ex: 95), nunca frações como 0.95.

Mensagem do cliente: "${descricao}"
`;

  const corpo = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  const resposta = await fetch(GEMINI_CONFIG.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_CONFIG.apiKey,
    },
    body: JSON.stringify(corpo),
  });

  if (!resposta.ok) {
    let detalhe = "";
    try {
      const err = await resposta.json();
      detalhe = err.error && err.error.message ? err.error.message : "";
    } catch (ignore) {}
    const erro = new Error("Erro na chamada da Gemini API: " + resposta.status);
    erro.status = resposta.status;
    erro.detalhe = detalhe;
    throw erro;
  }

  const dados = await resposta.json();

  if (!dados.candidates || !dados.candidates[0] || !dados.candidates[0].content) {
    throw new Error("A IA não devolveu resposta válida.");
  }

  // Texto bruto devolvido pela IA
  let textoIA = dados.candidates[0].content.parts[0].text;

  // Remove cercas de código (```json ... ```) caso a IA inclua
  textoIA = textoIA.replace(/```json/gi, "").replace(/```/g, "").trim();

  // Converte o texto em objeto JavaScript
  return JSON.parse(textoIA);
}
