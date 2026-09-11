'use strict';

// Capacidad "inventario": catálogo de productos, validación de
// disponibilidad y reserva/reposición de stock. Ver
// docs/specs/spec-inventario.md.

const store = require('../store');

const CATALOGO_SEED = [
  { id: 1, nombre: 'Libro', precioUnitario: 1500, stock: 10 },
  { id: 2, nombre: 'Taza', precioUnitario: 800, stock: 20 },
  { id: 3, nombre: 'Mochila', precioUnitario: 5000, stock: 3 },
];

function inicializar() {
  const db = store.cargar();
  if (db.productos.length === 0) {
    db.productos = CATALOGO_SEED.map((p) => ({ ...p }));
    store.guardar(db);
  }
}

function reset() {
  const db = store.cargar();
  db.productos = CATALOGO_SEED.map((p) => ({ ...p }));
  store.guardar(db);
}

function listarProductos() {
  inicializar();
  return store.cargar().productos;
}

function buscarProducto(productoId) {
  return store.cargar().productos.find((p) => p.id === productoId) || null;
}

function validarDisponibilidad(productoId, cantidad) {
  const producto = buscarProducto(productoId);
  if (!producto) {
    return false;
  }
  return producto.stock >= cantidad;
}

function reservarStock(productoId, cantidad) {
  const db = store.cargar();
  const producto = db.productos.find((p) => p.id === productoId);
  if (!producto || producto.stock < cantidad) {
    throw new Error('Stock insuficiente');
  }
  producto.stock -= cantidad;
  store.guardar(db);
}

function reponerStock(productoId, cantidad) {
  const db = store.cargar();
  const producto = db.productos.find((p) => p.id === productoId);
  if (!producto) {
    throw new Error('Producto inexistente');
  }
  producto.stock += cantidad;
  store.guardar(db);
}

module.exports = {
  inicializar,
  reset,
  listarProductos,
  buscarProducto,
  validarDisponibilidad,
  reservarStock,
  reponerStock,
  CATALOGO_SEED,
};
