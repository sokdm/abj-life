export const districtCatalog = [
  { id: "kubwa", name: "Kubwa", tier: "Starter", level: 1, wealth: 0, reputation: 0, travelCost: 900, travelMinutes: 8, description: "Affordable estates, roadside food spots and first jobs." },
  { id: "lugbe", name: "Lugbe", tier: "Starter", level: 1, wealth: 0, reputation: 0, travelCost: 1100, travelMinutes: 10, description: "Airport road energy with delivery routes and compact apartments." },
  { id: "gwarinpa", name: "Gwarinpa", tier: "Starter", level: 1, wealth: 0, reputation: 0, travelCost: 1400, travelMinutes: 12, description: "Large estates, shops and steady social life." },
  { id: "jabi", name: "Jabi", tier: "Lifestyle", level: 4, wealth: 85000, reputation: 15, travelCost: 2600, travelMinutes: 16, description: "Lakefront hangouts, malls and restaurant shifts." },
  { id: "wuse", name: "Wuse", tier: "Commercial", level: 5, wealth: 110000, reputation: 20, travelCost: 3000, travelMinutes: 18, description: "Busy offices, banks, retail streets and nightlife." },
  { id: "garki", name: "Garki", tier: "Civic", level: 5, wealth: 100000, reputation: 20, travelCost: 2800, travelMinutes: 18, description: "Government offices, hospitals and stable careers." },
  { id: "utako", name: "Utako", tier: "Transit", level: 4, wealth: 90000, reputation: 12, travelCost: 2400, travelMinutes: 15, description: "Transport hubs, hotels and quick business." },
  { id: "maitama", name: "Maitama", tier: "Elite", level: 12, wealth: 900000, reputation: 70, travelCost: 9000, travelMinutes: 28, description: "High-status homes, diplomatic events and luxury clubs." },
  { id: "asokoro", name: "Asokoro", tier: "Prestige", level: 15, wealth: 1200000, reputation: 85, travelCost: 12000, travelMinutes: 32, description: "Quiet prestige, executive circles and gated estates." },
  { id: "central-area", name: "Central Area", tier: "Corporate", level: 8, wealth: 350000, reputation: 45, travelCost: 5200, travelMinutes: 22, description: "Corporate towers, banks and premium offices." }
];

export const locationCatalog = [
  { id: "starter-apartment", name: "ABJ Starter Apartment", district: "kubwa", type: "Apartment", capacity: 8, open: true, description: "Your first private room in the city.", activities: ["Rest", "Change outfit", "Use phone"], requirements: { level: 1, wealth: 0, reputation: 0 } },
  { id: "kubwa-market-yard", name: "Kubwa Market Yard", district: "kubwa", type: "Market", capacity: 24, open: true, description: "A busy starter marketplace with errands and food stalls.", activities: ["Shop shift", "Meet players"], requirements: { level: 1, wealth: 0, reputation: 0 } },
  { id: "lugbe-route-park", name: "Lugbe Route Park", district: "lugbe", type: "Park", capacity: 18, open: true, description: "Transport routes for delivery and taxi work.", activities: ["Delivery run", "Taxi shift"], requirements: { level: 1, wealth: 0, reputation: 0 } },
  { id: "gwarinpa-food-court", name: "Gwarinpa Food Court", district: "gwarinpa", type: "Restaurant", capacity: 20, open: true, description: "Casual hangout for waiter jobs and local chat.", activities: ["Wait tables", "Socialize"], requirements: { level: 1, wealth: 0, reputation: 0 } },
  { id: "jabi-lake-walk", name: "Jabi Lake Walk", district: "jabi", type: "Park", capacity: 28, open: true, description: "A scenic social space for higher-level residents.", activities: ["Fitness walk", "Meet players"], requirements: { level: 4, wealth: 85000, reputation: 15 } },
  { id: "wuse-abj-bank", name: "ABJ Bank Wuse", district: "wuse", type: "Bank", capacity: 16, open: true, description: "Premium branch for transfers and future finance features.", activities: ["Banking", "Consultant job"], requirements: { level: 5, wealth: 110000, reputation: 20 } },
  { id: "garki-clinic", name: "Garki Wellness Clinic", district: "garki", type: "Hospital", capacity: 14, open: true, description: "Health services and future medical careers.", activities: ["Recover", "Medical work"], requirements: { level: 5, wealth: 100000, reputation: 20 } },
  { id: "central-tech-hub", name: "Central Tech Hub", district: "central-area", type: "Office", capacity: 32, open: true, description: "Office towers for technology and executive careers.", activities: ["Tech contract", "Networking"], requirements: { level: 8, wealth: 350000, reputation: 45 } }
];

export const phoneApps = [
  "Messages", "Contacts", "ABJ Bank", "Jobs", "City", "Properties", "Garage", "Marketplace", "ABJ Social", "Crews", "Notifications", "Profile", "Settings"
];

export const lockedPhoneApps = [
  "Businesses", "Events"
];

export const jobCatalog = [
  { id: "delivery-rider", name: "Delivery Rider", company: "Swift Abuja Runs", district: "lugbe", salary: 7600, level: 1, xp: 45, duration: 6, skill: "Driving", task: "delivery_selection" },
  { id: "shop-assistant", name: "Shop Assistant", company: "Kubwa Choice Mart", district: "kubwa", salary: 5800, level: 1, xp: 35, duration: 5, skill: "Communication", task: "customer_matching" },
  { id: "cleaner", name: "Cleaner", company: "Gwarinpa Sparkle Crew", district: "gwarinpa", salary: 4600, level: 1, xp: 30, duration: 4, skill: "Fitness", task: "timing_challenge" },
  { id: "security-guard", name: "Security Guard", company: "Civic Shield", district: "garki", salary: 7200, level: 2, xp: 42, duration: 7, skill: "Fitness", task: "memory_challenge" },
  { id: "waiter", name: "Waiter", company: "Gwarinpa Food Court", district: "gwarinpa", salary: 5400, level: 1, xp: 34, duration: 5, skill: "Communication", task: "customer_matching" },
  { id: "taxi-driver", name: "Taxi Driver", company: "ABJ Metro Cab", district: "utako", salary: 8400, level: 2, xp: 48, duration: 8, skill: "Driving", task: "route_timing" }
];

export function getDistrict(id) {
  return districtCatalog.find((district) => district.id === id);
}

export function getLocation(id) {
  return locationCatalog.find((location) => location.id === id);
}

export function canAccessDistrict(player, district) {
  return player.level >= district.level &&
    player.cash + player.bankBalance >= district.wealth &&
    player.civilianReputation >= district.reputation;
}
