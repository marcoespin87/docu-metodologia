# Caso 2 — Funcionalidad nueva sobre un sistema existente

Ya existe sistema + specs. Se agrega algo que no existía — no reemplaza ni modifica ningún
comportamiento actual. Dos variantes, según si la capacidad afectada ya tiene spec o no:

- **Capacidad nueva:** no hay spec para ella todavía. El spec nace recién en `/sdd-aplicacion`.
- **Subcapacidad nueva dentro de una capacidad ya existente:** el spec de esa capacidad ya
  existe (ejemplo de la propia metodología, sección 7: agregar un filtro por estado a un
  historial que ya tenía `spec-historial.md`). En `/sdd-aplicacion` no nace un spec — se le
  agrega una sección nueva al que ya hay.

En ambas variantes el delta es AGREGADO y el criterio de "no choca con nada existente" (abajo)
es el mismo. No asumir que "el spec ya existe" empuja esto a Caso 3 — lo que importa es si lo
que el spec **ya describe hoy** sigue siendo cierto sin matices después del cambio.

## Qué hacer

1. Leer los specs relevantes:
   - Si es capacidad nueva: los specs **vecinos** — de capacidades relacionadas que podrían
     compartir invariantes, datos o interfaz con lo nuevo.
   - Si es subcapacidad dentro de una capacidad existente: el spec **de esa misma capacidad**
     (para confirmar que lo pedido de verdad no toca nada de lo que ya describe) + los vecinos
     si aplica.
2. Confirmar explícitamente que lo pedido no choca con ningún invariante existente en esos
   specs. Si choca, decirlo ahora — puede que en realidad sea un Caso 3 disfrazado (si para
   agregar esto hay que romper o reinterpretar un invariante ya escrito, o si el comportamiento
   ya documentado deja de cumplirse sin usar lo nuevo, es una modificación, no un agregado
   puro).
3. Leer el documento de arquitectura para confirmar que la nueva capacidad encaja con el
   patrón/arquitectura ya establecidos (no proponer un patrón distinto sin que sea una decisión
   consciente y señalada).

## Qué dejar como resumen de salida

- Problema/necesidad, en 2-3 frases.
- **Caso:** 2 (funcionalidad nueva).
- **Delta tentativo:** AGREGADO.
- Si la capacidad ya tenía spec: decirlo explícitamente ("se agrega una sección nueva a
  `spec-<capacidad>.md`", no nace un spec).
- **Invariantes que restringen:** los citados de los specs leídos, con su "porqué".
- Confirmación de que no hay conflicto con nada existente (o la advertencia si la hay).

## Qué NO hacer en esta fase

- No escribir el spec (nuevo, o la sección nueva sobre uno existente) todavía — nace en
  `/sdd-aplicacion`, junto con el código, no antes.
- No decidir el enfoque técnico completo — eso es `/sdd-propuesta`.
