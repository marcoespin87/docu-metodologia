# Convenciones de archivos — SDD Spec-Anchored

Rutas y nombres que los 4 skills (`sdd-exploracion`, `sdd-propuesta`, `sdd-aplicacion`, `sdd-verificacion`) deben usar siempre, en cualquier proyecto. No inventar variantes por proyecto: si un proyecto ya tiene una convención distinta y establecida (por ejemplo `docs/design/` en vez de `docs/specs/`), respetarla y no forzar la migración a mitad de un cambio — pero si el proyecto no tiene nada todavía, usar exactamente lo de abajo.

## Specs

- Un spec por capacidad, nunca un spec central único.
- Ruta: `docs/specs/spec-<capacidad>.md`, con `<capacidad>` en kebab-case (ej. `spec-autenticacion.md`, `spec-carrito-compras.md`).
- **Criterio de tamaño de una capacidad** (sección 2 de la metodología): si dos comportamientos casi siempre cambian juntos y comparten los mismos invariantes, van en el mismo spec; si pueden evolucionar por separado, van en specs separados. Si el proyecto ya tiene un spec que cubre varios comportamientos relacionados, no partirlo en specs sueltos a mitad de camino sin que sea una decisión explícita — eso rompe la trazabilidad.
- Formato fijo: ver `plantilla-spec.md` en esta misma carpeta. No te apartes del formato, ni siquiera para "simplificar".
- Índice: `docs/specs/README.md`, con una tabla `Capacidad → Spec`. Se actualiza cada vez que nace un spec nuevo (Caso 1, Caso 2, Caso 5).

## Planes

- Un plan por cambio (o por familia de cambios en fases, con un plan padre).
- Ruta: `docs/plan-<tema>-<fecha>.md`, con `<tema>` en kebab-case y `<fecha>` en formato `YYYY-MM-DD` (la fecha en que nace el plan, no se actualiza si el plan se retoca después).
- El plan es transitorio: no se archiva, se **destila** — lo que se construyó pasa al spec (Comportamiento, Decisiones fechadas, Fuera de alcance); lo que no se implementó no entra al spec y se queda en el plan o se descarta.
- Formato: ver `plantilla-plan.md` en esta misma carpeta.

## Documento de arquitectura y convenciones

- Es **un solo documento por proyecto** (más uno por subproyecto si es un monorepo con varios subproyectos independientes) — nunca dos documentos con el mismo contenido.
- Si el proyecto ya tiene un archivo de contexto que la herramienta de IA carga sola al iniciar sesión (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, o instrucciones de proyecto equivalentes), ESE archivo es el documento de arquitectura — completarlo ahí, no crear `docs/arquitectura.md` aparte.
- Si el proyecto no tiene ninguno de esos archivos, crear `docs/arquitectura.md` y, si la herramienta usada sí soporta un archivo de contexto propio, hacer que ese archivo solo enlace a `docs/arquitectura.md` en vez de duplicar el contenido.
- Contenido mínimo: patrón arquitectónico, límites entre servicios/módulos, invariantes transversales (concurrencia, seguridad, portabilidad del entorno), restricciones del entorno, comandos útiles (cómo correr, testear, buildear).
- Se crea en el primer cambio de un Caso 1, o en la Fase 0 de un Caso 5. Después, solo se actualiza mediante un cambio dedicado a arquitectura — nunca como efecto lateral de un cambio funcional.

## Regla de precedencia

Cuando dos documentos se contradicen: `spec` > documento de arquitectura > memoria de sesión, apuntes o docs históricos sueltos.
