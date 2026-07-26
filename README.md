# NexaTalk AI — Fase 4 (Challenge Claro)

Olá, professor! Somos **Cesar Iglesias (RM 98007)** e **Samuel Aguiar (RM 550212)**.

Deixamos aqui um resumo do nosso projeto e como testar.

**Repositório:** https://github.com/eucesar/NexaTalk_AI  
**Link demo (visual apenas):** https://eucesar.github.io/NexaTalk_AI/  
> ⚠️ O link da GitHub Pages é **só para ver o layout**. A IA e o Firebase completos só funcionam localmente (a chave Gemini não sobe no GitHub).

---

## O que fizemos

Desenvolvemos um app **mobile web** (HTML/CSS/JS) de atendimento ao cliente. O fluxo usa:

- **Google Gemini** — triagem inteligente e análise estruturada do chamado
- **Firebase Auth + Firestore** — login e persistência dos atendimentos
- **NexaIA** — assistente que acompanha o cliente em **todas** as telas, com dicas contextuais e ações de IA sob demanda

### Destaques desta entrega

| Recurso | O que faz |
|---|---|
| **Jornada completa (8 telas)** | Do login até detalhes, consulta por protocolo/e-mail e tela 404 |
| **Triagem “IA resolve primeiro”** | Dúvidas e orientações resolvidas na hora; só vai para operador o que exige ação humana ou tem risco (estorno, fraude, jurídico etc.) |
| **NexaIA em todas as telas** | Cumprimenta pelo nome, orienta cada passo, melhora a descrição do chamado e resume os atendimentos |
| **Consulta sem login** | Busca por protocolo ou e-mail (como rastreio de encomenda) |
| **Visual dark animado** | Tema “AI Premium Dark” com animações, glassmorphism e micro-interações |

> **Próxima etapa:** área do **operador** (atender e concluir os casos encaminhados). Nesta entrega o foco é a jornada do **cliente**.

---

## Fluxo das telas (cliente)

1. **Início** — login / cadastro + Consultar Atendimento  
2. **Novo Atendimento** — formulário + “Melhorar descrição com IA”  
3. **Triagem IA** — resolve na hora **ou** encaminha para especialista  
4. **Análise da IA** — resumo, intenção, prioridade, confiança, painel completo  
5. **Protocolo criado** — confirmação + número do atendimento  
6. **Meus Atendimentos** — lista, filtros, busca e “Resumir com IA”  
7. **Detalhes** — descrição, resumo da IA, intenção e mensagem da operação  
8. **Consulta / 404** — busca por protocolo ou e-mail; erro se não encontrar  

---

## Como o senhor pode testar

> **Importante:** clone o repositório e rode **localmente**. Não precisa de Node/npm.

1. Baixe ou clone este repo  
2. Cole a chave da Gemini em `js/config.example.js` (passo abaixo)  
3. No VS Code/Cursor, instale a extensão **Live Server** (já sugerida em `.vscode/extensions.json`)  
4. Abra `index.html` e clique em **Go Live** (porta **5500**, configurada em `.vscode/settings.json`)  
5. Crie conta na Tela 1 (senha com 6+ caracteres) e teste o fluxo  

Funciona em **Chrome, Edge, Firefox, Opera, Brave** etc. O Go Live abre no navegador padrão do computador.

### Mensagens rápidas para testar a triagem

**Resolvido pela IA (não vai para operador):**
```text
Como faço para emitir a segunda via do meu boleto? E qual o horário de atendimento de vocês?
```

**Encaminhado para operador:**
```text
Fui cobrado duas vezes na fatura deste mês e quero o estorno do valor duplicado. Se não resolverem, vou abrir reclamação no Procon.
```

---

## Sobre as chaves de API

| | Chave da IA (Gemini) | Chave do Firebase (banco) |
|---|---|---|
| **Precisa colar?** | Sim | Não — já deixamos no código |
| **Onde está** | No **PDF de entrega FIAP ON** do nosso grupo | No arquivo `js/config.example.js` |

### Firebase — já configurado

No `js/config.example.js`, o bloco `FIREBASE_CONFIG` já vem preenchido. **Não precisa alterar nada** para login e banco funcionarem.

### Gemini (IA) — único passo manual

1. Abra o arquivo **`js/config.example.js`**
2. Procure esta linha:

```javascript
apiKey: "SUA_CHAVE_GEMINI_AQUI",
```

3. Substitua `SUA_CHAVE_GEMINI_AQUI` pela chave do **PDF de entrega FIAP ON** (começa com `AQ.`)
4. Salve e abra o `index.html` com Live Server

> A chave real fica em `js/config.js` (gitignored) e **não sobe** no GitHub.

---

## Tecnologias

- HTML5, CSS3, JavaScript  
- Bootstrap 5 + Bootstrap Icons  
- Firebase Authentication + Cloud Firestore  
- Google Gemini API (`gemini-2.5-flash`)  
- VS Code / Cursor + Live Server  
- Git / GitHub  

---

Qualquer dúvida, estamos à disposição!

**Cesar Iglesias (98007) · Samuel Aguiar (550212)**
