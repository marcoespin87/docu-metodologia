# Documento de arquitectura y convenciones — Sistema de Pedidos (caso4)

## Regla obligatoria para cualquier asistente de IA

**3.1 Specs primero.** Antes de proponer o construir cualquier cambio, leer
el spec de la capacidad afectada en `docs/specs/` (ver
`docs/specs/README.md` para el índice). El spec manda sobre este
documento, y este documento manda sobre memoria de sesión o apuntes
sueltos.

## Patrón arquitectónico

Librería Python en memoria, sin framework HTTP (mismo patrón que la
versión Node.js que reemplaza). Cada capacidad vive en su propio módulo
bajo `src/`:

- `src/pedidos.py` — capacidad "pedidos": creación y cambio de estado.
- `src/historial.py` — capacidad "historial": listado y filtrado por
  estado (resuelto en el servidor).

Ambos módulos comparten el mismo almacén en memoria (`src/store.py`), que
no es una capacidad en sí misma.

`legacy-node/` contiene la implementación Node.js **archivada** (de
caso3): es solo referencia histórica, no se ejecuta ni se mantiene.

## Stack

- Python 3 (stdlib únicamente: `unittest`). Sin dependencias externas.
- Decisión de migración: 2026-09-10, de Node.js a Python (ver
  `docs/plan-migracion-python-2026-09-10.md` y las Decisiones fechadas en
  cada spec).

## Comandos

```bash
python -m unittest discover -s tests -v   # suite de tests
python -m src.cli                         # CLI manual de humo
```

## Invariantes transversales

- **Sin persistencia real:** el almacén es una lista en memoria por
  proceso. Por qué: ejercicio de metodología, no sistema en producción.
- **Sin dependencias externas.** Por qué: mantener el ejercicio
  reproducible sin `pip install` ni acceso a red.
