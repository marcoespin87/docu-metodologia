---
name: sdd-verificacion
description: This skill should be used when the user explicitly invokes "/sdd-verificacion" to run the Verification and Merge phase of the Spec-Anchored SDD methodology — contrasting what was built against the plan's acceptance criteria, producing a discrepancy report, marking the plan as distilled, and preparing the spec diff for the mandatory human review before the change is considered closed. Manual-only: never auto-triggers from conversation content.
argument-hint: [opcional: ruta al plan si hay más de uno aplicado sin verificar]
disable-model-invocation: true
---

# sdd-verificacion — Fase 4: Verificación y fusión

Última fase del ciclo. Contrastar lo construido contra lo prometido, y dejar el diff del spec listo para que un humano lo revise **antes** de dar el cambio por cerrado.

## Por qué esta fase exige un humano

El mismo agente que construyó no debería ser el único que verifica contra una spec que él mismo redactó — es un punto ciego que se verifica a sí mismo. Por eso esta fase nunca termina sola: siempre cierra pidiendo la revisión humana del diff del spec, como mínimo. Si el usuario lo pide, ofrecer también verificar "con contexto limpio" (recomendarle abrir una sesión nueva y pasarle solo el spec + criterios de aceptación + diff, sin el historial de cómo se construyó) como una verificación más estricta todavía.

## Paso 1 — Ubicar plan y spec del cambio

Si `$ARGUMENTS` no da una ruta, usar el `docs/plan-*.md` más reciente con `Estado: en desarrollo` cuyo trabajo ya se aplicó. Leer también el/los spec(s) que `/sdd-aplicacion` tocó.

## Paso 2 — Cargar la rama del Caso

Ir a `references/caso1.md`, `caso2.md`, `caso3.md` o `caso4.md` según el Caso del plan — cada uno pesa distinto qué verificar (Caso 3 es el más exigente; Caso 4 exige paridad medida con tests, no solo lectura).

## Paso 3 — Contrastar contra los criterios de aceptación

Recorrer, uno por uno, los criterios de aceptación que quedaron escritos en el plan (no inventar nuevos criterios acá — si algo importante quedó afuera del plan, es una señal de que `/sdd-propuesta` los dejó incompletos, señalarlo, pero no usarlo para reprobar el cambio por sorpresa). Para cada criterio, verificar y anotar: cumple / no cumple / parcial.

## Paso 4 — Reporte de coincidencias/discrepancias

Producir un reporte corto: criterios cumplidos, discrepancias encontradas (con el detalle necesario para decidir si hay que volver a `/sdd-aplicacion`), y cualquier cosa fuera del plan que se haya roto sin querer.

Si hay discrepancias, no marcar el cambio como cerrado — decirle al usuario que hace falta volver a `/sdd-aplicacion` para resolverlas antes de reintentar esta fase.

## Paso 5 — Preparar el diff del spec para revisión humana

Mostrar (o resumir fielmente) qué cambió en `docs/specs/spec-<capacidad>.md` respecto a antes de este cambio. Si el spec cambió de forma que no está explicada por lo que el plan pedía, señalarlo explícitamente — "si el spec cambió de forma inesperada, algo en el código también" es la señal de alarma que este paso existe para atrapar.

## Paso 6 — Gate: revisión humana del diff del spec

Pedir explícitamente esa revisión antes de considerar el cambio cerrado/fusionado. No autoaprobar en nombre del usuario aunque el reporte del Paso 4 no tenga discrepancias.

## Paso 7 — Destilar el plan

Una vez que el humano aprueba: actualizar `Estado: destilado` en el plan, y dejar una nota de qué se destiló al spec y qué (si algo del plan no se implementó) queda afuera.

## Cerrar la fase

Confirmar al usuario que el cambio quedó cerrado, y recordarle que el próximo cambio arranca de nuevo en `/sdd-exploracion`.

## Referencias

- `references/caso1.md`
- `references/caso2.md`
- `references/caso3.md`
- `references/caso4.md`
