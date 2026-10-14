import { normalizeWorld } from './worlds'
import type { World } from '../types/world'

const BASE_URL = import.meta.env.PROD
    ? ''
    : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
const configuredWorlds = (import.meta.env.VITE_WORLD_IDS || 'Potato - 8').split(',').map((x: string) => x.trim()).filter(Boolean)

export const worldChoices = [
  ...configuredWorlds.map((id: string) => ({ id, label: id, type: 'api' as const })),
  { id: 'demo', label: 'Season 8 · Demo', type: 'demo' as const },
]

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error(`HTTP ${response.status} — ${response.statusText}`)
  return response.json()
}

export async function loadWorld(id: string, signal?: AbortSignal): Promise<World> {
  if (id === 'demo') {
    const data = await getJson('/demo/season-8.json', signal)
    return normalizeWorld(data, 'season-8', 'demo')
  }
  const data = await getJson(`${BASE_URL}/worlds/${encodeURIComponent(id)}`, signal)
  return normalizeWorld(data, id, 'api')
}

export const defaultWorldId = configuredWorlds[0] || 'demo'
export const autoConnect = import.meta.env.VITE_AUTO_CONNECT !== 'false'
