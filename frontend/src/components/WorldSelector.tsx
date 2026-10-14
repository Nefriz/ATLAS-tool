
import { useEffect, useState } from 'react'

interface WorldSelectorProps {
    value: string
    onChange: (worldId: string) => void
}

export function WorldSelector({
                                  value,
                                  onChange,
                              }: WorldSelectorProps) {
    const [worlds, setWorlds] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()

        async function loadWorlds() {
            try {
                const response = await fetch('/get_worlds', {
                    signal: controller.signal,
                })

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`)
                }

                const data: string[] = await response.json()

                if (!Array.isArray(data)) {
                    throw new Error('Invalid worlds response')
                }

                setWorlds(data)

                if (data.length > 0 && !data.includes(value)) {
                    onChange(data[0])
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Failed to load worlds'
                    )
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        void loadWorlds()

        return () => controller.abort()
    }, [])

    return (
        <div className="rounded-xl border border-white/20 bg-slate-900/90 p-3 shadow-xl backdrop-blur-md">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active World
            </label>

            {error ? (
                <span className="text-sm text-red-400">
                    {error}
                </span>
            ) : (
                <select
                    value={value}
                    onChange={event => onChange(event.target.value)}
                    disabled={loading || worlds.length === 0}
                    className="w-52 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                >
                    {loading && (
                        <option value="">Loading worlds...</option>
                    )}

                    {worlds.map(world => (
                        <option key={world} value={world}>
                            {world}
                        </option>
                    ))}
                </select>
            )}
        </div>
    )
}
