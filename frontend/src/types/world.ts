export interface Position {
  grid: string
  gridX: number
  gridY: number
  worldX: number
  worldY: number
  relativeX: number
  relativeY: number
  rotation: number
}

export interface Island {
  id: number
  name: string
  position: Position
  resources: Record<string, number>
  animals: string[]
  biomes: string[]
  width: number
  height: number
  isControlPoint: boolean
  homeServer: boolean
}

export interface World {
  id: string
  name: string
  size_x: number
  size_y: number
  grid_size: number
  grid_offset: number
  image_url?: string
  islands: Island[]
  origin: 'api' | 'demo'
}

export type SidebarTab = 'islands' | 'resources'
