# Spec: Inventario

**Estado:** desplegado · **Última revisión:** 2026-09-11

## Propósito

Mantener el catálogo de productos disponibles y su stock, y ofrecer a
otras capacidades (principalmente `pedidos`) las operaciones para
validar disponibilidad y reservar/reponer stock sin que esas capacidades
manipulen el almacén de productos directamente.

## Comportamiento

- Existe un catálogo fijo de 3 productos seed, cargado automáticamente
  la primera vez que se pide el catálogo (o se arranca la app) si el
  almacén de productos está vacío. Arranques posteriores no vuelven a
  sembrar el catálogo: se respeta el stock persistido.
- `GET /productos` devuelve el catálogo completo a cualquier usuario
  autenticado (no está restringido por rol).
- `validarDisponibilidad(productoId, cantidad)` devuelve `true` solo si
  el producto existe y su stock es mayor o igual a la cantidad pedida.
- `reservarStock(productoId, cantidad)` descuenta la cantidad del stock
  del producto. Si el producto no existe o el stock es insuficiente,
  lanza un error y **no modifica el stock** (ni de ese producto ni de
  ningún otro).
- `reponerStock(productoId, cantidad)` incrementa el stock del producto
  en la cantidad indicada. Se usa desde cancelaciones y devoluciones
  (ver `spec-logistica.md`).

## Invariantes (no negociables)

- **Una reserva fallida no deja el stock a mitad de camino.** Por qué:
  `reservarStock` se llama una vez por línea de un pedido multi-línea
  (ver `spec-pedidos.md`); si una reserva parcial modificara el stock
  antes de fallar, un pedido rechazado dejaría productos con menos stock
  del real sin haberse vendido.
- **El catálogo solo se siembra si está vacío.** Por qué: es la única
  forma de que el stock persistido en `data/db.json` sobreviva a un
  reinicio del servidor sin resetearse a los valores seed en cada boot.

## Decisiones

- 2026-09-11: catálogo de 3 productos hardcodeado en el código
  (`CATALOGO_SEED`), no cargado desde un archivo de configuración —
  no hay necesidad de que sea editable sin tocar código para el alcance
  de este ejercicio.
- 2026-09-11: `inventario` no conoce a `pedidos`; es `pedidos` quien
  orquesta la reserva todo-o-nada llamando a `reservarStock` por línea
  (ver decisión fechada en `docs/plan-sistema-pedidos-2026-09-11.md`).

## Fuera de alcance

- Alta/edición/baja de productos vía API (el catálogo es fijo).
- Múltiples almacenes o variantes de producto.

## Referencias

- Código: `src/inventario/inventario.service.js`,
  `src/inventario/inventario.routes.js`.
- Tests: `test/inventario.service.test.js`,
  `test/inventario.routes.test.js`.
- Plan de origen: `docs/plan-sistema-pedidos-2026-09-11.md` (fase F1).
