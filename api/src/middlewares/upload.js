const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter(req, file, callback) {
    if (file.mimetype !== 'application/pdf') {
      callback(new Error('File harus berformat PDF.'));
      return;
    }
    callback(null, true);
  },
});

module.exports = {
  upload,
};
