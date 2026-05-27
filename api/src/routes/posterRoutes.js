const express = require('express');
const { generatePoster, healthCheck } = require('../controllers/posterController');
const { generatePosterFromPdf } = require('../controllers/pdfPosterController');
const { upload } = require('../middlewares/upload');

const router = express.Router();

router.get('/health', healthCheck);

router.post('/posters', generatePoster);
router.post('/posters/from-pdf', upload.single('filePdf'), generatePosterFromPdf);

// Legacy aliases supaya client lama tetap jalan.
router.post('/generate-poster', generatePoster);
router.post('/generate-poster-pdf', upload.single('filePdf'), generatePosterFromPdf);

module.exports = router;
