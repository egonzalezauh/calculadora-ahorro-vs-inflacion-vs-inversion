import os
import urllib.request
import json
from pydantic import BaseModel, Field, EmailStr, field_validator
from email_validator import validate_email, EmailNotValidError
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Calculadora Fondo de Emergencia vs. Inflación")

_supabase_client = None

def get_supabase_client():
    global _supabase_client
    if _supabase_client is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        if url and key:
            _supabase_client = create_client(url, key)
    return _supabase_client

class Lead(BaseModel):
    name: str = Field(..., min_length=1)
    email: str

    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('El nombre no puede estar en blanco')
        return v.strip()

    @field_validator('email')
    @classmethod
    def validate_email_real(cls, v):
        try:
            # check_deliverability=True verifies that the domain actually exists and accepts emails
            email_info = validate_email(v, check_deliverability=True)
            return email_info.normalized
        except EmailNotValidError as e:
            raise ValueError(str(e))

# Serve static files (script.js, etc.)
BASE_DIR = Path(__file__).parent
app.mount("/static", StaticFiles(directory=BASE_DIR), name="static")


@app.get("/api/data")
def get_country_data():
    """
    Returns economic data (inflation & safe interest rate) per country.
    Sources: BCE (Ecuador) and Banxico / INEGI (Mexico).
    Averages based on 2022-2024 data.
    """
    return {
        "countries": [
            {
                "id": "EC",
                "name": "Ecuador 🇪🇨",
                "currency": "USD",
                "currency_symbol": "$",
                "inflation_rate": 0.020,   # 2.0% - Avg. 2022-2024 (BCE / INEGI)
                "safe_rate": 0.060,        # 6.0% - Bancos / Depósito a Plazo Fijo
                "safe_instrument": "Depósito a Plazo Fijo (Bancos)",
                "inflation_source": "BCE – promedio 2022-2024",
            },
            {
                "id": "MX",
                "name": "México 🇲🇽",
                "currency": "MXN",
                "currency_symbol": "$",
                "inflation_rate": 0.055,   # 5.5% - Avg. 2022-2024 (INEGI)
                "safe_rate": 0.105,        # 10.5% - CETES a 1 año
                "safe_instrument": "CETES a 1 año",
                "inflation_source": "INEGI – promedio 2022-2024",
            },
        ]
    }


@app.post("/api/lead-capture")
def capture_lead(data: Lead, request: Request):
    """
    Captures user contact information (Name and Email) as a lead for future marketing campaigns.
    """
    # 1. Obtener la IP real del cliente
    client_ip = request.client.host
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
        
    # 2. Detectar país usando ip-api.com
    country = "Desconocido"
    if client_ip and client_ip not in ("127.0.0.1", "localhost", "::1"):
        try:
            url = f"http://ip-api.com/json/{client_ip}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=3) as response:
                ip_data = json.loads(response.read().decode())
                if ip_data.get("status") == "success":
                    country = ip_data.get("country", "Desconocido")
        except Exception:
            pass

    # 3. Guardar en Supabase
    supabase = get_supabase_client()
    if supabase:
        try:
            supabase.table("leads").insert({"nombre": data.name, "email": data.email, "pais": country}).execute()
            print(f"[SUCCESS] NUEVO LEAD CAPTURADO Y GUARDADO EN SUPABASE: Nombre={data.name}, Email={data.email}, País={country}")
        except Exception as e:
            print(f"[ERROR] Error al guardar en Supabase: {e}")
            raise HTTPException(status_code=500, detail="Error al procesar el registro.")
    else:
        # --- SIMULACIÓN DE BASE DE DATOS/CRM ---
        print(f"[INFO] NUEVO LEAD CAPTURADO (Sin conexión a BD): Nombre={data.name}, Email={data.email}, País={country}")
        
    return {"status": "success", "message": "Gracias por tu interés. Tu información ha sido registrada con éxito."}

@app.get("/")
def serve_index():
    return FileResponse(BASE_DIR / "index.html")
