
export const RESOURCE_MAP: Record<string, string[]> = {
    Berry: [
        'Acai', 'Acerola', 'Arctic Raspberry', 'Bilberry',
        'Blackberry', 'Elderberry', 'Lignonberry',
        'Schisandra', 'Sea Grapes', 'Strawberry',
        'Berry', 'Lingonberry', 'Olives'
    ],
    Coal: [
        'Anthracite', 'Graphite', 'Lignite',
        'Nitre', 'Peat', 'Sulfur', 'Coal',
    ],
    Coral: [
        'Brain Coral', 'Fire Coral', 'Coral',
    ],
    Crystal: [
        'Amethyst', 'Calcite', 'Herkimer',
        'Pearl', 'Quartz', 'Tellurite', 'Crystal',
    ],
    Fibers: [
        'Bamboo', 'Cotton', 'Hemp', 'Jute',
        'Seaweed', 'Silk', 'Straw', 'Fibers',
    ],
    Flint: [
        'Agate', 'Basalt', 'Chalcedony',
        'Chert', 'Obsidian', 'Radiolarite', 'Flint',
    ],
    Gem: [
        'Diamond', 'Emerald', 'Garnet',
        'Opal', 'Ruby', 'Sunstone', 'Gem',
    ],
    Hide: [
        'Fish Skin', 'Fleece', 'Fur', 'Hair',
        'Leather', 'Pelt', 'Skin', 'Wool', 'Hide',
    ],
    Keratinoid: [
        'Carapace', 'Chitin', 'Bone', 'Residue',
        'Rhino Horn', 'Scale', 'Shell', 'Turtle Shell', 'Keratinoid', 'Bone Chips'
    ],
    Metal: [
        'Cobalt', 'Copper', 'Iridium',
        'Iron', 'Silver', 'Tin', 'Metal',
    ],
    Oil: [
        'Blubber', 'Crude Oil', 'Fish Oil',
        'Mineral Oil', 'Naptha', 'Shale Oil', 'Oil',
        'Naphtha',
    ],
    Salt: [
        'Flake Salt', 'Iodine', 'Kala Namak',
        'Pink Salt', 'Rock Salt', 'Sea Salt', 'Salt',
    ],
    Stone: [
        'Coquina', 'Granite', 'Limestone',
        'Marble', 'Sandstone', 'Slate', 'Stone',
    ],
    Sugar: [
        'Gum', 'Honey', 'Nectar', 'Resin',
        'Saps', 'Sugars', 'Sugar Cane', 'Syrup', 'Sugar','Sugarcane'
    ],
    Thatch: [
        'Bark', 'Fronds', 'Reeds',
        'Roots', 'Rushes', 'Twigs', 'Thatch',
    ],
    Wood: [
        'Cedar', 'Poplar', 'Ironwood',
        'Ash', 'Fir', 'Oak', 'Pine', 'Wood',
        'Cursed Wood',
    ],
    'Cooking Herbs': [
        'Cilantro', 'Garlic', 'Green Algae',
        'Red Algae', 'Mint', 'Oregano',
        'Parsley', 'Rosemary', 'Thyme',
    ],
    'Medicinal Herbs': [
        'Aloe', 'Basil', 'Chamomile', 'Licorice',
        'Poppy', 'Spirulina', 'Turmeric', 'Yarrow',
    ],
    Fruits: [
        'Cocoa', 'Coconut', 'Lime', 'Olive',
    ],
    Seed: [
        'Bean Seed', 'Beet Seed', 'Cactus Seed',
        'Rice Seed', 'Onion Seed', 'Maize Seed',
        'Pepper Seed', 'Potato Seed', 'Turnip Seed',
        'Carrot Seed', 'Chickpea Seed', 'Edible Greens Seed'

    ],
    'Wild Vegetables': [
        'Wild Beans', 'Wild Beet', 'Wild Cactus',
        'Wild Carrot', 'Celery', 'Wild Chickpeas',
        'Wild Chili', 'Wild Greens', 'Wild Maize',
        'Wild Onion', 'Wild Pepper', 'Wild Potato',
        'Wild Rice', 'Wild Turnip', 'Wheatgrass',
        'Wild Chick Peas'
    ],
    'Cultivated Vegetables': [
        'Beans', 'Beet', 'Cactus', 'Carrot',
        'Chickpeas', 'Chili', 'Coffee Bean',
        'Edible Greens', 'Maize', 'Onion',
        'Pepper', 'Potato', 'Rice', 'Turnip', 'Wheat',
    ],

}

export interface ResourceGroup<T> {
    name: string
    resources: T[]
}

const resourceCategories = new Map<string, string>()

for (const [category, names] of Object.entries(RESOURCE_MAP)) {
    for (const name of names) {
        resourceCategories.set(name.trim().toLowerCase(), category)
    }
}

export function groupResources<T extends { name: string }>(
    resources: T[]
): ResourceGroup<T>[] {
    const grouped = new Map<string, T[]>()

    for (const resource of resources) {
        const category =
            resourceCategories.get(resource.name.trim().toLowerCase())
            ?? 'Other'

        if (!grouped.has(category)) {
            grouped.set(category, [])
        }

        grouped.get(category)!.push(resource)
    }

    return [...Object.keys(RESOURCE_MAP), 'Other']
        .filter(category => grouped.has(category))
        .map(category => ({
            name: category,
            resources: grouped.get(category)!.sort(
                (a, b) => a.name.localeCompare(b.name)
            ),
        }))
}
