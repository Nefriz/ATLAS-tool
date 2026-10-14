import { Compass, Search, X, MapPin, Gem, Waves, SlidersHorizontal, ArrowUpRight, Anchor } from 'lucide-react'
import type { Island, SidebarTab, World } from '../../types/world'

type Resource = { name: string, count: number }

interface Props {
  world: World
  search: string
  onSearch: (value: string) => void
  activeTab: SidebarTab
  onTab: (tab: SidebarTab) => void
  islands: Island[]
  resources: Resource[]
  selectedIslandId: number | null
  selectedResource: string | null
  onSelectIsland: (id: number) => void
  onSelectResource: (name: string | null) => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({ world, search, onSearch, activeTab, onTab, islands, resources, selectedIslandId, selectedResource, onSelectIsland, onSelectResource, mobileOpen, onCloseMobile }: Props) {
  return <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
    <div className="brand-row">
      <div className="brand-icon"><Compass size={26} strokeWidth={1.65} /></div>
      <div className="brand-wordmark"><strong>ATLAS</strong><span>WORLD EXPLORER</span></div>
      <button aria-label="Close menu" className="icon-button mobile-close" onClick={onCloseMobile}><X size={18}/></button>
    </div>

    <div className="sidebar-eyebrow"><span className="eyebrow-line"/> THE NAVIGATION DESK</div>
    <div className="search-box"><Search size={17} strokeWidth={1.8}/><input aria-label="Search islands or resources" placeholder={activeTab === 'islands' ? 'Search islands...' : 'Search resources...'} value={search} onChange={e => onSearch(e.target.value)}/>{search && <button aria-label="Clear search" onClick={() => onSearch('')}><X size={15}/></button>}</div>

    <div className="nav-tabs" role="tablist" aria-label="Explorer tools">
      <button role="tab" aria-selected={activeTab === 'islands'} className={`nav-tab ${activeTab === 'islands' ? 'nav-tab--active' : ''}`} onClick={() => { onTab('islands'); onSearch('') }}><MapPin size={17}/> Islands</button>
      <button role="tab" aria-selected={activeTab === 'resources'} className={`nav-tab ${activeTab === 'resources' ? 'nav-tab--active' : ''}`} onClick={() => { onTab('resources'); onSearch('') }}><Gem size={17}/> Resources</button>
    </div>

    <div className="sidebar-section-title"><div><SlidersHorizontal size={15}/><span>{activeTab === 'islands' ? 'ISLAND DIRECTORY' : 'RESOURCE INDEX'}</span></div><span className="count-label">{activeTab === 'islands' ? islands.length : resources.length}</span></div>
    <div className="sidebar-scroll">
      {activeTab === 'islands' ? <>
        {islands.length === 0 && <div className="empty-list"><Search size={22}/><strong>No islands found</strong><span>Try a different search or clear the resource filter.</span></div>}
        {islands.map(island => <button
          key={island.id}
          className={`island-list-item ${selectedIslandId === island.id ? 'island-list-item--active' : ''}`}
          onClick={() => { onSelectIsland(island.id); onCloseMobile() }}
        >
          <span className="island-thumb"><span className="island-thumb-land"/></span>
          <span className="island-list-copy"><strong>{island.name.replaceAll('_', ' ')}</strong><small>GRID {island.position.grid} <span className="small-dot">·</span> {Object.keys(island.resources).length} RESOURCES</small></span>
          <ArrowUpRight size={15} className="list-chevron"/>
        </button>)}
      </> : <>
        {selectedResource && <button className="active-filter" onClick={() => onSelectResource(null)}><Gem size={14}/> {selectedResource}<X size={14}/></button>}
        {resources.length === 0 && <div className="empty-list"><Search size={22}/><strong>No resources found</strong><span>Try another name.</span></div>}
        {resources.map(resource => <button
          key={resource.name}
          className={`resource-list-item ${selectedResource === resource.name ? 'resource-list-item--active' : ''}`}
          onClick={() => onSelectResource(selectedResource === resource.name ? null : resource.name)}
        >
          <span className="resource-symbol"><Gem size={15}/></span><span>{resource.name}</span><span className="resource-count">{resource.count}</span>
        </button>)}
      </>}
    </div>
    <div className="sidebar-bottom">
      <div className="sidebar-bottom-icon"><Waves size={21}/></div>
      <div><strong>CHART YOUR COURSE</strong><span>{world.size_x} × {world.size_y} world grid · {world.islands.length} islands</span></div>
      <Anchor size={16} className="sidebar-bottom-anchor" />
    </div>
  </aside>
}
