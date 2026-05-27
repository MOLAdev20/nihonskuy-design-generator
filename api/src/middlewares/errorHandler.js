function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
}

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  console.error('API Error:', error.message);

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Terjadi error di server.',
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
