# Caso 3 — Aplicación del cambio

Código existente intervenido + porción del spec reemplazada (no todo el spec, solo la porción afectada) + decisión fechada.

## Qué construir

- Modificar (o eliminar) el código existente según el plan.
- En el spec: reemplazar la porción de `Comportamiento` que cambió — no reescribir el spec entero, no dejar rastros del comportamiento viejo mezclados con el nuevo.
- Si el plan determinó que el comportamiento observable no cambia (solo la implementación), tocar únicamente `Decisiones` (con fecha y porqué) y `Referencias` — dejar `Comportamiento` intacto, palabra por palabra, si sigue siendo exacto.
- Si se rompió un invariante existente a propósito, actualizar `Invariantes` para reflejar la nueva regla (no dejar el invariante viejo escrito junto al nuevo comportamiento que lo contradice).

## Verificación propia (antes de pasar a `/sdd-verificacion`)

Repasar qué otras partes del sistema dependían del comportamiento/implementación anterior (identificadas en `/sdd-exploracion` y `/sdd-propuesta`) y confirmar que siguen funcionando, o que su ajuste también quedó cubierto por este mismo cambio.
