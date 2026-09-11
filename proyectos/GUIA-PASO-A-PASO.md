# Guía paso a paso — 5 casos

Para cada caso: adjuntá `metodologia-sdd-spec-anchored_v3.md` junto con el
prompt de esa carpeta y mandaselo al agente parado en la ruta indicada.
De ahí en adelante, el agente va a ir pidiéndote lo que necesite (una
aprobación, una decisión, que revises algo) a medida que avanza — vos solo
respondé directo a lo que te pregunte. No hace falta que vos sepas ni
menciones nada de cómo está armado el documento por dentro.

**Orden:** `caso2` parte de `caso1`, `caso3` de `caso2`, `caso4` de
`caso3`. `caso5` es independiente y se puede hacer en cualquier momento.
No saltees el orden: cada prompt de abajo asume que la carpeta anterior ya
está terminada.

**Cómo seguir la conversación después del prompt inicial** (sin necesidad
de saber nada de metodología):

- Si el agente te muestra algo y te pregunta si sigue adelante, revisá lo
  que te mostró antes de decirle que sí.
- Si te pregunta una decisión de negocio (nombres, prioridades, cómo
  llamar algo, qué stack usar), respondé vos — no le pidas que decida por
  vos.
- Si te dice que terminó y te muestra un resumen de qué cambió en los
  documentos del proyecto, leelo antes de decirle que continúe con lo
  siguiente.
- Si en algún momento no tenés claro qué te está pidiendo, preguntale
  directamente "¿qué necesitás de mí ahora?" — el agente lo sabe porque
  lo tiene en el documento adjunto.

---

## Caso 1 — `proyectos/caso1`

Hoy la carpeta está completamente vacía.

**Prompt:**
```
Estamos en proyectos/caso1, un proyecto vacío. Vamos a construir un sistema avanzado de gestión de pedidos desde cero. 

Las funcionalidades a desarrollar incluyen:
1. Ciclo de vida del pedido: Crear pedido (soportando múltiples productos/líneas, cálculo de impuestos y subtotales), ver historial detallado y cambiar estados (ej. Pendiente, Procesando, Pagado, Enviado, Entregado, Cancelado).
2. Autenticación y Autorización: Control de acceso basado en roles (RBAC) con perfiles como "Cliente" (solo ve sus pedidos) y "Administrador/Soporte" (gestión global).
3. Control de Inventario: Validación de disponibilidad de productos y reserva de stock al momento de crear el pedido.
4. Búsqueda y Filtrado: Paginación y filtros avanzados en el historial (por rango de fechas, estado, cliente o ID de transacción).
5. Pagos: Simulación de integración con pasarela de pagos (transiciones de estado automáticas tras pago exitoso o fallido).
6. Notificaciones: Arquitectura orientada a eventos para disparar notificaciones (simuladas por email/SMS) cada vez que un pedido cambie de estado.
7. Logística y Post-venta: Asignación de guías de envío (tracking), manejo de cancelaciones y devoluciones con reposición de inventario.
```

---

## Caso 2 — `proyectos/caso2`

**Prompt:**
```
Estamos en proyectos/caso2. Antes de nada, copiá todo el contenido de
proyectos/caso1 a esta carpeta (ya tiene el sistema de pedidos armado).

Sobre ese sistema ya existente, quiero agregar algo nuevo: la posibilidad
de filtrar el historial de pedidos por estado (pendiente, enviado,
entregado, cancelado).

Te adjunto el documento con la forma de trabajo que tenés que seguir de
punta a punta para este cambio. Seguilo estrictamente.
```

---

## Caso 3 — `proyectos/caso3`

**Prompt:**
```
Estamos en proyectos/caso3. Copiá todo el contenido de proyectos/caso2 a
esta carpeta como punto de partida (ya tiene el sistema de pedidos con el
filtro por estado).

Ese filtro hoy se resuelve del lado del cliente, y no escala. Necesito que
se resuelva del lado del servidor en su lugar. El resultado que ve el
usuario tiene que quedar exactamente igual — lo único que cambia es cómo
se resuelve por dentro.

Te adjunto el documento con la forma de trabajo que tenés que seguir de
punta a punta para este cambio. Seguilo estrictamente.
```

---

## Caso 4 — `proyectos/caso4`

**Prompt:**
```
Estamos en proyectos/caso4. Copiá todo el contenido de proyectos/caso3 a
esta carpeta como punto de partida.

Necesito migrar este sistema de Node.js a Python (o el lenguaje que
prefieras si Python no está disponible), sin cambiar ningún
comportamiento. Hacelo de a un módulo por vez, como trabajos separados
(por ejemplo: primero historial, después pedidos) — no lo hagas todo
junto en un solo paso.

Te adjunto el documento con la forma de trabajo que tenés que seguir de
punta a punta para esto, incluido cómo verificar que no cambió nada del
comportamiento. Seguilo estrictamente.
```

---

## Caso 5 — `proyectos/caso5`

**Prompt:**
```
Estamos en proyectos/caso5. Esta carpeta tiene un sistema de pedidos
heredado, escrito hace tiempo, sin ninguna documentación formal — no hay
specs ni documento de arquitectura. Puede tener algún test suelto, pero
no una cobertura completa.

Quiero empezar a aplicar acá, de ahora en adelante, la forma de trabajo
que te adjunto. Seguila estrictamente, empezando por lo que el documento
diga que hay que hacer antes de poder tratar este proyecto como cualquier
otro ya documentado. Andá de a una parte del sistema por vez, no
documentes todo junto en un solo paso.
```

---

## Estado actual de cada carpeta

| Carpeta | Estado |
|---|---|
| `caso1/` | Vacía — se arma completa cuando corras el prompt de arriba. |
| `caso2/` | Ya tiene un sistema de pedidos con filtro por estado (resuelto del lado del cliente), construido y probado. |
| `caso3/` | Ya tiene el mismo sistema con el filtro resuelto del lado del servidor, construido y probado. |
| `caso4/` | Ya tiene el sistema migrado a Python (con la versión Node anterior archivada como referencia), construido y probado. |
| `caso5/` | Ya tiene un sistema heredado con un bug encontrado y corregido durante la documentación inicial, construido y probado. |

`caso2`, `caso3` y `caso4` se armaron migrando/copiando todo junto en un
solo paso en vez de hacerlo módulo por módulo como pide el prompt de
arriba para `caso4`; y en `caso5` la corrección del bug encontrado no
quedó como un trabajo separado de la documentación. Si querés que rehaga
esas dos cosas para que el trabajo ya hecho quede alineado con los
prompts de esta guía, decímelo.
