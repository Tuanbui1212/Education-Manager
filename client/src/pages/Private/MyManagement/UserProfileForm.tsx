import { useState } from 'react';
import { User, Mail, Phone, Lock, ShieldCheck, Save, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { getDecodedToken } from '../../../utils/auth';

const UserProfileForm = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [userInfo, setUserInfo] = useState(() => {
    const user = getDecodedToken();
    return {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.name?.charAt(0).toUpperCase() || 'U',
    };
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    showSuccess();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    showSuccess();
  };

  const showSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      {/* Header Profile */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="h-32 bg-primary relative">
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl">
                <div className="w-full h-full rounded-2xl bg-gray-50 flex items-center justify-center text-3xl font-black text-primary border border-gray-100">
                  {userInfo.avatar}
                </div>
              </div>
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-bold text-gray-900">{userInfo.fullName}</h1>
              <p className="text-sm text-gray-500 font-medium">{userInfo.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs - Sử dụng màu primary */}
        <div className="pt-16 pb-4 px-8 flex gap-8 border-b border-gray-50">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'info' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Thông tin chung
            {activeTab === 'info' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'security' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Bảo mật & Mật khẩu
            {activeTab === 'security' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Form chính */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            {activeTab === 'info' ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Họ và tên"
                    icon={<User size={18} />}
                    value={userInfo.fullName}
                    onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                  />
                  <InputField
                    label="Số điện thoại"
                    icon={<Phone size={18} />}
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                  />
                </div>
                <InputField
                  label="Email liên hệ"
                  icon={<Mail size={18} />}
                  value={userInfo.email}
                  disabled
                  className="bg-gray-50 cursor-not-allowed text-gray-500"
                />

                <div className="pt-4 border-t border-gray-50 flex justify-end">
                  <Button
                    variant="primary"
                    className="px-8 rounded-xl shadow-lg shadow-primary/20"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    Lưu thay đổi
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <InputField
                  label="Mật khẩu hiện tại"
                  type="password"
                  icon={<Lock size={18} />}
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  placeholder="••••••••"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Mật khẩu mới"
                    type="password"
                    icon={<KeyRound size={18} />}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  <InputField
                    label="Xác nhận mật khẩu"
                    type="password"
                    icon={<ShieldCheck size={18} />}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>

                <div className="pt-4 border-t border-gray-50 flex justify-end">
                  <Button
                    variant="primary"
                    className="px-8 rounded-xl shadow-lg shadow-primary/20"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
                    Cập nhật mật khẩu
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Cột phải: Trạng thái & Gợi ý (Đã dọn dẹp màu blue-xx) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6">
            <h3 className="font-bold text-primary flex items-center gap-2 mb-4">
              <ShieldCheck size={20} />
              Độ an toàn tài khoản
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Xác thực Email</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Đã xong
                </span>
              </div>
              {/* Progress bar sử dụng màu primary */}
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[80%] rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]"></div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed italic">
                * Gợi ý: Bạn nên sử dụng mật khẩu có cả chữ hoa, chữ thường và ký tự đặc biệt để bảo vệ tài khoản tốt
                hơn.
              </p>
            </div>
          </div>

          {isSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3 text-emerald-700 animate-in zoom-in-95">
              <CheckCircle2 size={24} className="shrink-0" />
              <p className="text-sm font-bold">Cập nhật thành công!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;
