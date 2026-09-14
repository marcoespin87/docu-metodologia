# Plan: Sistema de Gestión de Pedidos (Caso 1) [DESTILADO]

## Contexto y Delta (Goal Description)
**Contexto:** Se requiere construir un sistema mínimo de gestión de pedidos desde cero (Caso 1). El objetivo es tener una base funcional y sencilla para validar el flujo de la metodología *Spec-Anchored Spec-Driven Development*.
**Delta:** 100% del sistema (por ser el Caso 1, no hay base previa).

## Decisiones Tomadas y Enfoque Técnico
- **Stack:** Node.js, Express y SQLite (vía `sqlite3` o `better-sqlite3`).
- **Arquitectura:** Monolito simple. Capas de Rutas $\rightarrow$ Controladores $\rightarrow$ Base de Datos. Solo API REST.
- **Fuera de alcance explícito:** Autenticación, inventario, pagos, notificaciones y logística.

## User Review Required
> [!IMPORTANT]
> **Estrategia de Fusión (Merge Requests)**
> La metodología (Regla 3.3) indica que el trabajo se organiza en *cambios acotados* (MRs de vida corta). Dado que este es un sistema extremadamente pequeño, propongo que **todas las tareas listadas abajo se implementen en un solo MR fundacional**. 
> - Si estás de acuerdo con la estrategia de un solo MR y el uso de `PUT`, haz clic en "Proceed" para comenzar la construcción.

## Open Questions
> [!NOTE]
> Ninguna pendiente estructural de mi lado.

## Proposed Changes (Fases y Tareas)

### Componente: Infraestructura y Arquitectura (Fase 1)
Se establecerá la base del proyecto y el documento arquitectónico obligatorio de la Fase 1.
- Inicializar `package.json` y dependencias (`express`, `sqlite3`).
- Crear esquema de BD SQLite (`pedidos`: id, cliente, producto, cantidad, estado).
#### [NEW] docs/arquitectura.md
*(Contendrá el patrón arquitectónico, límites del servicio e invariantes transversales como exige la Sección 6).*
#### [NEW] docs/specs/README.md
*(Índice de specs).*

### Componente: Capacidad Base de Pedidos (Fase 2)
Implementación de la creación y lectura de historial.
#### [NEW] src/index.js
*(Rutas `POST /pedidos` y `GET /pedidos`, inicialización de Express y SQLite).*
#### [NEW] docs/specs/spec-pedidos.md
*(Spec vivo que documentará el comportamiento as-built e invariantes de los pedidos).*

### Componente: Gestión de Estados (Fase 3)
Implementación del ciclo de vida del pedido.
#### [MODIFY] src/index.js
*(Agregar ruta `PUT /pedidos/:id/estado`).*
#### [MODIFY] docs/specs/spec-pedidos.md
*(Actualizar el spec incorporando las transiciones de estados válidas y sus invariantes).*

## Verification Plan (Criterios de Aceptación)

De acuerdo a la **Regla 3.4**, los criterios se definen antes de construir para que la verificación sea objetiva.

### Automated Tests (cURL / API)
- `POST /pedidos` con datos válidos retorna HTTP 201 y el ID autogenerado.
- `GET /pedidos` retorna HTTP 200 y una lista de pedidos.
- `PUT /pedidos/:id/estado` con estado "Enviado" retorna HTTP 200 y refleja el cambio en la BD.
- `PUT /pedidos/:id/estado` con un estado inválido (ej. "En Tránsito") retorna HTTP 400 y no altera la BD.

### Manual Verification
- **Revisión Humana (Obligatoria por metodología):** Revisar que el diff en el PR (MR) incluye la creación de `docs/arquitectura.md` y `docs/specs/spec-pedidos.md`.
- El humano verificará que el spec redactado incluye secciones fijas (`Comportamiento`, `Invariantes`, `Decisiones`, `Fuera de alcance`) según la Sección 2.
