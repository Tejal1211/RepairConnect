"""
Pydantic models shared across routers.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, EmailStr


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class ItemCategory(str, Enum):
    smartphone = "Smartphone"
    laptop = "Laptop"
    tablet = "Tablet"
    television = "Television"
    refrigerator = "Refrigerator"
    washing_machine = "Washing Machine"
    bicycle = "Bicycle"
    furniture = "Furniture"
    other = "Other"


class Severity(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class Repairability(str, Enum):
    likely = "Likely Repairable"
    possibly = "Possibly Repairable"
    uncertain = "Uncertain"
    unlikely = "Unlikely Repairable"


class Recommendation(str, Enum):
    repair = "REPAIR"
    inspect = "PROFESSIONAL_INSPECTION_RECOMMENDED"
    replace = "REPLACE_OR_RECYCLE"


class RepairRequestStatus(str, Enum):
    submitted = "REQUEST_SUBMITTED"
    technician_review = "TECHNICIAN_REVIEW"
    inspection_scheduled = "INSPECTION_SCHEDULED"
    inspection_in_progress = "INSPECTION_IN_PROGRESS"
    approved = "REPAIR_APPROVED"
    in_progress = "REPAIR_IN_PROGRESS"
    ready = "READY_FOR_COLLECTION"
    completed = "COMPLETED"


# ---------------------------------------------------------------------------
# Image processing
# ---------------------------------------------------------------------------

class ImageQualityReport(BaseModel):
    valid: bool
    quality: str  # "good" | "fair" | "poor"
    blur_score: float
    brightness: float
    width: int
    height: int
    processed_image_path: Optional[str] = None
    message: Optional[str] = None


# ---------------------------------------------------------------------------
# Item / analysis request
# ---------------------------------------------------------------------------

class ItemDetails(BaseModel):
    item_name: str
    item_category: ItemCategory
    brand: Optional[str] = ""
    model: Optional[str] = ""
    item_age_years: float = Field(ge=0, default=0)
    estimated_current_value: float = Field(ge=0, default=0)
    purchase_price: Optional[float] = Field(ge=0, default=0)


class ProblemDescription(BaseModel):
    description: str
    when_occurred: Optional[str] = ""
    how_it_happened: Optional[str] = ""
    still_functioning: Optional[bool] = None


class EstimatedRepairRange(BaseModel):
    min: float
    max: float
    currency: str = "INR"


class RepairReport(BaseModel):
    item: str
    visible_damage: str
    possible_issue: str
    possible_cause: str
    severity: Severity
    repairability: Repairability
    confidence: int = Field(ge=0, le=100)
    safe_next_steps: List[str] = []
    warnings: List[str] = []
    professional_help_required: bool
    estimated_repair_range: EstimatedRepairRange
    analysis_disclaimer: str


class RepairScoreResult(BaseModel):
    repair_score: int = Field(ge=0, le=100)
    recommendation: Recommendation
    reasoning: List[str]


class AnalyzeResponse(BaseModel):
    report_id: str
    mode: str  # "live" | "demo"
    image_quality: ImageQualityReport
    repair_report: RepairReport
    repair_score: RepairScoreResult
    created_at: datetime


# ---------------------------------------------------------------------------
# Technicians
# ---------------------------------------------------------------------------

class Technician(BaseModel):
    id: str
    name: str
    specialization: str
    phone: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rating: float
    estimated_min_cost: float
    estimated_max_cost: float
    available: bool
    distance_km: Optional[float] = None


# ---------------------------------------------------------------------------
# Repair requests
# ---------------------------------------------------------------------------

class RepairRequestCreate(BaseModel):
    report_id: str
    technician_id: str
    preferred_date: str
    notes: Optional[str] = ""
    user_name: Optional[str] = "Guest User"
    user_email: Optional[EmailStr] = None


class RepairRequestOut(BaseModel):
    id: str
    report_id: str
    technician_id: str
    technician_name: str
    item_name: str
    preferred_date: str
    notes: Optional[str] = ""
    status: RepairRequestStatus
    created_at: datetime
    updated_at: datetime


class StatusUpdate(BaseModel):
    status: RepairRequestStatus


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

class DashboardStats(BaseModel):
    total_diagnoses: int
    repair_recommended: int
    items_under_repair: int
    completed_repairs: int
    items_potentially_repairable: int
    recent_reports: List[AnalyzeResponse] = []
    recent_requests: List[RepairRequestOut] = []
