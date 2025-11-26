import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        sku: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        category: String,
        quantityOnHand: { type: Number, default: 0 },
        uom: { type: String, default: "pcs" },
        isConsignment: { type: Boolean, default: false },
        location: String
    },
    { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
