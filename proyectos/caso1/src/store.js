'use strict';

// Infraestructura interna de persistencia (JSON en disco). No es una
// capacidad en sí misma: la usan las capacidades de negocio para guardar
// su estado. Ver AGENTS.md.

const fs = require('fs');
const path = require('path');

function rutaDb() {
  return process.env.DB_PATH || path.join(__dirname, '..', 'data', 'db.json');
}

function estadoInicial() {
  return { productos: [], pedidos: [] };
}

function cargar() {
  const archivo = rutaDb();
  if (!fs.existsSync(archivo)) {
    return estadoInicial();
  }
  const contenido = fs.readFileSync(archivo, 'utf-8');
  if (!contenido.trim()) {
    return estadoInicial();
  }
  return JSON.parse(contenido);
}

function guardar(db) {
  const archivo = rutaDb();
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  fs.writeFileSync(archivo, JSON.stringify(db, null, 2));
}

function reset() {
  guardar(estadoInicial());
}

module.exports = { cargar, guardar, reset, rutaDb };
