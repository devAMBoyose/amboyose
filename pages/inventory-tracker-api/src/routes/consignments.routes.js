import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roles.js";
import {
    createConsignment,
    getConsignments,
    getConsignmentById,
    updateConsignmentUsage,
} from "../controllers/consignments.controller.js";

const router = Router();

// CREATE consignment
router.post("/", auth, allowRoles("admin", "staff"), createConsignment);

// LIST consignments
router.get("/", auth, getConsignments);

// GET one
router.get("/:id", auth, getConsignmentById);

// UPDATE usage / close
router.patch("/:id/usage", auth, allowRoles("admin", "staff"), updateConsignmentUsage);

export default router;   // 👈
