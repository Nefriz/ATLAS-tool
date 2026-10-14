import json
from pathlib import Path
from app.models.Island import IslandScheme
from app.models.Position import PositionScheme
from app.models.World import WorldScheme
class WorldLoader:
    def __init__(self):
        self.worlds : dict[str, WorldScheme] = {}
    def load_instance(self, world: str) -> WorldScheme:
        if world in self.worlds:
            return self.worlds[world]

        islands_list : list[IslandScheme] = []
        base_dir = Path(__file__).resolve().parents[1]
        world_path = base_dir / "data" / "worlds" / world

        with open(world_path / "config.json", "r") as cfg_file:
            config = json.load(cfg_file)
        with open(world_path / "islands.json", "r") as island_file:
            islands = json.load(island_file)

        grid_size_x = config["ServersX"]
        grid_size_y = config["ServersY"]
        grid_offset = config["GridOffset"]
        grid_size = config["GridSize"]

        for isle in islands.values():
            position = PositionScheme.from_relative(
                grid=isle["grid"],
                x=isle["worldX"],
                y=isle["worldY"],
                rotation=isle["rotation"],
                grid_size= grid_size,
                grid_offset = grid_offset,
                width=isle["islandWidth"],
                height=isle["islandHeight"]
            )
            island = IslandScheme(
                position=position,
                animals=isle["animals"],
                resources=isle["resources"],
                name= isle["name"],
                id= isle["id"]
                                  )
            islands_list.append(island)
        self.worlds[world]  = WorldScheme(islands=islands_list, size_x=grid_size_x, size_y=grid_size_y)
        return self.worlds[world]

    def select_world(self, world_id: str) -> WorldScheme:
        if world_id in self.worlds:
            return self.worlds[world_id]

        return self.load_instance(world_id)