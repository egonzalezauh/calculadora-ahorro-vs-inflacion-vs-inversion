from pydantic import BaseModel
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi import FastAPI

app = FastAPI(title="Calculadora Fondo de Emergencia vs. Inflación")
# Define el modelo de datos para la captura de leads
class Lead(BaseModel):
    name: str
    email: str

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
def capture_lead(data: Lead):
    """
    Captures user contact information (Name and Email) as a lead for future marketing campaigns.
    In a production environment, this would save data to a CRM or database.
    """
    # --- SIMULACIÓN DE BASE DE DATOS/CRM ---
    print(f"⚡️ NUEVO LEAD CAPTURADO: Nombre={data.name}, Email={data.email}")
    return {"status": "success", "message": "Gracias por tu interés. Tu información ha sido registrada con éxito."}

@app.get("/")
def serve_index():
    return FileResponse(BASE_DIR / "index.html")
