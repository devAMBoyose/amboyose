// src/config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;

        console.log("🔌 Connecting to MongoDB...");
        // Small debug to check format (only first part, so you don't leak secrets)
        console.log("MONGO_URI starts with:", uri?.slice(0, 20));

        if (!uri) {
            throw new Error("MONGO_URI is missing in environment variables");
        }

        await mongoose.connect(uri, {
            // options mostly optional on mongoose 8, but safe:
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB error:", err.message);
        process.exit(1);
    }
};
