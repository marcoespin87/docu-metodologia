'use strict';

// Filtrado "del lado del cliente": opera sobre un historial ya obtenido,
// no consulta el almacén. Ver decisión fechada en
// docs/specs/spec-historial.md.
function filtrarPorEstado(historial, estado) {
  if (!estado) return historial;
  return historial.filter((p) => p.estado === estado);
}

module.exports = { filtrarPorEstado };
