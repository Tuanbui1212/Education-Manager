import StudentPortal from '../pages/Private/StudentPortal/StudentPortal';
import StudentAttendancePage from '../pages/Private/StudentPortal/StudentAttendancePage';
import StudentProfilePage from '../pages/Private/StudentPortal/StudentProfilePage';
import TeacherPortal from '../pages/Private/TeacherPortal/TeacherPortal';
import TeacherAttendanceSchedules from '../pages/Private/TeacherPortal/TeacherAttendanceSchedules';
import TeacherAttendanceDetails from '../pages/Private/TeacherPortal/TeacherAttendanceDetails';
import TeacherExamPage from '../pages/Private/TeacherPortal/TeacherExamPage';
import TeacherProfilePage from '../pages/Private/TeacherPortal/TeacherProfilePage';

import { PATHS } from '../utils/constants';
import PortalLayout from '../layouts/PortalLayout';

import StudentExamPage from '../pages/Private/StudentPortal/StudentExamPage';
import ExamLayout from '../layouts/ExamLayout';

export const mainRoutes = [
    { path: PATHS.STUDENT_PORTAL, component: StudentPortal, layout: PortalLayout },
    { path: PATHS.STUDENT_ATTENDANCE, component: StudentAttendancePage, layout: PortalLayout },
    { path: PATHS.STUDENT_EXAM_TAKING, component: StudentExamPage, layout: ExamLayout },
    { path: PATHS.PROFILE_STUDENT, component: StudentProfilePage, layout: PortalLayout },
    { path: PATHS.TEACHER_PORTAL, component: TeacherPortal, layout: PortalLayout },
    { path: PATHS.TEACHER_ATTENDANCE_SCHEDULES, component: TeacherAttendanceSchedules, layout: PortalLayout },
    { path: PATHS.TEACHER_ATTENDANCE_DETAILS, component: TeacherAttendanceDetails, layout: PortalLayout },
    { path: PATHS.TEACHER_EXAM_MANAGER, component: TeacherExamPage, layout: PortalLayout },
    { path: PATHS.PROFILE_TEACHER, component: TeacherProfilePage, layout: PortalLayout },
];
