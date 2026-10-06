export const walkableLayouts = {
  "starter-apartment": {
    id: "starter-apartment",
    name: "ABJ Starter Apartment",
    type: "home",
    width: 12,
    height: 9,
    spawn: { x: 5, y: 6 },
    blocked: [
      [0, 0], [1, 0], [10, 0], [11, 0], [0, 8], [11, 8],
      [1, 1], [2, 1], [8, 1], [9, 1], [10, 1],
      [2, 5], [3, 5], [7, 5], [8, 5], [9, 5],
      [1, 6], [2, 6], [9, 6]
    ],
    objects: [
      { id: "bed", label: "Bed", x: 2, y: 2, w: 2, h: 2, actions: ["Sleep", "Rest"], surface: "wood" },
      { id: "wardrobe", label: "Wardrobe", x: 9, y: 2, w: 1, h: 2, actions: ["Change Outfit"], surface: "wood" },
      { id: "sofa", label: "Sofa", x: 2, y: 6, w: 2, h: 1, actions: ["Sit"], surface: "tile" },
      { id: "table", label: "Table", x: 7, y: 5, w: 2, h: 1, actions: ["Use"], surface: "tile" },
      { id: "tv", label: "TV", x: 9, y: 5, w: 1, h: 1, actions: ["Turn On", "Turn Off"], surface: "tile" },
      { id: "door", label: "Door", x: 10, y: 7, w: 1, h: 1, actions: ["Leave Home"], surface: "tile" }
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
