import { Router } from "express";
import { CourseController } from "../controllers/course.controller";
import { validate } from "../middlewares/validate.middleware";
import { CreateCourseSchema, CourseIdSchema, UpdateCourseSchema } from "../validations/course.validation";

const router = Router();
const courseController = new CourseController();

router.post("/", validate(CreateCourseSchema), courseController.create);
router.get("/", courseController.getAll);
router.get("/:id", validate(CourseIdSchema, "params"), courseController.getOne);
router.put("/:id", validate(CourseIdSchema, "params"), validate(UpdateCourseSchema), courseController.update);
router.delete("/:id", validate(CourseIdSchema, "params"), courseController.delete);

export default router;
