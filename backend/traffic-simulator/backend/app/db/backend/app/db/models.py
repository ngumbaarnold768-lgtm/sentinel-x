from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from .database import Base
from datetime import datetime

class TrafficMetric(Base):
    __tablename__ = "traffic_metrics"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    pps = Column(Float)
    bps = Column(Float)
    source_ip = Column(String, index=True)

class SecurityAlert(Base):
    __tablename__ = "security_alerts"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    alert_type = Column(String)
    severity = Column(String)
    source_ip = Column(String)
    description = Column(String)
    status = Column(String, default="ACTIVE")

class MitigationAction(Base):
    __tablename__ = "mitigation_actions"
    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer)
    action_type = Column(String)
    target_ip = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    dry_run = Column(Boolean, default=False)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)