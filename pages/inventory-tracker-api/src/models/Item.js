// src/models/Item.js
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        sku: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        category: String,

        // Inventory
        quantityOnHand: { type: Number, default: 0 },
        uom: { type: String, default: "pcs" },
        isConsignment: { type: Boolean, default: false },
        location: String,

        // 🔹 New fields for portfolio features
        // Optional expiry date (used by "Expiry & Restock Radar")
        expiryDate: { type: Date },

        // Optional minimum stock threshold (used by restock alerts)
        minStock: { type: Number, default: 5 },

        // Optional unit price in PHP (used by Hospital Balance billing view)
        unitPrice: { type: Number }, // e.g. 7500 = ₱7,500.00
    },
    { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
