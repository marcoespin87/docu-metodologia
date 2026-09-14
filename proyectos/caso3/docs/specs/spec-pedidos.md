# Spec: Gestión de Pedidos

**Estado:** desplegado | **Última revisión:** 2026-09-13

## Propósito
Permitir la creación y lectura de pedidos, así como la gestión de su ciclo de vida a través de distintos estados, manteniendo un registro simple en la base de datos.

## Comportamiento
- **Crear pedido (`POST /pedidos`):** Recibe `cliente`, `producto`, y `cantidad`. Genera un pedido nuevo en el sistema y retorna su ID generado.
- **Ver historial (`GET /pedidos`):** Retorna la lista de pedidos. Acepta el parámetro de consulta `estado` (que puede repetirse) para filtrar por uno o varios estados permitidos. Si se pasan estados inválidos se rechaza con código 400. Sin el parámetro, devuelve la lista completa.
- **Cambiar estado (`PUT /pedidos/:id/estado`):** Recibe el campo `estado`. Actualiza el estado del pedido especificado.

## Invariantes (no negociables)
- **Estado Inicial Fijo:** Todo pedido recién creado asume incondicionalmente el estado "Pendiente". *(Porqué: evita que se creen pedidos saltándose pasos de validación o que nazcan como entregados por error).*
- **Estados Válidos Estrictos:** Los únicos estados permitidos en el sistema son: `Pendiente`, `Enviado`, `Entregado`, `Cancelado`. Un intento de usar otro estado es rechazado y no altera la BD. *(Porqué: asegura la consistencia de datos en el cliente y previene estados fantasma).*

## Decisiones
- 2026-09-13: Se usa SQLite como motor de base de datos — *Porqué: es el sistema más simple para persistir datos y validar la metodología sin levantar contenedores o infraestructuras externas.*
- 2026-09-13: El cambio de estado usa el método `PUT` en lugar de `PATCH` — *Porqué: fue una decisión explícita del usuario durante el diseño del plan, a pesar de que semánticamente se actualice un solo campo.*
- 2026-09-13: El filtrado de historial se implementa en el servidor (SQL), admite múltiples estados simultáneos y devuelve HTTP 400 ante estados inválidos — *Porqué: decisión del usuario para favorecer delegación en backend, flexibilidad y asegurar rigurosidad con el invariante de "Estados Válidos Estrictos".*

## Fuera de alcance
- Autenticación o roles de usuario.
- Lógica de pagos.
- Control de inventario.
- Notificaciones (email, SMS).
- Logística e integraciones de envío.

## Referencias
- Archivo principal: `src/index.js`
- Base de datos: `pedidos.db`
