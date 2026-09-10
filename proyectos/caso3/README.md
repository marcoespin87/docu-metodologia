# Caso 3 — Modificación de un requerimiento existente

Parte de `../caso2`. El comportamiento del filtro por estado no cambia;
cambia su implementación (de cliente a servidor). Ver
`docs/plan-filtro-estado-a-servidor-2026-09-10.md` y la sección
*Decisiones*/*Referencias* en `docs/specs/spec-historial.md` (la sección
*Comportamiento* queda intacta — regla 3.2 de la metodología).

```bash
npm test        # suite de tests (paridad con el filtro anterior)
node src/cli.js # demo manual
```
