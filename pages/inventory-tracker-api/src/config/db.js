// src/config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;

        console.log("🔌 Connecting to MongoDB...");
        console.log("MONGO_URI starts with:", uri ? uri.slice(0, 20) : "undefined");

        // if MONGO_URI is missing, THEN throw
        if (!uri) {
            throw new Error("MONGO_URI is missing in environment variables");
        }

        await mongoose.connect(uri, {
            // these options are optional on mongoose 8, but safe:
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB error:", err.message);
        // make the app crash so Render logs clearly show the problem
        process.exit(1);
    }
};
