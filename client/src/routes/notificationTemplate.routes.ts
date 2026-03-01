import { PATHS } from "../utils/constants";
import ListNotificationTemplate from "../pages/Private/NotificationTemplateManagement/ListNotificationTemplate";
import DashboardLayout from "../layouts/DashboardLayout";

export const notificationTemplateRoutes = [
    { path: PATHS.SETTINGS_NOTIFICATION_TEMPLATES, component: ListNotificationTemplate, layout: DashboardLayout }
];
