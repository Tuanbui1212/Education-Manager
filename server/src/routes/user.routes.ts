import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

import { validate } from '../middlewares/validate.middleware';
import { CreateUserSchema, UpdateUserSchema } from '../validations/users.validation';
import { verifyToken, checkAdmin } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

router.post('/', verifyToken, checkAdmin, validate(CreateUserSchema), userController.create);
router.get('/', verifyToken, checkAdmin, userController.getAll);
router.get('/:id', verifyToken, checkAdmin, userController.getOne);
router.put('/:id', verifyToken, checkAdmin, validate(UpdateUserSchema), userController.update);
router.delete('/:id', verifyToken, checkAdmin, userController.delete);

export default router;
