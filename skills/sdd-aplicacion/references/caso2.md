# Caso 2 — Aplicación del cambio

Código nuevo + spec nuevo o sección nueva, sin tocar el comportamiento existente.

## Qué construir

- La funcionalidad nueva, integrada con lo existente según lo que definió `/sdd-propuesta` (reusar componentes existentes en vez de duplicar).
- El spec: si el plan decidió que es una sección nueva de un spec existente, agregarla en `Comportamiento` (y `Invariantes`/`Decisiones` si corresponde) sin tocar las secciones que describen lo que ya había. Si el plan decidió que es un spec propio nuevo, crearlo completo y agregar la fila al índice.

## Verificación propia (antes de pasar a `/sdd-verificacion`)

Confirmar a mano que lo que ya existía se sigue comportando exactamente igual que antes de este cambio — no dejar esto solo para la fase de Verificación formal; si algo se rompió, es más barato notarlo acá.
