import { Application } from "express-serve-static-core";
import userRouter from "./user.routes";
import roomRouter from "./room.routes";

function router(app: Application) {
  app.use("/api/users", userRouter);
  app.use("/api/rooms", roomRouter);
}

export default router;
