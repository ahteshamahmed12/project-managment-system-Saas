from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from models.user import User
from schemas.user import UserCreate, UserOut, Token, RefreshRequest
from auth.hashing import hash_password, verify_password
from auth.jwt_handler import create_access_token, create_refresh_token, decode_refresh_token
from auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    if await User.find_one(User.email == user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(username=user_data.username, email=user_data.email,
                hashed_password=hash_password(user_data.password))
    await user.insert()
    return UserOut(id=str(user.id), username=user.username, email=user.email, is_active=user.is_active)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await User.find_one(User.email == form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password",
                             headers={"WWW-Authenticate": "Bearer"})
    token_data = {"sub": str(user.id)}
    return Token(access_token=create_access_token(token_data), refresh_token=create_refresh_token(token_data))

@router.post("/refresh", response_model=Token)
async def refresh_token(payload: RefreshRequest):
    data = decode_refresh_token(payload.refresh_token)
    if data is None:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    user = await User.get(data.get("sub"))
    if user is None:
        raise HTTPException(status_code=401, detail="User no longer exists")
    token_data = {"sub": str(user.id)}
    return Token(access_token=create_access_token(token_data), refresh_token=create_refresh_token(token_data))

@router.get("/me", response_model=UserOut)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return UserOut(id=str(current_user.id), username=current_user.username,
                    email=current_user.email, is_active=current_user.is_active)