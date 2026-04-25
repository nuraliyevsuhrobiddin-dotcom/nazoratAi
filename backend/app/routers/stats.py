from datetime import datetime, time, timezone

from fastapi import APIRouter

from app.database import reports_collection


router = APIRouter(tags=["stats"])


@router.get("/stats")
async def get_stats() -> dict:
    today_start = datetime.combine(datetime.now(timezone.utc).date(), time.min, tzinfo=timezone.utc)
    today_count = await reports_collection.count_documents({"created_at": {"$gte": today_start}})

    most_dangerous = await reports_collection.find_one(
        {},
        {"files.content": 0},
        sort=[("risk_score", -1), ("created_at", -1)],
    )

    top_category_pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 1},
    ]
    top_categories = await reports_collection.aggregate(top_category_pipeline).to_list(length=1)

    return {
        "today_count": today_count,
        "most_dangerous_location": {
            "id": str(most_dangerous["_id"]),
            "name": most_dangerous.get("name"),
            "risk_score": most_dangerous.get("risk_score", 0),
        } if most_dangerous else None,
        "top_category": top_categories[0]["_id"] if top_categories else None,
    }
