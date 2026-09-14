# Plan: Transiciones de Estado en Pedidos (2026-09-13)

**Estado:** Destilado (Implementado y documentado en spec)

## 1. Contexto y Delta
- **Delta:** Modificado (se modifica el comportamiento existente de cambio de estado).
- **Contexto:** Actualmente, el endpoint `PUT /pedidos/:id/estado` acepta cualquier estado válido, ignorando el ciclo de vida lógico del pedido. Esto permite transiciones sin sentido como volver a "Pendiente" desde "Entregado".

## 2. Enfoque Técnico y Comportamiento Propuesto
Se restringe el cambio de estado según el estado actual en el que se encuentra el pedido en la base de datos, implementando un nuevo invariante de "Ciclo de Vida".

**Transiciones válidas (Máquina de estados):**
- **Pendiente** $\rightarrow$ `Enviado` o `Cancelado`.
- **Enviado** $\rightarrow$ `Entregado` o `Cancelado`.
- **Entregado** $\rightarrow$ *Estado final* (no admite cambios).
- **Cancelado** $\rightarrow$ *Estado final* (no admite cambios).

**Respuesta de la API ante transición inválida:**
- **Código HTTP:** `409 Conflict` (o `400 Bad Request`, pendiente de decidir).
- **Cuerpo JSON:** `{ "error": "Transición de estado inválida. No se puede pasar de '[ESTADO_ACTUAL]' a '[NUEVO_ESTADO]'." }`

*Implementación:* Al recibir la petición `PUT`, se ejecutará primero un `SELECT estado FROM pedidos WHERE id = ?` para verificar el estado actual. Si la transición no está en las reglas permitidas, se devuelve el error sin ejecutar el `UPDATE`.

## 3. Tareas
- [ ] Modificar `PUT /pedidos/:id/estado` en `src/index.js` para consultar el estado actual antes de actualizar y verificar las transiciones válidas.
- [ ] Actualizar el archivo `docs/specs/spec-pedidos.md`:
  - Modificar la descripción del **Comportamiento** del cambio de estado.
  - Agregar un nuevo **Invariante** sobre el Ciclo de Vida que detalle las transiciones permitidas con su justificación.
  - Registrar la **Decisión** fechada de este cambio, detallando por qué se agregó este flujo estricto.

## 4. Criterios de Aceptación
1. Transición `Pendiente` $\rightarrow$ `Enviado` funciona y retorna `200`.
2. Transición `Pendiente` $\rightarrow$ `Cancelado` funciona y retorna `200`.
3. Transición `Enviado` $\rightarrow$ `Entregado` funciona y retorna `200`.
4. Transición `Enviado` $\rightarrow$ `Cancelado` funciona y retorna `200`.
5. Intento de transición no permitida (ej. `Entregado` $\rightarrow$ `Pendiente` o `Pendiente` $\rightarrow$ `Entregado`) devuelve el error esperado con el código HTTP correspondiente y no altera la base de datos.
6. La validación original sigue funcionando (intentar usar un estado inexistente devuelve error `400`).

## 5. Pendientes de decisión
* ¿Utilizamos el código HTTP `409 Conflict` o `400 Bad Request` para cuando ocurre una transición inválida?
* ¿Hay alguna otra transición atípica que debamos soportar (por ejemplo, devolver de "Enviado" a "Pendiente" por un error logístico)?
