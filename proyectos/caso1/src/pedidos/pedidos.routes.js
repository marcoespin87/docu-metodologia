'use strict';

const express = require('express');
const { authMiddleware, requireRole } = require('../auth/auth.middleware');
const pedidosService = require('./pedidos.service');

const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
  try {
    const pedido = pedidosService.crearPedido(req.usuario, req.body || {});
    res.status(201).json(pedido);
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, (req, res) => {
  const pedido = pedidosService.obtenerPedido(Number(req.params.id));
  if (!pedido) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }
  if (req.usuario.rol === 'cliente' && pedido.clienteId !== req.usuario.id) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }
  res.status(200).json(pedido);
});

router.patch('/:id/estado', authMiddleware, requireRole('administrador'), (req, res) => {
  const pedido = pedidosService.obtenerPedido(Number(req.params.id));
  if (!pedido) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }
  const { estado } = req.body || {};
  if (pedido.estado !== 'Enviado' || estado !== 'Entregado') {
    return res.status(409).json({ error: 'Esta operación solo permite marcar un pedido Enviado como Entregado' });
  }
  try {
    const actualizado = pedidosService.cambiarEstado(pedido.id, estado);
    res.status(200).json(actualizado);
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
});

module.exports = router;
