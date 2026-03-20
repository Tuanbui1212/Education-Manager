import { Router } from "express";
import { AttendanceController } from "../controllers/attendance.controller";
import { validate } from "../middlewares/validate.middleware";
import { GetAllAttendanceQuerySchema, GetAttendanceByIdSchema, UpsertAttendancesSchema } from "../validations/attendance.validation";

const router = Router();
const attendanceController = new AttendanceController();

router.get("/", validate(GetAllAttendanceQuerySchema, 'query'), attendanceController.getAll);
router.get("/:scheduleId", validate(GetAttendanceByIdSchema, 'params'), attendanceController.getById);
router.post("/", validate(UpsertAttendancesSchema, 'body'), attendanceController.upsert);

export default router;
