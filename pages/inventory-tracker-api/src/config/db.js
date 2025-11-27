import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;

        console.log("Connecting to MongoDB...");
        console.log("MONGO_URI starts with:", uri?.slice(0, 25));

        // If missing, throw error
        if (!uri) {
            throw new Error("MONGO_URI is missing in environment variables");
        }

        await mongoose.connect(uri, {
            // Safe options
            maxPoolSize: 10,
        });

        console.log("MongoDB connected successfully!");

    } catch (err) {
        console.error("MongoDB error:", err.message);
        process.exit(1); // Stop app so Render logs show the issue
    }
};
