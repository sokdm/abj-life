export const walkableLayouts = {
  "starter-apartment": {
    id: "starter-apartment",
    name: "ABJ Starter Apartment",
    type: "home",
    width: 14,
    height: 11,
    spawn: { x: 6, y: 7 },
    blocked: [
      [0, 0], [1, 0], [12, 0], [13, 0], [0, 10], [13, 10],
      [1, 1], [2, 1], [9, 1], [10, 1], [11, 1], [12, 1],
      [2, 3], [3, 3], [10, 3], [11, 3],
      [2, 6], [3, 6], [7, 6], [8, 6], [10, 6],
      [1, 7], [2, 7], [10, 7], [11, 7],
      [5, 2], [6, 2], [12, 6]
    ],
    objects: [
      { id: "bed", label: "Bed", x: 2, y: 2, w: 2, h: 2, category: "Sleep", actions: ["Sleep", "Nap", "Relax"], surface: "wood" },
      { id: "wardrobe", label: "Wardrobe", x: 10, y: 2, w: 2, h: 1, category: "Storage", actions: ["Change Outfit"], surface: "wood" },
      { id: "sofa", label: "Sofa", x: 2, y: 7, w: 2, h: 1, category: "Comfort", actions: ["Relax", "Sit & Chill", "Use Phone"], surface: "tile" },
      { id: "table", label: "Work Table", x: 7, y: 6, w: 2, h: 1, category: "Comfort", actions: ["Study", "Work", "Browse"], surface: "tile" },
      { id: "tv", label: "TV", x: 10, y: 6, w: 1, h: 1, category: "Electronics", actions: ["Watch Show", "Watch Sports", "Relax"], surface: "tile" },
      { id: "fridge", label: "Fridge", x: 12, y: 6, w: 1, h: 1, category: "Kitchen", actions: ["Eat", "Get Drink"], surface: "tile" },
      { id: "cooker", label: "Cooker", x: 11, y: 7, w: 1, h: 1, category: "Kitchen", actions: ["Cook Meal"], surface: "tile" },
      { id: "shower", label: "Shower", x: 5, y: 2, w: 1, h: 1, category: "Bath", actions: ["Take Shower"], surface: "tile" },
      { id: "sink", label: "Sink", x: 6, y: 2, w: 1, h: 1, category: "Bath", actions: ["Freshen Up"], surface: "tile" },
      { id: "plant", label: "Plant", x: 9, y: 8, w: 1, h: 1, category: "Decor", actions: ["Admire"], surface: "tile" },
      { id: "door", label: "Door", x: 12, y: 9, w: 1, h: 1, category: "Exit", actions: ["Leave Home"], surface: "tile" }
    ],
    npcs: [{ id: "starter-helper", name: "ABJ Helper", x: 8, y: 3, role: "receptionist" }],
    ambience: "home"
  },
  "wuse-plaza": {
    id: "wuse-plaza",
    name: "Wuse Street Plaza",
    type: "street",
    width: 16,
    height: 11,
    spawn: { x: 3, y: 7 },
    blocked: [[0, 0], [1, 0], [14, 0], [15, 0], [2, 2], [3, 2], [12, 2], [13, 2], [7, 5], [8, 5], [9, 5]],
    objects: [
      { id: "shop-counter", label: "Shop Counter", x: 12, y: 3, w: 2, h: 1, actions: ["Shop"], surface: "concrete" },
      { id: "bench", label: "Bench", x: 4, y: 7, w: 2, h: 1, actions: ["Sit"], surface: "concrete" },
      { id: "exit", label: "Taxi Stand", x: 1, y: 9, w: 1, h: 1, actions: ["Travel"], surface: "road" }
    ],
    npcs: [{ id: "wuse-attendant", name: "Shop Attendant", x: 11, y: 4, role: "shop" }],
    ambience: "street"
  },
  "jabi-social-park": {
    id: "jabi-social-park",
    name: "Jabi Social Park",
    type: "park",
    width: 15,
    height: 10,
    spawn: { x: 4, y: 6 },
    blocked: [[5, 2], [6, 2], [7, 2], [10, 6], [11, 6]],
    objects: [
      { id: "lake-rail", label: "Lake View", x: 6, y: 2, w: 3, h: 1, actions: ["View"], surface: "grass" },
      { id: "park-bench", label: "Park Bench", x: 10, y: 6, w: 2, h: 1, actions: ["Sit"], surface: "grass" }
    ],
    npcs: [{ id: "park-guide", name: "Park Guide", x: 9, y: 4, role: "guide" }],
    ambience: "park"
  },
  "capital-room": {
    id: "capital-room",
    name: "Capital Room",
    type: "club",
    width: 14,
    height: 9,
    spawn: { x: 3, y: 6 },
    blocked: [[1, 1], [2, 1], [10, 1], [11, 1], [6, 4], [7, 4]],
    objects: [
      { id: "dance-floor", label: "Dance Floor", x: 6, y: 5, w: 3, h: 2, actions: ["Dance"], surface: "tile" },
      { id: "lounge-seat", label: "Lounge Seat", x: 3, y: 3, w: 2, h: 1, actions: ["Sit"], surface: "tile" }
    ],
    npcs: [{ id: "club-host", name: "Host", x: 9, y: 3, role: "host" }],
    ambience: "club"
  }
};

export const emotes = ["Wave", "Clap", "Laugh", "Sit", "Dance"];

export const needDefinitions = [
  { id: "hunger", label: "Hunger", icon: "🍲", color: "#22c55e" },
  { id: "energy", label: "Energy", icon: "⚡", color: "#0ea5e9" },
  { id: "fun", label: "Fun", icon: "🎮", color: "#f97316" },
  { id: "social", label: "Social", icon: "💬", color: "#8b5cf6" },
  { id: "hygiene", label: "Hygiene", icon: "✨", color: "#06b6d4" },
  { id: "comfort", label: "Comfort", icon: "🛋", color: "#14b8a6" }
];

export const homeTasks = [
  { id: "restaurant", title: "Visit a restaurant", reward: "+Hunger", tab: "MAP" },
  { id: "work", title: "Go to work", reward: "+Cash", tab: "PHONE" },
  { id: "daily", title: "Daily reward", reward: "+XP", tab: "HOME" },
  { id: "gym", title: "Visit the gym", reward: "+Energy", tab: "MAP" },
  { id: "explore", title: "Explore a district", reward: "+Social", tab: "MAP" }
];

export const furnitureCatalog = [
  { id: "plastic-chair", name: "Kubwa Plastic Chair", category: "Comfort", footprint: "1x1", price: 4500, rarity: "Starter" },
  { id: "velvet-sofa", name: "Jabi Velvet Sofa", category: "Comfort", footprint: "3x1", price: 85000, rarity: "Premium" },
  { id: "soft-bed", name: "Cloud Rest Bed", category: "Sleep", footprint: "2x2", price: 95000, rarity: "Comfort" },
  { id: "city-wardrobe", name: "City Wardrobe", category: "Storage", footprint: "2x1", price: 52000, rarity: "Clean" },
  { id: "dining-table", name: "Gwarinpa Dining Table", category: "Kitchen", footprint: "2x1", price: 38000, rarity: "Classic" },
  { id: "abj-fridge", name: "ABJ Chill Fridge", category: "Kitchen", footprint: "1x1", price: 120000, rarity: "Appliance" },
  { id: "rain-shower", name: "Fresh Rain Shower", category: "Bath", footprint: "1x1", price: 74000, rarity: "Clean" },
  { id: "smart-tv", name: "Aso Smart TV", category: "Electronics", footprint: "2x1", price: 140000, rarity: "Tech" },
  { id: "floor-lamp", name: "Warm Floor Lamp", category: "Lighting", footprint: "1x1", price: 18000, rarity: "Decor" },
  { id: "living-plant", name: "Living Room Palm", category: "Decor", footprint: "1x1", price: 12500, rarity: "Fresh" }
];

export const furnitureCategories = ["Sleep", "Kitchen", "Bath", "Comfort", "Electronics", "Decor", "Lighting", "Storage"];

export const objectActivities = {
  bed: [
    { action: "Sleep", duration: 15, effects: "+Energy +Comfort" },
    { action: "Nap", duration: 9, effects: "+Energy" },
    { action: "Relax", duration: 8, effects: "+Comfort" }
  ],
  sofa: [
    { action: "Relax", duration: 9, effects: "+Fun +Comfort" },
    { action: "Sit & Chill", duration: 12, effects: "+Social" },
    { action: "Use Phone", duration: 6, effects: "+Fun" }
  ],
  tv: [
    { action: "Watch Show", duration: 10, effects: "+Fun" },
    { action: "Watch Sports", duration: 10, effects: "+Fun +Social" }
  ],
  shower: [{ action: "Take Shower", duration: 8, effects: "+Hygiene" }],
  fridge: [{ action: "Eat", duration: 7, effects: "+Hunger" }]
};

export const mapFilters = ["Moving", "Homes", "Work", "Food", "Health", "Fun", "Cars", "Government", "Walk"];

export const mapLocations = [
  { id: "abj-gym", name: "Pulse Yard Gym", district: "Wuse", category: "Health", description: "Bright Abuja gym with treadmills, weights and showers.", activities: ["Lift Weights", "Run on Treadmill", "Yoga", "Shower"], travel: ["Walk", "Keke", "Taxi/Cab", "Ride service"] },
  { id: "jabi-cafe", name: "Jabi Breeze Cafe", district: "Jabi", category: "Food", description: "Social cafe with meals, take away and meetups.", activities: ["Eat", "Take Away", "Meet Friend"], travel: ["Taxi/Cab", "Ride service", "Personal vehicle"] },
  { id: "central-bank", name: "ABJ Bank Central", district: "Central Area", category: "Government", description: "Premium branch for deposits, withdrawals and transfers.", activities: ["Deposit", "Withdraw", "Transfer"], travel: ["Public shuttle", "Taxi/Cab", "Personal vehicle"] },
  { id: "garki-market", name: "Garki Market Walk", district: "Garki", category: "Food", description: "Open shopping area for food, decor and quick errands.", activities: ["Browse", "Buy", "Meet players"], travel: ["Walk", "Keke", "Taxi/Cab"] },
  { id: "asokoro-showroom", name: "Aso Auto Gallery", district: "Asokoro", category: "Cars", description: "Walkable showroom with original ABJ vehicle models.", activities: ["View Vehicle", "Buy", "Compare"], travel: ["Taxi/Cab", "Personal vehicle"] },
  { id: "maitama-lounge", name: "Capital Room", district: "Maitama", category: "Fun", description: "Night social lounge with music, dancing and chat.", activities: ["Dance", "Socialize", "Relax"], travel: ["Ride service", "Personal vehicle"] }
];

export const travelOptions = [
  { name: "Walk", price: 0, duration: "12 min" },
  { name: "Keke", price: 800, duration: "6 min" },
  { name: "Taxi/Cab", price: 1800, duration: "4 min" },
  { name: "Ride service", price: 2600, duration: "3 min" },
  { name: "Public shuttle", price: 500, duration: "9 min" },
  { name: "Personal vehicle", price: 0, duration: "3 min" }
];

export const audioDefaults = {
  master: 0.75,
  music: 0.35,
  ambience: 0.45,
  sfx: 0.65,
  voice: 0,
  muted: false
};

export const qualityDefaults = {
  graphics: "medium",
  showNames: true,
  chatBubbles: true,
  reduceAnimations: false,
  textScale: 1
};

export const businessTypes = ["Restaurant", "Clothing Store", "Barbershop", "Cafe", "Mini Market", "Nightclub", "Car Dealership", "Tech Company"];

export const publicVenues = [
  { id: "wuse-plaza", name: "Wuse Street Plaza", district: "wuse", capacity: 32 },
  { id: "jabi-social-park", name: "Jabi Social Park", district: "jabi", capacity: 36 },
  { id: "capital-room", name: "Capital Room", district: "wuse", capacity: 28 }
];
