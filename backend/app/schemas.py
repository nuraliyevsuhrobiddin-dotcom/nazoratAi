from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    is_admin: bool = False


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    is_admin: bool = False


class ReportCreate(BaseModel):
    name: str
    description: str
    category: str = "Umumiy"
    lat: float
    lng: float
    is_anonymous: bool = True


class ReportUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    lat: float | None = None
    lng: float | None = None
    risk_score: int | None = Field(default=None, ge=0, le=100)
    status: str | None = None
    is_anonymous: bool | None = None


class ReportOut(BaseModel):
    id: str
    name: str
    description: str
    category: str
    lat: float
    lng: float
    risk_score: int
    score: int
    status: str
    is_anonymous: bool
    created_at: datetime
    evidence_filename: str | None = None
    evidence_content_type: str | None = None
    files: list[dict[str, Any]] = Field(default_factory=list)


class PlaceOut(BaseModel):
    id: str
    name: str
    category: str
    lat: float
    lng: float
    risk_score: int
    score: int
    complaints: int
    status: str
    date: str
    issue: str
    ai_explanation: str
    trust_score: int


class StatsOut(BaseModel):
    today_count: int
    most_dangerous_location: dict[str, Any] | None
    top_category: str | None
