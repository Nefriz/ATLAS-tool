import { X, Compass, MapPin, Layers3, Gem, PawPrint, Copy, Check, LocateFixed, Waves, Flag, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import type { Island } from '../../types/world'

interface Props {
  island: Island | null
  onClose: () => void
  onLocate: () => void
  onResource: (name: string) => void
}

export function Inspector({ island, onClose, onLocate, onResource }: Props) {
  const [copied, setCopied] = useState(false)
  if (!island) return <aside className="inspector inspector--empty">
    <div className="inspector-topline"><span>ISLAND INTELLIGENCE</span><Compass size={17}/></div>
    <div className="inspector-placeholder-art"><div className="inspector-orbit orbit-one"/><div className="inspector-orbit orbit-two"/><Compass size={62} strokeWidth={.75}/></div>
    <div className="inspector-placeholder-content"><span className="mini-rule"/><strong>No island selected</strong><p>Choose an island on the chart to explore its resources, wildlife and coordinates.</p><small>YOUR VOYAGE STARTS HERE</small></div>
    <div className="inspector-empty-footer"><Waves size={18}/> EXPLORE THE UNKNOWN</div>
  </aside>

  const resources = Object.entries(island.resources).sort(([a], [b]) => a.localeCompare(b))
  const copyCoordinates = async () => {
    const value = `${island.position.worldX}, ${island.position.worldY}`
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { setCopied(false) }
  }

  return <aside className="inspector">
    <div className="inspector-topline"><span>ISLAND INTELLIGENCE</span><button aria-label="Close island details" className="icon-button" onClick={onClose}><X size={18}/></button></div>
    <div className="island-hero"><div className="island-hero-lines"/><div className="island-hero-ground"><div className="island-hero-core"/></div><span className="island-hero-watermark">ATLAS · CARTOGRAPHY DEPT.</span><span className="island-hero-index">#{island.id}</span></div>
    <div className="inspector-scroll">
      <div className="inspector-kicker"><span className="status-dot"/>{island.homeServer ? 'FREEPORT ISLAND' : island.isControlPoint ? 'CONTROL POINT' : 'DISCOVERED ISLAND'} <span>· GRID {island.position.grid}</span></div>
      <h2 className="inspector-island-title">{island.name.replaceAll('_', ' ')}</h2>
      <p className="inspector-subtitle">World island · ID {island.id}</p>
      <div className="inspector-actions"><button className="primary-button" onClick={onLocate}><LocateFixed size={16}/> Locate on map <ArrowUpRight size={15}/></button><button className="secondary-button" onClick={copyCoordinates} title="Copy game coordinates" aria-label="Copy world coordinates">{copied ? <Check size={17}/> : <Copy size={17}/>}</button></div>

      <div className="inspector-divider"/>
      <div className="section-heading"><MapPin size={15}/><span>COORDINATES</span></div>
      <div className="coordinate-grid"><div><span>WORLD X</span><strong>{island.position.worldX.toLocaleString('en-US', { maximumFractionDigits: 1 })}</strong></div><div><span>WORLD Y</span><strong>{island.position.worldY.toLocaleString('en-US', { maximumFractionDigits: 1 })}</strong></div></div>
      <div className="coordinate-meta"><span><Layers3 size={13}/> Sector {island.position.grid}</span><span><Compass size={13}/> {Math.round(island.position.rotation)}°</span></div>

      <div className="inspector-divider"/>
      <div className="section-heading"><Gem size={15}/><span>AVAILABLE RESOURCES</span><span className="section-count">{resources.length}</span></div>
      {resources.length ? <div className="resource-chips">{resources.map(([name]) => <button key={name} onClick={() => onResource(name)} title={`Filter map by ${name}`}><Gem size={12}/>{name}</button>)}</div> : <p className="muted-copy">No resources recorded for this island.</p>}

      <div className="inspector-divider"/>
      <div className="section-heading"><PawPrint size={15}/><span>WILDLIFE</span><span className="section-count">{island.animals.length}</span></div>
      {island.animals.length ? <div className="wildlife-list">{island.animals.slice(0, 14).map((animal, i) => <span key={`${animal}-${i}`}>{animal}</span>)}{island.animals.length > 14 && <span>+{island.animals.length - 14} more</span>}</div> : <p className="muted-copy">No wildlife data available.</p>}
      {island.biomes.length > 0 && <><div className="inspector-divider"/><div className="section-heading"><Flag size={15}/><span>BIOMES</span></div><p className="muted-copy">{island.biomes.join(' · ')}</p></>}
    </div>
  </aside>
}
