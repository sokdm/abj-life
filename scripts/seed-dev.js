const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

const economy = {
  properties: ["kubwa-starter-room", "lugbe-studio", "gwarinpa-flat", "jabi-penthouse", "maitama-mansion"],
  vehicles: ["metro-sun", "wuse-glide", "jabi-range", "asokoro-veil"],
  items: ["soft-sofa", "oak-table", "abj-tv", "cream-jacket", "gold-sneakers"]
};

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Development seed check complete.");
  console.log(`Economy catalog: ${economy.properties.length} properties, ${economy.vehicles.length} vehicles, ${economy.items.length} items.`);
  console.log("Catalog data is code-defined in lib/economy.js; no production data was overwritten.");
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
