import { AttendanceModel } from "../models/attendance.model";
import { ScheduleModel } from "../models/schedule.model";
import { ClassModel } from "../models/class.model";
import { Types } from "mongoose";
import { AttendanceStatus, HomeworkStatus } from "../types/attendance.type";
import { z } from "zod";
import { UpsertAttendanceItemSchema } from "../validations/attendance.validation";

type UpsertAttendanceData = z.infer<typeof UpsertAttendanceItemSchema>;

export class AttendanceService {
    async getScheduleStats(query: any) {
        const { page = 1, limit = 10, classId, shiftId } = query;
        const match: any = {};
        if (classId) match.classId = new Types.ObjectId(classId);
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
                        }
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

    async getAttendanceBySchedule(scheduleId: string) {
        const schedule = await ScheduleModel.findById(scheduleId);
        if (!schedule) throw new Error("Không tìm thấy buổi học");

        const classData = await ClassModel.findById(schedule.classId).populate('studentIds', 'fullName code email phone');
        if (!classData) throw new Error("Không tìm thấy lớp học");

        const attendances = await AttendanceModel.find({ scheduleId });

        const students = classData.studentIds as any[];
        const attendanceMap = new Map(attendances.map(a => [a.studentId.toString(), a]));

        const result = students.map(student => {
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
                    teacherComment: ''
                }
            };
        });

        return result;
    }

    async upsertAttendances(attendances: UpsertAttendanceData[]) {
        if (!attendances || attendances.length === 0) return [];

        const ops = attendances.map(att => ({
            updateOne: {
                filter: { scheduleId: att.scheduleId, studentId: att.studentId },
                update: { $set: att },
                upsert: true
            }
        }));

        await AttendanceModel.bulkWrite(ops);
        return { success: true, message: "Lưu điểm danh thành công" };
    }
}
