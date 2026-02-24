/* global process */
import mongoose from "mongoose";

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/school_dashboard";

let isConnected = false;

export async function connectDb() {
  if (isConnected) {
    return mongoose.connection;
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  isConnected = true;
  return mongoose.connection;
}
