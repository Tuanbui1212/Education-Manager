import StudentPortal from '../pages/StudentPortal';
import StudentAttendancePage from '../pages/StudentAttendancePage';

import { PATHS } from '../utils/constants';
import ProfileLayout from '../layouts/ProfileLayout';

export const mainRoutes = [
    { path: PATHS.STUDENT_PORTAL, component: StudentPortal, layout: ProfileLayout },
    { path: PATHS.STUDENT_ATTENDANCE, component: StudentAttendancePage, layout: ProfileLayout },
];
