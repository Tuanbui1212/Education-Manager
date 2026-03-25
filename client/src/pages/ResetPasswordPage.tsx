import { useState, useEffect } from 'react';
import StudentImage from '../assets/image/login-image.png';
import { Lock, Loader2, ArrowLeft, CheckCircle2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth.service';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  console.log(token);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const isValidLink = !!token;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      alert('Vui lòng nhập đầy đủ mật khẩu mới');
      return;
    }

    if (password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token as string, password);

      setIsSuccess(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Link đã hết hạn hoặc có lỗi xảy ra!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Hiệu ứng nền */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px]"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 blur-[100px]"></div>
      </div>

      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[500px] relative z-10">
        {/* CỘT TRÁI: Hình ảnh */}
        <div className="w-full md:w-1/2 bg-blue-50/50 flex flex-col items-center justify-center p-12 relative overflow-hidden hidden md:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50/30"></div>
          <img
            src={StudentImage}
            alt="TN Education System"
            className="w-[85%] h-auto object-contain relative z-10 drop-shadow-xl hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* CỘT PHẢI: Form thao tác */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
          {!isValidLink ? (
            /* TRẠNG THÁI LỖI: Link không có token */
            <div className="text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">Liên kết không hợp lệ</h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 px-4">
                Đường dẫn đặt lại mật khẩu của bạn bị thiếu mã xác thực hoặc đã bị hỏng. Vui lòng yêu cầu lại một liên
                kết mới.
              </p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-primary hover:bg-primary-btn text-white font-semibold text-sm py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98]"
              >
                Yêu cầu liên kết mới
              </button>
            </div>
          ) : !isSuccess ? (
            /* TRẠNG THÁI 1: FORM NHẬP MẬT KHẨU MỚI */
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Tạo mật khẩu mới</h2>
                <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">
                  Mật khẩu mới của bạn phải khác với các mật khẩu đã sử dụng trước đây.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5 w-full">
                {/* Input: Mật khẩu mới */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 block">Mật khẩu mới</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
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
                </div>

                {/* Input: Xác nhận mật khẩu mới */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 block">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      disabled={isLoading}
                      className={`w-full pl-11 pr-12 py-3 bg-gray-50 border rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-50 ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                          : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1 pl-1">Mật khẩu xác nhận không khớp!</p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-btn text-white font-semibold text-sm py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Đang cập nhật...
                      </>
                    ) : (
                      'Đặt lại mật khẩu'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* TRẠNG THÁI 2: THÔNG BÁO THÀNH CÔNG */
            <div className="text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">Đổi mật khẩu thành công!</h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 px-4">
                Mật khẩu của bạn đã được cập nhật an toàn. Bây giờ bạn có thể đăng nhập vào hệ thống bằng mật khẩu mới.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-primary hover:bg-primary-btn text-white font-semibold text-sm py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98]"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
