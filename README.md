# NexaTalk AI

**ITSM B2B com inteligência artificial** — o cliente abre o chamado no celular, a IA faz a triagem, o operador trata no desktop com um copiloto e o ciclo fecha no Firebase em tempo real.

Olá, professor! Sou **Cesar Iglesias (RM 98007)**.

Este repositório é o projeto **NexaTalk AI** (Challenge FIAP / Claro): uma plataforma de atendimento corporativo (ITSM) em que a **NexaIA** (Google Gemini) reduz trabalho manual do time e o cliente acompanha tudo num app mobile web.

| | |
|---|---|
| **Repositório** | https://github.com/eucesar/NexaTalk_AI |
| **Demo visual (GitHub Pages)** | https://eucesar.github.io/NexaTalk_AI/ |
| **Como rodar de verdade** | Clone + Live Server (passos abaixo). Sem Node, sem npm. |

> A GitHub Pages mostra o **layout**. Login, banco e IA completos rodam **no computador**, porque a chave da Gemini não sobe no GitHub.

---

## O que é este projeto

Empresas B2B recebem dezenas de chamados por dia (cobrança, logística, suporte, cadastro). Um ITSM clássico joga tudo numa fila humana. O NexaTalk AI inverte isso:

1. O **cliente** descreve o problema no app (moldura de celular).
2. A **NexaIA** analisa intenção, prioridade, sentimento e risco.
3. Se der para resolver na hora (dúvida, 2ª via, orientação), a IA **fecha sozinha**.
4. Se exigir ação humana (estorno, fraude, Procon, cancelamento), o chamado cai **ao vivo** na central do **operador** (tela de notebook).
5. O operador quase não digita: plano de ação, resposta pronta, “resolver com IA em 1 clique”, qualidade auditada pela própria IA.
6. O cliente vê a resposta e o status **Concluído** no app.

Tudo persiste no **Firebase** (Authentication + Cloud Firestore).

---

## Duas experiências

### App do cliente (mobile web)

Moldura de celular, tema dark animado. Login/cadastro com Firebase Auth.

- Abrir chamado com “melhorar descrição com IA”
- Triagem que resolve na hora **ou** encaminha
- Protocolo, meus atendimentos, detalhes e mensagem da operação
- Consulta **sem login** por protocolo ou e-mail
- **Perfil Nexa** com XP, níveis e conquistas

**Login de demo do cliente (já vem preenchido):** `cliente@nexatalk.com` · senha `nexa123`  
A conta **já existe** no Firebase (nome **Cliente Demo**). É só **Entrar**. Se o Auth pedir cadastro num clone novo, use **Criar conta** com os mesmos dados.

Essa conta já tem uma jornada pronta para a apresentação (app + fila do operador):

| Chamado | O que mostra |
|---|---|
| Cobrança duplicada | Aberto na fila, ainda sem operador |
| App fechando no Android | Em tratamento pela **Ana Operadora** (com mensagem) |
| Pedido #77412 atrasado | Em tratamento pela **Marina Duarte** (com mensagem) |
| 2ª via de boleto · planos · cadastro | **Resolvidos pela IA** |
| Cancelamento Premium | **Concluído** pelo **Carlos Supervisor** |

No **Perfil Nexa**: 360 XP, nível Cliente Estrela e as 4 conquistas.

### Central do operador (desktop)

Layout de sistema corporativo, com barra lateral.

| Módulo | Função |
|---|---|
| **Login operacional** | Acesso da equipe (credencial demo abaixo) |
| **Fila de Atendimentos** | Tempo real, filtros (status + quem está tratando), busca, “Priorizar com IA”, pulso emocional da fila e “próximo melhor chamado” |
| **Detalhe do chamado** | Caso completo, **Atribuir a mim**, validar área da IA, copilot (riscos, plano, resposta, melhorar rascunho) e **Resolver com IA em 1 clique** |
| **Centro de Comando** | KPIs e gráficos ao vivo (velas, linhas, roscas), filtros de período/área/prioridade/humor e relatório executivo da NexaIA |
| **Arena ao Vivo** | Ranking do time, pódio e feed de XP em tempo real |
| **Meu Desempenho** | Nível, empatia/clareza/detalhe, conquistas e Coach IA |
| **Dojo de Treinamento** | A IA simula um cliente difícil; o operador responde e ganha nota + XP |
| **Base de Conhecimento Viva** | A IA minera a fila, escreve artigos; o operador aprova e copia a solução |
| **Ingestão de Dados** | Recria o cenário demo: jornada da conta `cliente@nexatalk.com` + fila, Arena, operadores e artigos |
| **Histórico** | Timeline / documentação do caso no ciclo do atendimento |

**Login demo do operador:** `operador@nexatalk.com` · senha `nexa123`  
(também vale `supervisor@nexatalk.com` · senha `nexa123`)

Na home do app: **Acessar Central do Operador**. Na sidebar: **App do Cliente**.

---

## Inteligência artificial (onde a NexaIA entra)

- Triagem e auto-resolução na abertura do chamado
- Melhoria da descrição do cliente
- Insights da fila e relatório executivo do Centro de Comando
- Plano de ação, rascunho de resposta e resolução em 1 clique
- Auditoria de qualidade (empatia, clareza, detalhe) ao concluir
- Cliente simulado no Dojo e mineração de artigos na base viva
- Assistente contextual em todas as telas do fluxo

Se a cota da Gemini estourar no dia, o app **não quebra**: a fila, o banco e a gamificação seguem; várias telas têm fallback local.

---

## Modo Jogo (gamificação)

Cliente e operador sobem de nível com XP no Firestore (`perfis_jogo` + `eventos_jogo`).

| Ação | XP |
|---|---|
| Cliente abre chamado | +20 |
| Cliente resolve com a IA na hora | +30 |
| Operador assume o caso | +10 |
| Validar / redirecionar área | +10 |
| Enviar resposta | +15 |
| Concluir chamado | +50 (+ bônus de qualidade) |
| Resolver com 1 clique | +35 (+ bônus) |
| Treino no Dojo | +15 / +20 / +30 (+10 se nota ≥ 80) |
| Publicar artigo na Base Viva | +15 |

Níveis: 0 → 100 → 300 → 700 → 1200 → 2000 XP.

---

## Como o professor roda o projeto do zero

Não precisa instalar Node, npm nem banco local.

### 1. Clonar

```bash
git clone https://github.com/eucesar/NexaTalk_AI.git
```

Abra a pasta no **VS Code** ou **Cursor**.

### 2. Única chave que precisa colar: Gemini

O Firebase **já está no código**. Só a IA pede a chave do grupo.

1. Copie o arquivo de exemplo:

```text
js/config.example.js  →  js/config.js
```

(No Windows: copie o arquivo na pasta `js` e renomeie a cópia para `config.js`.)

2. Abra `js/config.js` e troque:

```javascript
apiKey: "SUA_CHAVE_GEMINI_AQUI",
```

pela chave do **PDF de entrega FIAP ON** do grupo (começa com `AQ.`).

3. Salve. **Não commite** o `js/config.js` — ele está no `.gitignore`.

Se o `config.js` não existir, o app cai no `config.example.js` (Firebase funciona; a IA só responde depois da chave).

### 3. Subir o site

1. Instale a extensão **Live Server** (já sugerida em `.vscode/extensions.json`).
2. Clique com o botão direito em `index.html` → **Open with Live Server**.
3. Porta **5500** (já configurada em `.vscode/settings.json`).

Chrome, Edge, Firefox, Opera ou Brave.

### 4. Roteiro de demonstração (5 minutos)

**Cliente**

1. Home → e-mail e senha já vêm `cliente@nexatalk.com` / `nexa123` → **Entrar**.
2. Mostre **Meus Atendimentos** (abertos, em tratamento e resolvidos) e o **Perfil Nexa** (XP e conquistas).
3. Opcional, ao vivo: **Iniciar Atendimento** e teste estes textos:

Resolvido pela IA (não vai para a fila humana):

```text
Como faço para emitir a segunda via do meu boleto? E qual o horário de atendimento de vocês?
```

Encaminhado ao operador (prioridade alta / risco):

```text
Fui cobrado duas vezes na fatura deste mês e quero o estorno do valor duplicado. Se não resolverem, vou abrir reclamação no Procon.
```

4. Anote o protocolo do chamado novo e veja na lista (os outros 7 da demo continuam lá).

**Operador**

1. Home → **Acessar Central do Operador**  
   `operador@nexatalk.com` / `nexa123`
2. A **Fila** já lista os chamados da conta demo (um livre + dois com Ana e Marina). Abra um caso → **Atribuir a mim** → **Resolver com IA em 1 clique**.
3. **Centro de Comando** → filtre 7 dias / Financeiro / Alta e gere o relatório executivo.
4. Volte no app do cliente: o chamado tratado aparece **Concluído** com a mensagem da operação.
5. Só rode **Ingestão de Dados** se a base estiver vazia ou você quiser resetar o cenário (ela reata a jornada em `cliente@nexatalk.com`).

---

## Chaves e serviços

| Serviço | Precisa colar algo? | Onde |
|---|---|---|
| **Firebase** (Auth + Firestore) | Não | `FIREBASE_CONFIG` já preenchido em `js/config.example.js` (projeto `nexatalkai-d6540`) |
| **Google Gemini** | Sim, 1 linha | `GEMINI_CONFIG.apiKey` em `js/config.js` (copie do example). Modelo: `gemini-2.5-flash` |

Coleções no Firestore (criadas automaticamente no uso / ingestão):

- `usuarios` — cadastro do cliente  
- `atendimentos` — chamados (cliente ↔ operador)  
- `perfis_jogo` — XP e qualidade  
- `eventos_jogo` — feed da Arena  
- `base_conhecimento` — artigos da Base Viva  

---

## Stack

- HTML5, CSS3 e JavaScript (sem build)
- Bootstrap 5.3 + Bootstrap Icons
- Chart.js (Centro de Comando)
- Firebase Authentication + Cloud Firestore
- Google Gemini API
- VS Code / Cursor + Live Server
- Git / GitHub

### Pastas

```text
index.html                 App do cliente (entrada)
paginas/                   Telas do cliente
operador/                  Central desktop
js/                        firebase, gemini, nexaia, operador, jogo, config
css/                       estilo.css (mobile) · operador.css (desktop)
firestore.rules            Regras do protótipo (leitura/escrita liberadas para o MVP)
```

---

Qualquer dúvida, estou à disposição.

**Cesar Iglesias (RM 98007)**  
NexaTalk AI — ITSM B2B com inteligência artificial
