import { Router } from 'express';
import { ClassRequestController } from '../controllers/classRequest.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();
const classRequestController = new ClassRequestController();

router.post('/', verifyToken, classRequestController.create);
router.get('/', verifyToken, classRequestController.getAll);
router.delete('/', verifyToken, classRequestController.deleteByCreatorId);
router.post('/runGA', verifyToken, classRequestController.runGA);
router.put('/:id', verifyToken, classRequestController.update);

export default router;
