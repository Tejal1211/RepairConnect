from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.config import get_settings
from app.services import data_store

router = APIRouter(prefix="/api", tags=["technicians"])
settings = get_settings()


@router.get("/technicians")
def list_technicians(
    category: Optional[str] = Query(None),
    min_rating: float = Query(0),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
):
    technicians = data_store.list_technicians(category=category, min_rating=min_rating, user_lat=lat, user_lng=lng)
    return {
        "maps_enabled": settings.maps_available,
        "source": "supabase" if data_store.using_supabase() else "sample_data",
        "technicians": technicians,
    }


@router.get("/technicians/{tech_id}")
def get_technician(tech_id: str):
    tech = data_store.get_technician(tech_id)
    if not tech:
        raise HTTPException(status_code=404, detail="Technician not found.")
    return tech
