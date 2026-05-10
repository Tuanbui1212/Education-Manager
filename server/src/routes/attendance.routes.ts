import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  GetActiveClassesQuerySchema,
  GetSchedulesByClassParamsSchema,
  GetSchedulesByClassQuerySchema,
  GetAttendanceListParamsSchema,
  GetAttendanceListQuerySchema,
  UpsertAttendancesSchema,
} from '../validations/attendance.validation';
import { verifyToken, requirePermission, requireTeacherForAttendance } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();
const attendanceController = new AttendanceController();

router.get(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.ATTENDANCE.VIEW),
  validate(GetActiveClassesQuerySchema, 'query'),
  attendanceController.getAllClassesByTeacherId,
);

router.get(
  '/:classId',
  verifyToken,
  requirePermission(PERMISSIONS.ATTENDANCE.VIEW),
  requireTeacherForAttendance,
  validate(GetSchedulesByClassParamsSchema, 'params'),
  validate(GetSchedulesByClassQuerySchema, 'query'),
  attendanceController.getAllAttendancesByClassId,
);

router.get(
  '/:classId/list/:scheduleId',
  verifyToken,
  requirePermission(PERMISSIONS.ATTENDANCE.VIEW),
  validate(GetAttendanceListParamsSchema, 'params'),
  validate(GetAttendanceListQuerySchema, 'query'),
  attendanceController.getListAttendanceByClassId,
);

// EDIT thay cho 'attendance.check' để BE & FE dùng chung 1 permission
router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.ATTENDANCE.EDIT),
  validate(UpsertAttendancesSchema, 'body'),
  attendanceController.upsert,
);

router.get('/student-class/:classId', verifyToken, attendanceController.getStudentAttendancesByClassId);

export default router;
