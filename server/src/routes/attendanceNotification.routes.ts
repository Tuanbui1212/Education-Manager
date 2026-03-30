import { Router } from "express";
import { AttendanceNotificationController } from "../controllers/attendanceNotification.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();
const attendanceNotificationController = new AttendanceNotificationController();

router.use(verifyToken);

router.get("/", attendanceNotificationController.getNotifications);
router.put("/read-all", attendanceNotificationController.markAllAsRead);
router.put("/:id/read", attendanceNotificationController.markAsRead);
router.delete("/read", attendanceNotificationController.deleteAllRead);

export default router;
