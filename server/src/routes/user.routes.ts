import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middlewares/validate.middleware';
import { CreateUserSchema, updatePasswordSchema, UpdateUserSchema } from '../validations/users.validation';
import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();
const userController = new UserController();

router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.USER.CREATE),
  validate(CreateUserSchema),
  userController.create,
);

router.get('/', verifyToken, requirePermission(PERMISSIONS.USER.VIEW), userController.getAll);

router.get('/staff', verifyToken, userController.getStaff);
router.get('/:id', verifyToken, requirePermission(PERMISSIONS.USER.VIEW), userController.getOne);
router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.USER.EDIT),
  validate(UpdateUserSchema),
  userController.update,
);
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.USER.DELETE), userController.delete);
router.post('/:id/password', verifyToken, validate(updatePasswordSchema), userController.updatePassword);

export default router;
