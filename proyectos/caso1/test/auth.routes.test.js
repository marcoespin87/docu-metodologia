'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { crearApp } = require('../src/app');
const { reset } = require('../src/auth/auth.service');

test.beforeEach(() => {
  reset();
});

test('POST /auth/login con credenciales válidas devuelve 200 con token y rol', async () => {
  const app = crearApp();

  const respuesta = await request(app).post('/auth/login').send({ usuario: 'ana', password: 'ana123' });

  assert.equal(respuesta.status, 200);
  assert.equal(typeof respuesta.body.token, 'string');
  assert.equal(respuesta.body.rol, 'cliente');
});

test('POST /auth/login con credenciales inválidas devuelve 401', async () => {
  const app = crearApp();

  const respuesta = await request(app).post('/auth/login').send({ usuario: 'ana', password: 'incorrecta' });

  assert.equal(respuesta.status, 401);
});
