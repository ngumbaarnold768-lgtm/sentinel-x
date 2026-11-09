from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io, csv
from ..core.auth import get_db, get_current_user
from ..db.models import SecurityAlert

router = APIRouter(prefix="/api/reports", tags=["Reporting"], dependencies=[Depends(get_current_user)])

@router.get("/export-alerts")
def export_alerts_csv(db: Session = Depends(get_db)):
    alerts = db.query(SecurityAlert).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Timestamp", "Alert Type", "Severity", "Source IP", "Description", "Status"])
    for a in alerts:
        writer.writerow([a.id, a.timestamp, a.alert_type, a.severity, a.source_ip, a.description, a.status])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=sentinel_x_incidents.csv"})