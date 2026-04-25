from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings


client = AsyncIOMotorClient(settings.mongo_url)
db = client[settings.mongo_db_name]

users_collection = db["users"]
reports_collection = db["reports"]


async def create_indexes() -> None:
    await users_collection.create_index("email", unique=True)
    await reports_collection.create_index([("lat", 1), ("lng", 1)])
    await reports_collection.create_index("created_at")
    await reports_collection.create_index("category")
