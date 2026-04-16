# Proyecto 1 IA 2026 — Clasificación automática de tickets (Naive Bayes + Flask)

Este repositorio implementa un **clasificador de tickets de soporte** usando un modelo **Naive Bayes Multinomial** entrenado previamente y guardado en `modelo_final.pkl`. Incluye una **aplicación web** (Flask) para ingresar el asunto y la descripción del ticket, y ver la **categoría predicha** junto con su **distribución de probabilidades**.

## Requisitos

- Python 3.10+ (recomendado)
- Dependencias Python: `flask`, `nltk`
- Archivo del modelo: `modelo_final.pkl` (incluido en el repositorio)

## Instalación

### Windows (PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install flask nltk
```

> Nota: la primera ejecución descarga automáticamente recursos de NLTK (por ejemplo `punkt`, `stopwords`, `wordnet`). Si tu ambiente no tiene internet, deberás descargarlos previamente.

## Ejecución

### 1) Levantar la aplicación web

```powershell
python app.py
```

Luego abre en tu navegador:

- `http://127.0.0.1:5000/`

### 2) Consumir el endpoint de predicción (opcional)

El backend expone un endpoint:

- `POST /api/predict`

Ejemplo con `curl`:

```bash
curl -X POST http://127.0.0.1:5000/api/predict -H "Content-Type: application/json" -d "{\"ticket_id\":\"123\",\"subject\":\"Login issue\",\"description\":\"I can't access my account\"}"
```

### 3) Probar el motor de inferencia desde consola (opcional)

```powershell
python motor_inferencia.py
```

## Estructura rápida del proyecto

- `app.py`: servidor Flask y rutas (`/` y `/api/predict`)
- `motor_inferencia.py`: limpieza de texto + carga del modelo + predicción
- `naive_bayes.py`: implementación del Naive Bayes Multinomial (custom)
- `templates/` y `static/`: UI web
- `modelo_final.pkl`: modelo entrenado serializado
- `Procesamiento.ipynb`: notebook de procesamiento/entrenamiento (si aplica)
