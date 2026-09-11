'use strict';

// Capacidad "pedidos": ciclo de vida del pedido (creación multi-línea con
// cálculo de subtotal/impuestos, máquina de estados). Ver
// docs/specs/spec-pedidos.md.

const store = require('../store');
const inventario = require('../inventario/inventario.service');
const { esTransicionValida } = require('./estados');

const TASA_IMPUESTO = 0.15;

class TransicionInvalidaError extends Error {}
class PedidoNoEncontradoError extends Error {}

function siguienteId(pedidos) {
  return pedidos.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}

function resolverClienteId(usuarioActual, body) {
  if (usuarioActual.rol === 'administrador' && body.clienteId) {
    return body.clienteId;
  }
  return usuarioActual.id;
}

function crearPedido(usuarioActual, body) {
  const lineasEntrada = (body && body.lineas) || [];
  if (lineasEntrada.length === 0) {
    throw new Error('El pedido debe tener al menos una línea');
  }

  for (const linea of lineasEntrada) {
    if (!inventario.validarDisponibilidad(linea.productoId, linea.cantidad)) {
      throw new Error(`Stock insuficiente para el producto ${linea.productoId}`);
    }
  }

  const lineas = lineasEntrada.map((linea) => {
    const producto = inventario.buscarProducto(linea.productoId);
    return { productoId: producto.id, cantidad: linea.cantidad, precioUnitario: producto.precioUnitario };
  });

  for (const linea of lineas) {
    inventario.reservarStock(linea.productoId, linea.cantidad);
  }

  const subtotal = lineas.reduce((acc, l) => acc + l.cantidad * l.precioUnitario, 0);
  const impuestos = Math.round(subtotal * TASA_IMPUESTO);
  const total = subtotal + impuestos;
  const ahora = new Date().toISOString();

  const db = store.cargar();
  const pedido = {
    id: siguienteId(db.pedidos),
    clienteId: resolverClienteId(usuarioActual, body),
    lineas,
    subtotal,
    impuestos,
    total,
    estado: 'Pendiente',
    guiaEnvio: null,
    transaccionPagoId: null,
    historialEstados: [{ estado: 'Pendiente', fecha: ahora }],
    creadoEn: ahora,
  };
  db.pedidos.push(pedido);
  store.guardar(db);

  return pedido;
}

function obtenerPedido(id) {
  const db = store.cargar();
  return db.pedidos.find((p) => p.id === id) || null;
}

function cambiarEstado(id, nuevoEstado) {
  const db = store.cargar();
  const pedido = db.pedidos.find((p) => p.id === id);
  if (!pedido) {
    throw new PedidoNoEncontradoError(`Pedido ${id} no existe`);
  }
  if (!esTransicionValida(pedido.estado, nuevoEstado)) {
    throw new TransicionInvalidaError(`No se puede pasar de ${pedido.estado} a ${nuevoEstado}`);
  }
  pedido.estado = nuevoEstado;
  pedido.historialEstados.push({ estado: nuevoEstado, fecha: new Date().toISOString() });
  store.guardar(db);
  return pedido;
}

module.exports = {
  crearPedido,
  obtenerPedido,
  cambiarEstado,
  TransicionInvalidaError,
  PedidoNoEncontradoError,
  TASA_IMPUESTO,
};
