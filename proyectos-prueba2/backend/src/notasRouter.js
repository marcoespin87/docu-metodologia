const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { leerNotas, guardarNotas } = require("./notasStore");

const router = express.Router();

router.get("/", (req, res) => {
  const notas = leerNotas();
  res.json(notas);
});

router.post("/", (req, res) => {
  const { titulo, cuerpo } = req.body || {};

  if (typeof titulo !== "string" || !titulo.trim() || typeof cuerpo !== "string" || !cuerpo.trim()) {
    return res.status(400).json({ error: "titulo y cuerpo son requeridos y no pueden estar vacios" });
  }

  const notas = leerNotas();
  const nuevaNota = {
    id: uuidv4(),
    titulo: titulo.trim(),
    cuerpo: cuerpo.trim(),
    fechaCreacion: new Date().toISOString(),
  };

  notas.push(nuevaNota);
  guardarNotas(notas);

  res.status(201).json(nuevaNota);
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const notas = leerNotas();
  const existe = notas.some((nota) => nota.id === id);

  if (!existe) {
    return res.status(404).json({ error: `no existe una nota con id ${id}` });
  }

  const notasRestantes = notas.filter((nota) => nota.id !== id);
  guardarNotas(notasRestantes);

  res.status(204).send();
});

module.exports = router;
