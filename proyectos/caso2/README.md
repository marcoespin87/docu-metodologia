# Caso 2 — Funcionalidad nueva

Parte de `../caso1` (copiado tal cual) y agrega el filtro de historial por
estado, del lado del cliente. Ver
`docs/plan-filtro-estado-historial-2026-09-10.md` y la sección "Filtrado
por estado" + Decisión fechada en `docs/specs/spec-historial.md`.

```bash
npm test        # suite de tests (heredados + filtro nuevo)
node src/cli.js # demo manual
```
