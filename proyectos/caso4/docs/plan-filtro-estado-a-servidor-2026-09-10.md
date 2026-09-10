# Plan: Mover el filtrado de historial al servidor

**Fecha:** 2026-09-10 · **Caso:** 3 — Modificación de un requerimiento existente · **Estado:** destilado (construido)

## Contexto

El filtro por estado (caso2) está implementado del lado del cliente. El
equipo determina que no escala: cada consulta trae el historial completo
para filtrarlo después.

## Exploración

Se ubicó en `docs/specs/spec-historial.md` la sección "Filtrado por
estado" y la decisión "filtrado en cliente" (2026-09-10, plan de caso2)
que se va a reemplazar.

## Regla aplicada (3.2)

El comportamiento observable **no cambia**: los mismos 4 estados siguen
filtrando igual, con los mismos resultados. Cambia solo la
implementación. Por lo tanto el spec **solo** se toca en *Decisiones* y
*Referencias*; la sección *Comportamiento* queda intacta (ya describía el
filtrado sin mencionar dónde se resuelve).

## Enfoque técnico

`listarHistorial({estado})` acepta un filtro opcional y lo resuelve
internamente contra el almacén. Se elimina `src/filtroCliente.js` (código
muerto tras el cambio).

## Criterios de aceptación

1. Paridad exacta con el comportamiento del filtro anterior para los 4
   estados (mismos resultados, mismo criterio de "sin filtro = historial
   completo").
2. Nada que dependía del filtrado en cliente queda roto (no había otros
   consumidores de `filtroCliente.js` — confirmado por búsqueda en el
   código).

## Pendientes de decisión

Ninguno.
