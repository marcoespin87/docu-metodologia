# Plan: Filtrado de historial de pedidos por estado

## Descripción del Objetivo
Agregar la capacidad de filtrar el historial de pedidos según su estado (`Pendiente`, `Enviado`, `Entregado`, `Cancelado`). 
De acuerdo con la metodología Spec-Anchored, este es un **Caso 2 (Funcionalidad nueva sobre un sistema existente)**.
El delta es **Agregado**: no alteramos el comportamiento base de las consultas sin filtro, sino que añadimos la opción de parametrizar la búsqueda.

> [!NOTE]
> Este cambio requiere tocar código en `src/index.js` y actualizar el spec de la capacidad correspondiente en `docs/specs/spec-pedidos.md` dentro del mismo Merge Request.

## Preguntas Abiertas (Decisiones por tomar)

> [!IMPORTANT]
> Por favor responde a estas preguntas para terminar de definir el enfoque técnico antes de proceder a la implementación.

1. **Ubicación del filtrado (Cliente vs. Servidor):**
   Dado que actualmente solo tenemos la API (backend), ¿quieres que el filtro se implemente a nivel de base de datos (servidor) mediante un query parameter (ej. `GET /pedidos?estado=Pendiente`), o se espera construir alguna interfaz (cliente) que haga el filtrado en memoria? 
   *(Recomendado: Implementarlo en el Servidor en la consulta SQL para mayor escalabilidad).*

2. **Manejo de estados inválidos en la consulta:**
   Si un consumidor hace una petición como `GET /pedidos?estado=Invalido`, ¿preferimos devolver un error HTTP 400 indicando que el estado no es permitido, o simplemente devolver un 200 con una lista vacía?
   *(Recomendado: HTTP 400 para mantener la rigurosidad del invariante de "Estados Válidos Estrictos").*

3. **Multi-estado:**
   ¿Es necesario poder filtrar por múltiples estados a la vez (ej. `?estado=Pendiente&estado=Enviado`), o nos limitamos a un solo estado por consulta por ahora?
   *(Recomendado: Un solo estado por simplicidad, alineado con un delta acotado).*

## Cambios Propuestos

### Componente: Backend API (`src/index.js`)
Modificaremos el endpoint de historial para leer parámetros de consulta e incluirlos en la sentencia SQL, previa validación.

#### [MODIFY] `src/index.js`
```javascript
// GET /pedidos - Ver historial
app.get('/pedidos', (req, res) => {
    const { estado } = req.query;
    console.log('[INFO] Solicitud recibida: GET /pedidos', estado ? `Filtro: ${estado}` : '');
    
    // Si hay decisión de validar el estado, lo haríamos aquí.
    // ...

    let sql = 'SELECT * FROM pedidos';
    let params = [];

    if (estado) {
        sql += ' WHERE estado = ?';
        params.push(estado);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});
```

### Componente: Documentación Spec (`docs/specs/spec-pedidos.md`)
Actualizaremos el Spec para reflejar el comportamiento "AS-BUILT".

#### [MODIFY] `docs/specs/spec-pedidos.md`
- Actualizar sección **Comportamiento**: Modificar la línea de "Ver historial" para documentar que acepta un parámetro `estado` para filtrar, y que sin el parámetro devuelve la lista completa.
- Agregar en la sección **Decisiones** (según las respuestas a las preguntas abiertas):
  - *2026-09-13: El filtrado de historial se realiza en servidor (SQL) para asegurar escalabilidad...*

## Tareas

1. [ ] Obtener respuestas a decisiones abiertas.
2. [ ] Modificar `src/index.js` implementando el filtro en la consulta GET.
3. [ ] Actualizar `docs/specs/spec-pedidos.md` con el nuevo comportamiento y las decisiones tomadas.
4. [ ] Ejecutar servidor y realizar validación manual.

## Plan de Verificación

### Verificación Manual
El usuario o el tester deberá validar lo siguiente utilizando `curl`, Postman, o el navegador:

1. **Sin filtro:** Realizar `GET /pedidos`. **Criterio de aceptación:** Devuelve todos los pedidos sin importar el estado.
2. **Con filtro válido:** Realizar `GET /pedidos?estado=Pendiente` (y otros estados). **Criterio de aceptación:** Devuelve únicamente los pedidos cuyo estado coincida exactamente.
3. **Comportamiento ante error (dependiente de decisión):** Realizar `GET /pedidos?estado=Inventado`. **Criterio de aceptación:** Falla con código HTTP 400 (si esa es la decisión) o devuelve lista vacía.
4. **Revisión del diff del spec:** Asegurar que `spec-pedidos.md` refleje que el historial es ahora filtrable y por qué se decidió implementarlo de la forma acordada.
