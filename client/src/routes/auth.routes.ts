import { Fragment } from 'react/jsx-runtime';

import LoginPage from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';

import { PATHS } from '../utils/constants';

export const authRoutes = [
  { path: PATHS.LOGIN, component: LoginPage, layout: Fragment },
  { path: PATHS.FORGOT_PASSWORD, component: ForgotPasswordPage, layout: Fragment },
  { path: PATHS.RESET_PASSWORD, component: ResetPasswordPage, layout: Fragment },
];
