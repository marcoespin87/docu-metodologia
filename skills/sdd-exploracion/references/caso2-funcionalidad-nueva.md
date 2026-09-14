# Caso 2 — Funcionalidad nueva sobre un sistema existente

Ya existe sistema + specs. Se agrega algo que no existía — no reemplaza ni modifica ningún comportamiento actual.

## Qué hacer

1. Leer los specs **vecinos**: no necesariamente el que se va a crear (todavía no existe), sino los de capacidades relacionadas que podrían compartir invariantes, datos o interfaz con lo nuevo.
2. Confirmar explícitamente que lo pedido no choca con ningún invariante existente en esos specs vecinos. Si choca, decirlo ahora — puede que en realidad sea un Caso 3 disfrazado (si para agregar esto hay que romper o reinterpretar un invariante ya escrito, es una modificación, no un agregado puro).
3. Leer el documento de arquitectura para confirmar que la nueva capacidad encaja con el patrón/arquitectura ya establecidos (no proponer un patrón distinto sin que sea una decisión consciente y señalada).

## Qué dejar como resumen de salida

- Problema/necesidad, en 2-3 frases.
- **Caso:** 2 (funcionalidad nueva).
- **Delta tentativo:** AGREGADO.
- **Invariantes que restringen:** los citados de los specs vecinos, con su "porqué".
- Confirmación de que no hay conflicto con nada existente (o la advertencia si la hay).

## Qué NO hacer en esta fase

- No escribir el spec nuevo todavía — nace en `/sdd-aplicacion`, junto con el código, no antes.
- No decidir el enfoque técnico completo — eso es `/sdd-propuesta`.
