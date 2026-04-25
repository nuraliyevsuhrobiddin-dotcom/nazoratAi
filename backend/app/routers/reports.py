import re
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from pymongo import ReturnDocument

from app.ai import calculate_risk_score
from app.database import reports_collection
from app.schemas import ReportOut, ReportUpdate
from app.security import require_admin
from app.serializers import serialize_report


router = APIRouter(tags=["reports"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
MAX_FILE_SIZE = 25 * 1024 * 1024
ALLOWED_CONTENT_PREFIXES = ("image/", "video/", "audio/")
ALLOWED_CATEGORIES = {
    "Umumiy",
    "Boshqaruv",
    "Sud-huquq",
    "Moliya",
    "Bojxona",
    "Ta'lim",
    "Tibbiyot",
    "Transport",
    "Kommunal",
}
ALLOWED_STATUSES = {"Qabul qilindi", "Tekshirilmoqda", "Hal qilindi"}


def _parse_coordinate(value: str | float | None, fallback: float) -> float:
    if value in (None, ""):
        return fallback
    return float(value)


def _validate_report_fields(name: str, description: str, category: str, lat: float, lng: float) -> None:
    if not name.strip():
        raise HTTPException(status_code=422, detail="Tashkilot nomini kiriting")
    if len(name.strip()) > 160:
        raise HTTPException(status_code=422, detail="Tashkilot nomi juda uzun")
    if len(description.strip()) < 10:
        raise HTTPException(status_code=422, detail="Iltimos, muammoni kamida 10 ta belgidan iborat qilib yozing")
    if len(description.strip()) > 5000:
        raise HTTPException(status_code=422, detail="Muammo tavsifi juda uzun")
    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(status_code=422, detail="Noto'g'ri kategoriya tanlandi")
    if not -90 <= lat <= 90 or not -180 <= lng <= 180:
        raise HTTPException(status_code=422, detail="Joylashuv koordinatalari noto'g'ri")


def _safe_filename(filename: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]", "_", filename or "file")
    return cleaned[:120]


async def _save_uploads(files: Optional[List[UploadFile]]) -> list[dict]:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    uploaded_files = []

    for file in files or []:
        if not file.filename:
            continue
        if not file.content_type or not file.content_type.startswith(ALLOWED_CONTENT_PREFIXES):
            raise HTTPException(status_code=422, detail="Fayl turi qo'llab-quvvatlanmaydi. Faqat rasm, video yoki audio yuklang")

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail=f"{file.filename} hajmi 25 MB dan katta")

        file_id = uuid4().hex
        stored_name = f"{file_id}_{_safe_filename(file.filename)}"
        path = UPLOAD_DIR / stored_name
        path.write_bytes(content)

        uploaded_files.append(
            {
                "id": file_id,
                "filename": file.filename,
                "content_type": file.content_type,
                "size": len(content),
                "path": str(path),
            }
        )

    return uploaded_files


async def _create_report(
    name: str,
    description: str,
    category: str,
    lat: float,
    lng: float,
    is_anonymous: bool,
    files: Optional[List[UploadFile]],
) -> ReportOut:
    _validate_report_fields(name, description, category, lat, lng)
    risk_score = calculate_risk_score(description)
    uploaded_files = await _save_uploads(files)

    report_doc = {
        "name": name,
        "description": description,
        "category": category,
        "lat": lat,
        "lng": lng,
        "risk_score": risk_score,
        "status": "Qabul qilindi",
        "is_anonymous": is_anonymous,
        "created_at": datetime.now(timezone.utc),
        "evidence_filename": uploaded_files[0]["filename"] if uploaded_files else None,
        "evidence_content_type": uploaded_files[0]["content_type"] if uploaded_files else None,
        "files": uploaded_files,
    }

    result = await reports_collection.insert_one(report_doc)
    report_doc["_id"] = result.inserted_id
    return ReportOut(**serialize_report(report_doc))


@router.post("/report", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
async def create_report(
    name: str = Form(...),
    description: str = Form(...),
    category: str = Form("Umumiy"),
    lat: float = Form(...),
    lng: float = Form(...),
    is_anonymous: bool = Form(True),
    files: Optional[List[UploadFile]] = File(None),
) -> ReportOut:
    return await _create_report(name, description, category, lat, lng, is_anonymous, files)


@router.post("/reports", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
async def create_report_frontend_alias(
    location: str = Form(...),
    description: str = Form(...),
    category: str = Form("Umumiy"),
    lat: str | None = Form(None),
    lng: str | None = Form(None),
    is_anonymous: bool = Form(True),
    evidence: UploadFile | None = File(None),
    files: Optional[List[UploadFile]] = File(None),
) -> ReportOut:
    report_lat = _parse_coordinate(lat, 41.311081)
    report_lng = _parse_coordinate(lng, 69.240562)
    upload_files = files or ([evidence] if evidence else [])
    return await _create_report(location, description, category, report_lat, report_lng, is_anonymous, upload_files)


@router.get("/reports", response_model=list[ReportOut])
async def list_reports(_: dict = Depends(require_admin)) -> list[ReportOut]:
    reports = await reports_collection.find({}, {"files.content": 0}).sort("created_at", -1).to_list(length=500)
    return [ReportOut(**serialize_report(report)) for report in reports]


@router.patch("/report/{report_id}", response_model=ReportOut)
async def update_report(report_id: str, payload: ReportUpdate, _: dict = Depends(require_admin)) -> ReportOut:
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report id")

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    if "status" in update_data and update_data["status"] not in ALLOWED_STATUSES:
        raise HTTPException(status_code=422, detail="Noto'g'ri status tanlandi")
    if "category" in update_data and update_data["category"] not in ALLOWED_CATEGORIES:
        raise HTTPException(status_code=422, detail="Noto'g'ri kategoriya tanlandi")

    result = await reports_collection.find_one_and_update(
        {"_id": ObjectId(report_id)},
        {"$set": update_data},
        projection={"files.content": 0},
        return_document=ReturnDocument.AFTER,
    )

    if not result:
        raise HTTPException(status_code=404, detail="Report not found")

    return ReportOut(**serialize_report(result))


@router.get("/report/{report_id}/files/{file_id}")
async def download_report_file(report_id: str, file_id: str, _: dict = Depends(require_admin)) -> FileResponse:
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report id")

    report = await reports_collection.find_one({"_id": ObjectId(report_id)}, {"files": 1})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    file_meta = next((file for file in report.get("files", []) if file.get("id") == file_id), None)
    if not file_meta:
        raise HTTPException(status_code=404, detail="File not found")

    path = Path(file_meta["path"])
    if not path.exists():
        raise HTTPException(status_code=404, detail="File missing from storage")

    return FileResponse(
        path,
        media_type=file_meta.get("content_type") or "application/octet-stream",
        filename=file_meta.get("filename") or path.name,
    )
