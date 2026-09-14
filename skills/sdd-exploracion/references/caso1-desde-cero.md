# Caso 1 — Desde cero

No hay sistema ni specs todavía. Casi no hay nada previo que contrastar — la Exploración acá es liviana a propósito.

## Qué hacer

1. Confirmar que efectivamente no hay nada: ni `docs/specs/`, ni código relevante, ni documento de arquitectura.
2. No inventar requisitos que el usuario no pidió. Trabajar solo con la idea/necesidad que dio en `$ARGUMENTS` (o lo que responda si se le preguntó).
3. Si la idea es vaga ("necesitamos un sistema de X"), no tratar de adivinar el alcance completo en esta fase — eso es trabajo de `/sdd-propuesta`. Acá alcanza con entender el problema de negocio a alto nivel.
4. Identificar, a partir de la idea, qué capacidades tendría sentido separar (no hace falta ser exhaustivo ni definitivo — es una sugerencia inicial que `/sdd-propuesta` va a confirmar o ajustar).

## Qué dejar como resumen de salida

- Problema/necesidad de negocio, en 2-3 frases.
- **Caso:** 1 (desde cero).
- **Delta tentativo:** 100% del sistema.
- **Invariantes que restringen:** ninguno todavía (no hay nada previo) — dejarlo explícito en vez de omitir la sección.
- Un camino sugerido: qué capacidades separarías, sin comprometerse a esa lista.

## Qué NO hacer en esta fase

- No definir stack todavía (eso se decide o confirma en `/sdd-propuesta`).
- No crear ningún archivo — ni siquiera `docs/specs/README.md` vacío. Nace recién en `/sdd-aplicacion`.
