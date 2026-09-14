# Caso 1 — Aplicación del cambio

Base vacía: nace todo en este cambio.

## Qué construir

- El sistema completo tal como lo describe el plan, capacidad por capacidad.
- Un `docs/specs/spec-<capacidad>.md` por cada capacidad que el plan definió, `Estado: desplegado` una vez que esa parte está construida y corriendo (o `parcial`/`en desarrollo` si el plan tiene fases y esta corrida solo cubre algunas).
- `docs/specs/README.md` con la tabla completa.
- El documento de arquitectura (`AGENTS.md`/`CLAUDE.md`/`.cursorrules`/`docs/arquitectura.md`, el que corresponda a la herramienta usada) — ver contenido mínimo en `convenciones.md`. Este es el único Caso del ciclo normal donde este documento nace (fuera de la Fase 0 de Caso 5).

## Orden sugerido

Construir de abajo hacia arriba: primero lo que otras capacidades van a necesitar (ej. modelo de datos base), después cada capacidad. Si el plan ya trae un orden de fases, seguir ese en vez de improvisar uno nuevo.
