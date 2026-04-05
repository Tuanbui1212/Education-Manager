import StudentPortal from '../pages/StudentPortal';
import StudentAttendancePage from '../pages/StudentAttendancePage';
import TeacherPortal from '../pages/TeacherPortal';
import TeacherAttendanceSchedules from '../pages/TeacherAttendanceSchedules';
import TeacherAttendanceDetails from '../pages/TeacherAttendanceDetails';

import { PATHS } from '../utils/constants';
import ProfileLayout from '../layouts/ProfileLayout';

export const mainRoutes = [
    { path: PATHS.STUDENT_PORTAL, component: StudentPortal, layout: ProfileLayout },
    { path: PATHS.STUDENT_ATTENDANCE, component: StudentAttendancePage, layout: ProfileLayout },
    { path: PATHS.TEACHER_PORTAL, component: TeacherPortal, layout: ProfileLayout },
    { path: PATHS.TEACHER_ATTENDANCE_SCHEDULES, component: TeacherAttendanceSchedules, layout: ProfileLayout },
    { path: PATHS.TEACHER_ATTENDANCE_DETAILS, component: TeacherAttendanceDetails, layout: ProfileLayout },
];
