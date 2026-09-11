'use strict';

const express = require('express');
const { authMiddleware } = require('../auth/auth.middleware');
const { listarProductos } = require('./inventario.service');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  res.status(200).json(listarProductos());
});

module.exports = router;
