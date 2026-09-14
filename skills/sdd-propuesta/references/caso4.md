# Caso 4 — Propuesta de cambio

Delta = NULO. Acá el protagonismo no es "qué cambia" (nada, a propósito) sino el enfoque técnico de la migración y los tests de caracterización que van a probar la paridad.

## Qué debe contener el plan

- **Estrategia módulo por módulo** (o fase por fase, si el sistema tiene una sola capacidad — ver la nota de `sdd-exploracion/references/caso4-migracion-lenguaje.md`): orden concreto, empezando por lo más aislado o menos riesgoso.
- **Equivalencias de librerías/framework** del lenguaje/stack origen al destino.
- **Tests de caracterización**: derivados de cada spec (no del código viejo), que van a correr primero contra la implementación actual para confirmar que describen el comportamiento real, y después contra cada módulo ya migrado.
- Aclarar que cada módulo migrado es su propio cambio acotado — no juntar la migración completa en un solo plan de aplicación.

## Criterios de aceptación (siempre los mismos, por módulo)

1. Los tests de caracterización de ese módulo pasan igual en la versión vieja y en la nueva.
2. Ningún consumidor de la interfaz pública (API, CLI, lo que corresponda) tiene que cambiar cómo la usa.

## Preguntas abiertas típicas de este Caso

- Lenguaje/framework de destino, si no vino ya decidido.
- Orden de migración de los módulos.
