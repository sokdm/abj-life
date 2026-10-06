export const economy = {
  starterBalance: 25000,
  transfer: {
    maxAmount: 1000000,
    largeTransfer: 250000,
    referencePrefix: "ABJ"
  },
  properties: [
    { id: "kubwa-starter-room", name: "Kubwa Starter Room", district: "kubwa", type: "ROOM", price: 180000, rentPrice: 18000, bedrooms: 1, bathrooms: 1, capacity: 2, theme: "Compact cream studio", level: 1, reputation: 0, status: "AVAILABLE", description: "A practical starter space close to early jobs." },
    { id: "lugbe-studio", name: "Lugbe Skyline Studio", district: "lugbe", type: "STUDIO", price: 260000, rentPrice: 26000, bedrooms: 1, bathrooms: 1, capacity: 2, theme: "Airport-road modern", level: 1, reputation: 0, status: "AVAILABLE", description: "Clean studio with warm lights and a small work corner." },
    { id: "gwarinpa-flat", name: "Gwarinpa Estate Flat", district: "gwarinpa", type: "FLAT", price: 620000, rentPrice: 52000, bedrooms: 2, bathrooms: 2, capacity: 4, theme: "Estate comfort", level: 3, reputation: 10, status: "AVAILABLE", description: "A social flat with living room space for visitors." },
    { id: "jabi-penthouse", name: "Jabi Lake Penthouse", district: "jabi", type: "PENTHOUSE", price: 2200000, rentPrice: 160000, bedrooms: 3, bathrooms: 3, capacity: 6, theme: "Lake night luxury", level: 8, reputation: 45, status: "AVAILABLE", description: "Premium views and a polished hosting space." },
    { id: "maitama-mansion", name: "Maitama Crest Mansion", district: "maitama", type: "MANSION", price: 8200000, rentPrice: 480000, bedrooms: 6, bathrooms: 6, capacity: 12, theme: "Elite marble garden", level: 16, reputation: 90, status: "AVAILABLE", description: "A high-status home built for future crews and events." }
  ],
  vehicles: [
    { id: "metro-sun", brand: "Karu Motors", model: "Metro Sun", category: "ECONOMY", price: 420000, speed: 42, comfort: 35, status: 72, level: 2, reputation: 0, description: "Reliable city runabout for cheaper travel." },
    { id: "wuse-glide", brand: "Aso Auto", model: "Wuse Glide", category: "SEDAN", price: 850000, speed: 58, comfort: 62, status: 78, level: 4, reputation: 15, description: "Smooth sedan with a professional feel." },
    { id: "jabi-range", brand: "Savanna Drive", model: "Jabi Range", category: "SUV", price: 1600000, speed: 64, comfort: 75, status: 82, level: 7, reputation: 35, description: "Spacious SUV for long city moves." },
    { id: "asokoro-veil", brand: "Crestline", model: "Asokoro Veil", category: "LUXURY", price: 3800000, speed: 72, comfort: 92, status: 86, level: 12, reputation: 70, description: "Executive luxury without shouting." }
  ],
  items: [
    { id: "soft-sofa", name: "Soft Curve Sofa", category: "Furniture", price: 45000, rarity: "Common", tradable: true, stackable: false, slot: "living_room_sofa", description: "Comfortable sofa for a starter living room." },
    { id: "oak-table", name: "Warm Oak Table", category: "Furniture", price: 22000, rarity: "Common", tradable: true, stackable: false, slot: "living_room_table", description: "A sturdy center table." },
    { id: "abj-tv", name: "ABJ View TV", category: "Electronics", price: 78000, rarity: "Uncommon", tradable: true, stackable: false, slot: "living_room_tv", description: "Entertainment screen for your home." },
    { id: "cream-jacket", name: "Cream City Jacket", category: "Clothing", price: 18000, rarity: "Common", tradable: true, stackable: false, slot: "jacket", description: "A clean Abuja evening layer." },
    { id: "gold-sneakers", name: "Goldline Sneakers", category: "Clothing", price: 26000, rarity: "Uncommon", tradable: true, stackable: false, slot: "shoes", description: "Street-ready shoes with subtle gold accents." }
  ]
};

export function findEconomyItem(collection, id) {
  return economy[collection].find((item) => item.id === id);
}

export function makeTransactionReference() {
  return `${economy.transfer.referencePrefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}
