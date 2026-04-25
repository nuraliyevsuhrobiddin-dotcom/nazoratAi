from app.database import reports_collection
from app.schemas import PlaceOut
from app.serializers import ai_explanation_for_score

from fastapi import APIRouter


router = APIRouter(tags=["places"])


@router.get("/places", response_model=list[PlaceOut])
async def get_places() -> list[PlaceOut]:
    pipeline = [
        {
            "$group": {
                "_id": {
                    "name": "$name",
                    "lat": "$lat",
                    "lng": "$lng",
                    "category": "$category",
                },
                "complaints": {"$sum": 1},
                "risk_score": {"$max": "$risk_score"},
                "latest_status": {"$last": "$status"},
                "latest_issue": {"$last": "$description"},
                "latest_date": {"$last": "$created_at"},
            }
        },
        {"$sort": {"risk_score": -1, "complaints": -1}},
    ]

    grouped_reports = await reports_collection.aggregate(pipeline).to_list(length=500)
    places = []

    for item in grouped_reports:
      score = int(item.get("risk_score", 0))
      places.append(
          PlaceOut(
              id=f"{item['_id']['lat']}:{item['_id']['lng']}",
              name=item["_id"]["name"],
              category=item["_id"]["category"],
              lat=item["_id"]["lat"],
              lng=item["_id"]["lng"],
              risk_score=score,
              score=score,
              complaints=item.get("complaints", 0),
              status=item.get("latest_status", "Qabul qilindi"),
              date=item.get("latest_date").isoformat() if item.get("latest_date") else "",
              issue=item.get("latest_issue", ""),
              ai_explanation=ai_explanation_for_score(score),
              trust_score=max(0, 100 - score),
          )
      )

    return places
