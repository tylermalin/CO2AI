"""Auth endpoints - Magic DID token verification and JWT issuance."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.config import get_settings
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


class VerifyRequest(BaseModel):
    """Request body for Magic DID token verification."""

    did_token: str = Field(..., description="Magic DID token from client")


class VerifyResponse(BaseModel):
    """Response with JWT access token."""

    access_token: str


@router.post("/verify", response_model=VerifyResponse)
async def verify_magic_token(req: VerifyRequest) -> VerifyResponse:
    """
    Verify Magic DID token and return a JWT access token.
    The client obtains the DID token from Magic SDK after loginWithMagicLink/loginWithCredential.
    """
    settings = get_settings()
    if not settings.magic_secret_key:
        raise HTTPException(
            status_code=503,
            detail="Magic authentication is not configured. Set MAGIC_SECRET_KEY.",
        )

    try:
        from magic_admin import Magic
        from magic_admin.error import (
            DIDTokenExpired,
            DIDTokenInvalid,
            DIDTokenMalformed,
        )
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="Magic SDK not installed.",
        )

    try:
        magic = Magic(api_secret_key=settings.magic_secret_key)
        magic.Token.validate(req.did_token)
        issuer = magic.Token.get_issuer(req.did_token)
        metadata = magic.User.get_metadata_by_issuer(issuer)
        email = metadata.data.get("email") or metadata.data.get("issuer") or issuer
    except (DIDTokenExpired, DIDTokenInvalid, DIDTokenMalformed) as e:
        raise HTTPException(status_code=401, detail="Invalid or expired magic link")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token verification failed")

    access_token = create_access_token(
        subject=issuer,
        extra_claims={"email": email},
    )
    return VerifyResponse(access_token=access_token)
