import { Router } from 'express';
import { ExamController } from '../controllers/exam.controller';
import { validate } from '../middlewares/validate.middleware';
import {
    CreateExamSchema,
    UpdateExamSchema,
    ExamIdSchema,
    CopyExamSchema,
    StartSubmissionSchema,
    SubmitSubmissionSchema,
} from '../validations/exam.validation';
import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();
const examController = new ExamController();

router.post('/submissions/start', verifyToken, validate(StartSubmissionSchema), examController.startSubmission);
router.put('/submissions/:id/submit', verifyToken, validate(SubmitSubmissionSchema), examController.submitSubmission);
router.get('/submissions/active', verifyToken, examController.getActiveSubmission);
router.get('/submissions', verifyToken, examController.getSubmission);

router.get('/by-classes', verifyToken, examController.getByClasses);

router.get('/', verifyToken, requirePermission(PERMISSIONS.SCORE.VIEW), examController.getAll);
router.post('/', verifyToken, requirePermission(PERMISSIONS.SCORE.EDIT), validate(CreateExamSchema), examController.create);
router.get('/:id', verifyToken, validate(ExamIdSchema, 'params'), examController.getOne);
router.put('/:id', verifyToken, requirePermission(PERMISSIONS.SCORE.EDIT), validate(ExamIdSchema, 'params'), validate(UpdateExamSchema), examController.update);
router.delete('/:id', verifyToken, requirePermission(PERMISSIONS.SCORE.EDIT), validate(ExamIdSchema, 'params'), examController.delete);

router.post('/:id/copy', verifyToken, requirePermission(PERMISSIONS.SCORE.EDIT), validate(ExamIdSchema, 'params'), validate(CopyExamSchema), examController.copy);

router.get('/:id/submissions', verifyToken, requirePermission(PERMISSIONS.SCORE.VIEW), validate(ExamIdSchema, 'params'), examController.getExamSubmissions);

export default router;
