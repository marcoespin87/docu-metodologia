# Plan: Migración de Node.js a Python

**Fecha:** 2026-09-10 · **Caso:** 4 — Migración de lenguaje · **Estado:** destilado (construido)

## Contexto

El sistema (caso3, Node.js) se reescribe en otro lenguaje sin cambiar
comportamiento. Nota de alcance de este ejercicio: la metodología usa Go
como ejemplo; aquí se migra a **Python**, porque es el runtime disponible
en este entorno (Go no está instalado). La estrategia es la misma
descrita en la sección 4/7 de la metodología, solo cambia el lenguaje
destino.

## Exploración

Se leyeron `docs/specs/spec-pedidos.md` y `docs/specs/spec-historial.md`
completos, como inventario de todo lo que el sistema debe seguir haciendo.
No se leyó el código Node en busca de "qué hacer" — solo como referencia
de bajo nivel al escribir el equivalente en Python.

## Delta

**Nulo.** Ningún comportamiento nuevo.

## Estrategia de migración

- Módulo por módulo, empezando por `historial` (depende de `pedidos` para
  poblar datos en los tests, así que se migran juntos en este ejercicio
  por ser un sistema chico).
- Equivalencias: `node:test`/`node:assert` → `unittest` (stdlib de
  Python, sin dependencias externas, igual que el original).
- El código Node.js queda archivado en `legacy-node/` como referencia, no
  como implementación viva.

## Tests de caracterización

Derivados de cada ítem de *Comportamiento* de ambos specs:
`tests/test_pedidos.py` y `tests/test_historial.py` — mismos casos que
`legacy-node/test/*.test.js`, adaptados a `unittest`.

## Criterios de aceptación

1. Los tests de caracterización en Python pasan con los mismos resultados
   que los tests Node originales (paridad de comportamiento).
2. El spec **solo** actualiza *Referencias* (nuevas rutas de código) y
   agrega una *Decisión* fechada de la migración; *Comportamiento* e
   *Invariantes* quedan intactos.

## Pendientes de decisión

Ninguno.
