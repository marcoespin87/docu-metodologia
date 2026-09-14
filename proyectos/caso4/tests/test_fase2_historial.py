import requests
import pytest

BASE_URL = "http://localhost:3000"

@pytest.fixture(scope="module", autouse=True)
def setup_pedidos():
    # Creamos algunos pedidos para asegurar que hay datos para filtrar
    requests.post(f"{BASE_URL}/pedidos", json={"cliente": "A", "producto": "P1", "cantidad": 1})
    requests.post(f"{BASE_URL}/pedidos", json={"cliente": "B", "producto": "P2", "cantidad": 2})

def test_get_pedidos_sin_filtro():
    response = requests.get(f"{BASE_URL}/pedidos")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2

def test_get_pedidos_filtro_valido():
    response = requests.get(f"{BASE_URL}/pedidos?estado=Pendiente")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    for pedido in data:
        assert pedido["estado"] == "Pendiente"

def test_get_pedidos_multiples_filtros():
    # Por ahora todos los creados están Pendiente, pero validamos que el servidor acepte ambos
    response = requests.get(f"{BASE_URL}/pedidos?estado=Pendiente&estado=Enviado")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    for pedido in data:
        assert pedido["estado"] in ["Pendiente", "Enviado"]

def test_get_pedidos_filtro_invalido():
    response = requests.get(f"{BASE_URL}/pedidos?estado=Pendiente&estado=Fugado")
    assert response.status_code == 400
    
    data = response.json()
    assert "error" in data
    assert "Fugado" not in ["Pendiente", "Enviado", "Entregado", "Cancelado"]
