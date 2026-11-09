from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ..mitigation.engine import mitigation_engine
from ..core.auth import get_current_user

router = APIRouter(prefix="/api/mitigation", tags=["Mitigation"], dependencies=[Depends(get_current_user)])

class ManualBlockRequest(BaseModel):
    ip_address: str
    duration: int = 300

@router.post("/emergency-rollback")
def trigger_rollback():
    mitigation_engine.emergency_rollback()
    return {"status": "success", "message": "All temporary blocks removed."}

@router.post("/manual-block")
def manual_block(request: ManualBlockRequest):
    if request.ip_address in mitigation_engine.allowlist:
        raise HTTPException(status_code=403, detail="IP is in the allowlist.")
    if mitigation_engine.firewall.block_ip(request.ip_address, reason="Manual_Admin_Block"):
        return {"status": "success", "message": f"Blocked {request.ip_address}"}
    raise HTTPException(status_code=500, detail="Failed to apply rule")