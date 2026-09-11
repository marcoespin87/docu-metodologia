'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { authMiddleware, requireRole } = require('../src/auth/auth.middleware');
const { login, reset } = require('../src/auth/auth.service');

function resFalso() {
  return {
    statusCode: null,
    body: null,
    status(codigo) {
      this.statusCode = codigo;
      return this;
    },
    json(cuerpo) {
      this.body = cuerpo;
      return this;
    },
  };
}

test.beforeEach(() => {
  reset();
});

test('authMiddleware rechaza con 401 si no hay header Authorization', () => {
  const req = { headers: {} };
  const res = resFalso();
  let siguienteLlamado = false;

  authMiddleware(req, res, () => {
    siguienteLlamado = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(siguienteLlamado, false);
});

test('authMiddleware rechaza con 401 si el token no existe', () => {
  const req = { headers: { authorization: 'Bearer token-invalido' } };
  const res = resFalso();
  let siguienteLlamado = false;

  authMiddleware(req, res, () => {
    siguienteLlamado = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(siguienteLlamado, false);
});

test('authMiddleware adjunta req.usuario y llama a next() con un token válido', () => {
  const { token } = login('ana', 'ana123');
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = resFalso();
  let siguienteLlamado = false;

  authMiddleware(req, res, () => {
    siguienteLlamado = true;
  });

  assert.equal(siguienteLlamado, true);
  assert.equal(req.usuario.usuario, 'ana');
  assert.equal(res.statusCode, null);
});

test('requireRole rechaza con 403 si el rol del usuario no está permitido', () => {
  const req = { usuario: { rol: 'cliente' } };
  const res = resFalso();
  let siguienteLlamado = false;

  requireRole('administrador')(req, res, () => {
    siguienteLlamado = true;
  });

  assert.equal(res.statusCode, 403);
  assert.equal(siguienteLlamado, false);
});

test('requireRole llama a next() si el rol del usuario está permitido', () => {
  const req = { usuario: { rol: 'administrador' } };
  const res = resFalso();
  let siguienteLlamado = false;

  requireRole('administrador', 'cliente')(req, res, () => {
    siguienteLlamado = true;
  });

  assert.equal(siguienteLlamado, true);
  assert.equal(res.statusCode, null);
});
