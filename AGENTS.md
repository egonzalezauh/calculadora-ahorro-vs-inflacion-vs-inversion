## ⚡️ Opencode Guide: Fondo de Emergencia vs Inflación 💸

This repository implements an interactive Single Page Application (SPA) that simulates financial erosion due to inflation versus safe investment growth over time. The architecture is a full-stack Python/FastAPI backend serving a JavaScript frontend built with Chart.js and Tailwind CSS.

### 🚀 Initial Setup & Running the Project
The setup process requires creating a virtual environment and installing specific dependencies. Use these commands in sequence:

1.  **Create Virtual Environment:**
    ```bash
    python -m venv venv
    ```
2.  **Activate Environment (Windows):**
    ```powershell
    .\venv\Scripts\activate
    ```
3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Run Server:** Start the FastAPI application using Uvicorn.
    ```bash
    uvicorn main:app --reload --port 8000
    ```

### 🧩 Architecture and Execution Flow
*   **Backend Entrypoint:** The core logic resides in `main.py`. It uses `fastapi` to serve static assets (like the `script.js`) and handles API requests.
*   **API Endpoint:** All required economic data is retrieved from the `/api/data` endpoint. This endpoint provides structured rate data for specific countries (currently Ecuador and México).
    *   The response structure contains: `id`, `name`, `inflation_rate`, `safe_rate`, `safe_instrument`, etc.
*   **Frontend Logic:** The client-side JavaScript (`script.js`) must fetch data from `/api/data` on load before performing any calculations or rendering the charts.

### ⚙️ Technical Constraints & Quirks
*   **Dependencies:** Critical dependencies are explicitly managed via `requirements.txt`: `fastapi==0.115.12` and `uvicorn[standard]==0.34.0`. Ensure these versions are used if troubleshooting environment issues.
*   **Data Source Reliability:** The rate data (`inflation_rate`, `safe_rate`) is hardcoded in `main.py:16-40` using average historical data (2022-2024) for specific countries (EC/MX). Do not assume these rates are dynamically fetched or stored elsewhere; they must be updated directly within `main.py`.
*   **Calculation Logic:** The financial calculations follow the standard compound interest formula: $A = P(1 + r)^t$. This is used both for inflation erosion and safe investment projection.

### 🧪 Testing Guidance
Since this is a client-side simulation, unit/integration tests are complex. Focus on testing API contracts and core functions in `script.js`:
*   **API Contract Check:** Verify that `/api/data` returns the expected JSON structure with country IDs (e.g., "EC", "MX").
*   **Core Calculation Test:** Manually test the compound interest calculation logic (`seriesInvested` / `seriesInflation`) using known values to ensure accuracy against mathematical formulas.

(End of file)