from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pathlib import Path

import uvicorn

from models.WorldLoader import WorldLoader

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

loader = WorldLoader()
WORLDS_DIR = Path(__file__).resolve().parent / "data" / "worlds"

@app.get("/")
def main():
    return "Hello World"
@app.get("/get_worlds", response_model=list[str])
def get_worlds():
    return sorted(
        folder.name
        for folder in WORLDS_DIR.iterdir()
        if folder.is_dir()
        and (folder / "config.json").is_file()
        and (folder / "islands.json").is_file()
    )
@app.get("/worlds/{world_id}")
def read_world(world_id: str):
    return loader.load_instance(world_id)

@app.get("/worlds/{world_id}/islands/{island_id}")
def read_island(world_id : str ,island_id: int):
    return loader.select_world(world_id).get_island_instance(island_id)

if __name__ == "__main__":
    uvicorn.run('app.main:app',reload=True)
