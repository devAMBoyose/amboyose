// src/controllers/consignments.controller.js
import Consignment from "../models/Consignment.js";
import Item from "../models/Item.js";

/**
 * POST /api/consignments
 * Create consignment record
 */
export const createConsignment = async (req, res) => {
    try {
        const consignment = await Consignment.create(req.body);
        return res.status(201).json(consignment);
    } catch (err) {
        console.error("createConsignment error:", err);
        return res.status(400).json({ message: err.message });
    }
};

/**
 * GET /api/consignments
 * List all consignments (with item populated)
 */
export const getConsignments = async (req, res) => {
    try {
        const list = await Consignment.find()
            .populate("item")
            .sort({ createdAt: -1 });
        return res.json(list);
    } catch (err) {
        console.error("getConsignments error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /api/consignments/:id
 */
export const getConsignmentById = async (req, res) => {
    try {
        const record = await Consignment.findById(req.params.id).populate("item");
        if (!record) {
            return res.status(404).json({ message: "Consignment not found" });
        }
        return res.json(record);
    } catch (err) {
        console.error("getConsignmentById error:", err);
        return res.status(400).json({ message: "Invalid ID" });
    }
};

/**
 * PATCH /api/consignments/:id/usage
 * Update qtyUsed and status + adjust Item.quantityOnHand if you want
 */
export const updateConsignmentUsage = async (req, res) => {
    try {
        const { qtyUsed, status } = req.body;

        const consignment = await Consignment.findById(req.params.id);
        if (!consignment) {
            return res.status(404).json({ message: "Consignment not found" });
        }

        if (qtyUsed !== undefined) consignment.qtyUsed = qtyUsed;
        if (status) consignment.status = status;

        await consignment.save();
        return res.json(consignment);
    } catch (err) {
        console.error("updateConsignmentUsage error:", err);
        return res.status(400).json({ message: err.message });
    }
};
