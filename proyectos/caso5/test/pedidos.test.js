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

const app = require('../app');

let server;
let baseUrl;

function waitReady() {
  return new Promise((resolve) => {
    http.get(baseUrl + '/pedidos', (res) => {
      res.resume();
      resolve(res.statusCode !== 500);
    }).on('error', () => resolve(false));
  });
}

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
    if (await waitReady()) return;
    await new Promise((r) => setTimeout(r, 50));
  }
});

test.after(() => {
  server.close();
});

function post(rutaPath, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      baseUrl + rutaPath,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

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

// falta cobertura de GET /pedidos y de PUT /pedidos/:id/estado
