"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Home() {
  const [notas, setNotas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);
  const hoy = new Date().toISOString().slice(0, 10);

  async function obtenerNotas() {
    const res = await fetch(`${API_URL}/api/notas`);
    if (!res.ok) throw new Error("No se pudieron cargar las notas");
    return res.json();
  }

  async function cargarNotas() {
    try {
      const data = await obtenerNotas();
      setNotas(data);
      setError(null);
    } catch (err) {
      setError("No se pudo conectar con el backend. ¿Está corriendo en " + API_URL + "?");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let cancelado = false;

    obtenerNotas()
      .then((data) => {
        if (cancelado) return;
        setNotas(data);
        setError(null);
      })
      .catch(() => {
        if (cancelado) return;
        setError("No se pudo conectar con el backend. ¿Está corriendo en " + API_URL + "?");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  async function handleCrear(e) {
    e.preventDefault();
    setError(null);

    if (!titulo.trim() || !cuerpo.trim()) {
      setError("Título y cuerpo son requeridos.");
      return;
    }

    try {
      const body = { titulo, cuerpo };
      if (fechaLimite) body.fechaLimite = fechaLimite;

      const res = await fetch(`${API_URL}/api/notas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo crear la nota");
      }

      setTitulo("");
      setCuerpo("");
      setFechaLimite("");
      await cargarNotas();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEliminar(id) {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/notas/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo eliminar la nota");
      }
      setNotas((prev) => prev.filter((nota) => nota.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Mis notas</h1>

        <form onSubmit={handleCrear} className={styles.form}>
          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <textarea
            placeholder="Cuerpo"
            value={cuerpo}
            onChange={(e) => setCuerpo(e.target.value)}
            rows={4}
          />
          <label htmlFor="fechaLimite">Fecha límite (opcional)</label>
          <input
            id="fechaLimite"
            type="date"
            min={hoy}
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
          />
          <button type="submit">Crear nota</button>
        </form>

        {error && <p className={styles.error}>{error}</p>}

        {cargando ? (
          <p>Cargando notas...</p>
        ) : notas.length === 0 ? (
          <p>No hay notas todavía.</p>
        ) : (
          <ul className={styles.listaNotas}>
            {notas.map((nota) => (
              <li
                key={nota.id}
                className={`${styles.nota} ${nota.vencida ? styles.notaVencida : ""}`}
              >
                <div>
                  <h2>
                    {nota.titulo}
                    {nota.vencida && <span className={styles.etiquetaVencida}>Vencida</span>}
                  </h2>
                  <p>{nota.cuerpo}</p>
                  <small>{new Date(nota.fechaCreacion).toLocaleString()}</small>
                  {nota.fechaLimite && (
                    <small className={styles.fechaLimite}> · Vence: {nota.fechaLimite}</small>
                  )}
                </div>
                <button onClick={() => handleEliminar(nota.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
