import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateUserSchema, UpdateUserSchema, IdParamSchema } from '../validations/users.validation';

const router = Router();
const userController = new UserController();
router.post('/', verifyToken, checkAdmin, validate(CreateUserSchema), userController.create);
router.get('/', verifyToken, checkAdmin, userController.getAll);
router.get('/:id', verifyToken, checkAdmin, validate(IdParamSchema, 'params'), userController.getOne);
router.put('/:id', verifyToken, checkAdmin, validate(IdParamSchema, 'params'), validate(UpdateUserSchema), userController.update);
router.delete('/:id', verifyToken, checkAdmin, validate(IdParamSchema, 'params'), userController.delete);

export default router;
