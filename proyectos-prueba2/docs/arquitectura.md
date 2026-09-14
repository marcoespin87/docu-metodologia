# Arquitectura — Gestor de notas personal

## Patrón arquitectónico

Dos servicios independientes que corren como procesos separados en la misma máquina (uso personal, no distribuido):

- **`backend/`** — API REST en Node.js + Express. Único responsable de la lógica de negocio y de leer/escribir el archivo de datos.
- **`frontend/`** — aplicación Next.js (App Router, componentes cliente) que renderiza la UI y consume la API del backend vía `fetch`.

El frontend nunca accede al archivo de datos directamente — toda lectura/escritura de notas pasa por la API del backend.

## Límites entre servicios

- `backend/src/index.js` — entrypoint, configura CORS y monta las rutas.
- `backend/src/notasRouter.js` — endpoints HTTP de la capacidad `gestion-notas` (`GET/POST /api/notas`, `DELETE /api/notas/:id`).
- `backend/src/notasStore.js` — único módulo que lee/escribe `backend/data/notas.db` (SQLite). Ninguna otra parte del backend toca la base de datos directamente.
- `frontend/app/page.js` — única página de la UI; hace fetch al backend usando `NEXT_PUBLIC_API_URL`.

## Invariantes transversales

- **Persistencia en SQLite embebido:** las notas viven en `backend/data/notas.db`, accedido con `better-sqlite3` (API síncrona, sin proceso de base de datos separado). *(Porqué: reemplaza al archivo JSON plano anterior, que se reescribía completo en cada creación/eliminación y dejaba de escalar con más notas; sigue sin requerir un servidor de base de datos aparte porque el uso es personal/de un solo proceso.)* El archivo `backend/data/notas.json` anterior queda en disco como backup histórico; el backend ya no lo lee ni lo escribe.
- **Sin autenticación:** no hay login ni separación por usuario — un único espacio de notas compartido por quien use la app localmente. *(Porqué: uso personal, decidido explícitamente fuera de alcance en el plan inicial.)*
- **CORS restringido al origen del frontend:** el backend solo acepta requests desde `FRONTEND_ORIGIN` (por defecto `http://localhost:3000`), no `*`. *(Porqué: evitar que cualquier origen externo pueda leer/borrar notas si el backend queda expuesto en la red local.)*

## Restricciones del entorno

- Requiere Node.js 18+ (probado con Node 24) y npm.
- Backend y frontend son proyectos npm independientes, cada uno con su propio `package.json` y `node_modules` — no es un monorepo con workspaces compartidos.
- El backend debe estar corriendo para que el frontend pueda crear, listar o eliminar notas; si no lo está, el frontend lo muestra como error de conexión en la UI.

## Comandos útiles

### Backend (`backend/`)
```
npm install       # instalar dependencias
npm run dev        # correr en desarrollo (reinicia con --watch), puerto 4000
npm start           # correr en modo normal
```
Variables de entorno opcionales: `PORT` (default 4000), `FRONTEND_ORIGIN` (default `http://localhost:3000`).

### Frontend (`frontend/`)
```
npm install       # instalar dependencias
npm run dev         # correr en desarrollo, puerto 3000
npm run build       # build de producción
npm run lint         # lint (eslint)
```
Variable de entorno: `NEXT_PUBLIC_API_URL` en `.env.local` (default `http://localhost:4000`).

No hay tests automatizados todavía en ninguno de los dos proyectos.
