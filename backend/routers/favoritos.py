from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
import jwt
from typing import Optional
from database import get_db
from models import Favorito, Noticia, Usuario

router = APIRouter(prefix="/api/favoritos", tags=["favoritos"])
SECRET_KEY = "super_secreta"
ALGORITHM = "HS256"

def get_current_user_id(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload.get("sub"))
    except:
        raise HTTPException(status_code=401, detail="Token inválido")

@router.post("/{noticia_id}")
def add_favorito(noticia_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    exists = db.query(Favorito).filter(Favorito.usuario_id == user_id, Favorito.noticia_id == noticia_id).first()
    if not exists:
        nuevo = Favorito(usuario_id=user_id, noticia_id=noticia_id)
        db.add(nuevo)
        db.commit()
    return {"status": "ok"}

@router.delete("/{noticia_id}")
def remove_favorito(noticia_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    fav = db.query(Favorito).filter(Favorito.usuario_id == user_id, Favorito.noticia_id == noticia_id).first()
    if fav:
        db.delete(fav)
        db.commit()
    return {"status": "ok"}

@router.get("")
def get_favoritos(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    favs = db.query(Favorito).filter(Favorito.usuario_id == user_id).all()
    noticia_ids = [f.noticia_id for f in favs]
    noticias = db.query(Noticia).filter(Noticia.id.in_(noticia_ids)).all()
    return {"noticias": noticias, "ids": noticia_ids}
