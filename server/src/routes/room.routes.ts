import { Router } from "express";
import { RoomController } from "../controllers/room.controller";
import { validate } from "../middlewares/validate.middleware";
import { CreateRoomSchema, RoomIdSchema, UpdateRoomSchema} from "../validations/room.validation";

const router = Router();
const roomController = new RoomController();
router.post("/", validate(CreateRoomSchema), roomController.create);
router.get("/", roomController.getAll);
router.get("/:id", validate(RoomIdSchema, "params"), roomController.getOne);
router.put("/:id", validate(RoomIdSchema, "params"), validate(UpdateRoomSchema), roomController.update);
router.delete("/:id", validate(RoomIdSchema, "params"), roomController.delete);

export default router;
