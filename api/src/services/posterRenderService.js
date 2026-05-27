const { ensureLocalFontConfig } = require('../config/fontconfig');
ensureLocalFontConfig();

const sharp = require('sharp');
const { paths } = require('../config/paths');
const { buildAdumuTextElement, hasAdumuFont } = require('./fontPathService');
const { escapeXml } = require('../utils/escapeXml');
const { createHttpError } = require('../utils/httpError');

function sanitizeString(value) {
  return escapeXml(value || '');
}

function sanitizeStringArray(value) {
  return Array.isArray(value) ? value.map((item) => sanitizeString(item)) : [];
}

function normalizeManualPosterData(payload) {
  const lokasi = sanitizeString(payload.lokasi);
  const gaji = sanitizeString(payload.gaji);
  const posisi = sanitizeString(payload.posisi);

  if (!lokasi || !gaji || !posisi) {
    throw createHttpError(400, 'Input lokasi, gaji, dan posisi wajib diisi ya, bro!');
  }

  return {
    lokasi,
    gaji,
    posisi,
    syarat: sanitizeStringArray(payload.syarat),
    benefit: sanitizeStringArray(payload.benefit),
  };
}

function normalizeAiPosterData(payload) {
  return {
    lokasi: sanitizeString(payload.lokasi),
    gaji: sanitizeString(payload.gaji),
    posisi: sanitizeString(payload.posisi),
    syarat: sanitizeStringArray(payload.syarat),
    benefit: sanitizeStringArray(payload.benefit),
  };
}

function buildManualContentSectionSvg(dataLoker) {
  let contentSvg = '';
  let currentY = 675;
  const lineSpacing = 42;

  if (dataLoker.syarat.length > 0) {
    contentSvg += `<text x="130" y="${currentY}" font-family="'Montserrat', sans-serif" font-size="29" font-weight="800" fill="#1E1A4B">PERSYARATAN:</text>\n`;
    currentY += lineSpacing;

    dataLoker.syarat.forEach((item) => {
      contentSvg += `<text x="150" y="${currentY}" font-family="'Montserrat', sans-serif" font-size="29" font-weight="700" fill="#1E1A4B">• ${item}</text>\n`;
      currentY += lineSpacing;
    });
  }

  currentY += 20;

  if (dataLoker.benefit.length > 0) {
    contentSvg += `<text x="130" y="${currentY}" font-family="'Montserrat', sans-serif" font-size="29" font-weight="800" fill="#1E1A4B">BENEFIT:</text>\n`;
    currentY += lineSpacing;

    dataLoker.benefit.forEach((item) => {
      contentSvg += `<text x="150" y="${currentY}" font-family="'Montserrat', sans-serif" font-size="29" font-weight="700" fill="#1E1A4B">+ ${item}</text>\n`;
      currentY += lineSpacing;
    });
  }

  return contentSvg;
}

function buildPdfSyaratSvg(dataLoker) {
  let syaratSvgElements = '';
  let startY = 700;

  dataLoker.syarat.forEach((item) => {
    syaratSvgElements += `<text x="130" y="${startY}" font-family="'Montserrat', sans-serif" font-size="28" font-weight="700" fill="#1E1A4B">• ${item}</text>\n`;
    startY += 55;
  });

  return syaratSvgElements;
}

function buildManualPosterOverlay(width, height, dataLoker) {
  if (!hasAdumuFont()) {
    console.warn('Adumu.ttf tidak ditemukan. Font gaji akan fallback.');
  }

  const gajiSvgElement = buildAdumuTextElement(dataLoker.gaji, 55, 500, 85, '#000000');
  const contentSvg = buildManualContentSectionSvg(dataLoker);

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="55" y="400" font-family="'Open Sans', sans-serif" font-size="50" font-weight="700" fill="#000000" letter-spacing="0.5">${dataLoker.lokasi}</text>
      ${gajiSvgElement}
      <text x="180" y="590" font-family="'Montserrat', sans-serif" font-size="40" font-weight="700" fill="#FFFFFF">${dataLoker.posisi}</text>
      ${contentSvg}
    </svg>
  `;
}

function buildPdfPosterOverlay(width, height, dataLoker) {
  const syaratSvg = buildPdfSyaratSvg(dataLoker);

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="80" y="455" font-family="'Montserrat', sans-serif" font-size="26" font-weight="700" fill="#4B4A6B" letter-spacing="1">${dataLoker.lokasi}</text>
      <text x="80" y="505" font-family="'Montserrat', sans-serif" font-size="36" font-weight="900" fill="#E11D48">${dataLoker.gaji}</text>
      <text x="180" y="562" font-family="'Montserrat', sans-serif" font-size="26" font-weight="700" fill="#FFFFFF">${dataLoker.posisi}</text>
      ${syaratSvg}
    </svg>
  `;
}

function buildPosterOverlay(width, height, dataLoker, variant) {
  return variant === 'pdf'
    ? buildPdfPosterOverlay(width, height, dataLoker)
    : buildManualPosterOverlay(width, height, dataLoker);
}

async function renderPosterImage(dataLoker, options = {}) {
  const imageMetadata = await sharp(paths.templatePath).metadata();
  const width = imageMetadata.width || 1080;
  const height = imageMetadata.height || 1080;
  const svgOverlay = buildPosterOverlay(width, height, dataLoker, options.variant);

  return sharp(paths.templatePath)
    .composite([{ input: Buffer.from(svgOverlay), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

module.exports = {
  normalizeManualPosterData,
  normalizeAiPosterData,
  renderPosterImage,
};
