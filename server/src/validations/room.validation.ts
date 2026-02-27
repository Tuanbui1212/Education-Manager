import { z } from "zod"
import { RoomType } from "../types/room.type"

export const CreateRoomSchema = z.object({
    name: z.string({ message: 'Tên phòng là bắt buộc' }).min(1, "Tên phòng không được để trống").max(50, "Tên phòng không quá 50 ký tự"),
    capacity: z.number({ message: 'Số lượng học sinh là bắt buộc' }).min(1, "Số lượng học sinh phải lớn hơn 0"),
    status: z.enum(RoomType, { message: 'Trạng thái phòng không hợp lệ' }).default(RoomType.ACTIVE),
})

export const RoomIdSchema = z.object({
    id: z.string({ message: 'ID phòng là bắt buộc' }).trim().min(1, 'ID phòng không được để trống')
    .regex(/^[0-9a-fA-F]{24}$/, 'ID không đúng định dạng ObjectId'),
})

export const UpdateRoomSchema = CreateRoomSchema.partial()

export type CreateRoomType = z.infer<typeof CreateRoomSchema>
export type UpdateRoomType = z.infer<typeof UpdateRoomSchema>
export type RoomIdType = z.infer<typeof RoomIdSchema>
