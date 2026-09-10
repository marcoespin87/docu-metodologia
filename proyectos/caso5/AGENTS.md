# Documento de arquitectura y convenciones — Sistema de Pedidos (caso5)

> Nace en la Fase 0 (sección 6 de la metodología: "se define ... en la
> Fase 0 de un Caso 5"). Antes de este documento no existía ningún archivo
> de contexto para el asistente de IA.

## Regla obligatoria para cualquier asistente de IA

**3.1 Specs primero.** Antes de proponer o construir cualquier cambio, leer
el spec de la capacidad afectada en `docs/specs/` (ver
`docs/specs/README.md`). Si la capacidad no tiene spec todavía (ver
índice), ejecutar primero la Fase 0 para esa capacidad — no asumir el
comportamiento a partir del código sin marcar qué es inferido.

## Patrón arquitectónico

Librería Node.js en memoria, sin framework HTTP. Capacidades:

- `src/pedidos.js` — capacidad "pedidos": **sin spec todavía** (pendiente
  de Fase 0).
- `src/historial.js` — capacidad "historial": con spec desde 2026-09-10
  (Fase 0).

Comparten almacén en memoria (`src/store.js`).

## Stack

- Node.js (>= 18), `node:test` + `node:assert`, sin dependencias externas.

## Comandos

```bash
npm test        # corre toda la suite
node src/cli.js # demo manual
```

## Invariantes transversales

- **Sin persistencia real:** almacén en memoria por proceso.
- **Sin dependencias externas.**
- **Ninguna capacidad sin spec se toca "a ciegas":** cualquier cambio
  sobre "pedidos" debe empezar por su propia Fase 0, incremental (nunca
  documentar todo el sistema de una sola vez).
