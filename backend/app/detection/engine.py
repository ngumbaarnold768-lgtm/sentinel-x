import time
import threading
from collections import defaultdict
from scapy.all import sniff, IP, TCP, UDP, ICMP
from datetime import datetime
from ..db.database import SessionLocal
from ..db.models import SecurityAlert
from ..api.ws_manager import manager
from ..mitigation.engine import mitigation_engine
import asyncio

class DetectionEngine:
    def __init__(self, interface="lo"):
        self.interface = interface
        self.running = False
        self.metrics = defaultdict(int)
        self.source_ips = defaultdict(int)
        self.syn_count, self.icmp_count, self.udp_count = 0, 0, 0
        self.total_bytes = 0
        self.start_time = time.time()
        
        self.PPS_THRESHOLD = 1000
        self.SYN_THRESHOLD = 200
        self.ICMP_THRESHOLD = 100
        self.UDP_THRESHOLD = 500

    def packet_callback(self, packet):
        if IP in packet:
            src_ip = packet[IP].src
            self.metrics['total_packets'] += 1
            self.metrics['total_bytes'] += len(packet)
            self.source_ips[src_ip] += 1

            if TCP in packet:
                self.metrics['tcp_packets'] += 1
                if packet[TCP].flags == 'S': self.syn_count += 1
            elif UDP in packet:
                self.metrics['udp_packets'] += 1
                self.udp_count += 1
            elif ICMP in packet:
                self.metrics['icmp_packets'] += 1
                self.icmp_count += 1

    def analyze_and_alert(self):
        while self.running:
            time.sleep(1)
            elapsed = time.time() - self.start_time
            pps = self.metrics['total_packets'] / elapsed if elapsed > 0 else 0
            bps = self.metrics['total_bytes'] / elapsed if elapsed > 0 else 0

            telemetry = {
                "timestamp": datetime.utcnow().isoformat(),
                "pps": round(pps, 2), "bps": round(bps, 2),
                "top_sources": sorted(self.source_ips.items(), key=lambda x: x[1], reverse=True)[:5],
                "status": "NORMAL"
            }

            alert_triggered, alert_type, severity = False, "", "LOW"

            if self.syn_count > self.SYN_THRESHOLD:
                alert_triggered, alert_type, severity = True, "SYN_FLOOD", "HIGH"
            elif self.icmp_count > self.ICMP_THRESHOLD:
                alert_triggered, alert_type, severity = True, "ICMP_FLOOD", "MEDIUM"
            elif self.udp_count > self.UDP_THRESHOLD:
                alert_triggered, alert_type, severity = True, "UDP_FLOOD", "HIGH"
            elif pps > self.PPS_THRESHOLD:
                alert_triggered, alert_type, severity = True, "VOLUMETRIC_SPIKE", "CRITICAL"

            if alert_triggered:
                telemetry["status"] = "ALERT"
                top_ip = sorted(self.source_ips.items(), key=lambda x: x[1], reverse=True)[0][0] if self.source_ips else "Unknown"
                alert_id = self.log_alert(alert_type, severity, f"Detected {alert_type} with {pps} PPS. Top IP: {top_ip}", top_ip)
                mitigation_engine.process_alert(alert_id, top_ip, severity)

            asyncio.run(manager.broadcast(telemetry))
            
            self.metrics.clear()
            self.source_ips.clear()
            self.syn_count = self.icmp_count = self.udp_count = 0
            self.start_time = time.time()

    def log_alert(self, alert_type, severity, description, source_ip):
        db = SessionLocal()
        try:
            new_alert = SecurityAlert(alert_type=alert_type, severity=severity, source_ip=source_ip, description=description, status="ACTIVE")
            db.add(new_alert)
            db.commit()
            db.refresh(new_alert)
            return new_alert.id
        finally:
            db.close()

    def start(self):
        self.running = True
        threading.Thread(target=self.analyze_and_alert, daemon=True).start()
        threading.Thread(target=sniff, kwargs={"iface": self.interface, "prn": self.packet_callback, "store": False}, daemon=True).start()

    def stop(self):
        self.running = False