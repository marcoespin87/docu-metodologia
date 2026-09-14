# Plantilla del plan — `docs/plan-<tema>-<fecha>.md`

A diferencia del spec, la metodología no fija un formato rígido para el plan — pero usar siempre esta misma estructura entre proyectos evita el problema real que apareció en la práctica: un plan con encabezados mezclados en inglés y español, o secciones inventadas por cada cambio, que hacen cada plan distinto a leer. Usar encabezados en español, siempre los mismos.

```markdown
# Plan: <Tema del cambio>

**Fecha:** YYYY-MM-DD
**Estado:** en desarrollo | destilado

## Contexto
<Qué existe hoy, qué se pide cambiar, por qué. Si el cambio parte de un
spec existente, resumir la porción relevante.>

## Delta
<Uno de: AGREGADO | MODIFICADO | ELIMINADO | NULO | 100% del sistema (solo
Caso 1). Una frase de qué significa concretamente en este cambio.>

## Decisiones tomadas y enfoque técnico
<Decisiones ya cerradas para este cambio (stack si aplica, dónde vive la
lógica, formato de errores, etc.) y el enfoque técnico general.>

## Tareas
- [ ] <tarea 1>
- [ ] <tarea 2>

## Criterios de aceptación
<Casos concretos y verificables — NO "funciona bien". Se escriben antes de
construir para que la verificación no la defina quien construyó.>
1. <criterio 1>
2. <criterio 2>

## Pendientes de decisión
<Preguntas abiertas que necesitan respuesta humana antes de (o durante)
construir. Vacío si no hay ninguna.>
```

## Reglas

- El nombre de archivo lleva la fecha en la que nace el plan: `docs/plan-<tema>-<fecha>.md`. No renombrar el archivo si el plan se retoca después — la fecha marca el nacimiento, no la última edición.
- Un plan grande (varias fases) es un plan padre con sub-secciones de fase, pero cada fase se sigue fusionando como su propio cambio acotado (regla 3.3) — no se junta todo en un solo cambio gigante.
- Cuando el cambio termina y se destila al spec, actualizar el campo **Estado** del plan a `destilado` y dejar una nota de qué se destiló y qué quedó afuera (lo no implementado no entra al spec).
- El plan puede tener alternativas descartadas, dudas y fases futuras — el spec no puede. No confundir los dos documentos.
