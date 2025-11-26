import mongoose from "mongoose";

const consignmentSchema = new mongoose.Schema(
    {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
        hospital: { type: String, required: true },
        doctor: String,
        qtySent: { type: Number, required: true },
        qtyUsed: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["open", "closed", "partially_closed"],
            default: "open"
        }
    },
    { timestamps: true }
);

export default mongoose.model("Consignment", consignmentSchema);
