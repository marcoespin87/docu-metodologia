'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const os = require('os');
const request = require('supertest');

test.before(() => {
  process.env.DB_PATH = path.join(os.tmpdir(), `caso1-inventario-routes-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
});

test.after(() => {
  delete process.env.DB_PATH;
});

const { crearApp } = require('../src/app');
const { reset: resetInventario, CATALOGO_SEED } = require('../src/inventario/inventario.service');
const { login, reset: resetAuth } = require('../src/auth/auth.service');

test.beforeEach(() => {
  resetAuth();
  resetInventario();
});

test('GET /productos sin token devuelve 401', async () => {
  const app = crearApp();

  const respuesta = await request(app).get('/productos');

  assert.equal(respuesta.status, 401);
});

test('GET /productos con token válido devuelve 200 con el catálogo', async () => {
  const app = crearApp();
  const { token } = login('ana', 'ana123');

  const respuesta = await request(app).get('/productos').set('Authorization', `Bearer ${token}`);

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.length, CATALOGO_SEED.length);
});
