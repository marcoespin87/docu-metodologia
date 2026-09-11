'use strict';

// Máquina de estados del pedido. Ver docs/specs/spec-pedidos.md.

const TRANSICIONES = {
  Pendiente: ['Procesando', 'Cancelado'],
  Procesando: ['Pagado', 'Pendiente', 'Cancelado'],
  Pagado: ['Enviado'],
  Enviado: ['Entregado'],
  Entregado: ['Devuelto'],
  Cancelado: [],
  Devuelto: [],
};

function esTransicionValida(estadoActual, estadoNuevo) {
  return (TRANSICIONES[estadoActual] || []).includes(estadoNuevo);
}

module.exports = { esTransicionValida, TRANSICIONES };
