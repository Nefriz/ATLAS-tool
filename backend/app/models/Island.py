from pydantic import BaseModel
from app.models.Position import PositionScheme

class IslandScheme(BaseModel):
    position: PositionScheme
    animals : list[str | None]
    resources : dict[str, int]
    name : str
    id : int
