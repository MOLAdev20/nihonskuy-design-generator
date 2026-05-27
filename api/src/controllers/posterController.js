const { createHttpError } = require('../utils/httpError');
const { renderPosterImage, normalizeManualPosterData } = require('../services/posterRenderService');

async function generatePoster(req, res, next) {
  try {
    const posterData = normalizeManualPosterData(req.body);
    const outputBuffer = await renderPosterImage(posterData, { variant: 'manual' });

    res.setHeader('Content-Type', 'image/png');
    return res.send(outputBuffer);
  } catch (error) {
    return next(error);
  }
}

async function healthCheck(req, res) {
  return res.json({
    success: true,
    message: 'API is healthy',
  });
}

module.exports = {
  generatePoster,
  healthCheck,
};
