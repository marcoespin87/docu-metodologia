# Spec: Crear Pedido

**Estado:** desplegado · **Última revisión:** 2026-09-14

## Propósito
Permitir el registro de un nuevo pedido de un cliente en el sistema.

## Comportamiento
- **[Confirmado por test]** Recibe una solicitud con los campos `cliente`, `producto` y `cantidad`.
- **[Confirmado por test]** Si falta alguno de los datos obligatorios (`cliente`, `producto` o `cantidad`), la solicitud es rechazada y devuelve un código de error 400.
- **[Confirmado por test]** Si los datos están presentes, el pedido se crea exitosamente, asignándole el estado inicial `"Pendiente"`, y se devuelve el `id` autogenerado junto con el estado (código 201).
- **[Inferido del código]** Si ocurre un error interno al intentar guardar el registro en la base de datos, la operación se cancela y devuelve un código de error 500 con el mensaje de fallo.

## Invariantes (no negociables)
- **[Confirmado por test / Inferido] El estado inicial siempre es "Pendiente":** Un pedido recién creado nunca nace en otro estado. *Por qué:* Garantiza que los pedidos nuevos inicien su ciclo de vida correctamente y no puedan crearse saltándose las primeras etapas del proceso.

## Decisiones
- 2026-09-14: (Fase 0) Ingeniería inversa realizada sobre código heredado. No hay registro de decisiones pasadas documentadas.

## Fuera de alcance
- (Vacío por el momento)

## Referencias
- Código: `app.post('/pedidos')` en `app.js`
