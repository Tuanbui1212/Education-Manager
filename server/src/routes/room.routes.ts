import { Router } from "express";
import { RoomController } from "../controllers/room.controller";

const router = Router();

router.post("/", RoomController.create);
router.get("/", RoomController.getAll);
router.get("/:id", RoomController.getOne);
router.put("/:id", RoomController.update);
router.delete("/:id", RoomController.delete);

export default router;
