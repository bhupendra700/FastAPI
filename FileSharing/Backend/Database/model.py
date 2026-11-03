from sqlalchemy import String, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped , mapped_column

class Base(DeclarativeBase):
	pass

class User(Base):
	__tablename__ = "users"

	id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
	name: Mapped[str] = mapped_column(String(100))
	email: Mapped[str] = mapped_column(String(100) , unique=True , nullable=False)
	password: Mapped[str] = mapped_column(String)

	def __repr__(self) -> str:
		return f"User(id={self.id!r}, name={self.name!r}, email={self.email!r})"

	def to_dict(self) -> dict:
		return {"id": self.id , "name": self.name , "email" : self.email}