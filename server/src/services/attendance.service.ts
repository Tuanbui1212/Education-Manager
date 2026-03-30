import { AttendanceModel } from "../models/attendance.model";
import { ScheduleModel } from "../models/schedule.model";
import { ClassModel } from "../models/class.model";
import { Types } from "mongoose";
import { AttendanceStatus, HomeworkStatus } from "../types/attendance.type";
import { z } from "zod";
import { UpsertAttendanceItemSchema } from "../validations/attendance.validation";
import { AttendanceNotificationModel } from "../models/attendanceNotification.model";
import { getIO, userSocketMap } from "../lib/socket";

type UpsertAttendanceData = z.infer<typeof UpsertAttendanceItemSchema>;

export class AttendanceService {

    async getAllClasses(query: any, userId: string) {
        const { page = 1, limit = 10, shiftId, search } = query;
        const match: any = {};
        if (shiftId) match.shiftId = new Types.ObjectId(shiftId);
        if (search) match.name = { $regex: search, $options: 'i' };
        match.teacherId = new Types.ObjectId(userId);

        const skip = (Number(page) - 1) * Number(limit);

        const pipeline: any[] = [
            { $match: match },
            { $match: { status: 'ACTIVE' } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: Number(limit) },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'courseId',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'teacherId',
                    foreignField: '_id',
                    as: 'teacherInfo'
                }
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'roomId',
                    foreignField: '_id',
                    as: 'roomInfo'
                }
            },
            {
                $project: {
                    name: 1,
                    courseName: { $arrayElemAt: ['$courseInfo.title', 0] },
                    teacherName: { $arrayElemAt: ['$teacherInfo.fullName', 0] },
                    roomName: { $arrayElemAt: ['$roomInfo.name', 0] },
                }
            }
        ];

        const [classes, totalCountResult] = await Promise.all([
            ClassModel.aggregate([
                ...pipeline
            ]),
            ClassModel.aggregate([
                ...pipeline,
                { $count: 'total' }
            ])
        ]);

        const totalCount = totalCountResult.length > 0 ? totalCountResult[0].total : 0;

        return { data: classes, totalCount };
    }

    async getAllAttendancesByClassId(classId: string, query: any) {
        const { page = 1, limit = 10, shiftId } = query;
        const match: any = {};
        match.classId = new Types.ObjectId(classId);
        if (shiftId) match.shiftId = new Types.ObjectId(shiftId);

        const skip = (Number(page) - 1) * Number(limit);

        const pipeline: any[] = [
            { $match: match },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'classInfo'
                }
            },
            { $unwind: { path: '$classInfo' } },
            { $match: { 'classInfo.status': 'ACTIVE' } },
        ];

        const [schedules, totalCountResult] = await Promise.all([
            ScheduleModel.aggregate([
                ...pipeline,
                { $sort: { date: 1 } },
                { $skip: skip },
                { $limit: Number(limit) },
                {
                    $lookup: {
                        from: 'shifts',
                        localField: 'shiftId',
                        foreignField: '_id',
                        as: 'shiftInfo'
                    }
                },
                { $unwind: { path: '$shiftInfo', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'attendances',
                        localField: '_id',
                        foreignField: 'scheduleId',
                        as: 'attendances'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        date: 1,
                        classId: 1,
                        className: '$classInfo.name',
                        shiftId: 1,
                        shiftName: '$shiftInfo.name',
                        totalStudents: { $size: { $ifNull: ['$classInfo.studentIds', []] } },
                        presentCount: {
                            $size: {
                                $filter: {
                                    input: '$attendances',
                                    as: 'att',
                                    cond: { $in: ['$$att.status', [AttendanceStatus.PRESENT, AttendanceStatus.LATE]] }
                                }
                            }
                        },
                        absentCount: {
                            $size: {
                                $filter: {
                                    input: '$attendances',
                                    as: 'att',
                                    cond: { $eq: ['$$att.status', AttendanceStatus.ABSENT] }
                                }
                            }
                        },
                        isAttended: { $gt: [{ $size: '$attendances' }, 0] }
                    }
                }
            ]),
            ScheduleModel.aggregate([
                ...pipeline,
                { $count: 'total' }
            ])
        ]);

        const totalCount = totalCountResult.length > 0 ? totalCountResult[0].total : 0;

        return { data: schedules, totalCount };
    }

    async getListAttendanceByClassId(classId: string, scheduleId: string, query: any) {
        const { page = 1, limit = 10 } = query;
        const skip = (Number(page) - 1) * Number(limit);

        const schedule = await ScheduleModel.findById(scheduleId);
        if (!schedule) throw new Error("Không tìm thấy buổi học");

        const classData = await ClassModel.findById(classId).populate('studentIds', 'fullName email phone code');
        if (!classData) throw new Error("Không tìm thấy lớp học");

        const attendances = await AttendanceModel.find({ scheduleId });

        const students = classData.studentIds as any[];
        const totalCount = students.length;
        const paginatedStudents = students.slice(skip, skip + Number(limit));

        const attendanceMap = new Map(attendances.map(a => [a.studentId.toString(), a]));

        const data = paginatedStudents.map(student => {
            const studentIdStr = student._id.toString();
            const record = attendanceMap.get(studentIdStr);

            if (record) {
                return {
                    studentInfo: student,
                    attendance: record
                };
            }

            return {
                studentInfo: student,
                attendance: {
                    scheduleId: schedule._id,
                    studentId: student._id,
                    classId: classData._id,
                    status: AttendanceStatus.ABSENT,
                    homework: HomeworkStatus.NO_HOMEWORK,
                    teacherComment: '',
                    mark: undefined
                }
            };
        });

        return { data, totalCount };
    }

    async upsert(attendances: UpsertAttendanceData[]) {
        if (!attendances || attendances.length === 0) return [];

        const ops = attendances.map(att => ({
            updateOne: {
                filter: { scheduleId: att.scheduleId, studentId: att.studentId },
                update: { $set: att },
                upsert: true
            }
        }));

        await AttendanceModel.bulkWrite(ops);

        const updatedAttendances = await AttendanceModel.aggregate([
            {
                $match: {
                    $or: attendances.map(att => ({ scheduleId: att.scheduleId, studentId: att.studentId }))
                }
            },
            {
                $lookup: {
                    from: 'schedules',
                    localField: 'scheduleId',
                    foreignField: '_id',
                    as: 'schedule'
                }
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classId',
                    foreignField: '_id',
                    as: 'class'
                }
            },
            { $unwind: '$schedule' },
            { $unwind: '$class' },
            {
                $project: {
                    studentId: 1,
                    status: 1,
                    homework: 1,
                    teacherComment: 1,
                    mark: 1,
                    date: '$schedule.date',
                    className: '$class.name'
                }
            }
        ]);

        const notifications = updatedAttendances.map(att => {
            return ({
                userId: att.studentId,
                title: `Cập nhật điểm danh và nhận xét ngày ${new Date(att.date).toLocaleDateString('vi-VN')}`,
                content: `${att.status === AttendanceStatus.PRESENT ? 'Có mặt' : 'Vắng mặt'} - 
                    ${att.homework === HomeworkStatus.DONE ? 'Đã nộp bài tập' : 'Chưa nộp bài tập'} 
                    ${att.mark ? ` - Điểm: ${att.mark}` : ''} 
                    ${att.teacherComment ? ` - Nhận xét: ${att.teacherComment}` : ''}`,
                attendanceId: att._id,
                isRead: false
            })
        });

        const savedNotifs = await AttendanceNotificationModel.insertMany(notifications);
        const io = getIO();

        savedNotifs.forEach(notif => {
            const socketId = userSocketMap.get(notif.userId.toString());
            if (socketId) {
                io.to(socketId).emit('new_notification', notif);
            }
        });

        return { success: true, message: "Lưu điểm danh thành công" };
    }
}
