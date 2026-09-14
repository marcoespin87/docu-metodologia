const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { listarNotas, crearNota, eliminarNota } = require("./notasStore");

const router = express.Router();

const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function esFechaValida(fechaStr) {
  if (!FECHA_REGEX.test(fechaStr)) return false;
  const fecha = new Date(`${fechaStr}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === fechaStr;
}

router.get("/", (req, res) => {
  const notas = listarNotas();
  const hoy = hoyISO();
  const notasConEstado = notas.map((nota) => ({
    ...nota,
    fechaLimite: nota.fechaLimite ?? null,
    vencida: Boolean(nota.fechaLimite) && nota.fechaLimite < hoy,
  }));
  res.json(notasConEstado);
});

router.post("/", (req, res) => {
  const { titulo, cuerpo, fechaLimite } = req.body || {};

  if (typeof titulo !== "string" || !titulo.trim() || typeof cuerpo !== "string" || !cuerpo.trim()) {
    return res.status(400).json({ error: "titulo y cuerpo son requeridos y no pueden estar vacios" });
  }

  let fechaLimiteValidada = null;
  if (fechaLimite !== undefined && fechaLimite !== null && fechaLimite !== "") {
    if (typeof fechaLimite !== "string" || !esFechaValida(fechaLimite)) {
      return res.status(400).json({ error: "fechaLimite debe tener formato YYYY-MM-DD" });
    }
    if (fechaLimite < hoyISO()) {
      return res.status(400).json({ error: "fechaLimite no puede ser una fecha pasada" });
    }
    fechaLimiteValidada = fechaLimite;
  }

  const nuevaNota = {
    id: uuidv4(),
    titulo: titulo.trim(),
    cuerpo: cuerpo.trim(),
    fechaCreacion: new Date().toISOString(),
    fechaLimite: fechaLimiteValidada,
  };

  crearNota(nuevaNota);

  res.status(201).json(nuevaNota);
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const existia = eliminarNota(id);

  if (!existia) {
    return res.status(404).json({ error: `no existe una nota con id ${id}` });
  }

  res.status(204).send();
});

module.exports = router;
