const { GoogleGenerativeAI } = require('@google/generative-ai');
const { env } = require('../config/env');
const { createHttpError } = require('../utils/httpError');

function buildPrompt(pdfText) {
  return `Kamu adalah HR profesional di Nihonskuy. Tugasmu membaca teks hasil ekstrak dokumen lowongan kerja Jepang (Kyujinhyo) dan menyusunnya menjadi JSON ringkas untuk poster Instagram.

Aturan Analisis Dokumen:
1. posisi: Cari di bagian "業職" atau pekerjaan utama. Jika tertulis "介護", terjemahkan secara profesional menjadi "Keperawatan (Kaigo)". Maksimal 30 karakter.
2. lokasi: Cari di bagian "就業場所". Ambil nama Prefektur dan Kotanya saja, tulis dengan HURUF KAPITAL (contoh: "SAITAMA - MISATO").
3. gaji: Cari di bagian "給与". Ambil kisaran "月給" terendah dan tertinggi yang ada. Format harus "¥272,200 - ¥302,200".
4. syarat: Cari di bagian "応募条件", "必要な経験", "必要な資格", "備考", atau kriteria umum. Ekstrak maksimal 4 poin persyaratan paling penting. Maksimal 40 karakter per poin.
5. benefit: Cari di bagian "待遇", "福利厚生", "手当", "備考", atau kompensasi tambahan. Ekstrak maksimal 5 poin benefit paling penting. Maksimal 40 karakter per poin.
6. Jika data tidak ditemukan, isi string kosong "" atau array kosong [] sesuai tipe field. Jangan mengarang.

Output WAJIB JSON valid dengan bentuk:
{
  "posisi": "Nama Jabatan",
  "lokasi": "PREFEKTUR - KOTA",
  "gaji": "¥Angka - ¥Angka",
  "syarat": ["Poin 1", "Poin 2"],
  "benefit": ["Poin 1", "Poin 2"]
}

Jangan gunakan markdown, jangan gunakan code block, jangan tambahkan penjelasan apa pun. Balas JSON saja.

Teks PDF:
${pdfText}`;
}

function parseJsonFromModelText(rawText) {
  const trimmed = String(rawText || '').trim();

  if (!trimmed) {
    throw createHttpError(502, 'Respons Gemini kosong.');
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const jsonText = fencedMatch ? fencedMatch[1].trim() : trimmed;

  return JSON.parse(jsonText);
}

async function extractLokerDataFromPdfText(pdfText) {
  if (!env.geminiApiKey) {
    throw createHttpError(500, 'GEMINI_API_KEY belum diset.');
  }

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: env.geminiModel,
    generationConfig: {
      temperature: 0,
    },
  }, {
    apiVersion: env.geminiApiVersion,
  });

  const result = await model.generateContent(buildPrompt(pdfText));
  const parsed = parseJsonFromModelText(result.response.text());

  if (!Array.isArray(parsed.syarat)) {
    throw createHttpError(502, 'Format respons Gemini invalid: "syarat" harus array.');
  }
  if (!Array.isArray(parsed.benefit)) {
    throw createHttpError(502, 'Format respons Gemini invalid: "benefit" harus array.');
  }

  return parsed;
}

module.exports = {
  extractLokerDataFromPdfText,
};
