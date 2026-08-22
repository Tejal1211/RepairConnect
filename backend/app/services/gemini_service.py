"""
gemini_service.py
------------------
Wraps Google's Gemini multimodal API to turn (processed image + item details +
user description) into a structured repair report.

If GEMINI_API_KEY is not configured (or FORCE_DEMO_MODE=true), `analyze()`
falls back to `_demo_analysis()`, a transparent rule-based generator so the
rest of the app remains fully testable. Every response includes a `mode`
field ("live" or "demo") so the frontend can label it correctly - we never
pretend a mock result came from the real model.
"""

import json
import random

from app.config import get_settings
from app.models.schemas import (
    EstimatedRepairRange,
    RepairReport,
    Repairability,
    Severity,
)

settings = get_settings()

SYSTEM_PROMPT = """You are the repair-assessment engine for RepairConnect, an
application that gives users a *preliminary, non-professional* opinion about
whether a damaged electronic or household item might be repairable.

Rules you must always follow:
1. You are looking at a single photo plus a text description. You CANNOT see
   internal components, circuitry, or hidden damage. Never claim certainty
   about anything you cannot actually observe in the image or infer safely
   from the description.
2. Clearly separate:
   - "visible_damage": only what is literally visible in the photo
   - "possible_issue": your best-guess technical explanation
   - "possible_cause": a plausible cause, phrased tentatively
3. If there is any indication of overheating, smoke, sparks, battery
   swelling/leakage, exposed electrical wiring, or liquid exposure combined
   with power still connected, you MUST include an explicit safety warning
   and set professional_help_required to true.
4. Never give instructions that involve opening high-risk electrical
   equipment (e.g. TVs, washing machines, refrigerators) or handling
   batteries that show swelling, punctures, or leakage. For those cases,
   safe_next_steps should be limited to safe, non-invasive actions (e.g.
   "unplug the device", "avoid using it until inspected", "do not attempt to
   open the casing yourself").
5. Cost estimates are always ranges, always explicitly labeled as estimates,
   and must state that an accurate price requires professional inspection.
6. Return ONLY valid JSON matching the exact schema you are given. No prose,
   no markdown fences, no commentary.
"""

JSON_SCHEMA_INSTRUCTIONS = """Return JSON with EXACTLY these fields:
{
  "item": string,
  "visible_damage": string,
  "possible_issue": string,
  "possible_cause": string,
  "severity": "Low" | "Medium" | "High",
  "repairability": "Likely Repairable" | "Possibly Repairable" | "Uncertain" | "Unlikely Repairable",
  "confidence": integer 0-100,
  "safe_next_steps": [string, ...],
  "warnings": [string, ...],
  "professional_help_required": boolean,
  "estimated_repair_range": {"min": number, "max": number, "currency": "INR"},
  "analysis_disclaimer": string
}"""


def _build_user_prompt(item_type: str, item_details: dict, description: str, extra: dict) -> str:
    return f"""
Item type: {item_type}
Item details: {json.dumps(item_details)}
User's problem description: {description}
Additional context: {json.dumps(extra)}

{JSON_SCHEMA_INSTRUCTIONS}
"""


def _call_gemini(image_path: str, item_type: str, item_details: dict, description: str, extra: dict) -> dict:
    import google.generativeai as genai

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=SYSTEM_PROMPT,
        generation_config={"response_mime_type": "application/json"},
    )

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    prompt = _build_user_prompt(item_type, item_details, description, extra)

    response = model.generate_content(
        [
            {"mime_type": "image/jpeg", "data": image_bytes},
            prompt,
        ]
    )

    text = response.text.strip()
    # Defensive cleanup in case the model wraps JSON in markdown fences
    if text.startswith("```"):
        text = text.strip("`")
        text = text.split("\n", 1)[-1] if "\n" in text else text
        if text.lower().startswith("json"):
            text = text[4:]
    return json.loads(text)


def _demo_analysis(item_type: str, item_details: dict, description: str) -> dict:
    """
    Deterministic-ish, rule-based fallback so the whole product flow can be
    demoed / tested without a Gemini API key. This is intentionally simple
    and clearly labeled as demo/mock data at the call site (mode="demo").
    """
    desc_lower = description.lower()

    danger_terms = ["smoke", "spark", "burn", "swollen", "swelling", "leak", "fire", "smell"]
    is_dangerous = any(t in desc_lower for t in danger_terms)

    liquid = any(t in desc_lower for t in ["water", "liquid", "spill", "wet", "rain"])
    screen_issue = any(t in desc_lower for t in ["screen", "crack", "display", "flicker", "line"])
    not_turning_on = any(t in desc_lower for t in ["won't turn on", "not turning on", "dead", "no power"])

    if is_dangerous:
        severity = Severity.high
        repairability = Repairability.uncertain
        confidence = 40
        professional_help = True
        warnings = [
            "Signs described (smoke/sparks/swelling/burning smell) can indicate a serious electrical or battery hazard.",
            "Disconnect the device from power immediately and do not use it until a professional inspects it.",
        ]
        cost_min, cost_max = 1500, 6000
    elif screen_issue:
        severity = Severity.medium
        repairability = Repairability.likely
        confidence = 62
        professional_help = True
        warnings = ["Do not press on a cracked screen; glass fragments may cause injury."]
        cost_min, cost_max = 2000, 9000
    elif not_turning_on:
        severity = Severity.medium
        repairability = Repairability.possibly
        confidence = 50
        professional_help = True
        warnings = ["Avoid repeatedly attempting to power the device on if it shows no response at all."]
        cost_min, cost_max = 1000, 7000
    elif liquid:
        severity = Severity.high
        repairability = Repairability.uncertain
        confidence = 38
        professional_help = True
        warnings = ["Liquid exposure can cause hidden corrosion. Do not power the device on until it has been inspected."]
        cost_min, cost_max = 1500, 8000
    else:
        severity = Severity.low
        repairability = Repairability.possibly
        confidence = 55
        professional_help = False
        warnings = []
        cost_min, cost_max = 500, 3000

    visible_damage = (
        "Based on the description provided, the photo appears to show cosmetic or "
        "functional damage consistent with the reported issue. (Demo mode: a real "
        "Gemini analysis would describe the specific visible damage from the image itself.)"
    )

    result = {
        "item": item_details.get("item_name") or item_type,
        "visible_damage": visible_damage,
        "possible_issue": f"Demo-mode heuristic guess based on keywords in your description: '{description[:120]}'",
        "possible_cause": "Cause cannot be confirmed from a photo and text alone; this is a plausible, non-certain guess.",
        "severity": severity.value,
        "repairability": repairability.value,
        "confidence": confidence,
        "safe_next_steps": [
            "Avoid using the item until it has been checked, especially if you noticed unusual smells, heat, or sounds.",
            "Keep the item somewhere dry and away from direct sunlight.",
            "Take a few more photos from different angles for your own records.",
        ],
        "warnings": warnings,
        "professional_help_required": professional_help,
        "estimated_repair_range": {"min": cost_min, "max": cost_max, "currency": "INR"},
        "analysis_disclaimer": (
            "DEMO MODE: This result was generated by a local rule-based fallback, not the "
            "Gemini model, because no GEMINI_API_KEY was configured. It is illustrative only. "
            "In all cases, this is an initial assessment, not a guaranteed professional diagnosis."
        ),
    }
    return result


def analyze(image_path: str, item_type: str, item_details: dict, description: str, extra: dict | None = None) -> tuple[RepairReport, str]:
    """
    Returns (RepairReport, mode) where mode is "live" or "demo".
    Falls back to demo mode automatically on any Gemini API failure so the
    user still gets a usable (clearly labeled) result instead of a hard 500.
    """
    extra = extra or {}

    if settings.gemini_available:
        try:
            raw = _call_gemini(image_path, item_type, item_details, description, extra)
            raw.setdefault(
                "analysis_disclaimer",
                "This is an AI-generated initial assessment, not a guaranteed professional diagnosis. "
                "Please consult a qualified technician before making final repair decisions.",
            )
            return RepairReport(**raw), "live"
        except Exception as exc:  # noqa: BLE001 - we want to fall back on ANY failure
            fallback = _demo_analysis(item_type, item_details, description)
            fallback["analysis_disclaimer"] = (
                f"DEMO MODE (Gemini call failed: {exc.__class__.__name__}). "
                + fallback["analysis_disclaimer"]
            )
            return RepairReport(**fallback), "demo"

    raw = _demo_analysis(item_type, item_details, description)
    return RepairReport(**raw), "demo"
