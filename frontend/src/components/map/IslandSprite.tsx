
import { useEffect, useRef, useState } from 'react'
import * as L from 'leaflet'
import { useMap } from 'react-leaflet'

import type { Island, World } from '../../types/world'
import { CELL_SIZE, islandMapPoint } from '../../lib/worlds'
import { getIslandImage } from '../../lib/islandImages'
import { ensureRotatedOverlay } from '../../lib/rotatedOverlay'
import { IslandFallback } from './IslandFallback'

interface Props {
    island: Island
    world: World
    selected: boolean
    dimmed: boolean
    onSelectIsland: (id: number) => void
}

function imageCorners(
    island: Island,
    world: World
): [L.LatLng, L.LatLng, L.LatLng] {
    const [cy, cx] = islandMapPoint(island, world)

    const width = island.width / world.grid_size * CELL_SIZE
    const height = island.height / world.grid_size * CELL_SIZE

    const angle = island.position.rotation * Math.PI / 180
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    const rotate = (dx: number, dy: number) =>
        L.latLng(
            cy + dx * sin + dy * cos,
            cx + dx * cos - dy * sin
        )

    return [
        rotate(-width / 2, height / 2),
        rotate(width / 2, height / 2),
        rotate(-width / 2, -height / 2),
    ]
}

function tooltipElement(island: Island): HTMLElement {
    const wrapper = document.createElement('div')
    wrapper.className = 'atlas-tooltip'

    const title = document.createElement('strong')
    title.textContent = island.name.replaceAll('_', ' ')

    const detail = document.createElement('span')
    detail.textContent =
        `${island.position.grid} · #${island.id}`

    wrapper.append(title, detail)

    return wrapper
}

export function IslandSprite({
                                 island,
                                 world,
                                 selected,
                                 dimmed,
                                 onSelectIsland,
                             }: Props) {
    const map = useMap()

    const overlayRef = useRef<L.ImageOverlay.Rotated | null>(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        setReady(false)

        let cancelled = false
        let overlay: L.ImageOverlay.Rotated | null = null

        Promise.all([
            getIslandImage(island.name),
            ensureRotatedOverlay(),
        ])
            .then(([url]) => {
                if (cancelled) return
                if (!url) {
                    console.warn(`Missing island image: ${island.name}`)
                    return
                }
                if (cancelled || !url) return;

                const [topLeft, topRight, bottomLeft] =
                    imageCorners(island, world)

                overlay = L.imageOverlay.rotated(
                    url,
                    topLeft,
                    topRight,
                    bottomLeft,
                    {
                        pane: 'atlas-island-images',
                        opacity: dimmed ? 0.13 : selected ? 1 : 0.94,
                        interactive: true,
                        alt: island.name,
                    }
                )

                overlay.bindTooltip(
                    tooltipElement(island),
                    {
                        direction: 'top',
                        offset: [0, -5],
                        opacity: 1,
                        sticky: true,
                    }
                )

                overlay.on('click', () => {
                    onSelectIsland(island.id)
                })

                overlay.addTo(map)

                overlayRef.current = overlay
                setReady(true)
            })
            .catch(error => {
                console.warn(
                    `Could not display image for ${island.name}`,
                    error
                )
            })

        return () => {
            cancelled = true

            if (overlay) {
                overlay.remove()
            }

            overlayRef.current = null
        }
    }, [map, island, world, onSelectIsland])

    useEffect(() => {
        overlayRef.current?.setOpacity(
            dimmed ? 0.13 : selected ? 1 : 0.94
        )
    }, [dimmed, selected, ready])

    if (ready) return null

    return (
        <IslandFallback
            island={island}
            world={world}
            selected={selected}
            dimmed={dimmed}
            onSelect={() => onSelectIsland(island.id)}
        />
    )
}

