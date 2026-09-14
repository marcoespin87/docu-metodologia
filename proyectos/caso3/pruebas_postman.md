# Ejemplos de Pruebas para Postman

A continuación, tienes los datos y payloads exactos para probar cada endpoint del Sistema de Gestión de Pedidos en Postman.

> **Nota previa:** Asegúrate de tener el servidor corriendo (`node src/index.js`) y que Postman esté configurado para enviar datos en formato crudo JSON (`Body` -> `raw` -> `JSON`).

---

## 1. Crear Pedido
- **Método:** `POST`
- **URL:** `http://localhost:3000/pedidos`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "cliente": "Juan Perez",
  "producto": "Teclado Mecánico",
  "cantidad": 2
}
```

---

## 2. Ver Historial
- **Método:** `GET`
- **URL:** `http://localhost:3000/pedidos`
- *(No requiere Body ni Headers especiales)*

---

## 3. Cambiar Estado (Prueba exitosa)
- **Método:** `PUT`
- **URL:** `http://localhost:3000/pedidos/1/estado` *(Asegúrate de cambiar el `1` por el ID real que te haya devuelto la creación del pedido)*
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "estado": "Enviado"
}
```

---

## 4. Cambiar Estado (Error de Invariante)
Prueba intentando asignar un estado que no está definido en el *spec* para confirmar que el sistema lo rechaza y protege la base de datos (te debe devolver un `400 Bad Request`).

- **Método:** `PUT`
- **URL:** `http://localhost:3000/pedidos/1/estado`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "estado": "En Tránsito"
}
```
