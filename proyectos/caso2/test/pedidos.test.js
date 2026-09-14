const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// arrancamos con una base limpia para que el test no dependa de corridas anteriores
const dbPath = path.join(__dirname, '..', 'pedidos.db');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const app = require('../src/index');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = 'http://localhost:' + server.address().port;
      resolve();
    });
  });
  // La tabla se crea en el callback async de apertura de SQLite; esperamos
  // a que exista antes de correr los tests para no pisar esa carrera.
  for (let intentos = 0; intentos < 30; intentos++) {
    const res = await get('/pedidos');
    if (res.status !== 500) return;
    await new Promise((r) => setTimeout(r, 50));
  }
});

test.after(() => {
  server.close();
});

function request(method, rutaPath, body) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? null : JSON.stringify(body);
    const headers = {};
    if (data !== null) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = http.request(baseUrl + rutaPath, { method, headers }, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }));
    });
    req.on('error', reject);
    if (data !== null) req.write(data);
    req.end();
  });
}

const post = (rutaPath, body) => request('POST', rutaPath, body);
const get = (rutaPath) => request('GET', rutaPath);
const put = (rutaPath, body) => request('PUT', rutaPath, body);

test('POST /pedidos crea un pedido con estado Pendiente', async () => {
  const res = await post('/pedidos', { cliente: 'Ana', producto: 'Teclado', cantidad: 2 });
  assert.equal(res.status, 201);
  assert.equal(res.body.estado, 'Pendiente');
});

test('POST /pedidos sin datos obligatorios devuelve 400', async () => {
  const res = await post('/pedidos', { cliente: 'Ana' });
  assert.equal(res.status, 400);
});

test('GET /pedidos sin filtro devuelve la lista completa', async () => {
  await post('/pedidos', { cliente: 'Beto', producto: 'Mouse', cantidad: 1 });
  const res = await get('/pedidos');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
});

test('GET /pedidos?estado=X filtra por un solo estado', async () => {
  const creado = await post('/pedidos', { cliente: 'Cami', producto: 'Monitor', cantidad: 1 });
  await put(`/pedidos/${creado.body.id}/estado`, { estado: 'Enviado' });

  const res = await get('/pedidos?estado=Enviado');
  assert.equal(res.status, 200);
  assert.ok(res.body.every((p) => p.estado === 'Enviado'));
  assert.ok(res.body.some((p) => p.id === creado.body.id));
});

test('GET /pedidos?estado=X&estado=Y filtra por múltiples estados', async () => {
  const res = await get('/pedidos?estado=Pendiente&estado=Enviado');
  assert.equal(res.status, 200);
  assert.ok(res.body.every((p) => p.estado === 'Pendiente' || p.estado === 'Enviado'));
});

test('GET /pedidos?estado=Invalido devuelve 400', async () => {
  const res = await get('/pedidos?estado=Invalido');
  assert.equal(res.status, 400);
});

test('PUT /pedidos/:id/estado con un estado válido actualiza el pedido', async () => {
  const creado = await post('/pedidos', { cliente: 'Dani', producto: 'Cable', cantidad: 3 });
  const res = await put(`/pedidos/${creado.body.id}/estado`, { estado: 'Entregado' });
  assert.equal(res.status, 200);
  assert.equal(res.body.nuevo_estado, 'Entregado');
});

test('PUT /pedidos/:id/estado con un estado inválido devuelve 400', async () => {
  const creado = await post('/pedidos', { cliente: 'Eli', producto: 'Silla', cantidad: 1 });
  const res = await put(`/pedidos/${creado.body.id}/estado`, { estado: 'EnCamino' });
  assert.equal(res.status, 400);
});
