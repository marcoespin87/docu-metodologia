const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "notas.db");
const JSON_FILE = path.join(DATA_DIR, "notas.json");

const dbExistiaAntes = fs.existsSync(DB_FILE);

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(DB_FILE);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS notas (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    cuerpo TEXT NOT NULL,
    fecha_creacion TEXT NOT NULL,
    fecha_limite TEXT
  )
`);

if (!dbExistiaAntes) {
  migrarDesdeJson();
}

function migrarDesdeJson() {
  if (!fs.existsSync(JSON_FILE)) {
    return;
  }
  const contenido = fs.readFileSync(JSON_FILE, "utf-8").trim();
  if (!contenido) {
    return;
  }
  const notas = JSON.parse(contenido);
  const insertar = db.prepare(`
    INSERT INTO notas (id, titulo, cuerpo, fecha_creacion, fecha_limite)
    VALUES (@id, @titulo, @cuerpo, @fechaCreacion, @fechaLimite)
  `);
  const insertarTodas = db.transaction((notas) => {
    for (const nota of notas) {
      insertar.run({
        id: nota.id,
        titulo: nota.titulo,
        cuerpo: nota.cuerpo,
        fechaCreacion: nota.fechaCreacion,
        fechaLimite: nota.fechaLimite ?? null,
      });
    }
  });
  insertarTodas(notas);
}

function filaANota(fila) {
  return {
    id: fila.id,
    titulo: fila.titulo,
    cuerpo: fila.cuerpo,
    fechaCreacion: fila.fecha_creacion,
    fechaLimite: fila.fecha_limite,
  };
}

function listarNotas() {
  const filas = db.prepare("SELECT * FROM notas").all();
  return filas.map(filaANota);
}

function crearNota(nota) {
  db.prepare(`
    INSERT INTO notas (id, titulo, cuerpo, fecha_creacion, fecha_limite)
    VALUES (@id, @titulo, @cuerpo, @fechaCreacion, @fechaLimite)
  `).run({
    id: nota.id,
    titulo: nota.titulo,
    cuerpo: nota.cuerpo,
    fechaCreacion: nota.fechaCreacion,
    fechaLimite: nota.fechaLimite ?? null,
  });
  return nota;
}

function eliminarNota(id) {
  const resultado = db.prepare("DELETE FROM notas WHERE id = ?").run(id);
  return resultado.changes > 0;
}

module.exports = { listarNotas, crearNota, eliminarNota };
