import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

import { validate } from '../middlewares/validate.middleware';
import { CreateUserSchema, UpdateUserSchema } from '../validations/users.validation';
import { verifyToken, checkAdmin } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

router.post('/', validate(CreateUserSchema), userController.create);
router.get('/', userController.getAll);

router.get('/:id', userController.getOne);
router.put('/:id', validate(UpdateUserSchema), userController.update);
router.delete('/:id', userController.delete);

export default router;
