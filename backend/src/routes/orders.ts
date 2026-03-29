import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { createOrder, getOrders } from "../controllers/ordersController";

const router = Router();

router.use(requireAuth);
router.get("/", getOrders);
router.post("/", createOrder);

export default router;
