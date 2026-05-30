# NexaTalk AI — Fase 4 (Challenge Claro)

Hub de convergência de interfaces conversacionais — fluxo mobile do cliente com IA (Gemini) e banco de dados (Firebase Firestore).

**Grupo:** Cesar Iglesias Balseiro Neto (RM 98007) · Samuel Aguiar (RM 550212)

---

## Como rodar o projeto

1. Baixe ou clone este repositório.
2. Configure as chaves (passo a passo abaixo).
3. Abra o arquivo **`index.html`** no navegador.
   - Recomendado: usar **Live Server** (VS Code) ou servidor local na porta 5500/8000.
   - Evite abrir direto como `file://` se a IA não responder (use `http://localhost`).

---

## Onde colar as chaves (passo a passo)

O arquivo **`js/config.js`** não vai para o GitHub (contém chaves). Você precisa **criá-lo na sua máquina**:

### Opção A — Copiar o exemplo (mais fácil)

1. Na pasta `js/`, copie o arquivo:
   - De: `config.example.js`
   - Para: `config.js`
2. Abra `js/config.js` e substitua os valores pelas chaves abaixo (seção **Chaves do grupo**).

### Opção B — Editar manualmente

1. Crie o arquivo `js/config.js` (se não existir).
2. Cole o conteúdo de `js/config.example.js`.
3. Preencha os campos indicados.

### Campos que DEVEM ser preenchidos

| Onde no código | Campo | Para que serve |
|---|---|---|
| `GEMINI_CONFIG.apiKey` | Chave da IA | Triagem e análise da mensagem (Telas 2–3) |
| `GEMINI_CONFIG.projectNumber` | Número do projeto Google | Identificação (opcional para funcionar) |
| `FIREBASE_CONFIG` (objeto inteiro) | Config do Firebase | Login, cadastro e salvar atendimentos |

**Arquivo:** `js/config.js`

```javascript
const GEMINI_CONFIG = {
  apiKey: "COLE_A_CHAVE_GEMINI_AQUI",   // ← linha 11
  model: "gemini-flash-latest",
  endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
  projectNumber: "666394709185",
};

const FIREBASE_CONFIG = {
  apiKey: "COLE_A_API_KEY_FIREBASE_AQUI",           // ← linha 26
  authDomain: "nexatalkai-d6540.firebaseapp.com",
  projectId: "nexatalkai-d6540",
  storageBucket: "nexatalkai-d6540.firebasestorage.app",
  messagingSenderId: "597613220333",
  appId: "1:597613220333:web:70c4c39be21ed47824d7e4",
  measurementId: "G-M1LDVFTJV0",
};
```

> **Só trocar a `apiKey` do Gemini e o bloco `FIREBASE_CONFIG` já resolve.** O `model` e o `endpoint` podem ficar iguais ao exemplo.

---

## Chaves do grupo (para o professor / avaliador)

> **A chave da Gemini não está neste README** (o GitHub bloqueia push com segredos).  
> Ela está no **documento de entrega da FIAP ON** (PDF). Copie de lá para `GEMINI_CONFIG.apiKey`.

Use estes valores do **Firebase** ao criar o `js/config.js`:

### Gemini API (Inteligência Artificial)

- Cole a chave no campo `GEMINI_CONFIG.apiKey` (documento FIAP ON / PDF da entrega).
- `projectNumber`: `666394709185`
- `model`: `gemini-flash-latest` (já vem no `config.example.js`)

### Firebase (Login + Banco de dados)

```
apiKey: AIzaSyBFYJtQrvQZCcwQ-9n3N2LkDcsUoYFnPEo
authDomain: nexatalkai-d6540.firebaseapp.com
projectId: nexatalkai-d6540
storageBucket: nexatalkai-d6540.firebasestorage.app
messagingSenderId: 597613220333
appId: 1:597613220333:web:70c4c39be21ed47824d7e4
measurementId: G-M1LDVFTJV0
```

---

## Isso quebra a IA?

**Não.** Desde que você:

1. Crie o arquivo `js/config.js` (copiando de `config.example.js`).
2. Cole a **chave do Gemini** em `GEMINI_CONFIG.apiKey` (entre aspas).
3. Cole o **Firebase** completo em `FIREBASE_CONFIG`.

A IA continua funcionando normalmente: triagem, análise, dashboard e respostas automáticas.

Se a IA **não responder**, verifique:

- O arquivo `js/config.js` existe na pasta `js/`?
- A chave está entre aspas, sem espaço extra?
- Está rodando via `http://localhost` (não `file://`)?
- No Firebase Console, **Authentication → E-mail/senha** está **ativado**?

---

## Fluxo das telas

| # | Arquivo | Função |
|---|---|---|
| 1 | `index.html` | Login / cadastro |
| 2 | `paginas/novo-atendimento.html` | Abertura do chamado |
| 2.5 | `paginas/triagem-ia.html` | IA decide: resolve na hora ou encaminha |
| 3 | `paginas/analise-ia.html` | Análise + dashboard |
| 4 | `paginas/atendimento-criado.html` | Protocolo + salva no Firestore |
| 5 | `paginas/meus-atendimentos.html` | Lista dos atendimentos do usuário |

---

## Tecnologias

- HTML5, CSS3, JavaScript
- Bootstrap 5.3.8
- Firebase Authentication + Firestore
- Google Gemini API (`gemini-flash-latest`)

---

## Estrutura de pastas

```
NexaTalk_AI/
├── index.html
├── README.md
├── .gitignore
├── css/estilo.css
├── js/
│   ├── config.js          ← CRIAR localmente (não vai pro Git)
│   ├── config.example.js  ← Modelo sem chaves
│   ├── firebase.js
│   └── gemini.js
├── paginas/
│   ├── novo-atendimento.html
│   ├── triagem-ia.html
│   ├── analise-ia.html
│   ├── atendimento-criado.html
│   └── meus-atendimentos.html
└── firestore.rules
```

---

## Conta de teste (opcional)

O professor pode **criar uma conta nova** na Tela 1:

- Nome: qualquer
- E-mail: qualquer e-mail válido
- Senha: mínimo **6 caracteres**

Ou usar uma conta já criada pelo grupo durante a demonstração.

---

## Observação sobre o GitHub

O arquivo `js/config.js` está no `.gitignore` (não sobe pro Git).  
A **chave da Gemini** está no **PDF da entrega FIAP ON**. O Firebase abaixo pode ser copiado daqui.
