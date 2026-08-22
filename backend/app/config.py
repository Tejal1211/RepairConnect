"""
Central application configuration.

RepairConnect is designed to run in two modes:

1. LIVE MODE   - GEMINI_API_KEY and SUPABASE_URL/KEY are present.
                 Real AI analysis + real persistence are used.
2. DEMO MODE   - Any required credential is missing (or FORCE_DEMO_MODE=true).
                 The app keeps working end-to-end using an in-memory /
                 rule-based fallback so the whole flow can still be tested,
                 but every AI response is clearly labeled "demo/mock mode".

We never silently fabricate a "real" AI response - the frontend is told
explicitly which mode produced the data (see `mode` field in API responses).
"""

import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").strip()
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "").strip()
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "").strip()
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    FORCE_DEMO_MODE: bool = os.getenv("FORCE_DEMO_MODE", "false").lower() == "true"

    MAX_IMAGE_SIZE_MB: int = 10
    ALLOWED_IMAGE_TYPES: tuple = ("image/jpeg", "image/png", "image/webp")

    @property
    def gemini_available(self) -> bool:
        return bool(self.GEMINI_API_KEY) and not self.FORCE_DEMO_MODE

    @property
    def supabase_available(self) -> bool:
        return bool(self.SUPABASE_URL and self.SUPABASE_KEY) and not self.FORCE_DEMO_MODE

    @property
    def maps_available(self) -> bool:
        return bool(self.GOOGLE_MAPS_API_KEY) and not self.FORCE_DEMO_MODE


@lru_cache
def get_settings() -> Settings:
    return Settings()
