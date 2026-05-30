# NexaTalk AI — Fase 4 (Challenge Claro)

Hub de convergência de interfaces conversacionais — fluxo mobile do cliente com IA (Google Gemini) e banco de dados (Firebase Auth + Firestore).

## Integrantes

| Nome | RM |
|---|---|
| Cesar Iglesias | 98007 |
| Samuel Aguiar | 550212 |

**Repositório:** https://github.com/eucesar/NexaTalk_AI  
**Demo online:** https://eucesar.github.io/NexaTalk_AI/

---

## Sobre o projeto

Protótipo mobile do fluxo do **cliente**: login, abertura de chamado, triagem com IA, análise visual, registro de protocolo e listagem de atendimentos no Firestore.

---

## Como rodar — passo a passo (professor)

### Resumo em 3 passos

1. **Copiar** `js/config.example.js` → `js/config.js`
2. **Colar a chave da IA** no lugar certo (linha `apiKey` do Gemini — veja abaixo)
3. **Abrir** `index.html` no navegador (Live Server ou GitHub Pages)

---

### Passo 1 — Criar o arquivo de configuração

Na pasta `js/` do projeto:

```bash
cp js/config.example.js js/config.js
```

No Windows: copie `config.example.js`, cole na mesma pasta e renomeie para **`config.js`**.

> Sem esse arquivo o login e a IA **não funcionam**.

---

### Passo 2 — Onde colar a chave (único lugar obrigatório)

Abra **`js/config.js`** no editor e localize esta linha:

```javascript
apiKey: "SUA_CHAVE_GEMINI_AQUI",
```

**Apague** `SUA_CHAVE_GEMINI_AQUI` e **cole a chave da Gemini** (mantendo as aspas).

A chave está no **PDF de entrega FIAP ON** do grupo. Formato: começa com `AQ.` — cole o valor completo entre aspas.

Fica assim (exemplo):

```javascript
apiKey: "AQ.xxxxxxxxxxxxxxxxxxxxxxxxx",
```

O resto do arquivo (`model`, `endpoint`, `FIREBASE_CONFIG`) **já vem pronto** no `config.example.js` — não precisa mudar nada.

---

### Passo 3 — Abrir o sistema

- **Local:** abra `index.html` com **Live Server** (VS Code) — use `http://localhost`, não abra como `file://`
- **Online:** https://eucesar.github.io/NexaTalk_AI/ (também precisa do `config.js` se for clonar; na Pages só funciona se o arquivo existir no deploy)

Na **Tela 1**, crie uma conta (senha com **mínimo 6 caracteres**) e siga o fluxo.

---

### Referência — bloco completo do `js/config.js`

Se preferir, copie tudo abaixo para o arquivo `js/config.js`:

```javascript
const GEMINI_CONFIG = {
  apiKey: "COLE_A_CHAVE_DO_PDF_FIAP_AQUI",
  model: "gemini-2.5-flash",
  endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  projectNumber: "666394709185",
};

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBFYJtQrvQZCcwQ-9n3N2LkDcsUoYFnPEo",
  authDomain: "nexatalkai-d6540.firebaseapp.com",
  projectId: "nexatalkai-d6540",
  storageBucket: "nexatalkai-d6540.firebasestorage.app",
  messagingSenderId: "597613220333",
  appId: "1:597613220333:web:70c4c39be21ed47824d7e4",
  measurementId: "G-M1LDVFTJV0",
};
```

> O arquivo `js/config.js` não sobe no GitHub (`.gitignore`). A chave da Gemini está no **PDF FIAP ON** — o GitHub bloqueia essa chave se colocada no README ou no código.

---

## Telas

| # | Arquivo | Função |
|---|---|---|
| 1 | `index.html` | Login e cadastro |
| 2 | `paginas/novo-atendimento.html` | Abertura do chamado |
| 2.5 | `paginas/triagem-ia.html` | Triagem com IA |
| 3 | `paginas/analise-ia.html` | Análise e dashboard |
| 4 | `paginas/atendimento-criado.html` | Protocolo e gravação no banco |
| 5 | `paginas/meus-atendimentos.html` | Lista e gestão dos atendimentos |

---

## Status dos atendimentos

| Status | Descrição |
|---|---|
| Em análise | Encaminhado para equipe |
| Resolvido pela IA | Finalizado automaticamente na triagem |
| Concluído | Finalizado pelo operador (próxima entrega) |

---

## Tecnologias

- HTML5, CSS3, JavaScript
- Bootstrap 5.3.8
- Firebase Authentication + Firestore
- Google Gemini API (`gemini-2.5-flash`)

---

## Estrutura

```
NexaTalk_AI/
├── index.html
├── css/estilo.css
├── js/
│   ├── config.js          ← criar localmente (não vai pro Git)
│   ├── config.example.js
│   ├── firebase.js
│   └── gemini.js
├── paginas/
└── firestore.rules
```
