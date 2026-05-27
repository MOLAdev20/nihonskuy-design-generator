const express = require('express');
const apiRouter = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const { corsMiddleware } = require('./middlewares/corsMiddleware');

const app = express();

app.use(corsMiddleware);
app.use(express.json());
app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
