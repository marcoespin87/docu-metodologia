'use strict';

const store = require('./store');

// Filtrado por estado resuelto acá (servidor), no en el consumidor.
// Ver decisión fechada en docs/specs/spec-historial.md.
function listarHistorial({ estado } = {}) {
  const todos = store.todos();
  if (!estado) return todos;
  return todos.filter((p) => p.estado === estado);
}

module.exports = { listarHistorial };
