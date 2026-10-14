const extensions = ['png', 'webp', 'jpg', 'jpeg'] as const

const itemCache = new Map<string, Promise<string | null>>()
const typeCache = new Map<string, Promise<string | null>>()

function testUrl(url: string): Promise<boolean> {
    return new Promise(resolve => {
        const image = new Image()

        image.onload = () => resolve(true)
        image.onerror = () => resolve(false)

        image.src = url
    })
}

async function findImage(
    folder: 'resource-items' | 'resource-types',
    name: string
): Promise<string | null> {
    const root = `${import.meta.env.BASE_URL}${folder}/`

    for (const extension of extensions) {
        const url = `${root}${encodeURIComponent(name)}.${extension}`

        if (await testUrl(url)) {
            return url
        }
    }

    return null
}

export function getResourceItemImage(name: string): Promise<string | null> {
    let promise = itemCache.get(name)

    if (!promise) {
        promise = findImage('resource-items', name)
        itemCache.set(name, promise)
    }

    return promise
}

export function getResourceTypeImage(name: string): Promise<string | null> {
    let promise = typeCache.get(name)

    if (!promise) {
        promise = findImage('resource-types', name)
        typeCache.set(name, promise)
    }

    return promise
}