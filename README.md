# NexaTalk AI — Fase 4 (Challenge Claro)

Olá, professor! Somos **Cesar Iglesias (RM 98007)** e **Samuel Aguiar (RM 550212)**.

Deixamos aqui um resumo do nosso projeto e como testar.

**Link demo (visual apenas):** https://eucesar.github.io/NexaTalk_AI/  
> ⚠️ O link **não funciona por completo** — é só para ver o layout. Para testar de verdade, clone o repo e siga abaixo.

---

## O que fizemos

Desenvolvemos um app mobile (HTML/CSS/JS) de atendimento ao cliente. O fluxo usa **IA do Google Gemini** para triagem e análise, e **Firebase** para login e salvar os chamados no Firestore.

O cliente faz login, abre um chamado, passa pela triagem da IA, vê a análise e acompanha tudo em "Meus Atendimentos".

---

## Como o senhor pode testar

> **Importante:** o link da GitHub Pages é **apenas uma demo visual**. A IA não funciona pelo link (a chave não pode ficar no GitHub). Para avaliar o projeto completo, **clone o repositório** e rode localmente.

1. Baixe ou clone este repo
2. Cole a chave da Gemini em `js/config.example.js` (passo abaixo)
3. Abra o `index.html` com **Live Server** no VS Code (`http://localhost`)
4. Crie conta na Tela 1 (senha com 6+ caracteres) e teste o fluxo

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

> **Obs.:** A chave da Gemini não sobe no GitHub (bloqueio de segurança). Está no **PDF de entrega FIAP ON**.

---

## Fluxo das telas

Login → Novo Atendimento → Triagem IA → Análise → Protocolo → Meus Atendimentos

---

Qualquer dúvida, estamos à disposição!

**Cesar Iglesias (98007) · Samuel Aguiar (550212)**
