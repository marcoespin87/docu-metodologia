# Caso 4 — Migración de lenguaje

Parte de `../caso3` (Node.js) y lo reescribe en **Python** (nota: la
metodología usa Go como ejemplo; acá se usa Python porque es el runtime
disponible en este entorno — ver `docs/plan-migracion-python-2026-09-10.md`).
Delta nulo: mismo comportamiento, validado con tests de caracterización.

- `src/` — implementación viva en Python.
- `legacy-node/` — implementación Node.js archivada (caso3), solo
  referencia.
- `docs/specs/` — igual que caso3, solo cambian *Decisiones* y
  *Referencias*; *Comportamiento* e *Invariantes* quedan intactos.

```bash
python -m unittest discover -s tests -v   # tests de caracterización
python -m src.cli                         # demo manual
```
