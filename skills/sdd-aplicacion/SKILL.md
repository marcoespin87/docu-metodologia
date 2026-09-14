---
name: sdd-aplicacion
description: This skill should be used when the user explicitly invokes "/sdd-aplicacion" to run the Change Application phase of the Spec-Anchored SDD methodology — building or modifying the code from an already-approved plan and updating the affected spec in the same change, never one without the other. Manual-only: never auto-triggers from conversation content.
argument-hint: [opcional: ruta al plan si hay más de uno sin aplicar]
disable-model-invocation: true
---

# sdd-aplicacion — Fase 3: Aplicación del cambio

Tercera fase del ciclo. Construir el cambio **y** actualizar el spec correspondiente **en el mismo cambio** — la regla de anclaje de toda la metodología: el spec no se actualiza después, se actualiza como parte del mismo trabajo.

Leer `${CLAUDE_PLUGIN_ROOT}/skills/_shared/convenciones.md` y `${CLAUDE_PLUGIN_ROOT}/skills/_shared/plantilla-spec.md` antes de tocar nada.

## Paso 1 — Ubicar el plan aprobado

Si `$ARGUMENTS` no da una ruta, buscar el `docs/plan-*.md` más reciente con `Estado: en desarrollo` (no destilado). Si hay más de uno, preguntar cuál. Si no hay ninguno, decirlo y sugerir correr `/sdd-propuesta` primero — no construir sin un plan aprobado detrás.

Confirmar que el plan fue efectivamente aprobado (si no quedó explícito en la conversación, preguntar antes de construir).

## Paso 2 — Cargar la rama del Caso

El plan debe indicar el Caso y el delta. Ir a `references/caso1.md`, `caso2.md`, `caso3.md` o `caso4.md` según corresponda (Caso 5 ya resuelto en `/sdd-exploracion` entra como Caso 2 o Caso 3 acá también).

## Paso 3 — Construir

Seguir las tareas del plan. Mientras se construye:

- Reusar código/patrones existentes del proyecto en vez de reinventar — mirar cómo están hechas capacidades vecinas antes de escribir algo nuevo desde cero.
- Si algo del plan no encaja con la realidad del código al momento de construir, ajustar el plan (dejar constancia del ajuste) en vez de improvisar en silencio y que el spec termine describiendo algo distinto de lo que el plan decía.

## Paso 4 — Actualizar el spec en el mismo cambio

Usar la tabla de `plantilla-spec.md` (regla 3.2) para decidir qué secciones tocar. Nunca terminar esta fase con código nuevo/modificado y el spec sin tocar — si el cambio no altera comportamiento observable, como mínimo agregar la Decisión fechada + Referencias.

- Actualizar `docs/specs/spec-<capacidad>.md` (crearlo si es Caso 1/2/5-recién-confirmado).
- Actualizar `docs/specs/README.md` si nace un spec nuevo.
- **Caso 1 únicamente:** crear también el documento de arquitectura (`convenciones.md` dice dónde y con qué contenido mínimo) — es el único momento del ciclo normal en que nace, fuera de la Fase 0 de Caso 5.

## Paso 5 — Gate: build/lint/tests en verde

Correr lo que el proyecto use para verificar que compila/lintea/testea (buscarlo en el documento de arquitectura bajo "Comandos útiles", o en los scripts del proyecto — `package.json`, `Makefile`, etc.). No dar la fase por terminada si algo de esto falla. Si el proyecto no tiene tests automatizados todavía, decirlo explícitamente en vez de omitirlo en silencio.

## Cerrar la fase

Mostrar al usuario un resumen de: qué se construyó, qué archivos de spec se crearon/tocaron, y el resultado de build/lint/tests. Indicar que el siguiente paso es `/sdd-verificacion`.

## Referencias

- `${CLAUDE_PLUGIN_ROOT}/skills/_shared/convenciones.md`
- `${CLAUDE_PLUGIN_ROOT}/skills/_shared/plantilla-spec.md`
- `references/caso1.md`
- `references/caso2.md`
- `references/caso3.md`
- `references/caso4.md`
