// ============================================================
// NexaTalk AI - Configurações do projeto (EXEMPLO)
// ============================================================
// 1. Copie este arquivo para config.js
// 2. Cole a chave Gemini (PDF FIAP ON) em GEMINI_CONFIG.apiKey
// 3. O Firebase abaixo já pode ser usado como está
// ============================================================

// ----- Gemini API -----
const GEMINI_CONFIG = {
  apiKey: "SUA_CHAVE_GEMINI_AQUI",
  model: "gemini-2.5-flash",
  endpoint:
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
  projectNumber: "666394709185",
};

// ----- Firebase -----
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBFYJtQrvQZCcwQ-9n3N2LkDcsUoYFnPEo",
  authDomain: "nexatalkai-d6540.firebaseapp.com",
  projectId: "nexatalkai-d6540",
  storageBucket: "nexatalkai-d6540.firebasestorage.app",
  messagingSenderId: "597613220333",
  appId: "1:597613220333:web:70c4c39be21ed47824d7e4",
  measurementId: "G-M1LDVFTJV0",
};
