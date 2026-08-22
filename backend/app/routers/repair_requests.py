from fastapi import APIRouter, HTTPException

from app.models.schemas import RepairRequestCreate, StatusUpdate
from app.services import data_store

router = APIRouter(prefix="/api", tags=["repair-requests"])

VALID_STATUS_FLOW = [
    "REQUEST_SUBMITTED",
    "TECHNICIAN_REVIEW",
    "INSPECTION_SCHEDULED",
    "INSPECTION_IN_PROGRESS",
    "REPAIR_APPROVED",
    "REPAIR_IN_PROGRESS",
    "READY_FOR_COLLECTION",
    "COMPLETED",
]


@router.post("/repair-requests")
def create_repair_request(payload: RepairRequestCreate):
    report = data_store.get_report(payload.report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Repair report not found. Please run a diagnosis first.")

    technician = data_store.get_technician(payload.technician_id)
    if not technician:
        raise HTTPException(status_code=404, detail="Selected technician not found.")

    item_name = (report.get("item_details") or {}).get("item_name") or report.get("repair_report", {}).get("item", "Item")

    record = data_store.create_repair_request(
        {
            "report_id": payload.report_id,
            "technician_id": payload.technician_id,
            "technician_name": technician["name"],
            "item_name": item_name,
            "preferred_date": payload.preferred_date,
            "notes": payload.notes,
            "user_name": payload.user_name,
            "user_email": payload.user_email,
        }
    )
    return record


@router.get("/repair-requests")
def list_repair_requests():
    return data_store.list_repair_requests()


@router.get("/repair-requests/{request_id}")
def get_repair_request(request_id: str):
    record = data_store.get_repair_request(request_id)
    if not record:
        raise HTTPException(status_code=404, detail="Repair request not found.")
    return record


@router.patch("/repair-requests/{request_id}/status")
def update_status(request_id: str, payload: StatusUpdate):
    record = data_store.get_repair_request(request_id)
    if not record:
        raise HTTPException(status_code=404, detail="Repair request not found.")

    updated = data_store.update_repair_request_status(request_id, payload.status.value)
    return updated
