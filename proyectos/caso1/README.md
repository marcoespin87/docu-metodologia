# Caso 1 — Desde cero

Ejercicio de la metodología SDD spec-anchored (ver
`../GUIA-PASO-A-PASO.md` y `../../metodologia-sdd-spec-anchored_v3.md`).

Sistema mínimo de pedidos construido desde cero: crear pedido, ver
historial, cambiar estado.

```bash
npm test        # suite de tests (9 casos)
node src/cli.js # demo manual
```

Documentos clave:

- `AGENTS.md` — arquitectura y convenciones (léelo antes de proponer cambios).
- `docs/specs/` — comportamiento AS-BUILT de cada capacidad.
- `docs/plan-sistema-pedidos-2026-09-10.md` — plan que originó este caso.
