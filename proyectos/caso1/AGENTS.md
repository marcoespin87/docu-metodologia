# Documento de arquitectura y convenciones — Sistema de Pedidos (caso1)

## Regla obligatoria para cualquier asistente de IA

**3.1 Specs primero.** Antes de proponer o construir cualquier cambio, leer
el spec de la capacidad afectada en `docs/specs/` (ver
`docs/specs/README.md` para el índice). El spec manda sobre este
documento, y este documento manda sobre memoria de sesión o apuntes
sueltos.

## Patrón arquitectónico

Librería Node.js en memoria, sin framework HTTP (el objetivo de este
proyecto es probar la metodología SDD spec-anchored, no construir un
producto). Cada capacidad vive en su propio módulo bajo `src/`:

- `src/pedidos.js` — capacidad "pedidos": creación y cambio de estado.
- `src/historial.js` — capacidad "historial": listado de pedidos.

Los dos módulos comparten el mismo almacén en memoria (`store.js`), que no
es una capacidad en sí misma (es infraestructura interna).

## Stack

- Node.js (>= 18) con el runner de tests nativo `node:test` + `node:assert`.
- Sin dependencias externas: `npm test` no requiere instalar nada.

## Comandos

```bash
npm test        # corre toda la suite (node --test)
node src/cli.js # CLI manual de humo (crear, listar, cambiar estado)
```

## Invariantes transversales

- **Sin persistencia real:** el almacén es un array en memoria; se reinicia
  en cada proceso. Por qué: este proyecto es un ejercicio de metodología,
  no un sistema en producción — agregar una base de datos sería
  complejidad no justificada por el objetivo (YAGNI).
- **Sin dependencias externas.** Por qué: mantener el ejercicio reproducible
  sin `npm install` ni acceso a red.
