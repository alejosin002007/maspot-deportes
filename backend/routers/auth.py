from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
import bcrypt
from datetime import datetime, timedelta
import jwt
from typing import Optional

from database import get_db
from models import Usuario

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET_KEY = "super_secreta"
ALGORITHM = "HS256"

class UserRegister(BaseModel):
    nombre: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ChangePassword(BaseModel):
    old_password: str
    new_password: str

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")
    hashed = get_password_hash(user.password)
    new_user = Usuario(nombre=user.nombre, email=user.email, password_hash=hashed)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    token = create_access_token({"sub": str(new_user.id), "email": new_user.email})
    return {"token": token, "user": {"id": new_user.id, "nombre": new_user.nombre}}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(Usuario).filter(Usuario.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    token = create_access_token({"sub": str(db_user.id), "email": db_user.email})
    return {"token": token, "user": {"id": db_user.id, "nombre": db_user.nombre}}

@router.post("/change-password")
def change_password(data: ChangePassword, db: Session = Depends(get_db), authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except:
        raise HTTPException(status_code=401, detail="Token inválido")
        
    db_user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not db_user or not verify_password(data.old_password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
        
    db_user.password_hash = get_password_hash(data.new_password)
    db.commit()
    return {"status": "ok", "mensaje": "Contraseña actualizada exitosamente"}
