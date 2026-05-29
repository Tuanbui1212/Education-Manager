import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middlewares/validate.middleware';
import { logIpMiddleware } from '../middlewares/logIp.middleware';
import { CreateUserSchema, updatePasswordSchema, UpdateUserSchema } from '../validations/users.validation';
import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();
const userController = new UserController();

router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.USER.CREATE, PERMISSIONS.TEACHER.CREATE, PERMISSIONS.STAFF.CREATE, PERMISSIONS.STUDENT.CREATE),
  logIpMiddleware,
  validate(CreateUserSchema),
  userController.create,
);

router.get('/', verifyToken, requirePermission(PERMISSIONS.USER.VIEW, PERMISSIONS.STUDENT.VIEW, PERMISSIONS.CLASS.CREATE, PERMISSIONS.CLASS.EDIT), logIpMiddleware, userController.getAll);
router.get(
  '/teachers',
  verifyToken,
  requirePermission(PERMISSIONS.TEACHER.VIEW, PERMISSIONS.CLASS.CREATE, PERMISSIONS.CLASS.VIEW),
  userController.getAllTeachers,
);
router.get('/students', verifyToken, requirePermission(PERMISSIONS.STUDENT.VIEW), userController.getAllStudents);
router.get('/staff', verifyToken, requirePermission(PERMISSIONS.STAFF.VIEW), userController.getStaff);
router.get(
  '/:id',
  verifyToken,
  requirePermission(
    PERMISSIONS.USER.VIEW,
    PERMISSIONS.TEACHER.VIEW,
    PERMISSIONS.STAFF.VIEW,
    PERMISSIONS.STUDENT.VIEW,
    PERMISSIONS.USER.EDIT,
    PERMISSIONS.USER.DELETE,
  ),
  userController.getOne,
);
router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.USER.EDIT, PERMISSIONS.TEACHER.EDIT, PERMISSIONS.STAFF.EDIT, PERMISSIONS.STUDENT.EDIT),
  validate(UpdateUserSchema),
  userController.update,
);
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.USER.DELETE, PERMISSIONS.TEACHER.DELETE, PERMISSIONS.STAFF.DELETE, PERMISSIONS.STUDENT.DELETE), userController.delete);
router.post('/:id/password', verifyToken, validate(updatePasswordSchema), userController.updatePassword);

export default router;
