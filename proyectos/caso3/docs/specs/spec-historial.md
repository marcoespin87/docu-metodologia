# Spec: Historial

**Estado:** desplegado · **Última revisión:** 2026-09-10

## Propósito

Permitir consultar todos los pedidos creados, su estado actual, y
filtrarlos por estado.

## Comportamiento

- Listar el historial devuelve todos los pedidos existentes, en el orden
  en que fueron creados.
- Cada pedido en el historial refleja su estado más reciente (si cambió
  de estado, el historial lo muestra actualizado).
- Si no hay pedidos, el historial es una lista vacía.
- **Filtrado por estado:** el historial puede filtrarse por exactamente
  uno de los 4 estados válidos (`pendiente`, `enviado`, `entregado`,
  `cancelado`), devolviendo solo los pedidos que están en ese estado.
- Sin filtro, el resultado es el historial completo (no hay estado
  "por defecto").
- Filtrar por un estado sin pedidos devuelve una lista vacía, no un error.

## Invariantes (no negociables)

- **El historial siempre refleja el estado actual, no el de creación.**
  Por qué: es la única vista de consulta del sistema; si mostrara un
  estado desactualizado, sería la fuente de un reporte incorrecto.

## Decisiones

- 2026-09-10: el filtrado por estado se implementa del lado del cliente
  (sobre el historial ya obtenido), no como parte de `listarHistorial()`
  — es la solución más simple para el volumen actual de pedidos.
- 2026-09-10: el filtro pasa a resolverse en el servidor
  (`listarHistorial({estado})`) — el cliente no escala a medida que crece
  el número de pedidos (trae todo el historial para descartar la mayoría).
  Comportamiento observable idéntico al de la decisión anterior.

## Fuera de alcance

- Búsquedas por otros campos (cliente, rango de fechas, items).
- Paginación (asumido innecesario al volumen de este ejercicio).

## Referencias

- Código: `src/historial.js` (filtro resuelto acá desde 2026-09-10;
  `src/filtroCliente.js` se eliminó por quedar sin uso).
- Tests: `test/historial.test.js`.
- Plan de origen: `docs/plan-sistema-pedidos-2026-09-10.md`,
  `docs/plan-filtro-estado-historial-2026-09-10.md`,
  `docs/plan-filtro-estado-a-servidor-2026-09-10.md`.
