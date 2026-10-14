
import { CircleMarker } from 'react-leaflet'

import type { World } from '../../types/world'
import { islandMapPoint } from '../../lib/worlds'
import { IslandSprite } from './IslandSprite'

interface Props {
    world: World
    selectedIslandId: number | null
    onSelectIsland: (id: number) => void
    filteredIds: Set<number>
    filtering: boolean
}

export function IslandLayer({
                                world,
                                selectedIslandId,
                                onSelectIsland,
                                filteredIds,
                                filtering,
                            }: Props) {
    const selectedIsland = world.islands.find(
        island => island.id === selectedIslandId
    )

    return (
        <>
            {world.islands.map(island => {
                const selected = island.id === selectedIslandId
                const included = filteredIds.has(island.id)
                const dimmed = filtering && !included && !selected

                return (
                    <IslandSprite
                        key={island.id}
                        island={island}
                        world={world}
                        selected={selected}
                        dimmed={dimmed}
                        onSelectIsland={onSelectIsland}
                    />
                )
            })}

            {world.islands.map(island => {
                const selected = island.id === selectedIslandId
                const included = filteredIds.has(island.id)
                const dimmed = filtering && !included && !selected

                return (
                    <CircleMarker
                        key={`pin-${island.id}`}
                        center={islandMapPoint(island, world)}
                        radius={
                            selected ? 5
                                : filtering && included ? 4.1 : 2.6
                        }
                        pathOptions={{
                            color: selected
                                ? '#ffdda1'
                                : filtering && included
                                    ? '#b3dca8'
                                    : '#edebd3',
                            weight: selected ? 2.2 : 1,
                            fillColor: selected ? '#f8c979' : '#d6dfbb',
                            fillOpacity: dimmed ? 0.1 : 0.94,
                            opacity: dimmed ? 0.13 : 1,
                        }}
                        eventHandlers={{
                            click: () => onSelectIsland(island.id),
                        }}
                    />
                )
            })}

            {selectedIsland && (
                <CircleMarker
                    center={islandMapPoint(selectedIsland, world)}
                    radius={19}
                    pathOptions={{
                        color: '#eac185',
                        weight: 1.5,
                        opacity: 0.88,
                        fill: false,
                        dashArray: '4 5',
                    }}
                    interactive={false}
                />
            )}
        </>
    )
}
