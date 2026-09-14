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
  assert.ok(res.body.id);
});

test('POST /pedidos sin datos obligatorios devuelve 400', async () => {
  const res = await post('/pedidos', { cliente: 'Ana' });
  assert.equal(res.status, 400);
});

test('GET /pedidos devuelve la lista completa', async () => {
  await post('/pedidos', { cliente: 'Beto', producto: 'Mouse', cantidad: 1 });
  const res = await get('/pedidos');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length >= 2);
});

test('PUT /pedidos/:id/estado con un estado válido actualiza el pedido', async () => {
  const creado = await post('/pedidos', { cliente: 'Cami', producto: 'Monitor', cantidad: 1 });
  const res = await put(`/pedidos/${creado.body.id}/estado`, { estado: 'Enviado' });
  assert.equal(res.status, 200);
  assert.equal(res.body.nuevo_estado, 'Enviado');
});

test('PUT /pedidos/:id/estado con un estado inválido devuelve 400', async () => {
  const creado = await post('/pedidos', { cliente: 'Dani', producto: 'Cable', cantidad: 3 });
  const res = await put(`/pedidos/${creado.body.id}/estado`, { estado: 'EnCamino' });
  assert.equal(res.status, 400);
});

test('PUT /pedidos/:id/estado sobre un id inexistente devuelve 404', async () => {
  const res = await put('/pedidos/999999/estado', { estado: 'Enviado' });
  assert.equal(res.status, 404);
});
