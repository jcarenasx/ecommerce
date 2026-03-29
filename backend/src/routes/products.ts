import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin";
import { requireAuth } from "../middleware/requireAuth";
import {
  createNewProduct,
  deleteProductById,
  getProduct,
  listAllProducts,
  updateExistingProduct,
} from "../controllers/productsController";

const router = Router();

router.get("/", listAllProducts);
router.get("/:id", getProduct);
router.post("/", requireAuth, requireAdmin, createNewProduct);
router.put("/:id", requireAuth, requireAdmin, updateExistingProduct);
router.delete("/:id", requireAuth, requireAdmin, deleteProductById);

export default router;
