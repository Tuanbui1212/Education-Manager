import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { validate } from '../middlewares/validate.middleware';
import { CreateRoomSchema, RoomIdSchema, UpdateRoomSchema } from '../validations/room.validation';

import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions.config';

const router = Router();
const roomController = new RoomController();
router.post(
  '/',
  verifyToken,
  requirePermission(PERMISSIONS.ROOM.CREATE),
  validate(CreateRoomSchema),
  roomController.create,
);
router.get('/', verifyToken, requirePermission(PERMISSIONS.ROOM.VIEW, PERMISSIONS.CLASS.CREATE), roomController.getAll);
router.get(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.ROOM.VIEW),
  validate(RoomIdSchema, 'params'),
  roomController.getOne,
);
router.put(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.ROOM.EDIT),
  validate(RoomIdSchema, 'params'),
  validate(UpdateRoomSchema),
  roomController.update,
);
router.delete(
  '/:id',
  verifyToken,
  requirePermission(PERMISSIONS.ROOM.DELETE),
  validate(RoomIdSchema, 'params'),
  roomController.delete,
);

export default router;
