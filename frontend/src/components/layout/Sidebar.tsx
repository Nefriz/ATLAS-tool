
import { useMemo, useState } from 'react'
import {
  Anchor,
  ChevronDown,
  Compass,
  Search,
  SlidersHorizontal,
  Waves,
  X,
} from 'lucide-react'

import type { Island, SidebarTab, World } from '../../types/world'
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
  islands: Island[]
  resources: Resource[]
  selectedIslandId: number | null
  selectedResource: string | null
  onSelectIsland: (id: number) => void
  onSelectResource: (name: string | null) => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

// Icons for resource categories
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
                          resources,
                          selectedResource,
                          onSelectResource,
                          mobileOpen,
                          onCloseMobile,
                        }: Props) {
  const [expanded, setExpanded] = useState<string[]>([])

  const term = normalize(search)

  // Group resources first, then filter categories and resource names.
  const groups = useMemo(() => {
    return groupResources(resources)
        .map(group => {
          const categoryMatches =
              normalize(group.name).includes(term)

          const matchingResources = categoryMatches
              ? group.resources
              : group.resources.filter(resource =>
                  normalize(resource.name).includes(term)
              )

          return {
            ...group,
            resources: matchingResources,
          }
        })
        .filter(group => group.resources.length > 0)
  }, [resources, term])

  function toggleGroup(name: string) {
    setExpanded(previous =>
        previous.includes(name)
            ? previous.filter(item => item !== name)
            : [...previous, name]
    )
  }

  function selectResource(name: string) {
    onSelectResource(
        selectedResource === name ? null : name
    )
    onCloseMobile()
  }

  return (
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="brand-row">
          <div className="brand-icon">
            <Compass size={26} strokeWidth={1.65}/>
          </div>

          <div className="brand-wordmark">
            <strong>ATLAS</strong>
            <span>WORLD EXPLORER</span>
          </div>

          <button
              aria-label="Close menu"
              className="icon-button mobile-close"
              onClick={onCloseMobile}
          >
            <X size={18}/>
          </button>
        </div>

        <div className="sidebar-eyebrow">
          <span className="eyebrow-line"/>
          RESOURCE EXPLORER
        </div>

        <div className="search-box">
          <Search size={17}/>

          <input
              type="text"
              placeholder="Search resources or types..."
              value={search}
              onChange={event => onSearch(event.target.value)}
              aria-label="Search resources"
          />

          {search && (
              <button
                  onClick={() => onSearch('')}
                  aria-label="Clear search"
              >
                <X size={15}/>
              </button>
          )}
        </div>

        <div className="sidebar-section-title">
          <div>
            <SlidersHorizontal size={15}/>
            <span>RESOURCE INDEX</span>
          </div>
        </div>

        <div className="sidebar-scroll">
          {selectedResource && (
              <button
                  className="active-filter"
                  onClick={() => onSelectResource(null)}
              >
                {selectedResource}
                <X size={14}/>
              </button>
          )}

          <div className="atlas-resource-groups">
            {groups.map(group => {
              // Show matching resources automatically during search
              const isOpen =
                  term.length > 0 ||
                  expanded.includes(group.name) ||
                  group.resources.some(
                      item => item.name === selectedResource
                  )

              return (
                  <div
                      key={group.name}
                      className="atlas-category"
                  >
                    <button
                        type="button"
                        className="atlas-category-header"
                        onClick={() => toggleGroup(group.name)}
                        aria-expanded={isOpen}
                    >
                                    <span className="atlas-category-icon">
                                        {CATEGORY_ICONS[group.name] ?? '📦'}
                                    </span>

                      <span className="atlas-category-name">
                                        {group.name}
                                    </span>

                      <ChevronDown
                          size={16}
                          className={
                            `atlas-category-chevron ${
                                isOpen ? 'is-open' : ''
                            }`
                          }
                      />
                    </button>

                    {isOpen && (
                        <div className="atlas-category-items">
                          {group.resources.map(resource => (
                              <button
                                  type="button"
                                  key={resource.name}
                                  className={
                                    `atlas-resource-row ${
                                        selectedResource === resource.name
                                            ? 'is-selected'
                                            : ''
                                    }`
                                  }
                                  onClick={() =>
                                      selectResource(resource.name)
                                  }
                              >
                                <span className="atlas-resource-dot"/>

                                <span className="atlas-resource-name">
                                                    {resource.name}
                                                </span>
                              </button>
                          ))}
                        </div>
                    )}
                  </div>
              )
            })}

            {groups.length === 0 && (
                <div className="empty-list">
                  <Search size={22}/>
                  <strong>No resources found</strong>
                  <span>Try another search.</span>
                </div>
            )}
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-bottom-icon">
            <Waves size={21}/>
          </div>

          <div>
            <strong>CHART YOUR COURSE</strong>
            <span>
                        {world.size_x} × {world.size_y} world grid
                    </span>
          </div>

          <Anchor
              size={16}
              className="sidebar-bottom-anchor"
          />
        </div>
      </aside>
  )
}
