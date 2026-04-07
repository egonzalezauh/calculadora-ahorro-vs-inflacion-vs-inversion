
  # 💸 Fondo de Emergencia vs. Inflación
  
  **Descubre la cruda realidad de tener tu dinero parado vs. ponerlo a trabajar.**
  
  Una simulación financiera interactiva que proyecta cómo la inflación erosiona tu poder adquisitivo y cómo el interés compuesto de instrumentos seguros te protege a lo largo de **50 años**.

  <p align="center">
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js" />
  </p>
</div>

---

## 📸 Un Vistazo a la App

<div align="center">
  <img src="Vista%20App%201.png" alt="Vista App 1" width="85%">
  <br><br>
  <img src="Vista%20App%202.png" alt="Vista App 2" width="85%">
</div>
---

## 🎯 ¿Por qué nació este proyecto?
Mucha gente ahorra dejando su dinero en una cuenta base o literal "bajo el colchón", pensando que están a salvo de riesgos. Sin embargo, ignoran un riesgo invisible pero constante: la **inflación**.

Esta Single Page Application (SPA), patrocinada sutilmente por la marca "Mente Rica", busca concientizar a los usuarios mediante comparaciones de **datos macroeconómicos reales (2022-2024)** para Ecuador (USD) y México (MXN), contrastando escenarios de dejar tu dinero quieto vs. una inversión de renta fija segura.

## ✨ Características Principales

*   **⚡ Arquitectura Rápida**: Un backend súper liviano impulsado por **FastAPI** (Python) que sirve directamente la lógica de la UI y provee a través de una API el JSON con las tasas de países.
*   **📈 Gráficos Interactivos**: Integración con **Chart.js** para renderizar proyecciones precisas, reajustando dinámicamente el tamaño de los puntos de las 3 curvas a lo largo de 50 años.
*   **🎯 Control Total del Usuario**: Capacidad de seleccionar países para usar tasas bancarias predeterminadas, o ignorarlas e introducir **tasas de rendimiento anualizadas completamente personalizadas**.
*   **💎 UI / UX Pulcra**: Transición de estilo a un ambiente *Vintage Estético* e interactivo. Animaciones suavizadas para simular productos financieros *premium* sin temblores en la pantalla (*zero layout shifting*).
*   **📱 Mobile-First**: Layout adaptivo construido desde cero para soportar todo tipo de pantallas, incluso calculando el interés compuesto de **cantidades exorbitantes** gracias al reformateo inteligente de números.

## 🛠️ Cómo Inicializar el Proyecto Localmente

Si quieres correr esta herramienta en tu propio equipo, es sumamente fácil.

**1. Clona el repositorio:**
```bash
git clone https://github.com/TU_USUARIO/calculadora-fondo-emergencia.git
cd calculadora-fondo-emergencia
```

**2. Crea un entorno virtual e instala las dependencias:**
```bash
# Crear entorno
python -m venv venv

# Activar en Windows
.\venv\Scripts\activate

# Instalar dependencias 
pip install -r requirements.txt
```

**3. Levanta el servidor uvicorn:**
```bash
uvicorn main:app --reload --port 8000
```
**Listo!** 🚀 Dirígete a tu navegador en `http://127.0.0.1:8000`.

---
💡 *Toda gran inversión comienza con el conocimiento. "Las matemáticas no mienten, la inflación tampoco".*
