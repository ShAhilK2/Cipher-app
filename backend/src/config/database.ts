import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.log("❌ MongoDB connection error", error);
    process.exit(1); // process failure 1 and 0 for success
  }
};
