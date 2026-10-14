import type { Island, Position, World } from '../types/world'

type JsonRecord = Record<string, unknown>

const asRecord = (value: unknown): JsonRecord =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonRecord
    : {}

const n = (value: unknown, fallback = 0): number => {
  const result = Number(value)
  return Number.isFinite(result) ? result : fallback
}

const text = (value: unknown, fallback = ''): string =>
  typeof value === 'string' && value.trim() ? value : fallback

export function parseGrid(grid: string): [number, number] {
  const match = /^([A-Z])([1-9][0-9]*)$/.exec(grid.toUpperCase())
  if (!match) return [0, 0]
  return [match[1].charCodeAt(0) - 65, Number(match[2]) - 1]
}

function normalizeIsland(value: unknown, defaultId: number): Island {
  const o = asRecord(value)
  const p = asRecord(o.position)
  const grid = text(p.grid, text(o.grid, 'A1')).toUpperCase()
  const [calculatedX, calculatedY] = parseGrid(grid)
  const relativeX = n(p.relativeX, n(o.worldX))
  const relativeY = n(p.relativeY, n(o.worldY))
  const position: Position = {
    grid,
    gridX: n(p.gridX, calculatedX),
    gridY: n(p.gridY, calculatedY),
    worldX: n(p.worldX, n(o.worldX)),
    worldY: n(p.worldY, n(o.worldY)),
    relativeX,
    relativeY,
    rotation: n(p.rotation, n(o.rotation)),
  }

  const resources: Record<string, number> = {}
  for (const [key, value] of Object.entries(asRecord(o.resources))) {
    const count = Number(value)
    if (Number.isFinite(count) && count > 0) resources[key] = count
  }

  return {
    id: n(o.id, defaultId),
    name: text(o.name, `Island ${defaultId}`),
    position,
    resources,
    animals: Array.isArray(o.animals) ? o.animals.filter((x): x is string => typeof x === 'string' && x.length > 0) : [],
    biomes: Array.isArray(o.biomes) ? o.biomes.filter((x): x is string => typeof x === 'string' && x.length > 0) : [],
    width: n(o.width, n(o.islandWidth, 240000)),
    height: n(o.height, n(o.islandHeight, 240000)),
    isControlPoint: o.isControlPoint === true,
    homeServer: o.homeServer === true,
  }
}

export function normalizeWorld(raw: unknown, id: string, origin: 'api' | 'demo'): World {
  const o = asRecord(raw)
  const rawIslands = o.islands
  const items: unknown[] = Array.isArray(rawIslands)
    ? rawIslands
    : Object.values(asRecord(rawIslands))
  const islands = items.map((island, i) => normalizeIsland(island, i + 1))
  const gridSizeFromEnv = n(import.meta.env.VITE_DEFAULT_GRID_SIZE, 1_400_000)
  const grid_size = n(o.grid_size, n(o.GridSize, gridSizeFromEnv))
  const config = asRecord(o.config)

  const maxX = islands.length ? Math.max(...islands.map(x => x.position.gridX)) + 1 : 1
  const maxY = islands.length ? Math.max(...islands.map(x => x.position.gridY)) + 1 : 1

  const size_x = n(o.size_x, n(o.ServersX, n(config.ServersX, maxX)))
  const size_y = n(o.size_y, n(o.ServersY, n(config.ServersY, maxY)))
  if (size_x <= 0 || size_y <= 0 || size_x > 26 || size_y > 26) {
    throw new Error('Unsupported world grid dimensions')
  }
  return {
    id, name: text(o.name, id), size_x, size_y,
    grid_size: grid_size > 0 ? grid_size : 1_400_000,
    grid_offset: n(o.grid_offset, n(config.GridOffset)),
    image_url: text(o.image_url, text(o.map_image)) || undefined,
    islands: islands.filter(island => island.position.gridX < size_x && island.position.gridY < size_y),
    origin,
  }
}

const tileSize = 100
export const CELL_SIZE = tileSize

function localFraction(value: number, gridSize: number): number {
  // Accepts source formats where worldX/Y are either local or absolute.
  // The user's Python PositionScheme keeps raw source X/Y in relativeX/Y.
  const modulo = ((value % gridSize) + gridSize) % gridSize
  return Math.min(0.97, Math.max(0.03, modulo / gridSize))
}

export function islandMapPoint(island: Island, world: World): [number, number] {
  const { gridX, gridY, relativeX, relativeY } = island.position
  const x = (gridX + localFraction(relativeX, world.grid_size)) * tileSize
  const y = (world.size_y - gridY - localFraction(relativeY, world.grid_size)) * tileSize
  return [y, x]
}

export function aggregateResources(islands: Island[]) {
  const counts = new Map<string, number>()
  for (const island of islands) {
    for (const resource of Object.keys(island.resources)) {
      counts.set(resource, (counts.get(resource) ?? 0) + 1)
    }
  }
  return [...counts].map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function gridName(col: number, row: number) {
  return `${String.fromCharCode(65 + col)}${row + 1}`
}
