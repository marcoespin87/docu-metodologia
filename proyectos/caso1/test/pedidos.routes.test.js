'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const os = require('os');
const request = require('supertest');

test.before(() => {
  process.env.DB_PATH = path.join(os.tmpdir(), `caso1-pedidos-routes-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
});

test.after(() => {
  delete process.env.DB_PATH;
});

const { crearApp } = require('../src/app');
const { reset: resetAuth, login } = require('../src/auth/auth.service');
const inventarioService = require('../src/inventario/inventario.service');
const pedidosService = require('../src/pedidos/pedidos.service');

test.beforeEach(() => {
  resetAuth();
  inventarioService.reset();
});

function tokenDe(usuario, password) {
  return login(usuario, password).token;
}

test('POST /pedidos sin token devuelve 401', async () => {
  const app = crearApp();

  const respuesta = await request(app).post('/pedidos').send({ lineas: [{ productoId: 1, cantidad: 1 }] });

  assert.equal(respuesta.status, 401);
});

test('POST /pedidos como cliente crea el pedido a su propio nombre y devuelve 201', async () => {
  const app = crearApp();
  const token = tokenDe('ana', 'ana123');

  const respuesta = await request(app)
    .post('/pedidos')
    .set('Authorization', `Bearer ${token}`)
    .send({ lineas: [{ productoId: 1, cantidad: 2 }] });

  assert.equal(respuesta.status, 201);
  assert.equal(respuesta.body.clienteId, 1);
  assert.equal(respuesta.body.estado, 'Pendiente');
  assert.equal(typeof respuesta.body.total, 'number');
});

test('POST /pedidos con stock insuficiente devuelve 409', async () => {
  const app = crearApp();
  const token = tokenDe('ana', 'ana123');
  const mochila = inventarioService.CATALOGO_SEED[2];

  const respuesta = await request(app)
    .post('/pedidos')
    .set('Authorization', `Bearer ${token}`)
    .send({ lineas: [{ productoId: mochila.id, cantidad: mochila.stock + 1 }] });

  assert.equal(respuesta.status, 409);
});

test('GET /pedidos/:id como dueño del pedido devuelve 200', async () => {
  const app = crearApp();
  const token = tokenDe('ana', 'ana123');
  const creado = await request(app)
    .post('/pedidos')
    .set('Authorization', `Bearer ${token}`)
    .send({ lineas: [{ productoId: 1, cantidad: 1 }] });

  const respuesta = await request(app).get(`/pedidos/${creado.body.id}`).set('Authorization', `Bearer ${token}`);

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.id, creado.body.id);
});

test('GET /pedidos/:id como otro cliente devuelve 404', async () => {
  const app = crearApp();
  const tokenAna = tokenDe('ana', 'ana123');
  const tokenBeto = tokenDe('beto', 'beto123');
  const creado = await request(app)
    .post('/pedidos')
    .set('Authorization', `Bearer ${tokenAna}`)
    .send({ lineas: [{ productoId: 1, cantidad: 1 }] });

  const respuesta = await request(app).get(`/pedidos/${creado.body.id}`).set('Authorization', `Bearer ${tokenBeto}`);

  assert.equal(respuesta.status, 404);
});

test('GET /pedidos/:id como administrador devuelve 200 aunque no sea el dueño', async () => {
  const app = crearApp();
  const tokenAna = tokenDe('ana', 'ana123');
  const tokenAdmin = tokenDe('carla', 'carla123');
  const creado = await request(app)
    .post('/pedidos')
    .set('Authorization', `Bearer ${tokenAna}`)
    .send({ lineas: [{ productoId: 1, cantidad: 1 }] });

  const respuesta = await request(app).get(`/pedidos/${creado.body.id}`).set('Authorization', `Bearer ${tokenAdmin}`);

  assert.equal(respuesta.status, 200);
});

test('PATCH /pedidos/:id/estado como cliente devuelve 403', async () => {
  const app = crearApp();
  const token = tokenDe('ana', 'ana123');
  const creado = await request(app)
    .post('/pedidos')
    .set('Authorization', `Bearer ${token}`)
    .send({ lineas: [{ productoId: 1, cantidad: 1 }] });

  const respuesta = await request(app)
    .patch(`/pedidos/${creado.body.id}/estado`)
    .set('Authorization', `Bearer ${token}`)
    .send({ estado: 'Entregado' });

  assert.equal(respuesta.status, 403);
});

test('PATCH /pedidos/:id/estado como admin con una transición distinta de Enviado->Entregado devuelve 409', async () => {
  const app = crearApp();
  const tokenAna = tokenDe('ana', 'ana123');
  const tokenAdmin = tokenDe('carla', 'carla123');
  const creado = await request(app)
    .post('/pedidos')
    .set('Authorization', `Bearer ${tokenAna}`)
    .send({ lineas: [{ productoId: 1, cantidad: 1 }] });

  const respuesta = await request(app)
    .patch(`/pedidos/${creado.body.id}/estado`)
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ estado: 'Cancelado' });

  assert.equal(respuesta.status, 409);
});

test('PATCH /pedidos/:id/estado como admin mueve un pedido Enviado a Entregado', async () => {
  const app = crearApp();
  const tokenAna = tokenDe('ana', 'ana123');
  const tokenAdmin = tokenDe('carla', 'carla123');
  const creado = await request(app)
    .post('/pedidos')
    .set('Authorization', `Bearer ${tokenAna}`)
    .send({ lineas: [{ productoId: 1, cantidad: 1 }] });

  pedidosService.cambiarEstado(creado.body.id, 'Procesando');
  pedidosService.cambiarEstado(creado.body.id, 'Pagado');
  pedidosService.cambiarEstado(creado.body.id, 'Enviado');

  const respuesta = await request(app)
    .patch(`/pedidos/${creado.body.id}/estado`)
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ estado: 'Entregado' });

  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.body.estado, 'Entregado');
});
