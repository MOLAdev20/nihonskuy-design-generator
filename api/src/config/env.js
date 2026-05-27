require('dotenv').config();

const env = {
  port: Number(process.env.PORT) || 3000,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  geminiApiVersion: process.env.GEMINI_API_VERSION || 'v1',
};

module.exports = {
  env,
};
