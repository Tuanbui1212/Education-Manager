import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, ShieldCheck, Save, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import ConfirmModal from '../../../components/ConfirmModal';
import InfoRow from '../../../components/InfoRow';
import { getDecodedToken } from '../../../utils/auth';

import { userService } from '../../../services/user.service';

import useFetch from '../../../hooks/useFetch';

import { formatDate, formatCurrency } from '../../../utils/format.util';

const UserProfileForm = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [idUser, setIdUser] = useState('');

  const [consultant, setConsultant] = useState('');

  const [confirm, setConfirm] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'danger' | 'warning' | 'info',
    confirmText: '',
    cancelText: '',
    onConfirm: () =>
      setConfirm((prev) => ({
        ...prev,
        isOpen: false,
      })),
    onClose: () =>
      setConfirm((prev) => ({
        ...prev,
        isOpen: false,
      })),
  });

  const [userInfo, setUserInfo] = useState(() => {
    const user = getDecodedToken();
    setIdUser(user?.id as string);
    return {
      fullName: user?.name,
      email: user?.email,
      phone: user?.phone,
      avatar: user?.name?.charAt(0).toUpperCase(),
    };
  });
  const { data: userInfor } = useFetch(userService.getUserById, idUser, []);

  useEffect(() => {
    const consultantId = userInfor?.student_info?.consultantId;
    const isStudent = typeof userInfor?.roleId === 'object' && userInfor?.roleId?.name?.toLowerCase() === 'student';

    if (isStudent && consultantId) {
      let isMounted = true;

      const fetchName = async () => {
        try {
          const res = await userService.getUserById(consultantId as string);

          if (isMounted) {
            setConsultant(res.data?.fullName || 'Không có tên');
          }
        } catch (error) {
          if (isMounted) {
            setConsultant('Không tìm thấy');
          }
        }
      };

      fetchName();

      return () => {
        isMounted = false;
      };
    }
  }, [userInfor]);

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const { email, avatar, ...dataWithoutEmail } = userInfo;
      setIsLoading(true);
      if (idUser) {
        const updateUser = await userService.updateUser(idUser, dataWithoutEmail);

        if (updateUser.success) {
          setIsLoading(false);
          setConfirm({
            isOpen: true,
            title: 'Thành công!',
            message: updateUser.message || 'Cập nhật thông tin thành công.',
            type: 'success',
            confirmText: 'Xác nhận',
            cancelText: '',
            onConfirm: () => setConfirm((prev) => ({ ...prev, isOpen: false })),
            onClose: () => setConfirm((prev) => ({ ...prev, isOpen: false })),
          });
        }
      }
    } catch (error) {
      const err = error as any;
      const errors = err.response?.data?.errors as Record<string, string[]>;

      const message = Object.values(errors ?? {})?.[0]?.[0] ?? err.response?.data?.message ?? 'Có lỗi xảy ra';

      setConfirm({
        isOpen: true,
        title: 'Lỗi!',
        message,
        type: 'danger',
        confirmText: 'Xác nhận',
        cancelText: '',
        onConfirm: () => setConfirm((prev) => ({ ...prev, isOpen: false })),
        onClose: () => setConfirm((prev) => ({ ...prev, isOpen: false })),
      });
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setConfirm({
          isOpen: true,
          title: 'Lỗi!',
          message: 'Mật khẩu mới và mật khẩu xác nhận không khớp.',
          type: 'danger',
          confirmText: 'Xác nhận',
          cancelText: '',
          onConfirm: () => setConfirm((prev) => ({ ...prev, isOpen: false })),
          onClose: () => setConfirm((prev) => ({ ...prev, isOpen: false })),
        });
        return;
      }
      setIsLoading(true);
      if (idUser) {
        const updatePassword = await userService.updatePassword(idUser, {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        });

        if (updatePassword.success) {
          setIsLoading(false);
          setConfirm({
            isOpen: true,
            title: 'Thành công!',
            message: updatePassword.message || 'Cập nhật thông tin thành công.',
            type: 'success',
            confirmText: 'Xác nhận',
            cancelText: '',
            onConfirm: () => setConfirm((prev) => ({ ...prev, isOpen: false })),
            onClose: () => setConfirm((prev) => ({ ...prev, isOpen: false })),
          });
        }
      }
    } catch (error) {
      const err = error as any;
      const errors = err.response?.data?.errors as Record<string, string[]>;

      const message = Object.values(errors ?? {})?.[0]?.[0] ?? err.response?.data?.message ?? 'Có lỗi xảy ra';

      setConfirm({
        isOpen: true,
        title: 'Lỗi!',
        message,
        type: 'danger',
        confirmText: 'Xác nhận',
        cancelText: '',
        onConfirm: () => setConfirm((prev) => ({ ...prev, isOpen: false })),
        onClose: () => setConfirm((prev) => ({ ...prev, isOpen: false })),
      });
      setIsLoading(false);
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const inputClassName =
    'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] bg-white text-slate-800 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all';

  return (
    <div className="max-w-5xl w-full mx-auto animate-in fade-in duration-500">
      <ConfirmModal
        isOpen={confirm.isOpen}
        onClose={confirm.onClose}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        message={confirm.message}
        type={confirm.type}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
      />
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="h-32 bg-slate-900 w-full"></div>

        <div className="px-8 pb-0 relative flex flex-col md:flex-row gap-6">
          <div className="-mt-14 relative shrink-0 z-10">
            <div className="w-32 h-32 bg-white rounded-[1.5rem] shadow-sm p-1.5 flex items-center justify-center border border-gray-100">
              <div className="w-full h-full bg-slate-50 rounded-[1.1rem] flex items-center justify-center text-5xl font-black text-slate-800 uppercase">
                {userInfo.avatar}
              </div>
            </div>
          </div>

          <div className="flex-1 pt-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{userInfo.fullName}</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">{userInfo.email}</p>

            {/* Tabs */}
            <div className="flex gap-8 mt-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('info')}
                className={`pb-3 text-sm font-bold transition-all relative ${
                  activeTab === 'info' ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Thông tin chung
                {activeTab === 'info' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-900" />}
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`pb-3 text-sm font-bold transition-all relative ${
                  activeTab === 'security' ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Bảo mật & Mật khẩu
                {activeTab === 'security' && (
                  <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-900" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
            {activeTab === 'info' ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Họ và tên"
                    icon={<User size={16} className="text-gray-500" />}
                    value={userInfo.fullName}
                    onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                    className={inputClassName}
                  />
                  <InputField
                    label="Số điện thoại"
                    icon={<Phone size={16} className="text-gray-500" />}
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                    className={inputClassName}
                  />
                </div>
                <InputField
                  label="Email liên hệ"
                  icon={<Mail size={16} className="text-gray-500" />}
                  value={userInfo.email}
                  disabled
                  className={`${inputClassName} bg-gray-500 text-slate-400 cursor-not-allowed hover:border-slate-200`}
                />

                {typeof userInfor?.roleId === 'object' && userInfor.roleId.name?.toLowerCase() === 'student' && (
                  <div className="bg-slate-50 rounded-[14px] p-4 border border-slate-200">
                    <p className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">Phụ huynh & Tư vấn</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InfoRow label="Phụ huynh" value={userInfor?.student_info?.parentsName} />
                      <InfoRow label="SĐT phụ huynh" value={userInfor?.phone} />
                      <InfoRow label="Tư vấn viên" value={consultant} />
                      <InfoRow label="Ngày nhập học" value={formatDate(userInfor?.createdAt)} />
                    </div>
                  </div>
                )}

                {typeof userInfor?.roleId === 'object' && userInfor.roleId.name?.toLowerCase() === 'teacher' && (
                  <div className="bg-slate-50 rounded-[14px] p-4 border border-slate-200">
                    <p className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">Thông tin giảng dạy</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InfoRow label="Bằng cấp và chứng chỉ" value={userInfor?.teacher_info?.degrees} />
                      <InfoRow
                        label="Lương/giờ"
                        value={formatCurrency(userInfor?.teacher_info?.hourlyRate as number)}
                      />

                      <InfoRow label="Ngày vào làm" value={formatDate(userInfor?.createdAt)} />
                    </div>
                  </div>
                )}

                {['consultant', 'accountant', 'manager', 'super admin'].includes(
                  (typeof userInfor?.roleId === 'object' && userInfor.roleId.name?.toLowerCase()) as string,
                ) && (
                  <div className="bg-slate-50 rounded-[14px] p-4 border border-slate-200">
                    <p className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">Thông tin nhân sự</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InfoRow
                        label="Vai trò"
                        value={typeof userInfor?.roleId === 'object' ? userInfor.roleId.name?.toUpperCase() : ''}
                      />
                      <InfoRow label="Ngày vào làm" value={formatDate(userInfor?.createdAt)} />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-semibold hover:bg-slate-800 transition-colors active:scale-95 shadow-sm"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Lưu thay đổi
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <InputField
                  label="Mật khẩu hiện tại"
                  type="password"
                  icon={<Lock size={16} className="text-gray-500" />}
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  placeholder="••••••••"
                  className={inputClassName}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Mật khẩu mới"
                    type="password"
                    icon={<KeyRound size={16} className="text-gray-500" />}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                    className={inputClassName}
                  />
                  <InputField
                    label="Xác nhận mật khẩu"
                    type="password"
                    icon={<ShieldCheck size={16} className="text-gray-500" />}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                    className={inputClassName}
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-semibold hover:bg-slate-800 transition-colors active:scale-95 shadow-sm"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    Cập nhật mật khẩu
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileForm;
