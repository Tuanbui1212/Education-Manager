import { useState } from 'react';
import StudentImage from '../assets/image/login-image.png';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { PATHS } from '../utils/constants';
import { getDecodedToken } from '../utils/auth';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login(email, password);

      if (result && result.data) {
        localStorage.setItem('accessToken', result.data);
        const decodedToken = getDecodedToken();
        const role = decodedToken?.role;
        if (role?.name.toLowerCase().includes('admin')) {
          navigate(PATHS.HOME);
        } else if (role?.name.toLowerCase().includes('teacher')) {
          navigate(PATHS.TEACHER_PORTAL);
        } else if (role?.name.toLowerCase().includes('student')) {
          navigate(PATHS.STUDENT_PORTAL);
        } else {
          navigate(PATHS.HOME);
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px]"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[100px]"></div>
      </div>

      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[500px] relative z-10">
        <div className="w-full md:w-1/2 bg-blue-50/50 flex flex-col items-center justify-center p-12 relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50/30"></div>
          <img
            src={StudentImage}
            alt="TN Education System"
            className="w-[85%] h-auto object-contain relative z-10 drop-shadow-xl hover:scale-105 transition-transform duration-700"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">TN Education</h2>
            <p className="text-sm text-gray-500 mt-2 font-medium">Hệ thống Quản trị & Đào tạo nội bộ</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 w-full">
            <input type="text" name="fakeusernameremembered" className="hidden" />
            <input type="password" name="fakepasswordremembered" className="hidden" />

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 block">Email đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tn-education.com"
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center">
                <label className="text-sm font-semibold text-gray-700 block">Mật khẩu</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
                />

                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex items-center pt-1">
                <Link
                  to={PATHS.FORGOT_PASSWORD}
                  className="text-xs ms-auto font-semibold text-primary hover:text-primary-btn hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-btn text-white font-semibold text-sm py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Đang xác thực...
                  </>
                ) : (
                  'Đăng nhập hệ thống'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
