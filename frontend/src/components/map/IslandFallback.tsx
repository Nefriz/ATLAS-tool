
import { useMemo } from 'react'
import { Polygon, Tooltip } from 'react-leaflet'

import type { Island, World } from '../../types/world'
import { CELL_SIZE, islandMapPoint } from '../../lib/worlds'

interface Props {
    island: Island
    world: World
    selected: boolean
    dimmed: boolean
    onSelect: () => void
}

function coastline(
    island: Island,
    world: World
): [number, number][] {
    const [cy, cx] = islandMapPoint(island, world)

    const maxRadius = CELL_SIZE * 0.22

    const radiusX = Math.max(
        3.8,
        Math.min(
            maxRadius,
            island.width / world.grid_size * CELL_SIZE * 0.5
        )
    )

    const radiusY = Math.max(
        3.5,
        Math.min(
            maxRadius,
            island.height / world.grid_size * CELL_SIZE * 0.5
        )
    )

    const rotation = island.position.rotation * Math.PI / 180
    const points: [number, number][] = []

    for (let i = 0; i < 16; i++) {
        const angle = i / 16 * Math.PI * 2

        const variance =
            0.83 +
            0.17 * Math.sin(island.id * 2.2 + i * 9.31) +
            0.08 * Math.cos(i * 3 + island.id)

        const dx = Math.cos(angle) * radiusX * variance
        const dy = Math.sin(angle) * radiusY * variance

        points.push([
            cy + dx * Math.sin(rotation) + dy * Math.cos(rotation),
            cx + dx * Math.cos(rotation) - dy * Math.sin(rotation),
        ])
    }

    return points
}

function colorFor(island: Island): string {
    if (island.homeServer) return '#b5a67d'

    const biomes = island.biomes.join(' ').toLowerCase()

    if (
        biomes.includes('arctic') ||
        biomes.includes('tundra') ||
        biomes.includes('polar')
    ) return '#88a7a5'

    if (
        biomes.includes('desert') ||
        biomes.includes('temperate')
    ) return '#c4aa73'

    if (island.isControlPoint) return '#a89b78'

    return '#93aa81'
}

export function IslandFallback({
                                   island,
                                   world,
                                   selected,
                                   dimmed,
                                   onSelect,
                               }: Props) {
    const points = useMemo(
        () => coastline(island, world),
        [island, world]
    )

    return (
        <Polygon
            positions={points}
            pathOptions={{
                color: selected ? '#f7d58d' : '#b0bd99',
                opacity: dimmed ? 0.12 : 0.82,
                weight: selected ? 2.4 : 1.3,
                fillColor: colorFor(island),
                fillOpacity: dimmed
                    ? 0.11
                    : selected ? 0.91 : 0.75,
            }}
            eventHandlers={{ click: onSelect }}
        >
            <Tooltip
                direction="top"
                offset={[0, -5]}
                opacity={1}
                sticky
            >
                <div className="atlas-tooltip">
                    <strong>
                        {island.name.replaceAll('_', ' ')}
                    </strong>
                    <span>
            {island.position.grid} · #{island.id}
          </span>
                </div>
            </Tooltip>
        </Polygon>
    )
}
