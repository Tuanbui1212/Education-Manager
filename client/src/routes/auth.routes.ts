import { Fragment } from "react/jsx-runtime";

import LoginPage from "../pages/LoginPage";
import { PATHS } from "../utils/constants";

export const authRoutes = [
  { path: PATHS.LOGIN, component: LoginPage, layout: Fragment },
];
