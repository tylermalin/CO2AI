"""Organization endpoints - create org for scoping emissions and budgets."""

import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models.organization import Organization

router = APIRouter(prefix="/organizations", tags=["organizations"])


class CreateOrgResponse(BaseModel):
    """Response when creating an organization."""

    id: str
    name: str


@router.post("", response_model=CreateOrgResponse)
async def create_organization(
    db: AsyncSession = Depends(get_db),
) -> CreateOrgResponse:
    """
    Create a new organization. Returns an ID to use for:
    - X-Organization-Id header when calling the proxy
    - X-Organization-Id header when fetching emissions
    - Scoping carbon budgets and optimization insights
    """
    org = Organization(id=uuid.uuid4(), name=f"org-{uuid.uuid4().hex[:8]}")
    db.add(org)
    await db.commit()
    await db.refresh(org)
    return CreateOrgResponse(id=str(org.id), name=org.name)
