import requests
import pytest

BASE_URL = "http://localhost:3000"

def test_crear_pedido_exitoso():
    # Payload válido
    payload = {
        "cliente": "Juan Perez",
        "producto": "Laptop X",
        "cantidad": 2
    }
    
    response = requests.post(f"{BASE_URL}/pedidos", json=payload)
    
    assert response.status_code == 201, f"Expected status 201, got {response.status_code}"
    
    data = response.json()
    assert "id" in data, "Respuesta debe contener el id generado"
    assert data["estado"] == "Pendiente", "El estado inicial siempre debe ser 'Pendiente'"
    assert data["mensaje"] == "Pedido creado exitosamente"

def test_crear_pedido_faltan_campos():
    # Payload inválido: falta cantidad
    payload = {
        "cliente": "Maria Gomez",
        "producto": "Mouse"
    }
    
    response = requests.post(f"{BASE_URL}/pedidos", json=payload)
    
    assert response.status_code == 400, f"Expected status 400, got {response.status_code}"
    
    data = response.json()
    assert "error" in data, "La respuesta debe contener un campo de error"
    assert "Faltan campos obligatorios" in data["error"]
