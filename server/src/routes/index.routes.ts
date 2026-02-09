import { Application } from "express-serve-static-core";
import userRouter from "./user.routes";

function router(app: Application) {
  app.use("/api/users", userRouter);
}

export default router;
