import { Router } from 'express';
import { ShiftController } from '../controllers/shift.controller';
import { validate } from '../middlewares/validate.middleware';
import { CreateShiftSchema, UpdateShiftSchema } from '../validations/shift.validation';

const router = Router();
const shiftController = new ShiftController();

router.post('/', validate(CreateShiftSchema), shiftController.create);
router.get('/', shiftController.getAll);

router.put('/:id', validate(UpdateShiftSchema), shiftController.update);
router.get('/:id', shiftController.getOne);
router.delete('/:id', shiftController.delete);

export default router;
