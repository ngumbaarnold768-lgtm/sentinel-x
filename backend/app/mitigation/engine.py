import threading
import time
from datetime import datetime, timedelta
import logging
import platform
from ..db.database import SessionLocal
from ..db.models import MitigationAction, SecurityAlert
from .firewall import FirewallAdapter, MockFirewall

logger = logging.getLogger("sentinel_x.mitigation")

class MitigationEngine:
    def __init__(self, dry_run=False): # Set to True for safe testing
        self.allowlist = ["127.0.0.1", "::1", "192.168.1.100"] 
        self.default_block_duration = 60 # 1 minute for testing
        self.dry_run = dry_run
        self.firewall = FirewallAdapter(dry_run) if platform.system() == "Linux" else MockFirewall(dry_run)
        self.running = False

    def process_alert(self, alert_id: int, target_ip: str, severity: str):
        if target_ip in self.allowlist:
            self._update_alert_status(alert_id, "FALSE_POSITIVE")
            return False
        if severity not in ["HIGH", "CRITICAL"]:
            self._update_alert_status(alert_id, "MONITORING")
            return False

        success = self.firewall.block_ip(target_ip, reason=f"Alert_{alert_id}")
        if success:
            expires_at = datetime.utcnow() + timedelta(seconds=self.default_block_duration)
            self._log_mitigation_action(alert_id, target_ip, expires_at)
            self._update_alert_status(alert_id, "MITIGATED")
            return True
        return False

    def _log_mitigation_action(self, alert_id, target_ip, expires_at):
        db = SessionLocal()
        try:
            db.add(MitigationAction(alert_id=alert_id, action_type="BLOCK", target_ip=target_ip, expires_at=expires_at, dry_run=self.dry_run, is_active=True))
            db.commit()
        finally:
            db.close()

    def _update_alert_status(self, alert_id, status):
        db = SessionLocal()
        try:
            alert = db.query(SecurityAlert).filter(SecurityAlert.id == alert_id).first()
            if alert:
                alert.status = status
                db.commit()
        finally:
            db.close()

    def start_rollback_daemon(self):
        self.running = True
        threading.Thread(target=self._rollback_loop, daemon=True).start()

    def _rollback_loop(self):
        while self.running:
            time.sleep(10)
            db = SessionLocal()
            try:
                now = datetime.utcnow()
                expired = db.query(MitigationAction).filter(MitigationAction.is_active == True, MitigationAction.expires_at <= now).all()
                for action in expired:
                    self.firewall.unblock_ip(action.target_ip)
                    action.is_active = False
                    db.commit()
            finally:
                db.close()

    def emergency_rollback(self):
        self.firewall.flush_all_rules()
        db = SessionLocal()
        try:
            db.query(MitigationAction).filter(MitigationAction.is_active == True).update({"is_active": False})
            db.query(SecurityAlert).filter(SecurityAlert.status == "MITIGATED").update({"status": "RESOLVED"})
            db.commit()
        finally:
            db.close()

mitigation_engine = MitigationEngine(dry_run=False) # ⚠️ CHANGE TO TRUE IF TESTING WITHOUT SUDO