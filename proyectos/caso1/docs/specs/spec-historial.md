# Spec: Historial

**Estado:** desplegado · **Última revisión:** 2026-09-10

## Propósito

Permitir consultar todos los pedidos creados y su estado actual.

## Comportamiento

- Listar el historial devuelve todos los pedidos existentes, en el orden
  en que fueron creados.
- Cada pedido en el historial refleja su estado más reciente (si cambió
  de estado, el historial lo muestra actualizado).
- Si no hay pedidos, el historial es una lista vacía.

## Invariantes (no negociables)

- **El historial siempre refleja el estado actual, no el de creación.**
  Por qué: es la única vista de consulta del sistema; si mostrara un
  estado desactualizado, sería la fuente de un reporte incorrecto.

## Decisiones

_(ninguna aún)_

## Fuera de alcance

- Filtros o búsquedas sobre el historial.
- Paginación (asumido innecesario al volumen de este ejercicio).

## Referencias

- Código: `src/historial.js`.
- Tests: `test/historial.test.js`.
- Plan de origen: `docs/plan-sistema-pedidos-2026-09-10.md`.
