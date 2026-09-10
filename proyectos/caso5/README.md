# Caso 5 — Código sin spec previo

Sistema heredado, independiente de los casos 1-4: código con un test
suelto para "pedidos" y ningún spec. Se ejecutó la Fase 0 sobre la
capacidad "historial", que encontró y corrigió un bug real (el filtro
incluía siempre los pedidos `cancelado`). Ver
`docs/plan-fase0-historial-2026-09-10.md` para el proceso completo
(candidato confirmado/inferido → revisión humana → fix separado → spec
desplegado).

La capacidad "pedidos" todavía no pasó por su Fase 0 (queda pendiente a
propósito, para mostrar que es incremental, no "todo el sistema de una
vez").

```bash
npm test        # 6 tests: 2 heredados (pedidos) + 4 nuevos de Fase 0 (historial)
node src/cli.js # demo manual
```
