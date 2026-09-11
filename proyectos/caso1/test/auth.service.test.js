'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { login, usuarioPorToken, reset } = require('../src/auth/auth.service');

test.beforeEach(() => {
  reset();
});

test('login con credenciales válidas devuelve un token y el rol del usuario', () => {
  const resultado = login('ana', 'ana123');

  assert.equal(typeof resultado.token, 'string');
  assert.ok(resultado.token.length > 0);
  assert.equal(resultado.rol, 'cliente');
});

test('login con contraseña incorrecta devuelve null', () => {
  const resultado = login('ana', 'password-incorrecta');

  assert.equal(resultado, null);
});

test('login con usuario inexistente devuelve null', () => {
  const resultado = login('no-existe', 'lo-que-sea');

  assert.equal(resultado, null);
});

test('usuarioPorToken devuelve el usuario dueño de un token vigente', () => {
  const { token } = login('carla', 'carla123');

  const usuario = usuarioPorToken(token);

  assert.equal(usuario.usuario, 'carla');
  assert.equal(usuario.rol, 'administrador');
});

test('usuarioPorToken devuelve null para un token que no existe', () => {
  const usuario = usuarioPorToken('token-inventado');

  assert.equal(usuario, null);
});

test('reset() invalida los tokens emitidos antes de llamarlo', () => {
  const { token } = login('ana', 'ana123');

  reset();

  assert.equal(usuarioPorToken(token), null);
});
