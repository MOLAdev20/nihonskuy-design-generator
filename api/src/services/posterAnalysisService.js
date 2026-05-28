const { GoogleGenerativeAI } = require('@google/generative-ai');
const { env } = require('../config/env');
const { createHttpError } = require('../utils/httpError');

function buildPrompt(pdfText) {
  return `Kamu adalah HR profesional di Nihonskuy. Tugasmu membaca teks hasil ekstrak dokumen lowongan kerja Jepang (Kyujinhyo), lalu menyusun:
1. JSON ringkas untuk prefill form poster
2. Penjelasan analitis yang padat, lengkap, mendetail, dan enak disampaikan ke user

Fokus analisis:
- Jabatan / posisi kerja
- Lokasi kerja
- Gaji pokok atau range gaji
- Persyaratan utama
- Benefit / kompensasi / fasilitas
- Catatan penting, risiko, atau detail yang masih perlu diverifikasi user

Aturan Analisis Dokumen:
1. posisi: Cari di bagian "業職" atau pekerjaan utama. Jika tertulis "介護", terjemahkan secara profesional menjadi "Keperawatan (Kaigo)". Maksimal 30 karakter.
2. lokasi: Cari di bagian "就業場所". Ambil nama Prefektur dan Kotanya saja, tulis dengan HURUF KAPITAL (contoh: "SAITAMA - MISATO").
3. gaji: Cari di bagian "給与". Ambil kisaran "月給" terendah dan tertinggi yang ada. Format harus "¥272,200 - ¥302,200".
4. syarat: Cari di bagian "応募条件", "必要な経験", "必要な資格", "備考", atau kriteria umum. Ekstrak maksimal 4 poin persyaratan paling penting. Maksimal 40 karakter per poin.
5. benefit: Cari di bagian "待遇", "福利厚生", "手当", "備考", atau kompensasi tambahan. Ekstrak maksimal 5 poin benefit paling penting. Maksimal 40 karakter per poin.
6. penjelasan: Tulis penjabaran lengkap dalam bahasa Indonesia. Harus padat, informatif, dan mudah dipakai user untuk memahami isi Kyujinhyo. Jelaskan detail penting, kemungkinan arti bagian dokumen, hal yang menguntungkan, dan hal yang perlu dicek ulang. Format sebagai string multiline dengan paragraf-paragraf pendek. Maksimal sekitar 1200 karakter.
7. Jika data tidak ditemukan, isi string kosong "" atau array kosong [] sesuai tipe field. Jangan mengarang.

Output WAJIB JSON valid dengan bentuk:
{
  "posisi": "Nama Jabatan",
  "lokasi": "PREFEKTUR - KOTA",
  "gaji": "¥Angka - ¥Angka",
  "syarat": ["Poin 1", "Poin 2"],
  "benefit": ["Poin 1", "Poin 2"],
  "penjelasan": "Paragraf analisa..."
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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGeminiError(error) {
  const message = String(error?.message || '');
  return message.includes('[503 Service Unavailable]')
    || message.includes('currently experiencing high demand')
    || message.includes('503');
}

function getGeminiModelCandidates() {
  return [env.geminiModel, ...env.geminiFallbackModels]
    .filter(Boolean)
    .filter((model, index, models) => models.indexOf(model) === index);
}

async function generateWithModel(genAI, modelName, prompt) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0,
    },
  }, {
    apiVersion: env.geminiApiVersion,
  });

  return model.generateContent(prompt);
}

async function extractLokerDataFromPdfText(pdfText) {
  if (!env.geminiApiKey) {
    throw createHttpError(500, 'GEMINI_API_KEY belum diset.');
  }

  const genAI = new GoogleGenerativeAI(env.geminiApiKey);
  const prompt = buildPrompt(pdfText);
  const modelCandidates = getGeminiModelCandidates();
  let result;

  for (const modelName of modelCandidates) {
    for (let attempt = 0; attempt <= env.geminiRetryCount; attempt += 1) {
      try {
        result = await generateWithModel(genAI, modelName, prompt);
        break;
      } catch (error) {
        if (!isRetryableGeminiError(error)) {
          throw error;
        }

        if (attempt < env.geminiRetryCount) {
          await delay(1200 * (attempt + 1));
        }
      }
    }

    if (result) {
      break;
    }
  }

  if (!result) {
    throw createHttpError(
      503,
      'Layanan AI Gemini sedang sibuk. Coba upload lagi beberapa saat ke depan.'
    );
  }

  const parsed = parseJsonFromModelText(result.response.text());

  if (!Array.isArray(parsed.syarat)) {
    throw createHttpError(502, 'Format respons Gemini invalid: "syarat" harus array.');
  }
  if (!Array.isArray(parsed.benefit)) {
    throw createHttpError(502, 'Format respons Gemini invalid: "benefit" harus array.');
  }
  if (typeof parsed.penjelasan !== 'string') {
    throw createHttpError(502, 'Format respons Gemini invalid: "penjelasan" harus string.');
  }

  return parsed;
}

module.exports = {
  extractLokerDataFromPdfText,
};
