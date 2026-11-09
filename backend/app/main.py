from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from .db.database import engine, SessionLocal
from .db.models import Base, User, SecurityAlert
from .core.auth import get_password_hash, get_current_user
from .api.ws_manager import manager
from .detection.engine import DetectionEngine
from .mitigation.engine import mitigation_engine
from .api.auth import router as auth_router
from .api.mitigation import router as mitigation_router
from .api.reports import router as reports_router
import platform

Base.metadata.create_all(bind=engine)
app = FastAPI(title="SENTINEL-X API")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Auto-detect interface. On Windows, None works best with Npcap.
INTERFACE = "lo" if platform.system() == "Linux" else None
detector = DetectionEngine(interface=INTERFACE)

app.include_router(auth_router)
app.include_router(mitigation_router)
app.include_router(reports_router)

@app.on_event("startup")
def startup_event():
    detector.start()
    mitigation_engine.start_rollback_daemon()
    db = SessionLocal()
    if not db.query(User).filter(User.username == "admin").first():
        db.add(User(username="admin", hashed_password=get_password_hash("sentinel123")))
        db.commit()
    db.close()

@app.on_event("shutdown")
def shutdown_event():
    detector.stop()
    mitigation_engine.stop()

@app.websocket("/ws/metrics")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True: await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/alerts", dependencies=[Depends(get_current_user)])
def get_alerts():
    db = SessionLocal()
    alerts = db.query(SecurityAlert).order_by(SecurityAlert.id.desc()).limit(50).all()
    db.close()
    return alerts

@app.get("/")
def read_root():
    return {"status": "SENTINEL-X Backend is Operational"}