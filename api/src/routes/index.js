const express = require('express');
const posterRoutes = require('./posterRoutes');

const router = express.Router();

router.use('/', posterRoutes);

module.exports = router;
