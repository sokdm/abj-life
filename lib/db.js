import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const redactedMongoUri = MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");

if (!MONGODB_URI) {
  console.warn("MONGODB_URI is not set. API routes that need the database will fail until configured.");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDb() {
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;
  if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

  if (!cached.promise) {
    console.log(`MongoDB connecting: ${redactedMongoUri}`);
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 15000
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connection.asPromise();
  }
  return cached.conn;
}
