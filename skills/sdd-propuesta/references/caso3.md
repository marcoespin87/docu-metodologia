# Caso 3 — Propuesta de cambio

Delta = MODIFICADO o ELIMINADO. Ya se determinó en Exploración si esto toca el Comportamiento observable del spec o solo Decisiones/Referencias (cambio de implementación) — llevar esa distinción al plan explícitamente.

## Qué debe contener el plan

- **Si toca Comportamiento:** describir el comportamiento nuevo tal como va a quedar (no solo el delta respecto al viejo), y declarar explícitamente qué invariante(s) existentes se modifican o se rompen a propósito, con la razón.
- **Si es solo cambio de implementación:** el criterio de aceptación central es **paridad** — mismo comportamiento observable, verificable por comparación directa (mismas entradas → mismas salidas que antes del cambio).
- Impacto en lo dependiente: qué otras partes del sistema podrían asumir el comportamiento actual y deberían seguir funcionando igual (o ajustarse a propósito, si corresponde).

## Preguntas abiertas típicas de este Caso

- Si se rompe un invariante existente: ¿hay consenso explícito de que es correcto romperlo, o hace falta confirmarlo con más contexto de negocio?
- Umbrales de aceptación cuando el cambio es de performance/escalabilidad (ej. tiempo de respuesta) en vez de solo funcional.
