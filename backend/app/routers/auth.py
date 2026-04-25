from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.database import users_collection
from app.schemas import TokenResponse, UserCreate, UserLogin
from app.security import create_access_token, hash_password, verify_password


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate) -> TokenResponse:
    user_doc = {
        "email": payload.email.lower(),
        "password": hash_password(payload.password),
        "is_admin": payload.is_admin,
    }

    try:
        result = await users_collection.insert_one(user_doc)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="User already exists") from exc

    user_id = str(result.inserted_id)
    token = create_access_token({
        "sub": user_doc["email"],
        "user_id": user_id,
        "is_admin": user_doc["is_admin"],
    })
    return TokenResponse(access_token=token, user_id=user_id, is_admin=user_doc["is_admin"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin) -> TokenResponse:
    user = await users_collection.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    user_id = str(user.get("_id", ObjectId()))
    is_admin = user.get("is_admin", False)
    token = create_access_token({
        "sub": user["email"],
        "user_id": user_id,
        "is_admin": is_admin,
    })
    return TokenResponse(access_token=token, user_id=user_id, is_admin=is_admin)
