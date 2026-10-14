# ATLAS — World Explorer (frontend v0.1)

React + TypeScript + Vite + Tailwind + React Leaflet. **This is a standalone frontend**, not a rewrite of the Discord bot or FastAPI backend.

## Run on Windows / PyCharm

Copy the archive contents into your existing `ATLAS/frontend/` directory (merge with or replace Vite's starter files; don't touch `backend/`). In PowerShell:

```powershell
cd C:\Users\16102\PycharmProjects\ATLAS\frontend
npm.cmd install
Copy-Item .env.example .env
npm.cmd run dev
```

Open http://localhost:5173/ . If you don't have a running backend, the app displays the bundled Season 8 **reference demo** with 116 real records from the provided `islands.json`. This is not an accurate coastline raster: island shapes are stylized from island extents; the optional world image can be supplied later.

## Hook up your current FastAPI

`.env` contains:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_WORLD_IDS=Potato - 8
VITE_AUTO_CONNECT=true
VITE_DEFAULT_GRID_SIZE=1400000
```

With `VITE_AUTO_CONNECT=true`, frontend attempts `GET http://127.0.0.1:8000/worlds/Potato%20-%208` and falls back to a real Season 8 demo dataset if the backend is unreachable. You can switch sources using the dropdown. To add more server-side worlds, set `VITE_WORLD_IDS=Potato - 8,Other World`. Restart Vite after updating `.env`.

Your current `WorldScheme` response is supported:

```json
{
  "size_x": 6,
  "size_y": 6,
  "islands": [
    {
      "id": 470,
      "name": "Cove_A_Tort",
      "position": {"grid":"A1", "gridX":0, "gridY":0, "relativeX":936341.75, "relativeY":725367.5, "worldX":959675.08, "worldY":748700.83,"rotation":6.2},
      "resources": {}, "animals": []
    }
  ]
}
```

The API does **not** need a separate `/worlds` index in this version.

### CORS is required for local development

Because Vite runs on `localhost:5173` and FastAPI on `127.0.0.1:8000`, add this middleware to your existing `backend/app/main.py` after `app = FastAPI()`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)
```

Without this, browser requests may fail even though Swagger `/docs` works.

### How coordinates are displayed

Leaflet uses non-geographic `CRS.Simple`, with each cell occupying 100 map units. The data source names x/y inconsistently, so placement uses `position.gridX/gridY` and raw `position.relativeX/relativeY` with modulo `grid_size` to resolve local position. `VITE_DEFAULT_GRID_SIZE` is used if `WorldScheme` doesn't expose `grid_size`.

For best accuracy and to support worlds with different cell sizes, add `grid_size` to `WorldScheme` and return it from the API. The map makes no assumption that the grid is always 6x6.

## Original map artwork

There was no original sea/island texture in the exported JSON. The included `public/assets/ocean-chart.svg` is a stylistic ocean background, and island polygons are approximate illustrations, **not accurate coastlines**. To replace the ocean layer with an actual map image, serve it from `frontend/public/maps/your-map.png` and return `image_url: "/maps/your-map.png"` in your World API response. Ensure the image covers the full grid and aligns with the cell boundaries.

## Files

- `src/App.tsx` — UI state and actions
- `src/components/layout/Sidebar.tsx` — island/resource list and search
- `src/components/layout/Inspector.tsx` — island detail panel
- `src/components/map/AtlasMap.tsx` — Leaflet map, grid, island markers
- `src/lib/worlds.ts` — data normalization and coordinate calculations
- `src/lib/api.ts` — live FastAPI data and demo fallback
- `public/demo/season-8.json` — lazy-loaded real reference island records

## Next improvements

- Explicit `grid_size`, `image_url`, and optional island shape data in backend response
- API `/worlds` list to discover worlds rather than environment-defined IDs
- Accurate island image or tile layers
- Route/nearest-islands algorithms and multiple resource optimization
- UI integration and end-to-end tests on your Windows machine
