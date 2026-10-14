from pydantic import BaseModel, Field


class PositionScheme(BaseModel):
    grid: str

    gridX: int = Field(ge=0)
    gridY: int = Field(ge=0)

    worldX: float
    worldY: float

    relativeX: float
    relativeY: float

    rotation: float = 0.0

    width: int = 240000
    height: int = 240000

    @staticmethod
    def parse_grid(grid: str) -> tuple[int, int]:
        grid_x = ord(grid[0].upper()) - ord("A")
        grid_y = int(grid[1:]) - 1
        return grid_x, grid_y

    @classmethod
    def from_relative(
            cls,
            grid: str,
            x: float,
            y: float,
            rotation: float,
            width: float,
            height: float,
            grid_size: float,
            grid_offset: float = 0,
    ) -> "PositionScheme":

        grid = grid.upper()
        grid_x, grid_y = cls.parse_grid(grid)

        world_x = x + grid_x * grid_size + grid_offset
        world_y = y + grid_y * grid_size + grid_offset

        return cls(
            grid=grid,
            gridX=grid_x,
            gridY=grid_y,
            worldX=world_x,
            worldY=world_y,
            relativeX=x,
            relativeY=y,
            rotation=rotation,
            width=width,
            height=height,
        )
