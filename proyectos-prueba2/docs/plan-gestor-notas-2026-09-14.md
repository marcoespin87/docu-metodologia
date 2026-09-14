# Plan: Gestor de notas personal

**Fecha:** 2026-09-14
**Estado:** destilado

## Contexto

No existe ningún sistema, spec ni código previo en este proyecto (Caso 1 — desde cero, confirmado en `/sdd-exploracion`). Se pide construir un gestor de notas personal con tres operaciones: crear una nota con título y cuerpo, listar todas las notas, y eliminar una nota.

## Delta

**100% del sistema** (Caso 1). Todo el código, la arquitectura y el spec de esta capacidad nacen en este cambio.

## Decisiones tomadas y enfoque técnico

- **Interfaz:** aplicación web local (confirmado con el usuario).
- **Stack:** dos proyectos separados dentro del repo:
  - **Backend:** Node.js + Express, expone una API REST.
  - **Frontend:** Next.js (App Router), consume la API del backend vía `fetch`.
  - Se descartó "solo Next.js" (API routes propias) porque el usuario pidió explícitamente Next.js y Express como piezas separadas.
- **Persistencia:** archivo JSON local en el backend (`backend/data/notas.json`), leído y escrito en cada operación. Sin base de datos (confirmado con el usuario).
- **Arquitectura:** monolito dividido en dos procesos independientes:
  - `backend/` — servidor Express, puerto `4000`.
  - `frontend/` — servidor Next.js, puerto `3000`, llama al backend por HTTP usando una variable de entorno para la URL base (`NEXT_PUBLIC_API_URL`).
  - CORS habilitado en el backend para aceptar llamadas desde el origen del frontend.
- **Modelo de datos de una nota:** `id` (identificador único generado por el backend), `titulo` (string, requerido, no vacío), `cuerpo` (string, requerido, no vacío), `fechaCreacion` (timestamp ISO, generado por el backend).
- **Capacidad única:** `gestion-notas` — crear, listar y eliminar comparten la misma entidad y los mismos invariantes (una nota siempre tiene título y cuerpo no vacíos), así que van en un solo spec en vez de tres.
- **Fuera de alcance explícito:** edición de notas, autenticación/multiusuario, búsqueda, filtros, categorías o etiquetas. Todo esto queda fuera de este cambio y, si se pide después, es un Caso 2 (funcionalidad nueva) sobre el spec `gestion-notas`.

## Tareas

### Backend (Express)
- [ ] Inicializar `backend/` (package.json, dependencias: express, cors, uuid)
- [ ] Módulo de persistencia sobre `backend/data/notas.json` (leer, escribir, crear el archivo si no existe)
- [ ] `POST /api/notas` — crear nota (valida título y cuerpo no vacíos)
- [ ] `GET /api/notas` — listar todas las notas
- [ ] `DELETE /api/notas/:id` — eliminar nota por id (valida que exista)
- [ ] Configurar CORS para aceptar el origen del frontend

### Frontend (Next.js)
- [ ] Inicializar `frontend/` (Next.js, App Router, TypeScript o JS a elección de quien construya)
- [ ] Página principal: formulario para crear nota (título + cuerpo) con validación básica en cliente
- [ ] Listado de notas existentes, obtenido del backend
- [ ] Acción de eliminar una nota desde el listado
- [ ] Manejo de estados de error (ej. backend no disponible, validación fallida)

### Documento de arquitectura
- [ ] Crear `docs/arquitectura.md`: patrón (dos servicios separados), estructura de carpetas, invariantes (formato de nota, validación título/cuerpo no vacíos), comandos para correr cada proyecto (`npm run dev` en cada carpeta), puertos usados

## Criterios de aceptación

1. Al enviar el formulario con título y cuerpo no vacíos, se crea una nota nueva y aparece en el listado del frontend.
2. Si se intenta crear una nota con título o cuerpo vacío, el backend responde con un error 4xx y el frontend muestra que faltan datos, sin crear la nota.
3. `GET /api/notas` devuelve todas las notas creadas hasta el momento, cada una con `id`, `titulo`, `cuerpo` y `fechaCreacion`.
4. Al eliminar una nota desde la interfaz, esta desaparece del listado inmediatamente y no vuelve a aparecer al recargar la página.
5. Las notas persisten en `backend/data/notas.json` entre reinicios del servidor backend (reiniciar el backend no borra notas existentes).
6. Intentar eliminar una nota con un `id` que no existe responde con un error 4xx y no afecta las notas existentes.
7. El frontend (puerto 3000) puede comunicarse exitosamente con el backend (puerto 4000) sin errores de CORS.

## Pendientes de decisión

Ninguno — todas las decisiones necesarias para construir quedaron cerradas arriba.

## Nota de destilación (2026-09-14)

Se implementó el plan completo, sin recortes: las 7 tareas de backend/frontend/arquitectura y los 7 criterios de aceptación se cumplieron y se verificaron en `/sdd-verificacion` (aprobado por el usuario). Todo el contenido relevante pasó a `docs/specs/spec-gestion-notas.md` (Comportamiento, Invariantes, Decisiones, Fuera de alcance) y a `docs/arquitectura.md`. No quedó nada del plan sin implementar.
