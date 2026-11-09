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

💥 Step 2: Run the Attacks (Terminal 4)
bash
cd sentinel-x/traffic-simulator

# Test 1: ICMP Flood (Layer 3)
sudo python3 attack_lab.py icmp

# Test 2: SYN Flood (Layer 4)
sudo python3 attack_lab.py syn

# Test 3: UDP Flood (Layer 4)
sudo python3 attack_lab.py udp

# Test 4: HTTP Flood (Layer 7)
python3 attack_lab.py http

# Test 5: Slowloris (Layer 7)
python3 attack_lab.py slowloris
🔍 Step 3: Verifying the Mitigation
Trigger the SYN Flood (sudo python3 attack_lab.py syn).

Watch Terminal 1 (Backend). You should see:

text
[ALERT] HIGH: SYN_FLOOD - Detected SYN_FLOOD with X PPS. Top IP: 127.0.0.1
[MOCK FIREWALL] Simulated: iptables -A SENTINEL_X -s 127.0.0.1 -j DROP
Go to the Mitigation Center on your dashboard. You will see the active block rule.

Wait 60 seconds. Check Terminal 1 again:

text
[MOCK FIREWALL] Simulated: iptables -D SENTINEL_X -s 127.0.0.1 -j DROP
The rule is automatically removed. The mitigation worked!

🛠️ Troubleshooting
Error: Scapy Permission Error -> Run the script with sudo.

Error: iptables
: command not found
 -> Run sudo apt install iptables -y.

Error: Cannot connect to 127.0.0.1:8080 -> Ensure Terminal 3 is running the nc -lk 8080 & command.

Dashboard is not updating -> Change 127.0.0.1 in frontend/src/services/api.js to your VM's IP address.

text
**Save and exit:** Press `Ctrl + O`, hit `Enter`, then `Ctrl + X`.

---

### 🎉 Step 5: Push Everything to GitHub

Now that you have the complete structure, you can push it to your repository.

```bash
# From the sentinel-x root folder
git add .
git commit -m "Added traffic simulator, attack lab scripts, and comprehensive lab guide"
git push origin main
🚀 Quick Test Run
To make sure everything works before you push, run this:

Terminal 3 (Victim):

bash
nc -lk 8080 &
nc -lku 9090 &
Terminal 4 (Attacker):

bash
cd sentinel-x/traffic-simulator
sudo python3 attack_lab.py syn
Check Terminal 1 (Backend): You should see the [ALERT] HIGH: SYN_FLOOD message, confirming the engine caught the attack.
