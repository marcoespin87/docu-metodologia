# Caso 1 — Propuesta de cambio

Delta = 100% del sistema. Este plan es el más grande que va a existir en el proyecto — el resto de los cambios futuros van a ser incrementales sobre lo que este plan deja construido.

## Qué debe contener el plan

- **Stack elegido**, con una frase de por qué (o confirmado con el usuario si ya lo trajo decidido).
- **Arquitectura**: patrón (monolito, servicios separados, etc.), organización de carpetas.
- Lista de **capacidades** a construir (puede refinar la lista tentativa de Exploración).
- Tareas agrupadas por capacidad — no hace falta un detalle exhaustivo tarea por tarea, pero sí una fase/tarea por capacidad como mínimo.
- Criterios de aceptación **por capacidad**, no uno genérico para todo el sistema.

## Preguntas abiertas típicas de este Caso

- Stack (si no vino decidido).
- Nombres de las capacidades.
- Alcance de cada capacidad: qué entra y qué queda explícitamente fuera (esto alimenta la sección "Fuera de alcance" de cada spec futuro).

## Nota

Este plan también va a dar origen al documento de arquitectura (nace en `/sdd-aplicacion`, no acá) — pero conviene que la decisión de stack/patrón quede ya escrita en este plan, para no tener que volver a decidirla al construir.
