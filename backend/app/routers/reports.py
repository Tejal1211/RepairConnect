from fastapi import APIRouter, HTTPException

from app.models.schemas import DashboardStats
from app.services import data_store

router = APIRouter(prefix="/api", tags=["reports"])


@router.get("/reports/{report_id}")
def get_report(report_id: str):
    report = data_store.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Repair report not found.")
    return report


@router.get("/reports")
def list_reports():
    return data_store.list_reports()


@router.get("/dashboard")
def dashboard():
    reports = data_store.list_reports()
    requests = data_store.list_repair_requests()

    total_diagnoses = len(reports)
    repair_recommended = sum(
        1 for r in reports if (r.get("repair_score") or {}).get("recommendation") == "REPAIR"
    )
    items_potentially_repairable = sum(
        1
        for r in reports
        if (r.get("repair_report") or {}).get("repairability") in ("Likely Repairable", "Possibly Repairable")
    )
    items_under_repair = sum(
        1 for req in requests if req.get("status") not in ("COMPLETED",)
    )
    completed_repairs = sum(1 for req in requests if req.get("status") == "COMPLETED")

    return {
        "total_diagnoses": total_diagnoses,
        "repair_recommended": repair_recommended,
        "items_under_repair": items_under_repair,
        "completed_repairs": completed_repairs,
        "items_potentially_repairable": items_potentially_repairable,
        "recent_reports": reports[:5],
        "recent_requests": requests[:5],
    }
