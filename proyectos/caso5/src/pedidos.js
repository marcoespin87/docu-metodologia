'use strict';

const store = require('./store');

const ESTADOS_VALIDOS = ['pendiente', 'enviado', 'entregado', 'cancelado'];

function crearPedido({ cliente, items } = {}) {
  if (!cliente) throw new Error('cliente es obligatorio');
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items no puede estar vacío');
  }
  return store.agregar({
    cliente,
    items,
    estado: 'pendiente',
    creadoEn: Date.now(),
  });
}

function cambiarEstado(id, nuevoEstado) {
  if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
    throw new Error(`estado inválido: ${nuevoEstado}`);
  }
  const pedido = store.buscarPorId(id);
  if (!pedido) throw new Error(`pedido ${id} no existe`);
  pedido.estado = nuevoEstado;
  return pedido;
}

module.exports = { crearPedido, cambiarEstado, ESTADOS_VALIDOS };
