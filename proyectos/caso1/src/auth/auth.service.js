'use strict';

// Capacidad "auth": login simulado contra usuarios seed fijos (sin
// registro) y resolución de tokens de sesión. Ver docs/specs/spec-auth.md.

const crypto = require('crypto');

const USUARIOS = [
  { id: 1, nombre: 'Ana Cliente', usuario: 'ana', password: 'ana123', rol: 'cliente' },
  { id: 2, nombre: 'Beto Cliente', usuario: 'beto', password: 'beto123', rol: 'cliente' },
  { id: 3, nombre: 'Carla Admin', usuario: 'carla', password: 'carla123', rol: 'administrador' },
];

let sesiones = new Map();

function reset() {
  sesiones = new Map();
}

function login(usuario, password) {
  const encontrado = USUARIOS.find((u) => u.usuario === usuario && u.password === password);
  if (!encontrado) {
    return null;
  }
  const token = crypto.randomBytes(16).toString('hex');
  sesiones.set(token, encontrado.id);
  return { token, rol: encontrado.rol };
}

function usuarioPorToken(token) {
  const usuarioId = sesiones.get(token);
  if (usuarioId === undefined) {
    return null;
  }
  return USUARIOS.find((u) => u.id === usuarioId) || null;
}

module.exports = { login, usuarioPorToken, reset, USUARIOS };
