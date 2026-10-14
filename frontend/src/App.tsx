import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import { AlertCircle, Compass, Grid2X2, Layers, MapPinned, Maximize, Menu, Minus, Plus, RefreshCw, Search, X } from 'lucide-react'
import { Sidebar } from './components/layout/Sidebar'
import { Inspector } from './components/layout/Inspector'
import { AtlasMap } from './components/map/AtlasMap'
import { aggregateResources, CELL_SIZE } from './lib/worlds'
import { autoConnect, defaultWorldId, loadWorld } from './lib/api'
import type { SidebarTab, World } from './types/world'

function App() {
  const [worldId, setWorldId] = useState(autoConnect ? defaultWorldId : 'demo')
  const [availableWorlds, setAvailableWorlds] = useState<string[]>([])
  const [world, setWorld] = useState<World | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<SidebarTab>('resources')
  const [selectedResource, setSelectedResource] = useState<string | null>(null)
  const [selectedIslandId, setSelectedIslandId] = useState<number | null>(null)
  const [focusIslandId, setFocusIslandId] = useState<number | null>(null)
  const [focusToken, setFocusToken] = useState(0)
  const [gridVisible, setGridVisible] = useState(true)
  const [hoverGrid, setHoverGrid] = useState('—')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const mapRef = useRef<LeafletMap | null>(null)

  // Ask FastAPI for the available world names once when the app starts.
  useEffect(() => {
    const controller = new AbortController()

    async function fetchWorlds() {
      try {
        const response = await fetch('/get_worlds', { signal: controller.signal })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data: unknown = await response.json()
        if (!Array.isArray(data) || !data.every(value => typeof value === 'string')) {
          throw new Error('/get_worlds must return a JSON array of strings')
        }

        setAvailableWorlds(data)
      } catch (err) {
        if (!controller.signal.aborted) console.error('Could not load worlds:', err)
      }
    }

    void fetchWorlds()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6500)
    setLoading(true)
    if (worldId !== 'demo') setError(null)
    loadWorld(worldId, controller.signal).then(next => {
      if (!active) return
      setWorld(next)
      if (next.origin === 'api') setError(null)
      setSelectedIslandId(null)
      setSelectedResource(null)
      setSearch('')
      setFocusToken(0)
      setLoading(false)
    }).catch(err => {
      if (!active) return
      if (controller.signal.aborted && err?.name === 'AbortError') {
        if (worldId !== 'demo') { setError('FastAPI connection timed out. Demo world loaded instead.'); setWorldId('demo') }
        else { setError('Demo data could not be loaded.'); setLoading(false) }
        return
      }
      if (worldId !== 'demo') {
        setError('FastAPI is unavailable. Showing reference map instead.')
        setWorldId('demo')
      } else { setError('Demo world could not be loaded.'); setLoading(false) }
    }).finally(() => clearTimeout(timeout))
    return () => { active = false; controller.abort(); clearTimeout(timeout) }
  }, [worldId, refreshKey])

  const allResources = useMemo(() => world ? aggregateResources(world.islands) : [], [world])
  const term = search.trim().toLowerCase()
  const filteredIslands = useMemo(() => world?.islands.filter(island => {
    const matchesResource = !selectedResource || Object.hasOwn(island.resources, selectedResource)
    const matchesText = activeTab !== 'islands' || !term || `${island.name} ${island.id} ${island.position.grid}`.toLowerCase().includes(term)
    return matchesResource && matchesText
  }).sort((a, b) => a.name.localeCompare(b.name)) ?? [], [world, selectedResource, term, activeTab])
  const filteredResources = allResources
  const filteredIds = useMemo(() => new Set(filteredIslands.map(x => x.id)), [filteredIslands])
  const selectedIsland = useMemo(() => world?.islands.find(island => island.id === selectedIslandId) ?? null, [world, selectedIslandId])

  const onMapReady = useCallback((map: LeafletMap | null) => { mapRef.current = map }, [])
  const onHover = useCallback((name: string) => { setHoverGrid(prev => prev === name ? prev : name) }, [])
  const selectIsland = useCallback((id: number) => {
    setSelectedIslandId(id)
    setFocusIslandId(id)
    setFocusToken(value => value + 1)
  }, [])
  const resetView = () => {
    if (!world) return
    mapRef.current?.fitBounds([[0, 0], [world.size_y * CELL_SIZE, world.size_x * CELL_SIZE]], { padding: [38, 38], animate: true })
  }
  const selectResource = (name: string | null) => {
    setSelectedResource(name)
    if (name) { setActiveTab('resources'); setSearch('') }
  }
  const clearSelection = () => { setSelectedIslandId(null); setFocusIslandId(null) }

  return <div className="atlas-app">
    <div className="top-hairline"/>
    {world && <Sidebar
      world={world} search={search} onSearch={setSearch} activeTab={activeTab} onTab={setActiveTab}
      islands={filteredIslands} resources={filteredResources} selectedIslandId={selectedIslandId}
      selectedResource={selectedResource} onSelectIsland={selectIsland} onSelectResource={selectResource}
      mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)}
    />}
    {mobileOpen && <button aria-label="Close menu" className="mobile-scrim" onClick={() => setMobileOpen(false)}/>}

    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left"><button className="icon-button menu-button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><div className="breadcrumb"><span>EXPLORER</span><span className="breadcrumb-separator">/</span><strong>WORLD MAP</strong></div></div>
        <div className="topbar-actions">
          <span className={`connection-state ${world?.origin === 'api' ? 'connection-state--online' : ''}`}>
            <span/>{world?.origin === 'api' ? 'API CONNECTED' : 'DEMO DATA'}
          </span>
          <span className="topbar-separator"/>
          <label className="world-picker">
            <Compass size={17}/>
            <select aria-label="Select world" value={worldId} onChange={e => { setError(null); setWorldId(e.target.value) }}>
              <option value="demo">Demo</option>
              {worldId !== 'demo' && !availableWorlds.includes(worldId) && (
                <option value={worldId}>{worldId}</option>
              )}
              {availableWorlds.filter(id => id !== 'demo').map(id => (
                <option value={id} key={id}>{id}</option>
              ))}
            </select>
            <span className="picker-chevron">⌄</span>
          </label>
        </div>
      </header>

      <div className="workspace">
        <section className="map-workspace" aria-label="Interactive Atlas world map">
          <div className="map-stage">
            {world && <AtlasMap world={world} selectedIslandId={selectedIslandId} onSelectIsland={selectIsland}
              focusIslandId={focusIslandId} focusToken={focusToken} gridVisible={gridVisible}
              onMapReady={onMapReady} onHover={onHover} filterIds={filteredIds}
              filtering={Boolean(selectedResource) || (activeTab === 'islands' && Boolean(term))}/>
            }
            {!world && <div className="map-loading"><Compass size={38}/><span>Loading nautical charts...</span></div>}
            {loading && world && <div className="map-loading map-loading--veil"><RefreshCw size={30} className="spin"/><span>Loading world...</span></div>}
            <div className="map-label-upper">
              <Compass size={15}/>
              ATLAS: {world?.name ?? worldId}</div>
            <div className="map-actions"><button aria-label="Zoom in" title="Zoom in" onClick={() => mapRef.current?.zoomIn(.5)}><Plus size={18}/></button><button aria-label="Zoom out" title="Zoom out" onClick={() => mapRef.current?.zoomOut(.5)}><Minus size={18}/></button><span className="tool-divider"/><button aria-label="Fit map" title="Fit entire map" onClick={resetView}><Maximize size={17}/></button><button aria-label="Toggle grid" title="Toggle grid" className={gridVisible ? 'tool-active' : ''} onClick={() => setGridVisible(value => !value)}><Grid2X2 size={17}/></button></div>
            {selectedResource && <div className="map-filter-tag"><Search size={13}/> {selectedResource} <span>· {filteredIslands.length} islands</span><button aria-label="Clear resource filter" onClick={() => selectResource(null)}><X size={13}/></button></div>}
            <div className="map-bottom-left"><span className="map-coordinate-mark">⌖</span> Grid <strong>{hoverGrid}</strong></div>
            <div className="map-bottom-right">SCROLL TO ZOOM <span>·</span> DRAG TO NAVIGATE</div>
          </div>
        </section>
        <Inspector island={selectedIsland} onClose={clearSelection} onLocate={() => selectedIslandId && selectIsland(selectedIslandId)} onResource={selectResource}/>
      </div>
      {(error || !world) && <div className="system-toast"><AlertCircle size={17}/><span>{error || 'Loading world...'}</span><button aria-label="Dismiss notice" onClick={() => setError(null)}><X size={16}/></button></div>}
    </main>
    <div className="small-screen-bottom"><button onClick={() => setMobileOpen(true)}><Layers size={18}/> Explore</button><button onClick={resetView}><MapPinned size={18}/> Map</button><button onClick={() => {setWorldId(defaultWorldId);setRefreshKey(n => n + 1)}}><RefreshCw size={18}/> Connect</button></div>
  </div>
}

export default App
