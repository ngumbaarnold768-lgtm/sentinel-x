# Sentinel-X

## Project layout

- `backend/app/` contains the FastAPI application and its API, detection,
  database, core, and mitigation modules.
- `backend/simulator.py` contains the traffic simulator.
- `backend/requirements.txt` lists the Python dependencies.
- `frontend/` contains the web dashboard.

## Run the backend

From the repository root, install the backend dependencies and start the API:

```powershell
python -m pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload
```
