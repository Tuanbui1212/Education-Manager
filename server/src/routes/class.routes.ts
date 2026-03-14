import { Router } from 'express';
import { ClassController } from '../controllers/class.controller';
import { validate } from '../middlewares/validate.middleware';
import { ClassIdSchema, CreateClassSchema, UpdateClassSchema } from '../validations/class.validation';

const router = Router();
const classController = new ClassController();

router.post('/', validate(CreateClassSchema), classController.create);
router.get('/', classController.getAll);
router.get('/student/:id', classController.getClassByStudentId);
router.get('/:id', validate(ClassIdSchema, 'params'), classController.getOne);
router.put('/:id', validate(ClassIdSchema, 'params'), validate(UpdateClassSchema), classController.update);
router.delete('/:id', validate(ClassIdSchema, 'params'), classController.delete);
router.get('/:id/students', validate(ClassIdSchema, 'params'), classController.getAllStudents);

export default router;
