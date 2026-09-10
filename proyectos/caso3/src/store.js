'use strict';

// Almacén en memoria compartido por las capacidades "pedidos" e "historial".
// No es una capacidad en sí: es infraestructura interna (ver AGENTS.md).

let pedidos = [];
let siguienteId = 1;

function reset() {
  pedidos = [];
  siguienteId = 1;
}

function agregar(pedido) {
  const nuevo = { ...pedido, id: siguienteId++ };
  pedidos.push(nuevo);
  return nuevo;
}

function todos() {
  return pedidos;
}

function buscarPorId(id) {
  return pedidos.find((p) => p.id === id);
}

module.exports = { reset, agregar, todos, buscarPorId };
