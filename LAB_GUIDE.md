# Sentinel-X Local Health-Check Lab

This lab makes a small number of sequential health-check requests to the Sentinel-X API on `127.0.0.1`. It does not generate floods, open concurrent connections, or send traffic to other hosts.

## 1. Start the backend

From the repository root, install the backend dependencies if needed and start the API:

```powershell
python -m pip install -r backend/requirements.txt
cd backend
uvicorn app.main:app --reload
```

The API listens on `http://127.0.0.1:8000`.

## 2. Run the local health check

Open another terminal at the repository root. One check is run by default:

```powershell
python attack_lab.py
```

To run a few sequential checks, specify a count and a delay of at least one second:

```powershell
python attack_lab.py --requests 5 --interval 2
```

The script is restricted to the local Sentinel-X API, allows at most 10 checks per run, and never sends requests faster than one per second. It needs no elevated privileges. If the API is unavailable, start the backend and try again.
