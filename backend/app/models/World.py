from app.models.Island import IslandScheme
from pydantic import BaseModel, Field

class WorldScheme(BaseModel):
    islands: list[IslandScheme] = Field(default_factory=list)
    size_x : int = Field(gt=0, le=26)
    size_y : int = Field(gt=0, le=26)

    def get_island_instance(self, id) -> IslandScheme:
        for island in self.islands:
            if island.id == id:
                return island