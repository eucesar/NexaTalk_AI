// ============================================================
// NexaTalk AI - Configurações do projeto (EXEMPLO)
// ============================================================
// 1. Copie este arquivo para config.js
// 2. Preencha com suas chaves do Google AI Studio e Firebase
// ============================================================

// ----- Gemini API -----
const GEMINI_CONFIG = {
  apiKey: "SUA_CHAVE_GEMINI_AQUI",
  model: "gemini-flash-latest",
  endpoint:
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
  projectNumber: "SEU_PROJECT_NUMBER",
};

// ----- Bootstrap 5.3.8 (CDN oficial usado no projeto) -----
// CSS:
// <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
// JS:
// <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>

// ----- Firebase -----
const FIREBASE_CONFIG = {
  apiKey: "SUA_API_KEY_FIREBASE",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxxxxxx",
  measurementId: "G-XXXXXXXXXX",
};
