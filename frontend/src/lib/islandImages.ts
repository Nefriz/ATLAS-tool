
const extensions = ['png', 'webp', 'jpg', 'jpeg'] as const

const suffixes = ['', '_img'] as const

const cache = new Map<string, Promise<string | null>>()

function testUrl(url: string): Promise<boolean> {
    return new Promise(resolve => {
        const image = new Image()

        image.onload = () => resolve(true)
        image.onerror = () => resolve(false)

        image.src = url
    })
}

async function findImage(name: string): Promise<string | null> {
    const root = `${import.meta.env.BASE_URL}islands/`

    for (const suffix of suffixes) {
        for (const extension of extensions) {
            const filename = `${name}${suffix}.${extension}`
            const url = `${root}${encodeURIComponent(filename)}`

            if (await testUrl(url)) {
                console.log(`Found island image: ${name} -> ${url}`)
                return url
            }
        }
    }

    console.warn(`Island image not found: ${name}`)
    return null
}

export function getIslandImage(
    name: string
): Promise<string | null> {
    let promise = cache.get(name)

    if (!promise) {
        promise = findImage(name)
        cache.set(name, promise)
    }

    return promise
}
