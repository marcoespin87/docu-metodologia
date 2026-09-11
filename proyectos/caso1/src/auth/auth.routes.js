'use strict';

const express = require('express');
const { login } = require('./auth.service');

const router = express.Router();

router.post('/login', (req, res) => {
  const { usuario, password } = req.body || {};
  const resultado = login(usuario, password);
  if (!resultado) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  res.status(200).json(resultado);
});

module.exports = router;
