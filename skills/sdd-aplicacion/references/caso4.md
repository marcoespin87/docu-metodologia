# Caso 4 — Aplicación del cambio

Reescritura del módulo/fase que toca en esta corrida, guiada por el spec — no por la sintaxis del código origen.

## Qué construir

1. Confirmar que los tests de caracterización de este módulo (definidos en `/sdd-propuesta`) pasan contra la implementación actual (baseline) antes de tocar nada — si no pasan, el test está mal escrito o el spec no describe la realidad; resolver eso primero.
2. Reescribir el módulo en el lenguaje/stack de destino, leyendo el spec para entender **qué** debe hacer, no traduciendo línea por línea el código viejo.
3. Correr los mismos tests de caracterización contra la implementación nueva. Deben pasar igual que contra la vieja.

## Qué tocar del spec (regla estricta de este Caso)

Solo:
- **Referencias**: actualizar rutas/archivos al nuevo lenguaje.
- **Decisiones**: una entrada fechada documentando la migración de este módulo (motivo: Caso 4 metodológico / decisión del usuario).

**No tocar** `Comportamiento` ni `Invariantes` — si hiciera falta tocarlos, esto dejó de ser una migración pura y hay que tratarlo como un Caso 3 aparte.

## Cuándo dar el módulo por terminado

Cuando el módulo nuevo pasa todos sus tests de caracterización y nada más quedó a medio migrar dentro de ese módulo. No arrancar el próximo módulo en la misma corrida de esta fase — cada módulo es su propio ciclo Propuesta → Aplicación → Verificación.
