# Plan: Filtrado del historial por estado

**Fecha:** 2026-09-10 · **Caso:** 2 — Funcionalidad nueva · **Estado:** destilado (construido)

## Contexto

El historial ya existe como lista simple (heredado de caso1). Se agrega la
capacidad de filtrar por estado (pendiente, enviado, entregado,
cancelado).

## Exploración

Se leyó `docs/specs/spec-historial.md`: no tiene filtros ni ningún
invariante que choque con agregar uno. La capacidad "pedidos" no se ve
afectada.

## Delta

**Agregado.** Filtro por estado sobre el historial existente.

## Enfoque técnico

Filtrado en el lado consumidor (módulo `src/filtroCliente.js`), no en el
almacén ni en `listarHistorial()`: se obtiene el historial completo y se
filtra después, simulando el filtrado en el cliente de una UI. Se elige
así porque es la solución más simple para esta primera versión (YAGNI); el
costo de escalabilidad de este enfoque se evalúa más adelante (ver
caso3).

## Tareas

- [x] `src/filtroCliente.js`: función `filtrarPorEstado(historial, estado)`
- [x] Tests del filtro
- [x] Sección nueva en `docs/specs/spec-historial.md` + decisión fechada

## Criterios de aceptación

1. Filtrar por cada uno de los 4 estados devuelve solo los pedidos con ese
   estado exacto.
2. Sin filtro (estado `undefined`/no provisto), el resultado es idéntico
   al historial completo.
3. Filtrar por un estado sin pedidos devuelve una lista vacía (no un
   error).

## Pendientes de decisión

Ninguno.
