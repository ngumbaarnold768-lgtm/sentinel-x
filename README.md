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

## Run a safe local health check

With the backend running, open a second terminal at the repository root and run:

```powershell
python attack_lab.py --requests 5 --interval 2
```

The health-check script contacts only `http://127.0.0.1:8000/`. It makes at most
10 sequential requests per run, with at least one second between requests. A
successful check prints an HTTP status for each request; if the API is
unavailable, confirm that the backend is running.

This local check verifies API availability only; it does not simulate attacks
or verify firewall mitigation.
