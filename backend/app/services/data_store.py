"""
data_store.py
-------------
Thin persistence layer.

- If Supabase credentials are configured, all reads/writes go to Postgres
  via the supabase-py client (see database/schema.sql for the tables).
- Otherwise, an in-memory store is used so the whole app (including repair
  requests + status tracking + dashboard) keeps working for local
  development/demo without any external services.

Routers should only talk to this module, never to Supabase directly, so the
live/demo distinction stays in one place.
"""

import math
import uuid
from datetime import datetime, timezone
from typing import Optional

from app.config import get_settings

settings = get_settings()

_supabase_client = None
if settings.supabase_available:
    try:
        from supabase import create_client

        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception:
        _supabase_client = None


def using_supabase() -> bool:
    return _supabase_client is not None


# ---------------------------------------------------------------------------
# In-memory fallback store
# ---------------------------------------------------------------------------

_REPORTS: dict[str, dict] = {}
_REQUESTS: dict[str, dict] = {}

SAMPLE_TECHNICIANS = [
    {
        "id": "tech-001", "name": "Chetan Electronics Repair", "specialization": "Smartphone & Laptop",
        "phone": "+91 98200 11122", "address": "Andheri West, Mumbai", "latitude": 19.1364, "longitude": 72.8296,
        "rating": 4.7, "estimated_min_cost": 500, "estimated_max_cost": 6000, "available": True,
    },
    {
        "id": "tech-002", "name": "QuickFix Appliance Care", "specialization": "Refrigerator & Washing Machine",
        "phone": "+91 98670 44551", "address": "Bandra East, Mumbai", "latitude": 19.0596, "longitude": 72.8656,
        "rating": 4.4, "estimated_min_cost": 800, "estimated_max_cost": 5000, "available": True,
    },
    {
        "id": "tech-003", "name": "ScreenSavers TV & Display", "specialization": "Television",
        "phone": "+91 99870 33221", "address": "Powai, Mumbai", "latitude": 19.1176, "longitude": 72.9060,
        "rating": 4.6, "estimated_min_cost": 1000, "estimated_max_cost": 9000, "available": True,
    },
    {
        "id": "tech-004", "name": "CycleWorks Bike Studio", "specialization": "Bicycle",
        "phone": "+91 90040 12345", "address": "Dadar, Mumbai", "latitude": 19.0176, "longitude": 72.8438,
        "rating": 4.8, "estimated_min_cost": 200, "estimated_max_cost": 2500, "available": True,
    },
    {
        "id": "tech-005", "name": "Urban Furniture Restorers", "specialization": "Furniture",
        "phone": "+91 98200 99887", "address": "Malad West, Mumbai", "latitude": 19.1863, "longitude": 72.8489,
        "rating": 4.3, "estimated_min_cost": 300, "estimated_max_cost": 4000, "available": False,
    },
    {
        "id": "tech-006", "name": "TechMed Mobile Clinic", "specialization": "Smartphone & Tablet",
        "phone": "+91 91367 22110", "address": "Ghatkopar, Mumbai", "latitude": 19.0864, "longitude": 72.9081,
        "rating": 4.5, "estimated_min_cost": 400, "estimated_max_cost": 5500, "available": True,
    },
]


def _now():
    return datetime.now(timezone.utc)


def _haversine_km(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2):
        return None
    r = 6371
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlambda / 2) ** 2
    return round(r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 1)


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------

def save_report(payload: dict) -> str:
    report_id = payload.get("report_id") or str(uuid.uuid4())
    payload["report_id"] = report_id
    if using_supabase():
        _supabase_client.table("repair_reports").insert(payload).execute()
    else:
        _REPORTS[report_id] = payload
    return report_id


def get_report(report_id: str) -> Optional[dict]:
    if using_supabase():
        res = _supabase_client.table("repair_reports").select("*").eq("report_id", report_id).execute()
        return res.data[0] if res.data else None
    return _REPORTS.get(report_id)


def list_reports() -> list[dict]:
    if using_supabase():
        res = _supabase_client.table("repair_reports").select("*").order("created_at", desc=True).execute()
        return res.data or []
    return sorted(_REPORTS.values(), key=lambda r: r["created_at"], reverse=True)


# ---------------------------------------------------------------------------
# Technicians
# ---------------------------------------------------------------------------

def list_technicians(category: Optional[str] = None, min_rating: float = 0,
                      user_lat: Optional[float] = None, user_lng: Optional[float] = None) -> list[dict]:
    if using_supabase():
        query = _supabase_client.table("technicians").select("*")
        if category and category.lower() != "other":
            query = query.ilike("specialization", f"%{category}%")
        res = query.execute()
        techs = res.data or []
    else:
        techs = list(SAMPLE_TECHNICIANS)
        if category and category.lower() != "other":
            techs = [t for t in techs if category.lower() in t["specialization"].lower()] or techs

    out = []
    for t in techs:
        t = dict(t)
        if t.get("rating", 0) < min_rating:
            continue
        if user_lat is not None and user_lng is not None:
            t["distance_km"] = _haversine_km(user_lat, user_lng, t.get("latitude"), t.get("longitude"))
        out.append(t)

    out.sort(key=lambda t: (t.get("distance_km") is None, t.get("distance_km", 0)))
    return out


def get_technician(tech_id: str) -> Optional[dict]:
    if using_supabase():
        res = _supabase_client.table("technicians").select("*").eq("id", tech_id).execute()
        return res.data[0] if res.data else None
    return next((t for t in SAMPLE_TECHNICIANS if t["id"] == tech_id), None)


# ---------------------------------------------------------------------------
# Repair requests
# ---------------------------------------------------------------------------

def create_repair_request(data: dict) -> dict:
    request_id = str(uuid.uuid4())
    now = _now()
    record = {
        "id": request_id,
        **data,
        "status": "REQUEST_SUBMITTED",
        "created_at": now,
        "updated_at": now,
    }
    if using_supabase():
        _supabase_client.table("repair_requests").insert(record).execute()
    else:
        _REQUESTS[request_id] = record
    return record


def get_repair_request(request_id: str) -> Optional[dict]:
    if using_supabase():
        res = _supabase_client.table("repair_requests").select("*").eq("id", request_id).execute()
        return res.data[0] if res.data else None
    return _REQUESTS.get(request_id)


def list_repair_requests() -> list[dict]:
    if using_supabase():
        res = _supabase_client.table("repair_requests").select("*").order("created_at", desc=True).execute()
        return res.data or []
    return sorted(_REQUESTS.values(), key=lambda r: r["created_at"], reverse=True)


def update_repair_request_status(request_id: str, status: str) -> Optional[dict]:
    if using_supabase():
        _supabase_client.table("repair_requests").update(
            {"status": status, "updated_at": _now().isoformat()}
        ).eq("id", request_id).execute()
        return get_repair_request(request_id)
    if request_id in _REQUESTS:
        _REQUESTS[request_id]["status"] = status
        _REQUESTS[request_id]["updated_at"] = _now()
        return _REQUESTS[request_id]
    return None
