"""Tests de caracterizacion - Fase 1 (notas base).

Derivados de docs/specs/spec-gestion-notas.md, seccion Comportamiento:
crear, listar y eliminar notas (sin fechaLimite/vencida, que se cubren en
la Fase 2). Corren por HTTP contra una URL base configurable, para poder
usarse tanto contra el backend Node (baseline) como contra backend_py.

Uso:
    API_BASE_URL=http://localhost:4000 pytest tests_caracterizacion/test_notas_base.py
    API_BASE_URL=http://localhost:4001 pytest tests_caracterizacion/test_notas_base.py
"""

import os
import uuid

import pytest
import requests

BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:4000")
NOTAS_URL = f"{BASE_URL}/api/notas"
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")


def _titulo_unico(prefijo="caracterizacion"):
    return f"{prefijo}-{uuid.uuid4()}"


@pytest.fixture
def nota_creada():
    """Crea una nota de prueba y la borra al final, sin importar el resultado del test."""
    payload = {"titulo": _titulo_unico(), "cuerpo": "cuerpo de prueba"}
    resp = requests.post(NOTAS_URL, json=payload, timeout=5)
    assert resp.status_code == 201
    nota = resp.json()
    yield nota
    requests.delete(f"{NOTAS_URL}/{nota['id']}", timeout=5)


class TestCrearNota:
    def test_post_valido_devuelve_201_con_la_nota_creada(self):
        payload = {"titulo": _titulo_unico(), "cuerpo": "una nota de prueba"}
        resp = requests.post(NOTAS_URL, json=payload, timeout=5)
        try:
            assert resp.status_code == 201
            nota = resp.json()
            assert nota["titulo"] == payload["titulo"]
            assert nota["cuerpo"] == payload["cuerpo"]
            assert "id" in nota and nota["id"]
            assert "fechaCreacion" in nota and nota["fechaCreacion"]
        finally:
            if resp.status_code == 201:
                requests.delete(f"{NOTAS_URL}/{resp.json()['id']}", timeout=5)

    def test_post_sin_titulo_devuelve_400_y_no_crea(self):
        antes = requests.get(NOTAS_URL, timeout=5).json()
        resp = requests.post(NOTAS_URL, json={"cuerpo": "solo cuerpo"}, timeout=5)
        assert resp.status_code == 400
        despues = requests.get(NOTAS_URL, timeout=5).json()
        assert len(despues) == len(antes)

    def test_post_sin_cuerpo_devuelve_400_y_no_crea(self):
        antes = requests.get(NOTAS_URL, timeout=5).json()
        resp = requests.post(NOTAS_URL, json={"titulo": "solo titulo"}, timeout=5)
        assert resp.status_code == 400
        despues = requests.get(NOTAS_URL, timeout=5).json()
        assert len(despues) == len(antes)

    def test_post_con_titulo_vacio_devuelve_400_y_no_crea(self):
        antes = requests.get(NOTAS_URL, timeout=5).json()
        resp = requests.post(
            NOTAS_URL, json={"titulo": "   ", "cuerpo": "cuerpo valido"}, timeout=5
        )
        assert resp.status_code == 400
        despues = requests.get(NOTAS_URL, timeout=5).json()
        assert len(despues) == len(antes)

    def test_post_con_cuerpo_vacio_devuelve_400_y_no_crea(self):
        antes = requests.get(NOTAS_URL, timeout=5).json()
        resp = requests.post(
            NOTAS_URL, json={"titulo": "titulo valido", "cuerpo": ""}, timeout=5
        )
        assert resp.status_code == 400
        despues = requests.get(NOTAS_URL, timeout=5).json()
        assert len(despues) == len(antes)


class TestListarNotas:
    def test_get_devuelve_un_array(self):
        resp = requests.get(NOTAS_URL, timeout=5)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_incluye_la_nota_recien_creada(self, nota_creada):
        resp = requests.get(NOTAS_URL, timeout=5)
        ids = [n["id"] for n in resp.json()]
        assert nota_creada["id"] in ids


class TestEliminarNota:
    def test_delete_existente_devuelve_204_y_deja_de_listarse(self, nota_creada):
        resp = requests.delete(f"{NOTAS_URL}/{nota_creada['id']}", timeout=5)
        assert resp.status_code == 204

        ids = [n["id"] for n in requests.get(NOTAS_URL, timeout=5).json()]
        assert nota_creada["id"] not in ids

    def test_delete_inexistente_devuelve_404_con_mensaje(self):
        id_inexistente = str(uuid.uuid4())
        resp = requests.delete(f"{NOTAS_URL}/{id_inexistente}", timeout=5)
        assert resp.status_code == 404
        assert resp.json() == {"error": f"no existe una nota con id {id_inexistente}"}


class TestCors:
    def test_origen_permitido_recibe_access_control_allow_origin(self):
        resp = requests.get(
            NOTAS_URL, headers={"Origin": FRONTEND_ORIGIN}, timeout=5
        )
        assert resp.headers.get("Access-Control-Allow-Origin") == FRONTEND_ORIGIN

    def test_nunca_permite_cualquier_origen(self):
        resp = requests.get(
            NOTAS_URL, headers={"Origin": "http://evil.example.com"}, timeout=5
        )
        assert resp.headers.get("Access-Control-Allow-Origin") != "*"
