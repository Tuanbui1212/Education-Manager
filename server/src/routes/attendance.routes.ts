import { Router } from "express";
import { AttendanceController } from "../controllers/attendance.controller";
import { validate } from "../middlewares/validate.middleware";
import { GetActiveClassesQuerySchema, GetSchedulesByClassParamsSchema, GetSchedulesByClassQuerySchema, GetAttendanceListParamsSchema, GetAttendanceListQuerySchema, UpsertAttendancesSchema } from "../validations/attendance.validation";
import { verifyToken, requirePermission, requireTeacherForAttendance } from "../middlewares/auth.middleware";

const router = Router();
const attendanceController = new AttendanceController();

router.get("/", verifyToken, requirePermission('attendance.view'),
    validate(GetActiveClassesQuerySchema, 'query'),
    attendanceController.getAllClasses);

router.get("/:classId", verifyToken, requirePermission('attendance.view'),
    requireTeacherForAttendance,
    validate(GetSchedulesByClassParamsSchema, 'params'),
    validate(GetSchedulesByClassQuerySchema, 'query'),
    attendanceController.getAllAttendancesByClassId);

router.get("/:classId/list/:scheduleId", verifyToken, requirePermission('attendance.view'),
    validate(GetAttendanceListParamsSchema, 'params'),
    validate(GetAttendanceListQuerySchema, 'query'),
    attendanceController.getListAttendanceByClassId);

router.post("/", verifyToken, requirePermission('attendance.check'),
    validate(UpsertAttendancesSchema, 'body'),
    attendanceController.upsert);

router.get("/student-class/:classId", verifyToken, attendanceController.getStudentAttendancesByClassId);

export default router;
