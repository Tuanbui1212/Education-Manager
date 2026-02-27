import { Router } from 'express';
import { ExpenditureController } from '../controllers/expenditure.controller';
import { validate } from '../middlewares/validate.middleware';
import { CreateExpenditureSchema, UpdateExpenditureSchema } from '../validations/expenditure.validation';

const router = Router();
const expenditureController = new ExpenditureController();

router.post('/', validate(CreateExpenditureSchema), expenditureController.create);
router.get('/', expenditureController.getAll);
router.put('/:id', validate(UpdateExpenditureSchema), expenditureController.update);
router.delete('/:id', expenditureController.delete);

export default router;
