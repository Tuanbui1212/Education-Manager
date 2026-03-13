import { ClassModel } from "../models/class.model";
import { ScheduleModel } from "../models/schedule.model";
import { CreateScheduleType, UpdateScheduleType } from "../validations/schedule.validation";
import { ShiftModel } from "../models/shift.model";
import { RoomModel } from "../models/room.model";
import { UserModel } from "../models/user.model";
import { GetSchedulesQuery } from "@/types/schedule.type";
import { Types } from "mongoose";

export class ScheduleService {
    async createSchedule(schedule: CreateScheduleType) {
        const existingSchedule = await ScheduleModel.findOne({
            classId: schedule.classId, shiftId: schedule.shiftId,
            roomId: schedule.roomId, date: schedule.date
        });
        if (existingSchedule) {
            throw new Error("Lịch học đã tồn tại");
        }
        if (schedule.teacherId) {
            const existingUser = await UserModel.findById(schedule.teacherId);
            if (!existingUser) {
                throw new Error("Người dùng không tồn tại");
            }
        }
        const existingClass = await ClassModel.findById(schedule.classId);
        if (!existingClass) {
            throw new Error("Lớp học không tồn tại");
        }
        const existingShift = await ShiftModel.findById(schedule.shiftId);
        if (!existingShift) {
            throw new Error("Ca học không tồn tại");
        }
        const existingRoom = await RoomModel.findById(schedule.roomId);
        if (!existingRoom) {
            throw new Error("Phòng học không tồn tại");
        }
        return await ScheduleModel.create(schedule);
    }

    async getAllSchedules(query: GetSchedulesQuery) {
        const { page = 1, limit = 10, classId, roomId, teacherId } = query;
        const skip = (Number(page) - 1) * Number(limit);

        const filter: any = {};
        if (classId) filter.classId = new Types.ObjectId(classId);
        if (roomId) filter.roomId = new Types.ObjectId(roomId);
        if (teacherId) filter.teacherId = new Types.ObjectId(teacherId);
        const [total, schedules] = await Promise.all([
            ScheduleModel.countDocuments(filter),
            ScheduleModel.find(filter).sort({ date: 1 }).skip(skip).limit(limit).populate('classId', 'name')
                .populate('shiftId', 'name').populate('roomId', 'name')
                .populate('teacherId', 'fullName').populate('attendances', 'fullName'),
        ])
        return { schedules, total };
    }

    async getScheduleById(id: string) {
        return await ScheduleModel.findById(id).populate('classId', 'name')
            .populate('shiftId', 'name').populate('roomId', 'name')
            .populate('teacherId', 'fullName').populate('attendances', 'fullName');
    }

    async updateSchedule(id: string, schedule: UpdateScheduleType) {
        const existingSchedule = await ScheduleModel.findById(id);
        if (!existingSchedule) {
            throw new Error("Lịch học không tồn tại");
        }
        if (schedule.classId) {
            const existingClass = await ClassModel.findById(schedule.classId);
            if (!existingClass) {
                throw new Error("Lớp học không tồn tại");
            }
        }
        if (schedule.shiftId) {
            const existingShift = await ShiftModel.findById(schedule.shiftId);
            if (!existingShift) {
                throw new Error("Ca học không tồn tại");
            }
        }
        if (schedule.roomId) {
            const existingRoom = await RoomModel.findById(schedule.roomId);
            if (!existingRoom) {
                throw new Error("Phòng học không tồn tại");
            }
        }
        if (schedule.teacherId) {
            const existingUser = await UserModel.findById(schedule.teacherId);
            if (!existingUser) {
                throw new Error("Người dùng không tồn tại");
            }
        }
        return await ScheduleModel.findByIdAndUpdate(id, schedule, { new: true }).populate('classId', 'name')
            .populate('shiftId', 'name').populate('roomId', 'name')
            .populate('teacherId', 'fullName').populate('attendances', 'fullName');
    }

    async deleteSchedule(id: string) {
        return await ScheduleModel.findByIdAndDelete(id);
    }
}