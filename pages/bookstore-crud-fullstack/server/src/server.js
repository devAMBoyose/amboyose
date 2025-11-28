import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import bookRoutes from "./routes/books.routes.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use(morgan("dev"));

const allowedOrigins = [
    process.env.CLIENT_URL,        // https://bookstore-crud-ui.onrender.com
    "https://bookstore-crud-ui.onrender.com"       // for local dev http://localhost:5173
];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

// ---------- ROUTES ----------
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

// ---------- START ----------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 API running on port ${PORT}`);
    });
});
