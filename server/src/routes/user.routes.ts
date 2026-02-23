import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

import { validate } from '../middlewares/validate.middleware';
import { CreateUserSchema, UpdateUserSchema, IdParamSchema } from '../validations/users.validation';

const router = Router();
const userController = new UserController();

router.post('/', validate(CreateUserSchema), userController.create);
router.get('/', userController.getAll);

router.get('/:id', validate(IdParamSchema, 'params'), userController.getOne);
router.put('/:id', validate(IdParamSchema, 'params'), validate(UpdateUserSchema), userController.update);
router.delete('/:id', validate(IdParamSchema, 'params'), userController.delete);

export default router;
