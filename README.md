# NexaTalk AI — Fase 4

**Integrantes:** Cesar Iglesias (98007) · Samuel Aguiar (550212)

---

## O que é

App mobile de atendimento ao cliente com **IA (Gemini)** e **banco Firebase**. O cliente abre chamado, a IA faz triagem e análise, e tudo fica salvo no Firestore.

**Demo:** https://eucesar.github.io/NexaTalk_AI/

---

## Como rodar (3 passos)

**1.** Copie o arquivo de exemplo:

```
js/config.example.js  →  js/config.js
```

**2.** Abra `js/config.js` e cole a **chave da Gemini** na linha:

```javascript
apiKey: "SUA_CHAVE_GEMINI_AQUI",
```

→ A chave está no **PDF de entrega FIAP ON** do grupo (começa com `AQ.`).

O Firebase já vem preenchido no `config.example.js` — não precisa mudar.

**3.** Abra `index.html` com **Live Server** (ou use o link da GitHub Pages acima).

Crie uma conta na Tela 1 (senha com 6+ caracteres) e teste.

---

## Telas

Login → Novo Atendimento → Triagem IA → Análise → Protocolo → Meus Atendimentos
