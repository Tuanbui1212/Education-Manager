import { useState } from 'react';
import StudentImage from '../assets/image/login-image.png';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      alert('Vui lòng nhập email đăng nhập của bạn');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
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
          {!isSuccess ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Quên mật khẩu?</h2>
                <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">
                  Đừng lo lắng! Hãy nhập email liên kết với tài khoản của bạn, chúng tôi sẽ gửi liên kết để đặt lại mật
                  khẩu.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6 w-full">
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-btn text-white font-semibold text-sm py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Đang gửi yêu cầu...
                      </>
                    ) : (
                      'Gửi liên kết đặt lại'
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">Kiểm tra email của bạn</h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 px-4">
                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email <br />
                <span className="font-bold text-gray-800">{email}</span>
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-primary hover:bg-primary-btn text-white font-semibold text-sm py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Quay lại trang đăng nhập
                </button>

                <p className="text-xs text-gray-400 font-medium mt-4">
                  Không nhận được email?{' '}
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={isLoading}
                    className="text-primary hover:underline font-semibold disabled:opacity-50"
                  >
                    Gửi lại
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
