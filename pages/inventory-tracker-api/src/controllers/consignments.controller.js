// src/controllers/consignments.controller.js
import Consignment from "../models/Consignment.js";
import Item from "../models/Item.js";

/**
 * POST /api/consignments
 * Create consignment record
 * - Validates stock
 * - Deducts qtySent from Item.onHand (real inventory behavior)
 */
export const createConsignment = async (req, res) => {
    try {
        const { item: itemId, hospital, doctor, qtySent, unitPrice } = req.body;

        // Basic validation
        if (!itemId || qtySent === undefined) {
            return res.status(400).json({
                message: "Missing required fields: item and qtySent are required.",
            });
        }

        // 1. Find the item being consigned
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // 2. Validate qtySent vs onHand
        let sent = Number(qtySent);
        if (!Number.isFinite(sent) || sent <= 0) {
            return res.status(400).json({
                message: "qtySent must be a positive number.",
            });
        }

        if (sent > item.onHand) {
            return res.status(400).json({
                message: `Not enough stock. On hand: ${item.onHand}, requested: ${sent}`,
            });
        }

        // 3. Create consignment
        const consignment = await Consignment.create({
            item: itemId,
            hospital,
            doctor,
            qtySent: sent,
            qtyUsed: 0,           // starts with nothing used
            unitPrice,
            // status: "open"      // optional: if your schema has default, you can omit this
        });

        // 4. Deduct from item stock (real inventory behavior)
        item.onHand = item.onHand - sent;
        await item.save();

        // 5. Return populated consignment (so UI still shows item info)
        const populated = await consignment.populate("item");
        return res.status(201).json(populated);
    } catch (err) {
        console.error("createConsignment error:", err);
        return res.status(400).json({ message: err.message });
    }
};

/**
 * GET /api/consignments
 * List consignments (with populated item)
 */
export const getConsignments = async (req, res) => {
    try {
        const consignments = await Consignment.find()
            .populate("item")
            .sort({ createdAt: -1 });

        return res.json(consignments);
    } catch (err) {
        console.error("getConsignments error:", err);
        return res.status(500).json({ message: "Failed to load consignments" });
    }
};

/**
 * GET /api/consignments/:id
 * Get single consignment
 */
export const getConsignmentById = async (req, res) => {
    try {
        const consignment = await Consignment.findById(req.params.id).populate(
            "item"
        );
        if (!consignment)
            return res.status(404).json({ message: "Consignment not found" });
        return res.json(consignment);
    } catch (err) {
        console.error("getConsignmentById error:", err);
        return res.status(400).json({ message: "Invalid ID" });
    }
};

/**
 * PATCH /api/consignments/:id/usage
 * Update usage (qtyUsed + status)
 * Called by portfolio UI "Edit" button
 */
export const updateConsignmentUsage = async (req, res) => {
    try {
        const { qtyUsed, status } = req.body;

        const consignment = await Consignment.findById(req.params.id);
        if (!consignment) {
            return res.status(404).json({ message: "Consignment not found" });
        }

        if (qtyUsed !== undefined) {
            // Clamp between 0 and qtySent
            let safeUsed = Number(qtyUsed);
            if (!Number.isFinite(safeUsed) || safeUsed < 0) safeUsed = 0;
            if (safeUsed > consignment.qtySent) {
                safeUsed = consignment.qtySent;
            }
            consignment.qtyUsed = safeUsed;

            // Derive status if not explicitly passed
            if (!status) {
                if (consignment.qtyUsed === 0) {
                    consignment.status = "open";
                } else if (consignment.qtyUsed < consignment.qtySent) {
                    consignment.status = "partially_closed";
                } else {
                    consignment.status = "closed";
                }
            }
        }

        if (status) {
            consignment.status = status;
        }

        await consignment.save();
        const populated = await consignment.populate("item");
        return res.json(populated);
    } catch (err) {
        console.error("updateConsignmentUsage error:", err);
        return res.status(400).json({ message: err.message });
    }
};
