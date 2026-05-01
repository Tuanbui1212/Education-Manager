import StudentPortal from '../pages/Private/StudentPortal/StudentPortal';
import StudentAttendancePage from '../pages/Private/StudentPortal/StudentAttendancePage';
import TeacherPortal from '../pages/Private/TeacherPortal/TeacherPortal';
import TeacherAttendanceSchedules from '../pages/Private/TeacherPortal/TeacherAttendanceSchedules';
import TeacherAttendanceDetails from '../pages/Private/TeacherPortal/TeacherAttendanceDetails';

import { PATHS } from '../utils/constants';
import ProfileLayout from '../layouts/ProfileLayout';

import StudentExamPage from '../pages/Private/StudentPortal/StudentExamPage';
import ExamLayout from '../layouts/ExamLayout';

export const mainRoutes = [
    { path: PATHS.STUDENT_PORTAL, component: StudentPortal, layout: ProfileLayout },
    { path: PATHS.STUDENT_ATTENDANCE, component: StudentAttendancePage, layout: ProfileLayout },
    { path: PATHS.STUDENT_EXAM_TAKING, component: StudentExamPage, layout: ExamLayout },
    { path: PATHS.TEACHER_PORTAL, component: TeacherPortal, layout: ProfileLayout },
    { path: PATHS.TEACHER_ATTENDANCE_SCHEDULES, component: TeacherAttendanceSchedules, layout: ProfileLayout },
    { path: PATHS.TEACHER_ATTENDANCE_DETAILS, component: TeacherAttendanceDetails, layout: ProfileLayout },
];
