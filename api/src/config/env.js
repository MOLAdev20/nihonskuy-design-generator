require('dotenv').config();

const env = {
  port: Number(process.env.PORT) || 3000,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  geminiFallbackModels: (process.env.GEMINI_FALLBACK_MODELS || 'gemini-2.5-flash-lite,gemini-2.0-flash')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean),
  geminiApiVersion: process.env.GEMINI_API_VERSION || 'v1',
  geminiRetryCount: Number(process.env.GEMINI_RETRY_COUNT) || 2,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

module.exports = {
  env,
};
