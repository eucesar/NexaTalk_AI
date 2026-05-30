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

**Login e banco funcionam** (Firebase já está no `js/config.example.js`).

A **IA (triagem/análise) não funciona só pelo link**, porque a chave da Gemini não pode ficar no GitHub — ela está no **PDF FIAP ON**. Para testar a IA, use a Opção 2 abaixo.

### Opção 2 — Clonando o repositório (recomendado — fluxo completo com IA)

1. Baixe ou clone este repo
2. Cole a chave da Gemini em `js/config.example.js` (passo abaixo) **ou** crie um `js/config.js` local com as chaves (não sobe pro Git)
3. Abra o `index.html` com **Live Server** no VS Code (`http://localhost`)

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
4. Salve e abra o `index.html` com Live Server. Crie conta na Tela 1 (senha com 6+ caracteres).

> **Obs.:** Não conseguimos subir a chave da Gemini no GitHub (o site bloqueia). Por isso ela está no PDF de entrega.

> **Obs. 2 — GitHub Pages:** o site online carrega `js/config.example.js` automaticamente (o `config.js` não sobe pro Git). Login funciona; IA só após colar a chave e rodar localmente.

> **Obs. 3:** Se o login der erro no link, confira se `eucesar.github.io` está em **Firebase Console → Authentication → Authorized domains**.

---

## Fluxo das telas

Login → Novo Atendimento → Triagem IA → Análise → Protocolo → Meus Atendimentos

---

Qualquer dúvida, estamos à disposição!

**Cesar Iglesias (98007) · Samuel Aguiar (550212)**
