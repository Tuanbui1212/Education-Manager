import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft, User, Lock, Save, Eye, EyeOff,
  Phone, MapPin, Calendar, Mail, ShieldCheck,
} from 'lucide-react';
import { getDecodedToken } from '../../../utils/auth';
import { userService } from '../../../services/user.service';
import { PATHS } from '../../../utils/constants';

type ProfileTab = 'info' | 'password';

const TeacherProfilePage = () => {
  const navigate = useNavigate();
  const currentUser = getDecodedToken();
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState({ fullName: '', phone: '', address: '', date: '', email: '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;
    userService.getUserById(currentUser.id)
      .then(res => {
        if (res.success && res.data) {
          const u = res.data as any;
          setInfo({ fullName: u.fullName || '', phone: u.phone || '', address: u.address || '', date: u.date ? u.date.slice(0, 10) : '', email: u.email || '' });
        }
      })
      .catch(() => toast.error('Không thể tải thông tin hồ sơ'))
      .finally(() => setLoading(false));
  }, [currentUser?.id]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    setSaving(true);
    try {
      const { email: _e, ...updateData } = info;
      await userService.updateUser(currentUser.id, updateData);
      toast.success('Cập nhật thông tin thành công!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Mật khẩu xác nhận không khớp'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Mật khẩu mới phải có ít nhất 6 ký tự'); return; }
    if (!currentUser?.id) return;
    setSaving(true);
    try {
      await userService.updatePassword(currentUser.id, { oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      toast.success('Đổi mật khẩu thành công!');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally { setSaving(false); }
  };

  const inputCls = 'w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all bg-white';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(PATHS.TEACHER_PORTAL)} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-0.5">Giáo viên</p>
          <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        </div>
      </div>

      {/* Avatar card */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white mb-6 relative overflow-hidden shadow-lg shadow-indigo-600/20">
        <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4"><ShieldCheck size={200} /></div>
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-black border-2 border-white/30 backdrop-blur-sm">
            {info.fullName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-indigo-100 text-sm font-medium mb-0.5">Giáo viên</p>
            <h2 className="text-2xl font-bold">{info.fullName || 'Chưa cập nhật'}</h2>
            <p className="text-indigo-200 text-sm mt-1 flex items-center gap-1.5"><Mail size={13} /> {info.email}</p>
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex mb-6 bg-white border border-gray-200 p-1.5 rounded-2xl shadow-xs w-fit">
        {([['info', 'Thông tin cá nhân'], ['password', 'Đổi mật khẩu']] as const).map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab as ProfileTab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-gray-600 hover:bg-gray-50'}`}>
            {tab === 'info' ? <User size={16} /> : <Lock size={16} />} {label}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 animate-in fade-in duration-300">
          <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2"><User size={18} className="text-indigo-600" /> Thông tin cá nhân</h3>
          {loading ? (
            <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : (
            <form onSubmit={handleSaveInfo} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5"><User size={13} className="text-gray-400" /> Họ và tên</label>
                <input required className={inputCls} value={info.fullName} onChange={e => setInfo(p => ({ ...p, fullName: e.target.value }))} placeholder="Nhập họ và tên" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-gray-400" /> Email
                  <span className="text-[10px] text-gray-400 font-normal bg-gray-100 px-2 py-0.5 rounded-full ml-1">Không thể thay đổi</span>
                </label>
                <input className="w-full px-4 py-3 text-sm border border-gray-100 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed" value={info.email} disabled readOnly />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5"><Phone size={13} className="text-gray-400" /> Số điện thoại</label>
                <input className={inputCls} value={info.phone} onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} placeholder="Nhập số điện thoại" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5"><Calendar size={13} className="text-gray-400" /> Ngày sinh</label>
                <input type="date" className={inputCls} value={info.date} onChange={e => setInfo(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 flex items-center gap-1.5"><MapPin size={13} className="text-gray-400" /> Địa chỉ</label>
                <textarea rows={2} className={inputCls} value={info.address} onChange={e => setInfo(p => ({ ...p, address: e.target.value }))} placeholder="Nhập địa chỉ" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-600/20">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                Lưu thông tin
              </button>
            </form>
          )}
        </div>
      )}

      {activeTab === 'password' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 animate-in fade-in duration-300">
          <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2"><Lock size={18} className="text-indigo-600" /> Đổi mật khẩu</h3>
          <form onSubmit={handleChangePassword} className="space-y-5">
            {[
              { label: 'Mật khẩu hiện tại', key: 'oldPassword', show: showOld, toggle: () => setShowOld(p => !p) },
              { label: 'Mật khẩu mới', key: 'newPassword', show: showNew, toggle: () => setShowNew(p => !p) },
              { label: 'Xác nhận mật khẩu mới', key: 'confirmPassword', show: showConfirm, toggle: () => setShowConfirm(p => !p) },
            ].map(({ label, key, show, toggle }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">{label}</label>
                <div className="relative">
                  <input required type={show ? 'text' : 'password'} className={`${inputCls} pr-10`} value={(pwForm as any)[key]}
                    onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))} placeholder={`Nhập ${label.toLowerCase()}`} />
                  <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={saving} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-600/20">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock size={16} />}
              Đổi mật khẩu
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TeacherProfilePage;
