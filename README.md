<div align="center">
  <img src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/256/external-investment-accounting-flaticons-lineal-color-flat-icons.png" alt="Logo" width="120" />

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

*(Aquí puedes arrastrar y soltar una captura de pantalla de la app corriendo para que la gente vea cómo luce en tu repositorio).*

---

## 🎯 ¿Por qué nació este proyecto?
Mucha gente ahorra dejando su dinero en una cuenta base o literal "bajo el colchón", pensando que están a salvo de riesgos. Sin embargo, ignoran un riesgo invisible pero constante: la **inflación**.

Esta Single Page Application (SPA), patrocinada sutilmente por la marca "Mente Rica", busca concientizar a los usuarios mediante comparaciones de **datos macroeconómicos reales (2022-2024)** para Ecuador (USD) y México (MXN), contrastando escenarios de dejar tu dinero quieto vs. una inversión de renta fija segura.

## ✨ Características Principales

*   **⚡ Arquitectura Rápida**: Un backend súper liviano impulsado por **FastAPI** (Python) que sirve directamente la lógica de la UI y provee a través de una API el JSON con las tasas de países.
*   **📈 Gráficos Interactivos**: Integración con **Chart.js** para renderizar, en tiempo real, 3 curvas de crecimiento a lo largo de 50 años (Erosión por inflación, Inversión estática y Crecimiento con interés compuesto).
*   **💎 UI / UX Pulcra**: Diseño *Glassmorphism* y animaciones integradas mediante Tailwind CSS, asegurando que la calculadora luzca como un producto financiero de nivel *Premium*.
*   **📱 Mobile-First**: Layout adaptivo construido desde cero para soportar todo tipo de pantallas sin desbordarse, incluso al calcular el interés compuesto de **cantidades exhorbitantes** gracias al reformateo dinámico de números grandes.

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
