export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export type HomeworkStatus = 'DONE' | 'NOT_DONE' | 'NO_HOMEWORK';

export interface IAttendance {
    _id?: string;
    scheduleId: string;
    studentId: string;
    classId: string;
    homework: HomeworkStatus;
    teacherComment: string;
    status: AttendanceStatus;
}

export interface IAttendanceRecord {
    studentInfo: {
        _id: string;
        fullName: string;
        code: string;
        email?: string;
        phone?: string;
    };
    attendance: IAttendance;
}

export interface IActiveClass {
    _id: string;
    name: string;
    courseName: string;
    teacherName: string;
    roomName: string;
}

export interface IScheduleStat {
    _id: string;
    date: string;
    classId: string;
    className: string;
    shiftId: string;
    shiftName: string;
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    isAttended?: boolean;
}
