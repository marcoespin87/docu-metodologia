const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "notas.json");

function leerNotas() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  const contenido = fs.readFileSync(DATA_FILE, "utf-8").trim();
  if (!contenido) {
    return [];
  }
  return JSON.parse(contenido);
}

function guardarNotas(notas) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(notas, null, 2), "utf-8");
}

module.exports = { leerNotas, guardarNotas };
