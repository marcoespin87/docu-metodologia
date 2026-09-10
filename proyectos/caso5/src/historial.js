'use strict';

const store = require('./store');

// Fix de Fase 0 (docs/plan-fase0-historial-2026-09-10.md, sección 3): el
// código heredado incluía siempre los pedidos 'cancelado' sin importar el
// filtro pedido; era un bug, no una decisión de producto documentada.
function listarHistorial({ estado } = {}) {
  const todos = store.todos();
  if (!estado) return todos;
  return todos.filter((p) => p.estado === estado);
}

module.exports = { listarHistorial };
