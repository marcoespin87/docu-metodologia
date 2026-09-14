---
name: sdd-propuesta
description: This skill should be used when the user explicitly invokes "/sdd-propuesta" to run the Change Proposal phase of the Spec-Anchored SDD methodology — turning a confirmed Exploration summary (case, delta, constraining invariants) plus the user's full natural-language instruction into a written plan file with acceptance criteria, before any code is touched. Manual-only: never auto-triggers from conversation content.
argument-hint: [instrucción completa del cambio a construir; opcional si ya se dio en /sdd-exploracion]
disable-model-invocation: true
---

# sdd-propuesta — Fase 2: Propuesta de cambio

Segunda fase del ciclo. Convertir la Exploración confirmada + la instrucción del usuario en un **plan escrito**, con criterios de aceptación definidos antes de construir. No tocar código ni specs todavía — eso es `/sdd-aplicacion`.

Leer `${CLAUDE_PLUGIN_ROOT}/skills/_shared/convenciones.md` y `${CLAUDE_PLUGIN_ROOT}/skills/_shared/plantilla-plan.md` antes de escribir el plan.

## Paso 1 — Recuperar o re-derivar el Caso

Si en esta misma conversación ya corrió `/sdd-exploracion`, usar el Caso, delta tentativo e invariantes que dejó. Si esta es una sesión nueva sin ese contexto:

1. Buscar el spec `en desarrollo` más reciente en `docs/specs/`, o el plan sin destilar más reciente en `docs/` — pueden indicar en qué venía trabajando el usuario.
2. Si no hay nada claro, **no adivinar el Caso** — decirle al usuario que falta la Exploración y ofrecer correr `/sdd-exploracion` primero, o pedirle que confirme el Caso directamente si prefiere saltear el paso.

## Paso 2 — Reunir la instrucción completa

`$ARGUMENTS` (o lo que el usuario aporte en el chat) debe describir **qué construir o cambiar**, no solo la idea general que ya dio en Exploración. Si faltan detalles necesarios (mockups, stack a usar, nombres, prioridades), preguntarlos ahora — no en `/sdd-aplicacion`.

## Paso 3 — Cargar la rama del Caso

Ir a `references/caso1.md`, `caso2.md`, `caso3.md` o `caso4.md` según el Caso confirmado en el Paso 1. (El Caso 5, una vez que su Fase 0 terminó, entra acá como Caso 2 o Caso 3 — no existe `references/caso5.md`.) Cada archivo dice qué debe contener el plan específicamente para ese Caso y qué preguntas abiertas son típicas de él.

## Paso 4 — Resolver decisiones abiertas con el usuario

Antes de cerrar el plan, preguntar explícitamente cualquier decisión que le corresponda a un humano: stack (si no está fijado), nombres, alcance, prioridades entre alternativas. No decidir estas cosas por el usuario ni dejarlas como "TBD" en el plan si se pueden resolver ahora — el plan que se apruebe debe quedar accionable.

## Paso 5 — Escribir el plan

Crear `docs/plan-<tema>-<fecha>.md` (fecha de hoy) siguiendo `plantilla-plan.md` al pie de la letra, incluyendo:

- **Delta** explícito (AGREGADO / MODIFICADO / ELIMINADO / NULO / 100%).
- **Criterios de aceptación** concretos y verificables — nunca "funciona bien". Estos son los que `/sdd-verificacion` va a usar después; si quedan vagos acá, la verificación no tiene con qué trabajar.
- Si el cambio es grande, partirlo en fases dentro del mismo plan (regla 3.3) — cada fase sigue siendo un cambio acotado que se aplica y verifica por separado, no todas juntas.

## Paso 6 — Gate: aprobación humana explícita

Mostrar el plan completo (o un resumen fiel de sus puntos clave) y pedir aprobación explícita antes de terminar la fase. Es obligatoria si el cambio es grande o toca un invariante existente; igual conviene pedirla siempre. No avanzar a `/sdd-aplicacion` sin ese OK explícito — no asumirlo por silencio ni por un cambio de tema.

## Cerrar la fase

Confirmar que el plan quedó guardado en `docs/plan-<tema>-<fecha>.md`, y decirle al usuario que el siguiente paso es `/sdd-aplicacion` una vez que dé el OK.

## Referencias

- `${CLAUDE_PLUGIN_ROOT}/skills/_shared/convenciones.md`
- `${CLAUDE_PLUGIN_ROOT}/skills/_shared/plantilla-plan.md`
- `references/caso1.md` — desde cero
- `references/caso2.md` — funcionalidad nueva
- `references/caso3.md` — modificación de un requerimiento existente
- `references/caso4.md` — migración de lenguaje
