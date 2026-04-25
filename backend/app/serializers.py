from datetime import datetime, timezone
from typing import Any


def serialize_report(report: dict[str, Any]) -> dict[str, Any]:
    risk_score = int(report.get("risk_score", 0))
    files = [
        {
            "id": file.get("id"),
            "filename": file.get("filename"),
            "content_type": file.get("content_type"),
            "size": file.get("size", 0),
        }
        for file in report.get("files", [])
    ]

    return {
        "id": str(report["_id"]),
        "name": report.get("name", ""),
        "description": report.get("description", ""),
        "category": report.get("category", "Umumiy"),
        "lat": report.get("lat"),
        "lng": report.get("lng"),
        "risk_score": risk_score,
        "score": risk_score,
        "status": report.get("status", "Qabul qilindi"),
        "is_anonymous": report.get("is_anonymous", True),
        "created_at": report.get("created_at", datetime.now(timezone.utc)),
        "evidence_filename": report.get("evidence_filename"),
        "evidence_content_type": report.get("evidence_content_type"),
        "files": files,
    }


def ai_explanation_for_score(score: int) -> str:
    if score >= 80:
        return "AI kalit so'zlar va murojaat mazmuniga ko'ra yuqori xavf aniqladi."
    if score >= 50:
        return "AI murojaatda o'rta darajadagi xavf signallarini aniqladi."
    return "AI murojaatda past xavf darajasini aniqladi."
