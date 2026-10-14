
import * as L from 'leaflet'

let pluginReady: Promise<void> | null = null

export function ensureRotatedOverlay(): Promise<void> {
    if (!pluginReady) {
        Object.assign(globalThis, { L })

        pluginReady = import('leaflet-imageoverlay-rotated')
            .then(() => undefined)
            .catch(error => {
                pluginReady = null
                throw error
            })
    }

    return pluginReady
}
