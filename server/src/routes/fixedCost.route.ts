import { Router } from 'express';
import { FixedCostController } from '../controllers/fixedCost.controller';
import { validate } from '../middlewares/validate.middleware';
import { createFixedCostSchema, updateFixedCostSchema } from '../validations/fixedCost.validation';

const router = Router();
const fixedCostController = new FixedCostController();

router.post('/', validate(createFixedCostSchema), fixedCostController.create);
router.get('/', fixedCostController.getAll);
router.get('/:id', fixedCostController.getById);
router.put('/:id', validate(updateFixedCostSchema), fixedCostController.update);
router.delete('/:id', fixedCostController.remove);

export default router;
