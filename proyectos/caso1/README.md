# Caso 1 — Desde cero

Sistema avanzado de gestión de pedidos, construido desde cero siguiendo la
metodología SDD spec-anchored. Ver `docs/plan-sistema-pedidos-2026-09-11.md`
(plan padre con fases F0–F6) y `docs/specs/` (comportamiento AS-BUILT por
capacidad, se completa a medida que avanzan las fases).

```bash
npm install
npm test        # suite de tests (node --test + supertest)
npm start       # levanta la API en http://localhost:3000
```

**Estado:** F0 (infraestructura + auth), F1 (inventario) y F2 (pedidos)
completas. Ver `docs/specs/README.md` para el resto de las capacidades.
