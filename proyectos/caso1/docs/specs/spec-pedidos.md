# Spec: Pedidos

**Estado:** parcial · **Última revisión:** 2026-09-11

> Parcial porque las transiciones de pago (F4) y logística (F6) todavía no
> están implementadas — hoy solo se puede crear un pedido y hacerlo avanzar
> manualmente por `cambiarEstado` a nivel de servicio; el resto de fases
> agregan los endpoints que disparan esas transiciones en el flujo real.

## Propósito

Manejar el ciclo de vida de un pedido: su creación a partir de líneas de
producto, el cálculo de sus totales, y las transiciones válidas entre
estados.

## Comportamiento

- `POST /pedidos` crea un pedido a partir de una o más líneas
  `{productoId, cantidad}`. Requiere autenticación; lo puede hacer un
  `cliente` (siempre para sí mismo) o un `administrador` (para sí mismo
  por defecto, o para otro cliente si manda `clienteId` en el body).
- Cada línea resuelve su `precioUnitario` contra el catálogo de
  `inventario` en el momento de creación — el valor que mande el cliente
  en el body para ese campo se ignora.
- `subtotal` = suma de `cantidad * precioUnitario` de todas las líneas.
  `impuestos` = `subtotal * 15%` (redondeado). `total` = `subtotal +
  impuestos`.
- Antes de crear el pedido se valida disponibilidad de **todas** las
  líneas; si alguna no tiene stock suficiente, no se crea el pedido y no
  se reserva stock de ninguna línea (todo o nada). `POST /pedidos`
  devuelve `409` en ese caso.
- Un pedido nace en estado `Pendiente`, con `historialEstados` conteniendo
  esa primera entrada con fecha.
- `GET /pedidos/:id`: un `cliente` solo puede ver sus propios pedidos (un
  pedido ajeno responde `404`, igual que uno inexistente, para no revelar
  que el id pertenece a otro cliente). Un `administrador` puede ver
  cualquier pedido.
- `PATCH /pedidos/:id/estado` (solo `administrador`) es deliberadamente
  angosto: la única transición que acepta es `Enviado -> Entregado`.
  Cualquier otro par estado-actual/estado-pedido devuelve `409`. Las
  demás transiciones (`Pendiente -> Procesando -> Pagado`, envío,
  cancelación, devolución) las disparan sus propios endpoints en fases
  posteriores, nunca este PATCH genérico.
- A nivel de servicio, `cambiarEstado(id, nuevoEstado)` es la función
  compartida que todas las capacidades usan para mover un pedido de
  estado: valida contra la máquina de estados y agrega la entrada
  correspondiente a `historialEstados`; una transición no contemplada
  lanza un error sin modificar el pedido.

## Máquina de estados

```
Pendiente -> Procesando -> Pagado -> Enviado -> Entregado -> Devuelto
Pendiente | Procesando -> Cancelado
```

Ver `src/pedidos/estados.js` para la tabla completa. Cualquier transición
fuera de esta tabla se rechaza.

## Invariantes (no negociables)

- **El precio de cada línea se resuelve del catálogo, nunca del body.**
  Por qué: si se confiara en el precio que manda el cliente, cualquiera
  podría comprar a un precio arbitrario.
- **La reserva de stock al crear un pedido es todo-o-nada.** Por qué: un
  pedido parcialmente reservado dejaría productos con stock descontado
  sin que el pedido correspondiente exista.
- **El rol y el id de usuario para RBAC salen de `req.usuario` (derivado
  del token), nunca de un campo del body,** salvo el caso explícito de
  `clienteId` que un `administrador` puede fijar a propósito. Ver
  `spec-auth.md`.
- **`PATCH /pedidos/:id/estado` no es una puerta trasera a la máquina de
  estados completa.** Por qué: si aceptara cualquier transición válida
  de `estados.js`, un administrador podría saltarse el flujo de pago
  (ej. marcar `Pagado` sin que existiera una transacción de pago real).

## Decisiones

- 2026-09-11: tasa de impuesto fija del 15% sobre el subtotal (constante
  `TASA_IMPUESTO` en `pedidos.service.js`), redondeada a entero.
- 2026-09-11: `GET /pedidos/:id` devuelve `404` (no `403`) cuando un
  cliente pide un pedido ajeno — evita usar la API para confirmar que un
  id de pedido existe.
- 2026-09-11: el id de pedido se calcula como `max(id existente) + 1` a
  partir de lo persistido, no con un contador en memoria — así no se
  duplican ids si el proceso se reinicia con datos ya guardados.

## Fuera de alcance

- Edición de líneas de un pedido ya creado.
- Transiciones de pago, envío, cancelación y devolución activadas por
  endpoint propio: llegan en F4 y F6 (`spec-pagos.md`,
  `spec-logistica.md`), que ampliarán este spec.

## Referencias

- Código: `src/pedidos/pedidos.service.js`, `src/pedidos/pedidos.routes.js`,
  `src/pedidos/estados.js`.
- Tests: `test/pedidos.service.test.js`, `test/pedidos.routes.test.js`,
  `test/estados.test.js`.
- Plan de origen: `docs/plan-sistema-pedidos-2026-09-11.md` (fase F2).
