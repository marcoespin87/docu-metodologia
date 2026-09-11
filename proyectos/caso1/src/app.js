'use strict';

const express = require('express');
const authRoutes = require('./auth/auth.routes');
const inventarioRoutes = require('./inventario/inventario.routes');
const pedidosRoutes = require('./pedidos/pedidos.routes');

function crearApp() {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);
  app.use('/productos', inventarioRoutes);
  app.use('/pedidos', pedidosRoutes);
  return app;
}

module.exports = { crearApp };
