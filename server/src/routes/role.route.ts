import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { validate } from '../middlewares/validate.middleware';
import { createRoleSchema, updateRoleSchema } from '../validations/role.validation';

const router = Router();
const roleController = new RoleController();

router.post('/', validate(createRoleSchema), roleController.create);
router.get('/', roleController.getAll);
router.get('/:id', roleController.getById);
router.put('/:id', validate(updateRoleSchema), roleController.update);
router.delete('/:id', roleController.remove);

export default router;
