import { Router } from "express";
import { AttendanceController } from "../controllers/attendance.controller";
import { validate } from "../middlewares/validate.middleware";
import { GetAttendanceByScheduleSchema, ScheduleStatsQuerySchema, UpsertAttendancesSchema } from "../validations/attendance.validation";

const router = Router();
const attendanceController = new AttendanceController();

router.get("/schedules-stats", validate(ScheduleStatsQuerySchema, 'query'), attendanceController.getScheduleStats);
router.get("/schedule/:scheduleId", validate(GetAttendanceByScheduleSchema, 'params'), attendanceController.getBySchedule);
router.post("/bulk", validate(UpsertAttendancesSchema, 'body'), attendanceController.upsert);

export default router;
