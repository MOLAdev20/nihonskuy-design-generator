const { env } = require('../config/env');

function corsMiddleware(req, res, next) {
  const requestOrigin = req.headers.origin;
  const isAllowedOrigin = requestOrigin && env.corsOrigins.includes(requestOrigin);

  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  return next();
}

module.exports = {
  corsMiddleware,
};
