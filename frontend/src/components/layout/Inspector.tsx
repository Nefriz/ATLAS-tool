import {
  X, Compass, Gem, PawPrint,
  LocateFixed, Waves, Flag, ArrowUpRight,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Island } from '../../types/world'
import { getIslandImage } from '../../lib/islandImages'

interface Props {
  island: Island | null
  onClose: () => void
  onLocate: () => void
  onResource: (name: string) => void
}

// Uses the same real island sprite as the map.
function IslandHero({ island }: { island: Island }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setImageUrl(null)

    void getIslandImage(island.name).then(url => {
      if (active) setImageUrl(url)
    })

    return () => { active = false }
  }, [island.name])

  return (
    <div className="island-hero">
      <div className="island-hero-lines" />
      {imageUrl ? (
        <img
          className="island-hero-image"
          src={imageUrl}
          alt={`Island ${island.name.replaceAll('_', ' ')}`}
        />
      ) : (
        <div className="island-hero-ground">
          <div className="island-hero-core" />
        </div>
      )}
      <span className="island-hero-watermark">ATLAS · CARTOGRAPHY DEPT.</span>
      <span className="island-hero-index">#{island.id}</span>
    </div>
  )
}

export function Inspector({ island, onClose, onLocate, onResource }: Props) {
  if (!island) {
    return (
      <aside className="inspector inspector--empty">
        <div className="inspector-topline">
          <span>ISLAND INTELLIGENCE</span>
          <Compass size={17} />
        </div>
        <div className="inspector-placeholder-art">
          <div className="inspector-orbit orbit-one" />
          <div className="inspector-orbit orbit-two" />
          <Compass size={62} strokeWidth={0.75} />
        </div>
        <div className="inspector-placeholder-content">
          <span className="mini-rule" />
          <strong>No island selected</strong>
          <p>Choose an island on the chart to explore its resources and wildlife.</p>
          <small>YOUR VOYAGE STARTS HERE</small>
        </div>
        <div className="inspector-empty-footer"><Waves size={18} /> EXPLORE THE UNKNOWN</div>
      </aside>
    )
  }

  const resources = Object.entries(island.resources).sort(([a], [b]) => a.localeCompare(b))


  return (
    <aside className="inspector">
      <div className="inspector-topline">
        <span>ISLAND INTELLIGENCE</span>
        <button aria-label="Close island details" className="icon-button" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* The illustration now scrolls together with the text below. */}
      <div className="inspector-scroll" key={island.id}>
        <IslandHero island={island} key={island.name} />

        <div className="inspector-kicker">
          <span className="status-dot" />
          {island.homeServer ? 'FREEPORT ISLAND' : island.isControlPoint ? 'CONTROL POINT' : 'DISCOVERED ISLAND'}
          <span>· GRID {island.position.grid}</span>
        </div>
        <h2 className="inspector-island-title">{island.name.replaceAll('_', ' ')}</h2>
        <p className="inspector-subtitle">World island · ID {island.id}</p>
        <div className="inspector-actions">
          <button className="primary-button" onClick={onLocate}>
            <LocateFixed size={16} /> Locate on map <ArrowUpRight size={15} />
          </button>

        </div>

        <div className="inspector-divider" />
        <div className="section-heading">
          <Gem size={15} /><span>AVAILABLE RESOURCES</span>
          <span className="section-count">{resources.length}</span>
        </div>
        {resources.length ? (
          <div className="resource-chips">
            {resources.map(([name]) => (
              <button key={name} onClick={() => onResource(name)} title={`Filter map by ${name}`}>
                <Gem size={12} />{name}
              </button>
            ))}
          </div>
        ) : <p className="muted-copy">No resources recorded for this island.</p>}

        <div className="inspector-divider" />
        <div className="section-heading">
          <PawPrint size={15} /><span>WILDLIFE</span>
          <span className="section-count">{island.animals.length}</span>
        </div>
        {island.animals.length ? (
          <div className="wildlife-list">
            {island.animals.slice(0, 14).map((animal, i) => (
              <span key={`${animal}-${i}`}>{animal}</span>
            ))}
            {island.animals.length > 14 && <span>+{island.animals.length - 14} more</span>}
          </div>
        ) : <p className="muted-copy">No wildlife data available.</p>}

        {island.biomes.length > 0 && (
          <>
            <div className="inspector-divider" />
            <div className="section-heading"><Flag size={15} /><span>BIOMES</span></div>
            <p className="muted-copy">{island.biomes.join(' · ')}</p>
          </>
        )}
      </div>
    </aside>
  )
}
