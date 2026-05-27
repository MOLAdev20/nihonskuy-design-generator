const { createHttpError } = require('../utils/httpError');
const { extractPdfTextFromBuffer } = require('../services/pdfExtractionService');
const { extractLokerDataFromPdfText } = require('../services/posterAnalysisService');
const { renderPosterImage, normalizeAiPosterData } = require('../services/posterRenderService');

async function generatePosterFromPdf(req, res, next) {
  try {
    if (!req.file) {
      throw createHttpError(400, 'Mana file PDF-nya, bro? Upload dulu!');
    }

    const pdfText = (await extractPdfTextFromBuffer(req.file.buffer)).trim();
    if (!pdfText) {
      throw createHttpError(400, 'Teks PDF kosong atau gagal diekstrak.');
    }

    const extractedData = await extractLokerDataFromPdfText(pdfText);
    const posterData = normalizeAiPosterData(extractedData);
    const outputBuffer = await renderPosterImage(posterData, { variant: 'pdf' });

    res.setHeader('Content-Type', 'image/png');
    return res.send(outputBuffer);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  generatePosterFromPdf,
};
