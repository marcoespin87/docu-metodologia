# Caso 2 — Propuesta de cambio

Delta = AGREGADO. El sistema existente no cambia lo que ya hace; solo se le suma algo nuevo.

## Qué debe contener el plan

- **Enfoque técnico**: cómo se integra lo nuevo con lo existente (reutilizar componentes/módulos ya presentes cuando tenga sentido, en vez de duplicar).
- **Dónde nace**: si la capacidad nueva entra como sección nueva de un spec ya existente, o como spec propio nuevo (ver criterio de tamaño en `convenciones.md`) — decidirlo acá, no en Aplicación.
- Criterios de aceptación que cubran explícitamente: (a) lo nuevo funciona, y (b) lo que ya existía se sigue comportando exactamente igual que antes (no-regresión) — este segundo punto se olvida seguido y es el que verifica `/sdd-verificacion` con más rigor en este Caso.

## Preguntas abiertas típicas de este Caso

- Dónde vive la nueva lógica (cliente vs. servidor, nuevo módulo vs. extender uno existente).
- Cómo se ve/comporta ante casos borde (entradas inválidas, ausencia del dato nuevo, etc.).
