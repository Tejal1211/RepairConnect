import json
from datetime import datetime, timezone

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from pydantic import BaseModel

from app.config import get_settings
from app.models.schemas import AnalyzeResponse, ImageQualityReport, RepairScoreResult, Severity, Repairability
from app.services import data_store
from app.services.gemini_service import analyze as gemini_analyze
from app.services.image_processor import process_image
from app.services.repair_engine import calculate_repair_score

router = APIRouter(prefix="/api", tags=["analysis"])
settings = get_settings()


class RepairScoreRequest(BaseModel):
    estimated_value: float
    repair_cost_min: float
    repair_cost_max: float
    item_age_years: float
    severity: Severity
    repairability: Repairability
    confidence: int


@router.post("/repair-score", response_model=RepairScoreResult)
def repair_score_endpoint(payload: RepairScoreRequest):
    """Standalone endpoint to (re)compute a repair score, e.g. if the user
    edits their estimated item value after seeing the AI report."""
    return calculate_repair_score(
        estimated_value=payload.estimated_value,
        repair_cost_min=payload.repair_cost_min,
        repair_cost_max=payload.repair_cost_max,
        item_age_years=payload.item_age_years,
        severity=payload.severity,
        repairability=payload.repairability,
        confidence=payload.confidence,
    )


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_item(
    image: UploadFile = File(...),
    item_name: str = Form(...),
    item_category: str = Form(...),
    brand: str = Form(""),
    model: str = Form(""),
    item_age_years: float = Form(0),
    estimated_current_value: float = Form(0),
    purchase_price: float = Form(0),
    description: str = Form(...),
    when_occurred: str = Form(""),
    how_it_happened: str = Form(""),
    still_functioning: str = Form(""),
):
    # ---- Basic request validation -----------------------------------
    if image.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format '{image.content_type}'. Please upload a JPEG, PNG, or WEBP image.",
        )

    image_bytes = await image.read()
    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb > settings.MAX_IMAGE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"Image is too large ({size_mb:.1f}MB). Please upload an image under {settings.MAX_IMAGE_SIZE_MB}MB.",
        )

    if not description or not description.strip():
        raise HTTPException(status_code=400, detail="Please describe the problem before submitting.")

    # ---- OpenCV preprocessing + quality check ------------------------
    try:
        processed = process_image(image_bytes)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Image processing failed: {exc}") from exc

    if not processed.valid:
        raise HTTPException(status_code=400, detail=processed.message or "The uploaded file could not be processed as an image.")

    quality_report = ImageQualityReport(
        valid=processed.valid,
        quality=processed.quality,
        blur_score=processed.blur_score,
        brightness=processed.brightness,
        width=processed.width,
        height=processed.height,
        processed_image_path=processed.processed_image_path,
        message=processed.message,
    )

    if processed.quality == "poor":
        # Stop here and ask for a better photo instead of wasting an AI call
        raise HTTPException(
            status_code=422,
            detail={
                "error": "image_quality_too_low",
                "message": processed.message,
                "image_quality": quality_report.model_dump(),
            },
        )

    # ---- Gemini AI analysis -------------------------------------------
    item_details = {
        "item_name": item_name,
        "item_category": item_category,
        "brand": brand,
        "model": model,
        "item_age_years": item_age_years,
        "estimated_current_value": estimated_current_value,
        "purchase_price": purchase_price,
    }
    extra = {
        "when_occurred": when_occurred,
        "how_it_happened": how_it_happened,
        "still_functioning": still_functioning,
    }

    try:
        repair_report, mode = gemini_analyze(
            image_path=processed.processed_image_path,
            item_type=item_category,
            item_details=item_details,
            description=description,
            extra=extra,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {exc}") from exc

    # ---- Repair Score ---------------------------------------------------
    score_result = calculate_repair_score(
        estimated_value=estimated_current_value,
        repair_cost_min=repair_report.estimated_repair_range.min,
        repair_cost_max=repair_report.estimated_repair_range.max,
        item_age_years=item_age_years,
        severity=repair_report.severity,
        repairability=repair_report.repairability,
        confidence=repair_report.confidence,
    )

    created_at = datetime.now(timezone.utc)
    response = AnalyzeResponse(
        report_id="",  # filled by data_store.save_report
        mode=mode,
        image_quality=quality_report,
        repair_report=repair_report,
        repair_score=score_result,
        created_at=created_at,
    )

    record = response.model_dump(mode="json")
    record["item_details"] = item_details
    report_id = data_store.save_report(record)
    response.report_id = report_id

    return response
