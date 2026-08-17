from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_current_user
from database import get_db
from models.user import User
from services.search_service import perform_search

router = APIRouter(
    prefix="/search",
    tags=["search"],
)


@router.get("/")
async def global_search(
    q: str = Query(..., min_length=2, description="The search term"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        results = await perform_search(db, search_term=q)
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while searching.",
        )

    count = sum(len(group) for group in results.values())

    return {
        "query": q,
        "count": count,
        "data": results,
    }
