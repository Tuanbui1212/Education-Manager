// src/routes/user.routes.ts
import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();

// Định nghĩa các đường dẫn CRUD
router.post("/", UserController.create);
router.get("/", UserController.getAll);
router.get("/:id", UserController.getOne);
router.put("/:id", UserController.update);
router.delete("/:id", UserController.delete);

export default router;
