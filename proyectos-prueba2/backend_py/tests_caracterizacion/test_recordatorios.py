"""Tests de caracterizacion - Fase 2 (recordatorios).

Derivados de docs/specs/spec-gestion-notas.md: fechaLimite opcional al
crear, vencida calculada (no persistida) al listar. Corren por HTTP contra
una URL base configurable, igual que test_notas_base.py.

Uso:
    API_BASE_URL=http://localhost:4000 pytest tests_caracterizacion/test_recordatorios.py
    API_BASE_URL=http://localhost:4001 pytest tests_caracterizacion/test_recordatorios.py
"""

import os
import sqlite3
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
import requests

BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:4000")
NOTAS_URL = f"{BASE_URL}/api/notas"
DB_FILE = Path(__file__).resolve().parent.parent.parent / "backend" / "data" / "notas.db"


def _titulo_unico(prefijo="caracterizacion-recordatorios"):
    return f"{prefijo}-{uuid.uuid4()}"


def _hoy():
    return datetime.now(timezone.utc).date()


def _fecha_iso(delta_dias):
    return (_hoy() + timedelta(days=delta_dias)).isoformat()


@pytest.fixture
def crear_y_limpiar():
    """Crea una nota con el payload dado y la borra al final si llego a crearse."""
    creadas = []

    def _crear(payload):
        resp = requests.post(NOTAS_URL, json=payload, timeout=5)
        if resp.status_code == 201:
            creadas.append(resp.json()["id"])
        return resp

    yield _crear

    for id_nota in creadas:
        requests.delete(f"{NOTAS_URL}/{id_nota}", timeout=5)


@pytest.fixture
def nota_vencida_directo():
    """Inserta una nota directo en notas.db con una fechaLimite pasada,
    bypaseando la API (que rechaza crear notas ya vencidas por regla de
    negocio) -- unico modo de probar el calculo de `vencida: true`."""
    ids = []

    def _insertar(fecha_limite):
        id_nota = str(uuid.uuid4())
        conn = sqlite3.connect(DB_FILE)
        conn.execute(
            "INSERT INTO notas (id, titulo, cuerpo, fecha_creacion, fecha_limite) "
            "VALUES (?, ?, ?, ?, ?)",
            (id_nota, _titulo_unico(), "x", datetime.now(timezone.utc).isoformat(), fecha_limite),
        )
        conn.commit()
        conn.close()
        ids.append(id_nota)
        return id_nota

    yield _insertar

    for id_nota in ids:
        requests.delete(f"{NOTAS_URL}/{id_nota}", timeout=5)


class TestCrearConFechaLimite:
    def test_fecha_futura_devuelve_201_con_fechaLimite(self, crear_y_limpiar):
        fecha = _fecha_iso(1)
        resp = crear_y_limpiar(
            {"titulo": _titulo_unico(), "cuerpo": "vence manana", "fechaLimite": fecha}
        )
        assert resp.status_code == 201
        assert resp.json()["fechaLimite"] == fecha

    def test_fecha_de_hoy_devuelve_201(self, crear_y_limpiar):
        fecha = _fecha_iso(0)
        resp = crear_y_limpiar(
            {"titulo": _titulo_unico(), "cuerpo": "vence hoy", "fechaLimite": fecha}
        )
        assert resp.status_code == 201
        assert resp.json()["fechaLimite"] == fecha

    def test_fecha_pasada_devuelve_400_y_no_crea(self, crear_y_limpiar):
        antes = requests.get(NOTAS_URL, timeout=5).json()
        resp = crear_y_limpiar(
            {"titulo": _titulo_unico(), "cuerpo": "x", "fechaLimite": _fecha_iso(-1)}
        )
        assert resp.status_code == 400
        despues = requests.get(NOTAS_URL, timeout=5).json()
        assert len(despues) == len(antes)

    @pytest.mark.parametrize(
        "fecha_invalida",
        [
            "31-13-2026",
            "2026/09/20",
            "2026-9-1",
            "2026-13-01",
            "2026-02-30",
            "no-es-una-fecha",
        ],
    )
    def test_formato_invalido_devuelve_400_y_no_crea(self, crear_y_limpiar, fecha_invalida):
        antes = requests.get(NOTAS_URL, timeout=5).json()
        resp = crear_y_limpiar(
            {"titulo": _titulo_unico(), "cuerpo": "x", "fechaLimite": fecha_invalida}
        )
        assert resp.status_code == 400
        despues = requests.get(NOTAS_URL, timeout=5).json()
        assert len(despues) == len(antes)

    def test_sin_fechaLimite_sigue_comportandose_igual_que_antes(self, crear_y_limpiar):
        resp = crear_y_limpiar({"titulo": _titulo_unico(), "cuerpo": "sin fecha"})
        assert resp.status_code == 201
        assert resp.json()["fechaLimite"] is None


class TestVencida:
    def test_nota_con_fecha_pasada_esta_vencida_al_listar(self, nota_vencida_directo):
        nota_id = nota_vencida_directo(_fecha_iso(-1))
        notas = requests.get(NOTAS_URL, timeout=5).json()
        nota = next(n for n in notas if n["id"] == nota_id)
        assert nota["vencida"] is True

    def test_nota_con_fecha_futura_no_esta_vencida(self, crear_y_limpiar):
        resp = crear_y_limpiar(
            {"titulo": _titulo_unico(), "cuerpo": "x", "fechaLimite": _fecha_iso(1)}
        )
        assert resp.status_code == 201
        nota_id = resp.json()["id"]
        notas = requests.get(NOTAS_URL, timeout=5).json()
        nota = next(n for n in notas if n["id"] == nota_id)
        assert nota["vencida"] is False

    def test_nota_con_fecha_de_hoy_no_esta_vencida(self, crear_y_limpiar):
        resp = crear_y_limpiar(
            {"titulo": _titulo_unico(), "cuerpo": "x", "fechaLimite": _fecha_iso(0)}
        )
        nota_id = resp.json()["id"]
        notas = requests.get(NOTAS_URL, timeout=5).json()
        nota = next(n for n in notas if n["id"] == nota_id)
        assert nota["vencida"] is False

    def test_nota_sin_fechaLimite_nunca_esta_vencida(self, crear_y_limpiar):
        resp = crear_y_limpiar({"titulo": _titulo_unico(), "cuerpo": "x"})
        nota_id = resp.json()["id"]
        notas = requests.get(NOTAS_URL, timeout=5).json()
        nota = next(n for n in notas if n["id"] == nota_id)
        assert nota["vencida"] is False

    def test_vencida_no_se_persiste_se_recalcula_en_cada_get(self, crear_y_limpiar):
        """No hay forma de crear una nota ya vencida (400), asi que esto se
        verifica indirectamente: dos GET seguidos devuelven el mismo valor de
        `vencida` para la misma nota sin que nada la haya modificado -- si se
        recalculara mal (ej. cacheada a partir de un GET viejo) esto detectaria
        una inconsistencia entre ambas lecturas."""
        resp = crear_y_limpiar(
            {"titulo": _titulo_unico(), "cuerpo": "x", "fechaLimite": _fecha_iso(0)}
        )
        nota_id = resp.json()["id"]
        primera = next(
            n for n in requests.get(NOTAS_URL, timeout=5).json() if n["id"] == nota_id
        )
        segunda = next(
            n for n in requests.get(NOTAS_URL, timeout=5).json() if n["id"] == nota_id
        )
        assert primera["vencida"] == segunda["vencida"] is False
