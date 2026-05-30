# NexaTalk AI — Fase 4 (Challenge Claro)

Olá, professor! Somos **Cesar Iglesias (RM 98007)** e **Samuel Aguiar (RM 550212)**.

Deixamos aqui um resumo do nosso projeto e como testar.

**Link para testar online:** https://eucesar.github.io/NexaTalk_AI/

---

## O que fizemos

Desenvolvemos um app mobile (HTML/CSS/JS) de atendimento ao cliente. O fluxo usa **IA do Google Gemini** para triagem e análise, e **Firebase** para login e salvar os chamados no Firestore.

O cliente faz login, abre um chamado, passa pela triagem da IA, vê a análise e acompanha tudo em "Meus Atendimentos".

---

## Como o senhor pode testar

### Opção 1 — Pelo link (GitHub Pages)

Acesse: https://eucesar.github.io/NexaTalk_AI/

Crie uma conta na Tela 1 (senha com no mínimo 6 caracteres) e siga o fluxo.

### Opção 2 — Clonando o repositório

1. Baixe ou clone este repo
2. Siga os passos de configuração abaixo (só precisa colar a chave da IA)
3. Abra o `index.html` com **Live Server** no VS Code (use `http://localhost`, não abra como arquivo direto)

---

## Sobre as chaves de API

Deixamos quase tudo pronto no código. O senhor só precisa se preocupar com **uma chave**:

| | Chave da IA (Gemini) | Chave do Firebase (banco) |
|---|---|---|
| **Precisa colar?** | Sim | Não — já deixamos no código |
| **Onde está** | No **PDF de entrega FIAP ON** do nosso grupo | No arquivo `js/config.example.js` |

### Firebase — já configurado por nós

No arquivo `js/config.example.js`, o bloco `FIREBASE_CONFIG` já vem preenchido com o nosso projeto Firebase. **Não precisa alterar nada** para login e banco funcionarem.

### Gemini (IA) — único passo manual

1. Abra o arquivo **`js/config.example.js`**
2. Procure esta linha:

```javascript
apiKey: "SUA_CHAVE_GEMINI_AQUI",
```

3. Substitua `SUA_CHAVE_GEMINI_AQUI` pela chave que deixamos no **PDF de entrega FIAP ON** (começa com `AQ.`)
4. Salve o arquivo e abra o `index.html`

> **Obs.:** Não conseguimos subir a chave da Gemini direto no GitHub porque o site bloqueia. Por isso ela está no PDF de entrega.

> **Obs. 2:** Se for testar pelo link da GitHub Pages, o domínio `eucesar.github.io` precisa estar em **Firebase Console → Authentication → Authorized domains**. Nós já configuramos, mas vale conferir se o login der erro.

---

## Fluxo das telas

Login → Novo Atendimento → Triagem IA → Análise → Protocolo → Meus Atendimentos

---

Qualquer dúvida, estamos à disposição!

**Cesar Iglesias (98007) · Samuel Aguiar (550212)**
