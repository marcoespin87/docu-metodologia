# Spec: Historial

**Estado:** desplegado · **Última revisión:** 2026-09-10

## Propósito

Permitir consultar todos los pedidos creados, su estado actual, y
filtrarlos por estado.

## Comportamiento

- Listar el historial devuelve todos los pedidos existentes, en el orden
  en que fueron creados.
- Cada pedido en el historial refleja su estado más reciente.
- Si no hay pedidos, el historial es una lista vacía.
- Filtrar por estado devuelve **exactamente** los pedidos que están en ese
  estado (incluido `cancelado`), sin pedidos de otros estados mezclados.
- Sin filtro, el resultado es el historial completo.

## Invariantes (no negociables)

- **El filtro por estado nunca devuelve pedidos de un estado distinto al
  pedido.** Por qué: nació de un bug real detectado en la Fase 0 (ver
  Decisiones) — un comentario heredado sin autor ni fecha hacía que los
  pedidos `cancelado` aparecieran siempre, sin importar el filtro. Se deja
  como invariante explícito para que ningún cambio futuro reintroduzca esa
  excepción "sin querer".

## Decisiones

- 2026-09-10: spec redactado por ingeniería inversa (Fase 0, Caso 5) a
  partir de `src/historial.js`, sin tests previos que lo cubrieran. La
  revisión humana detectó que el filtro incluía siempre los `cancelado`
  independientemente del estado pedido; se confirmó que era un bug (no
  una decisión de producto documentada) y se corrigió en el mismo
  baseline. Ver `docs/plan-fase0-historial-2026-09-10.md`.

## Fuera de alcance

- Búsquedas por otros campos (cliente, rango de fechas, items).
- Paginación.

## Referencias

- Código: `src/historial.js`.
- Tests: `test/historial.test.js` (nacen en esta Fase 0 — no existían
  antes).
- Plan de origen: `docs/plan-fase0-historial-2026-09-10.md`.
