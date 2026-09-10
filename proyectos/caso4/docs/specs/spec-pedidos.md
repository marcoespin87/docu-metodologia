# Spec: Pedidos

**Estado:** desplegado · **Última revisión:** 2026-09-10

## Propósito

Permitir crear pedidos y hacerlos avanzar por sus estados válidos.

## Comportamiento

- Crear un pedido requiere un `cliente` y una lista de `items` no vacía.
- Todo pedido creado nace en estado `pendiente`.
- Un pedido puede cambiar de estado a cualquiera de: `pendiente`,
  `enviado`, `entregado`, `cancelado`.
- Cambiar el estado de un pedido inexistente, o a un estado que no es uno
  de los 4 válidos, es un error.

## Invariantes (no negociables)

- **Un pedido siempre nace en `pendiente`.** Por qué: garantiza un único
  punto de entrada al flujo de estados; si se pudiera crear directamente
  en `enviado` o `entregado`, cualquier reporte de "pedidos que pasaron
  por pendiente" dejaría de ser confiable.
- **Los estados válidos son exactamente 4** (`pendiente`, `enviado`,
  `entregado`, `cancelado`). Por qué: cualquier código o reporte que
  itere sobre estados asume este conjunto cerrado; agregar un estado
  nuevo es un cambio de comportamiento y debe pasar por este spec.

## Decisiones

- 2026-09-10: sin persistencia real, almacén en memoria — el proyecto es
  un ejercicio de metodología, no un sistema en producción.
- 2026-09-10: migrado de Node.js a Python — comportamiento idéntico,
  validado con tests de caracterización (ver plan de migración). El código
  Node queda archivado en `legacy-node/`.

## Fuera de alcance

- Notificaciones al cliente por cambio de estado.
- Reglas de transición entre estados (p. ej. impedir pasar de `cancelado`
  a `entregado`): hoy cualquier estado válido es alcanzable desde
  cualquier otro.

## Referencias

- Código: `src/pedidos.py`, `src/store.py` (implementación viva desde
  2026-09-10; versión Node archivada en `legacy-node/src/pedidos.js`).
- Tests: `tests/test_pedidos.py` (caracterización derivada de este spec;
  equivalente a `legacy-node/test/pedidos.test.js`).
- Plan de origen: `docs/plan-sistema-pedidos-2026-09-10.md`,
  `docs/plan-migracion-python-2026-09-10.md`.
