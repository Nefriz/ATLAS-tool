import { useMemo, useState } from 'react'
import {
  Anchor,
  ChevronDown,
  Compass,
  Gem,
  PawPrint,
  Search,
  SlidersHorizontal,
  Waves,
  X,
} from 'lucide-react'

import type { SidebarTab, World } from '../../types/world'
import { groupResources } from '../../lib/resourceGroups'

type Resource = {
  name: string
  count: number
}

interface Props {
  world: World
  search: string
  onSearch: (value: string) => void
  activeTab: SidebarTab
  onTab: (tab: SidebarTab) => void
  resources: Resource[]
  animals: string[]
  selectedResource: string | null
  selectedAnimal: string | null
  onSelectResource: (name: string | null) => void
  onSelectAnimal: (name: string | null) => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

const CATEGORY_ICONS: Record<string, string> = {
  Berry: '🍓',
  Coal: '🪨',
  Coral: '🪸',
  Crystal: '💎',
  Fibers: '🌾',
  Flint: '🪨',
  Gem: '💠',
  Hide: '🐑',
  Keratinoid: '🐚',
  Metal: '⛏️',
  Oil: '🛢️',
  Salt: '🧂',
  Stone: '🪨',
  Sugar: '🍯',
  Thatch: '🌿',
  Wood: '🌲',
  'Cooking Herbs': '🌿',
  'Medicinal Herbs': '🌱',
  Fruits: '🍎',
  'Wild Vegetables': '🥕',
  'Cultivated Vegetables': '🥬',
  Other: '📦',
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/_/g, ' ')
}

export function Sidebar({
  world,
  search,
  onSearch,
  activeTab,
  onTab,
  resources,
  animals,
  selectedResource,
  selectedAnimal,
  onSelectResource,
  onSelectAnimal,
  mobileOpen,
  onCloseMobile,
}: Props) {
  const [expanded, setExpanded] = useState<string[]>([])
  const term = normalize(search)

  const groups = useMemo(() => {
    return groupResources(resources)
      .map(group => ({
        ...group,
        resources: normalize(group.name).includes(term)
          ? group.resources
          : group.resources.filter(resource =>
              normalize(resource.name).includes(term)
            ),
      }))
      .filter(group => group.resources.length > 0)
  }, [resources, term])

  const filteredAnimals = useMemo(() => {
    return animals
      .filter(animal => normalize(animal).includes(term))
      .sort((a, b) => a.localeCompare(b))
  }, [animals, term])

  function changeTab(tab: SidebarTab) {
    if (tab === activeTab) return
    onTab(tab)
    onSearch('')
  }

  function toggleGroup(name: string) {
    setExpanded(previous =>
      previous.includes(name)
        ? previous.filter(item => item !== name)
        : [...previous, name]
    )
  }

  function selectResource(name: string) {
    onSelectResource(selectedResource === name ? null : name)
    onCloseMobile()
  }

  function selectAnimal(name: string) {
    onSelectAnimal(selectedAnimal === name ? null : name)
    onCloseMobile()
  }

  return (
    <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
      <div className="brand-row">
        <div className="brand-icon">
          <Compass size={26} strokeWidth={1.65} />
        </div>
        <div className="brand-wordmark">
          <strong>ATLAS</strong>
          <span>WORLD EXPLORER</span>
        </div>
        <button
          type="button"
          aria-label="Close menu"
          className="icon-button mobile-close"
          onClick={onCloseMobile}
        >
          <X size={18} />
        </button>
      </div>

      <div className="sidebar-eyebrow">
        <span className="eyebrow-line" />
        THE NAVIGATION DESK
      </div>

      <div className="search-box">
        <Search size={17} />
        <input
          type="search"
          aria-label={activeTab === 'animals' ? 'Search animals' : 'Search resources'}
          placeholder={activeTab === 'animals' ? 'Search animals...' : 'Search resources or types...'}
          value={search}
          onChange={event => onSearch(event.target.value)}
        />
        {search && (
          <button type="button" onClick={() => onSearch('')} aria-label="Clear search">
            <X size={15} />
          </button>
        )}
      </div>

      <div className="nav-tabs" role="tablist" aria-label="Explorer tools">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'resources'}
          className={`nav-tab ${activeTab === 'resources' ? 'nav-tab--active' : ''}`}
          onClick={() => changeTab('resources')}
        >
          <Gem size={17} />
          Resources
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'animals'}
          className={`nav-tab ${activeTab === 'animals' ? 'nav-tab--active' : ''}`}
          onClick={() => changeTab('animals')}
        >
          <PawPrint size={17} />
          Animals
        </button>
      </div>

      <div className="sidebar-section-title">
        <div>
          <SlidersHorizontal size={15} />
          <span>{activeTab === 'animals' ? 'ANIMAL INDEX' : 'RESOURCE INDEX'}</span>
        </div>
      </div>

      <div className="sidebar-scroll">
        {activeTab === 'resources' ? (
          <>
            {selectedResource && (
              <button
                type="button"
                className="active-filter"
                onClick={() => onSelectResource(null)}
              >
                {selectedResource}
                <X size={14} />
              </button>
            )}

            <div className="atlas-resource-groups">
              {groups.map(group => {
                const isOpen =
                  term.length > 0 ||
                  expanded.includes(group.name) ||
                  group.resources.some(resource => resource.name === selectedResource)

                return (
                  <div key={group.name} className="atlas-category">
                    <button
                      type="button"
                      className="atlas-category-header"
                      aria-expanded={isOpen}
                      onClick={() => toggleGroup(group.name)}
                    >
                      <span className="atlas-category-icon">
                        {CATEGORY_ICONS[group.name] ?? '📦'}
                      </span>
                      <span className="atlas-category-name">{group.name}</span>
                      <ChevronDown
                        size={16}
                        className={`atlas-category-chevron ${isOpen ? 'is-open' : ''}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="atlas-category-items">
                        {group.resources.map(resource => (
                          <button
                            type="button"
                            key={resource.name}
                            className={`atlas-resource-row ${selectedResource === resource.name ? 'is-selected' : ''}`}
                            onClick={() => selectResource(resource.name)}
                          >
                            <span className="atlas-resource-dot" />
                            <span className="atlas-resource-name">{resource.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {groups.length === 0 && (
                <div className="empty-list">
                  <Search size={22} />
                  <strong>No resources found</strong>
                  <span>Try another search.</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {selectedAnimal && (
              <button
                type="button"
                className="active-filter"
                onClick={() => onSelectAnimal(null)}
              >
                <PawPrint size={14} />
                {selectedAnimal}
                <X size={14} />
              </button>
            )}

            <div className="atlas-resource-groups">
              {filteredAnimals.map(animal => (
                <button
                  type="button"
                  key={animal}
                  className={`atlas-animal-row ${selectedAnimal === animal ? 'is-selected' : ''}`}
                  onClick={() => selectAnimal(animal)}
                >
                  <PawPrint size={17} />
                  <span>{animal}</span>
                </button>
              ))}
              {filteredAnimals.length === 0 && (
                <div className="empty-list">
                  <Search size={22} />
                  <strong>No animals found</strong>
                  <span>Try another search or check world data.</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-bottom-icon"><Waves size={21} /></div>
        <div>
          <strong>CHART YOUR COURSE</strong>
          <span>{world.size_x} × {world.size_y} world grid</span>
        </div>
        <Anchor size={16} className="sidebar-bottom-anchor" />
      </div>
    </aside>
  )
}
