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
  "auto_resolvivel": true ou false (siga a POLÍTICA DE AUTO-RESOLUÇÃO abaixo),
  "resposta_automatica": "se auto_resolvivel for true, escreva aqui a resposta COMPLETA para o cliente: cordial, objetiva, com passos numerados quando for orientação (1. 2. 3.), e termine avisando que, se não resolver, ele pode falar com um atendente; se auto_resolvivel for false, deixe string vazia"
}

POLÍTICA DE AUTO-RESOLUÇÃO (objetivo: a IA resolve o máximo possível; o operador é exceção):

Use auto_resolvivel = true SEMPRE que conseguir dar uma resposta útil e completa sem acessar sistemas internos, por exemplo:
- Dúvidas e informações: horários, prazos, políticas, funcionamento de produtos/serviços, planos e diferenças entre eles;
- Orientações passo a passo: segunda via de boleto/fatura, trocar senha, recuperar acesso, atualizar cadastro, rastrear/consultar status de pedido, configurar app ou serviço;
- Problemas técnicos simples com solução conhecida: reiniciar, reconectar, limpar cache, atualizar aplicativo, verificar conexão;
- Cliente só quer ENTENDER uma cobrança ou fatura (explique os itens e cenários comuns e como conferir);
- Elogios, sugestões e feedbacks (agradeça e registre).

Use auto_resolvivel = false APENAS quando a resolução exigir ação humana ou envolver risco, por exemplo:
- Ações que alteram conta, contrato ou pedido: cancelamento, estorno, reembolso, troca, devolução, mudança de plano ou titularidade;
- CONTESTAÇÃO ou disputa de cobrança (cliente afirma cobrança indevida/duplicada e quer devolução);
- Fraude, acesso indevido, segurança da conta, vazamento de dados;
- Assuntos jurídicos, LGPD, Procon, ameaças ou reclamações formais;
- Negociação de dívidas ou valores;
- Cliente pede explicitamente para falar com um humano.

Regra de ouro: na dúvida, prefira true com uma resposta_automatica completa. Só use false se a solução exigir mexer em sistemas internos ou houver risco financeiro, legal ou de segurança.

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
