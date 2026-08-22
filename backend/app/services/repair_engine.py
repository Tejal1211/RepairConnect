"""
repair_engine.py
-----------------
Transparent, rule-based Repair Score algorithm.

Deliberately NOT a black box: every point added or subtracted is explained
in the `reasoning` list returned alongside the score, so the recommendation
can be justified to the user in plain language.

Score is 0-100. Higher = repair is more clearly worthwhile.
"""

from app.models.schemas import Recommendation, RepairScoreResult, Severity, Repairability

# --- Tunable weights -------------------------------------------------------
# Keeping these as named constants (rather than magic numbers inline) makes
# the scoring logic easy to audit and adjust.
COST_TO_VALUE_WEIGHT = 40      # max points based on repair cost vs item value
AGE_WEIGHT = 20                 # max points based on how new the item is
SEVERITY_WEIGHT = 15            # max points based on damage severity
REPAIRABILITY_WEIGHT = 15       # max points based on AI repairability verdict
CONFIDENCE_WEIGHT = 10          # max points based on AI confidence


def _cost_to_value_score(estimated_value: float, repair_cost_avg: float, reasoning: list[str]) -> float:
    if estimated_value <= 0:
        reasoning.append("Item value was not provided, so cost-effectiveness could not be fully weighed.")
        return COST_TO_VALUE_WEIGHT * 0.5  # neutral-ish score

    ratio = repair_cost_avg / estimated_value

    if ratio <= 0.2:
        reasoning.append("Estimated repair cost is very low compared with the item's value.")
        return COST_TO_VALUE_WEIGHT
    if ratio <= 0.4:
        reasoning.append("Estimated repair cost is relatively low compared with the item's value.")
        return COST_TO_VALUE_WEIGHT * 0.8
    if ratio <= 0.6:
        reasoning.append("Estimated repair cost is moderate relative to the item's value.")
        return COST_TO_VALUE_WEIGHT * 0.55
    if ratio <= 0.8:
        reasoning.append("Estimated repair cost is fairly high relative to the item's value.")
        return COST_TO_VALUE_WEIGHT * 0.3
    reasoning.append("Estimated repair cost is close to or exceeds the item's current value.")
    return COST_TO_VALUE_WEIGHT * 0.05


def _age_score(item_age_years: float, reasoning: list[str]) -> float:
    if item_age_years <= 1:
        reasoning.append("The item is relatively new, which generally favors repairing over replacing.")
        return AGE_WEIGHT
    if item_age_years <= 3:
        reasoning.append("The item is a few years old, a reasonable age to still consider repair.")
        return AGE_WEIGHT * 0.75
    if item_age_years <= 6:
        reasoning.append("The item is moderately old, which slightly favors considering replacement.")
        return AGE_WEIGHT * 0.4
    reasoning.append("The item is quite old, which favors replacement over repair investment.")
    return AGE_WEIGHT * 0.1


def _severity_score(severity: Severity, reasoning: list[str]) -> float:
    mapping = {
        Severity.low: (SEVERITY_WEIGHT, "The reported damage severity is low."),
        Severity.medium: (SEVERITY_WEIGHT * 0.55, "The reported damage severity is moderate."),
        Severity.high: (SEVERITY_WEIGHT * 0.15, "The reported damage severity is high, which increases risk and cost."),
    }
    score, note = mapping[severity]
    reasoning.append(note)
    return score


def _repairability_score(repairability: Repairability, reasoning: list[str]) -> float:
    mapping = {
        Repairability.likely: (REPAIRABILITY_WEIGHT, "The AI assessment indicates the issue is likely repairable."),
        Repairability.possibly: (REPAIRABILITY_WEIGHT * 0.65, "The AI assessment indicates the issue may be repairable."),
        Repairability.uncertain: (REPAIRABILITY_WEIGHT * 0.35, "Repairability is uncertain based on the available information."),
        Repairability.unlikely: (REPAIRABILITY_WEIGHT * 0.05, "The AI assessment suggests the issue is unlikely to be economically repairable."),
    }
    score, note = mapping[repairability]
    reasoning.append(note)
    return score


def _confidence_score(confidence: int, reasoning: list[str]) -> float:
    ratio = max(0, min(confidence, 100)) / 100
    if confidence < 40:
        reasoning.append("The AI's confidence in this assessment is low, so a professional inspection is especially advisable.")
    return CONFIDENCE_WEIGHT * ratio


def calculate_repair_score(
    estimated_value: float,
    repair_cost_min: float,
    repair_cost_max: float,
    item_age_years: float,
    severity: Severity,
    repairability: Repairability,
    confidence: int,
) -> RepairScoreResult:
    reasoning: list[str] = []
    repair_cost_avg = (repair_cost_min + repair_cost_max) / 2

    total = 0.0
    total += _cost_to_value_score(estimated_value, repair_cost_avg, reasoning)
    total += _age_score(item_age_years, reasoning)
    total += _severity_score(severity, reasoning)
    total += _repairability_score(repairability, reasoning)
    total += _confidence_score(confidence, reasoning)

    score = round(max(0, min(total, 100)))

    if repairability == Repairability.unlikely or (estimated_value > 0 and repair_cost_avg >= estimated_value):
        recommendation = Recommendation.replace
        reasoning.append("Because the item is unlikely to be repairable or repair cost approaches/exceeds its value, replacement or responsible recycling is recommended.")
    elif score >= 65:
        recommendation = Recommendation.repair
        reasoning.append("Overall, repairing appears to be the more sensible option.")
    elif score >= 40:
        recommendation = Recommendation.inspect
        reasoning.append("The situation is mixed enough that a professional inspection is recommended before deciding.")
    else:
        recommendation = Recommendation.replace
        reasoning.append("Overall, the factors lean toward replacement or responsible recycling.")

    return RepairScoreResult(repair_score=score, recommendation=recommendation, reasoning=reasoning)
