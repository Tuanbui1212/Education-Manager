import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middlewares/validate.middleware';
import { CreateUserSchema, UpdateUserSchema } from '../validations/users.validation';
import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();
const userController = new UserController();

// [POST] Tạo mới User
router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.USER.CREATE),
  validate(CreateUserSchema),
  userController.create,
);

// [GET] Lấy danh sách Users
router.get('/', verifyToken, requirePermission(PERMISSIONS.USER.VIEW), userController.getAll);

// [GET] Lấy chi tiết 1 User
router.get('/:id', verifyToken, requirePermission(PERMISSIONS.USER.VIEW), userController.getOne);

// [PUT] Cập nhật User
router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.USER.EDIT),
  validate(UpdateUserSchema),
  userController.update,
);

// [DELETE] Xóa User
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.USER.DELETE), userController.delete);

export default router;
