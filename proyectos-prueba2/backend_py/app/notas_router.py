"""Endpoints HTTP de la capacidad gestion-notas: GET/POST /, DELETE /{id}.

Fase 2 de la migracion (docs/plan-migracion-fastapi-2026-09-14.md): agrega
validacion de fechaLimite (formato + no puede ser pasada) al crear, y el
calculo de `vencida` (no persistido) al listar. La forma de los errores
replica a mano la de notasRouter.js ({"error": "..."}), sin dejar que
Pydantic dispare un 422 automatico con una forma distinta.
"""

import re
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from . import notas_store

router = APIRouter()

_FECHA_REGEX = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _error(status_code, mensaje):
    return JSONResponse(status_code=status_code, content={"error": mensaje})


def _ahora_iso_ms():
    """Replica el formato de `new Date().toISOString()` de JS: milisegundos (3 digitos), sufijo Z."""
    ahora = datetime.now(timezone.utc)
    return ahora.strftime("%Y-%m-%dT%H:%M:%S.") + f"{ahora.microsecond // 1000:03d}Z"


def _hoy_iso():
    """Fecha UTC del servidor, equivalente a `new Date().toISOString().slice(0, 10)`."""
    return datetime.now(timezone.utc).date().isoformat()


def _es_fecha_valida(fecha_str):
    if not _FECHA_REGEX.match(fecha_str):
        return False
    try:
        datetime.strptime(fecha_str, "%Y-%m-%d")
    except ValueError:
        return False
    return True


@router.get("")
async def listar_notas():
    hoy = _hoy_iso()
    notas = notas_store.listar_notas()
    for nota in notas:
        nota["vencida"] = bool(nota["fechaLimite"]) and nota["fechaLimite"] < hoy
    return notas


@router.post("")
async def crear_nota(request: Request):
    try:
        body = await request.json()
    except Exception:
        body = {}
    if not isinstance(body, dict):
        body = {}

    titulo = body.get("titulo")
    cuerpo = body.get("cuerpo")
    fecha_limite = body.get("fechaLimite")

    titulo_valido = isinstance(titulo, str) and titulo.strip()
    cuerpo_valido = isinstance(cuerpo, str) and cuerpo.strip()
    if not titulo_valido or not cuerpo_valido:
        return _error(400, "titulo y cuerpo son requeridos y no pueden estar vacios")

    fecha_limite_validada = None
    if fecha_limite is not None and fecha_limite != "":
        if not isinstance(fecha_limite, str) or not _es_fecha_valida(fecha_limite):
            return _error(400, "fechaLimite debe tener formato YYYY-MM-DD")
        if fecha_limite < _hoy_iso():
            return _error(400, "fechaLimite no puede ser una fecha pasada")
        fecha_limite_validada = fecha_limite

    nueva_nota = {
        "id": str(uuid.uuid4()),
        "titulo": titulo.strip(),
        "cuerpo": cuerpo.strip(),
        "fechaCreacion": _ahora_iso_ms(),
        "fechaLimite": fecha_limite_validada,
    }

    notas_store.crear_nota(nueva_nota)

    return JSONResponse(status_code=201, content=nueva_nota)


@router.delete("/{id_nota}")
async def eliminar_nota(id_nota: str):
    existia = notas_store.eliminar_nota(id_nota)
    if not existia:
        return _error(404, f"no existe una nota con id {id_nota}")
    return JSONResponse(status_code=204, content=None)
