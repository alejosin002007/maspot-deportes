from sqlalchemy import Column, Integer, String
from database import Base

class Noticia(Base):
    __tablename__ = "noticias"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    resumen = Column(String)
    link = Column(String, unique=True, index=True)
    disciplina = Column(String)
    fecha = Column(String)
    imagen_url = Column(String, nullable=True)

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    foto_url = Column(String, nullable=True)

class Favorito(Base):
    __tablename__ = "favoritos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, index=True)
    noticia_id = Column(Integer, index=True)
