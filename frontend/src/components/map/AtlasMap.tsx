
import { useEffect, useMemo, useState } from 'react'
import {
  CRS,
  divIcon,
  latLngBounds,
  type Map as LeafletMap,
} from 'leaflet'

import {
  ImageOverlay,
  MapContainer,
  Marker,
  Pane,
  Rectangle,
  useMap,
  useMapEvents,
} from 'react-leaflet'

import type { Island, World } from '../../types/world'
import {
  CELL_SIZE,
  gridName,
  islandMapPoint,
} from '../../lib/worlds'

import { IslandLayer } from './IslandLayer'

interface Props {
  world: World
  selectedIslandId: number | null
  onSelectIsland: (id: number) => void
  focusIslandId: number | null
  focusToken: number
  gridVisible: boolean
  onMapReady: (map: LeafletMap | null) => void
  onHover: (name: string) => void
  filterIds: Set<number>
  filtering: boolean
}

function Lifecycle({
                     world,
                     onMapReady,
                     onHover,
                   }: Pick<Props, 'world' | 'onMapReady' | 'onHover'>) {
  const map = useMapEvents({
    mousemove(event) {
      const x = Math.floor(event.latlng.lng / CELL_SIZE)

      const y = Math.floor(
          (world.size_y * CELL_SIZE - event.latlng.lat) / CELL_SIZE
      )

      const inside =
          x >= 0 &&
          x < world.size_x &&
          y >= 0 &&
          y < world.size_y

      onHover(inside ? gridName(x, y) : '—')
    },

    mouseout() {
      onHover('—')
    },
  })

  useEffect(() => {
    onMapReady(map)
    map.invalidateSize()

    map.fitBounds(
        [
          [0, 0],
          [world.size_y * CELL_SIZE, world.size_x * CELL_SIZE],
        ],
        {
          padding: [38, 38],
          animate: false,
        }
    )

    return () => onMapReady(null)
  }, [
    map,
    world.id,
    world.size_x,
    world.size_y,
    onMapReady,
  ])

  return null
}

function FocusIsland({
                       island,
                       world,
                       focusToken,
                     }: {
  island: Island | undefined
  world: World
  focusToken: number
}) {
  const map = useMap()

  useEffect(() => {
    if (!island || focusToken === 0) return

    map.flyTo(
        islandMapPoint(island, world),
        Math.max(map.getZoom(), 0.95),
        { duration: 0.65 }
    )
  }, [island, map, world, focusToken])

  return null
}

function GridLayer({ world }: { world: World }) {
  const [zoom, setZoom] = useState(0)

  const cells = useMemo(() => {
    const list: {
      name: string
      x: number
      y: number
    }[] = []

    for (let row = 0; row < world.size_y; row++) {
      for (let col = 0; col < world.size_x; col++) {
        list.push({
          name: gridName(col, row),
          x: col,
          y: row,
        })
      }
    }

    return list
  }, [world.size_x, world.size_y])

  const map = useMap()

  useMapEvents({
    zoomend() {
      setZoom(map.getZoom())
    },
  })

  return (
      <>
        {cells.map(cell => {
          const south = (
              world.size_y - cell.y - 1
          ) * CELL_SIZE

          return (
              <Rectangle
                  key={cell.name}
                  bounds={[
                    [south, cell.x * CELL_SIZE],
                    [
                      south + CELL_SIZE,
                      (cell.x + 1) * CELL_SIZE,
                    ],
                  ]}
                  pathOptions={{
                    color: '#b1d7ce',
                    weight: 0.8,
                    opacity: 0.22,
                    fill: false,
                  }}
                  interactive={false}
              />
          )
        })}

        {zoom > -1.45 && cells.map(cell => {
          const y = (
              world.size_y - cell.y - 0.5
          ) * CELL_SIZE

          const x = (cell.x + 0.5) * CELL_SIZE

          const icon = divIcon({
            className: 'atlas-cell-label-wrap',
            html: `<span class="atlas-cell-label">${cell.name}</span>`,
            iconSize: [46, 20],
            iconAnchor: [23, 10],
          })

          return (
              <Marker
                  key={cell.name}
                  position={[y, x]}
                  icon={icon}
                  interactive={false}
              />
          )
        })}
      </>
  )
}

export function AtlasMap({
                           world,
                           selectedIslandId,
                           onSelectIsland,
                           focusIslandId,
                           focusToken,
                           gridVisible,
                           onMapReady,
                           onHover,
                           filterIds,
                           filtering,
                         }: Props) {
  const bounds = useMemo(
      () => latLngBounds([
        [0, 0],
        [
          world.size_y * CELL_SIZE,
          world.size_x * CELL_SIZE,
        ],
      ]),
      [world.size_x, world.size_y]
  )

  const island = world.islands.find(
      item => item.id === focusIslandId
  )

  return (
      <MapContainer
          key={world.id}
          crs={CRS.Simple}
          center={[
            world.size_y * CELL_SIZE / 2,
            world.size_x * CELL_SIZE / 2,
          ]}
          zoom={0}
          minZoom={-4.5}
          maxZoom={3.25}
          zoomSnap={0.25}
          zoomDelta={0.5}
          scrollWheelZoom
          wheelPxPerZoomLevel={110}
          maxBounds={bounds.pad(0.3)}
          maxBoundsViscosity={0.8}
          zoomControl={false}
          attributionControl={false}
          preferCanvas
          className="atlas-leaflet-map"
      >
        <ImageOverlay
            url={world.image_url || '/assets/ocean-chart.svg'}
            bounds={bounds}
            opacity={1}
            interactive={false}
        />

        <Pane
            name="atlas-island-images"
            style={{ zIndex: 350 }}
        />

        <Lifecycle
            world={world}
            onMapReady={onMapReady}
            onHover={onHover}
        />

        {gridVisible && <GridLayer world={world} />}

        <IslandLayer
            world={world}
            selectedIslandId={selectedIslandId}
            onSelectIsland={onSelectIsland}
            filteredIds={filterIds}
            filtering={filtering}
        />

        <FocusIsland
            island={island}
            world={world}
            focusToken={focusToken}
        />
      </MapContainer>
  )
}
