import { useState } from 'react';
import {
  BookOpen,
  CreditCard,
  FileText,
  Star,
  QrCode,
  X,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  TrendingUp,
  ChevronRight,
  Save,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_USERS = {
  student: {
    id: 'u001',
    fullName: 'Nguyễn Minh Châu',
    email: 'chau.nguyen@email.com',
    phone: '0901 234 567',
    role: 'student',
    roleName: 'Học viên',
    joinDate: '2024-03-15',
    student_info: { parentName: 'Nguyễn Văn Bình', parentPhone: '0912 345 678', consultantName: 'Trần Thị Hoa' },
    classes: [
      {
        id: 'c1',
        name: 'IELTS Intermediate',
        course: 'IELTS',
        teacher: 'Mr. David',
        schedule: 'T2, T4 (17:00–18:30)',
        room: 'Phòng 201',
        status: 'ACTIVE',
        attendance: 85,
      },
      {
        id: 'c2',
        name: 'TOEIC 600+',
        course: 'TOEIC',
        teacher: 'Cô Lan',
        schedule: 'T7 (08:00–10:00)',
        room: 'Phòng 105',
        status: 'COMPLETED',
        attendance: 92,
      },
    ],
    exams: [
      {
        id: 'e1',
        title: 'Giữa kỳ IELTS',
        score: 7.0,
        maxScore: 9.0,
        date: '2025-01-20',
        class: 'IELTS Intermediate',
        feedback: 'Cần cải thiện Writing Task 2',
      },
      {
        id: 'e2',
        title: 'Cuối kỳ TOEIC',
        score: 620,
        maxScore: 990,
        date: '2024-11-10',
        class: 'TOEIC 600+',
        feedback: 'Tốt, duy trì phần Listening',
      },
    ],
    invoices: [
      {
        id: 'i1',
        code: 'INV-2025-031',
        title: 'Học phí IELTS Intermediate (T4)',
        amount: 8500000,
        debt: 2000000,
        status: 'PARTIAL',
        dueDate: '2025-04-01',
      },
      {
        id: 'i2',
        code: 'INV-2025-011',
        title: 'Học phí TOEIC 600+ (T11/2024)',
        amount: 5000000,
        debt: 0,
        status: 'PAID',
        dueDate: '2024-11-01',
      },
    ],
  },
  teacher: {
    id: 'u002',
    fullName: 'Phạm Thị Lan',
    email: 'lan.pham@center.edu.vn',
    phone: '0987 654 321',
    role: 'teacher',
    roleName: 'Giáo viên',
    joinDate: '2022-08-01',
    teacher_info: { hourlyRate: 180000, degree: 'Thạc sĩ Ngôn ngữ Anh', certifications: ['IELTS 8.5', 'CELTA'] },
    classes: [
      { id: 'c3', name: 'IELTS Advanced', studentCount: 12, status: 'ACTIVE', nextSchedule: 'T2, T4 - Ca 2' },
      { id: 'c4', name: 'IELTS Intermediate', studentCount: 15, status: 'ACTIVE', nextSchedule: 'T3, T5 - Ca 1' },
      { id: 'c5', name: 'IELTS Beginner', studentCount: 10, status: 'COMPLETED', nextSchedule: '—' },
    ],
    averageRating: 4.8,
    totalReviews: 47,
    upcomingSchedules: [
      { date: '28/03', shift: 'Ca 2 (13:30–15:30)', class: 'IELTS Advanced', room: 'P.201' },
      { date: '30/03', shift: 'Ca 1 (08:00–10:00)', class: 'IELTS Intermediate', room: 'P.103' },
    ],
    salaryHistory: [
      { month: 'T3/2025', amount: 7200000, status: 'PAID' },
      { month: 'T2/2025', amount: 6840000, status: 'PAID' },
      { month: 'T1/2025', amount: 7560000, status: 'PAID' },
    ],
  },
  consultant: {
    id: 'u003',
    fullName: 'Trần Hoàng Nam',
    email: 'nam.tran@center.edu.vn',
    phone: '0909 111 222',
    role: 'consultant',
    roleName: 'Tư vấn viên',
    joinDate: '2023-05-20',
    pipeline: [
      { name: 'Lê Văn Dũng', status: 'ENROLLED', course: 'IELTS Advanced', note: 'Đã đóng học phí' },
      { name: 'Hoàng Thị Mai', status: 'NEGOTIATING', course: 'TOEIC 600+', note: 'Hẹn tư vấn lại T5' },
      { name: 'Võ Minh Tú', status: 'NEW_LEAD', course: 'IELTS Intermediate', note: 'Liên hệ qua Facebook' },
    ],
    commissionInvoices: [
      { studentName: 'Lê Văn Dũng', class: 'IELTS Advanced', finalAmount: 9500000, commissionRate: 10, status: 'PAID' },
      {
        studentName: 'Hoàng Thị Mai',
        class: 'TOEIC 600+',
        finalAmount: 5000000,
        commissionRate: 10,
        status: 'PARTIAL',
      },
      {
        studentName: 'Võ Minh Tú',
        class: 'IELTS Intermediate',
        finalAmount: 8500000,
        commissionRate: 10,
        status: 'UNPAID',
      },
    ],
    totalCommission: 2300000,
    pendingCommission: 1350000,
    payoutHistory: [
      { month: 'T3/2025', amount: 950000, status: 'PAID' },
      { month: 'T2/2025', amount: 1200000, status: 'PAID' },
    ],
  },
  accountant: {
    id: 'u004',
    fullName: 'Lê Thị Hồng',
    email: 'hong.le@center.edu.vn',
    phone: '0978 888 777',
    role: 'accountant',
    roleName: 'Kế toán',
    joinDate: '2021-01-10',
    recentInvoices: [
      { code: 'INV-098', student: 'Phạm Quang Huy', amount: 7500000, status: 'PAID', date: '20/03/2025' },
      { code: 'INV-099', student: 'Đặng Lan Anh', amount: 9000000, status: 'PARTIAL', date: '22/03/2025' },
      { code: 'INV-100', student: 'Bùi Thanh Tùng', amount: 5500000, status: 'UNPAID', date: '25/03/2025' },
    ],
    recentExpenditures: [
      { type: 'SALARY_TEACHER', desc: 'Lương GV Phạm Thị Lan - T3', amount: 7200000, date: '25/03/2025' },
      { type: 'OPERATION', desc: 'Tiền điện tháng 3', amount: 1800000, date: '20/03/2025' },
      { type: 'SALARY_SALE', desc: 'Hoa hồng Trần Hoàng Nam - T3', amount: 950000, date: '28/03/2025' },
    ],
    summary: { totalRevenue: 42000000, totalExpense: 18500000, debtTotal: 6200000 },
  },
  manager: {
    id: 'u005',
    fullName: 'Đinh Quang Trung',
    email: 'trung.dinh@center.edu.vn',
    phone: '0911 999 000',
    role: 'manager',
    roleName: 'Quản lý',
    joinDate: '2020-06-01',
    centerStats: { totalStudents: 124, totalTeachers: 8, activeClasses: 14, monthlyRevenue: 42000000 },
    staffList: [
      { name: 'Phạm Thị Lan', role: 'Giáo viên', status: 'ACTIVE', classes: 3 },
      { name: 'Trần Hoàng Nam', role: 'Tư vấn viên', status: 'ACTIVE', leads: 12 },
      { name: 'Lê Thị Hồng', role: 'Kế toán', status: 'ACTIVE', invoices: 28 },
    ],
    recentActivities: [
      { action: 'Phê duyệt lớp IELTS Advanced mở mới', time: '2 giờ trước' },
      { action: 'Duyệt chi lương GV tháng 3', time: '1 ngày trước' },
      { action: 'Xem báo cáo doanh thu Q1', time: '2 ngày trước' },
    ],
  },
  superadmin: {
    id: 'u006',
    fullName: 'Admin Hệ Thống',
    email: 'admin@center.edu.vn',
    phone: '0800 000 001',
    role: 'superadmin',
    roleName: 'Super Admin',
    joinDate: '2019-01-01',
    systemStats: { totalUsers: 187, totalRoles: 6, totalCourses: 12, uptime: '99.98%' },
    recentLogs: [
      { action: 'Tạo role mới: Trợ giảng', user: 'admin', time: '10 phút trước' },
      { action: 'Cập nhật quyền role Manager', user: 'admin', time: '3 giờ trước' },
      { action: 'Xóa user #u099 (spam)', user: 'admin', time: '1 ngày trước' },
    ],
    roles: [
      { name: 'Super Admin', permissions: 1, users: 1 },
      { name: 'Manager', permissions: 17, users: 2 },
      { name: 'Teacher', permissions: 7, users: 8 },
      { name: 'Accountant', permissions: 11, users: 2 },
      { name: 'Consultant', permissions: 11, users: 5 },
      { name: 'Student', permissions: 1, users: 169 },
    ],
  },
};

// ─── Constants & Styling Configs ──────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString('vi-VN');
}

const ROLE_CONFIG = {
  student: { classes: 'bg-green-100 text-green-700', tab: 'Học tập', chip: (u) => `📚 ${u.classes.length} lớp học` },
  teacher: {
    classes: 'bg-violet-100 text-violet-700',
    tab: 'Giảng dạy',
    chip: (u) => `⭐ ${u.averageRating} · ${u.totalReviews} đánh giá`,
  },
  consultant: {
    classes: 'bg-amber-100 text-amber-700',
    tab: 'Hoa hồng',
    chip: (u) => `💰 ${fmt(u.totalCommission)} tổng HH`,
  },
  accountant: {
    classes: 'bg-sky-100 text-sky-700',
    tab: 'Tài chính',
    chip: (u) => `🧾 ${u.recentInvoices.length} HĐ gần đây`,
  },
  manager: {
    classes: 'bg-rose-100 text-rose-700',
    tab: 'Tổng quan',
    chip: (u) => `🏫 ${u.centerStats.activeClasses} lớp đang mở`,
  },
  superadmin: {
    classes: 'bg-blue-100 text-blue-800',
    tab: 'Hệ thống',
    chip: (u) => `🛡 ${u.systemStats.totalUsers} users`,
  },
};

const STATUS_CFG = {
  ACTIVE: { label: 'Đang học', classes: 'bg-green-100 text-green-700' },
  COMPLETED: { label: 'Đã xong', classes: 'bg-slate-100 text-slate-600' },
  PAID: { label: 'Đã trả', classes: 'bg-green-100 text-green-700' },
  PARTIAL: { label: 'Còn nợ', classes: 'bg-yellow-100 text-yellow-700' },
  UNPAID: { label: 'Chưa trả', classes: 'bg-red-100 text-red-700' },
  ENROLLED: { label: 'Đã đăng ký', classes: 'bg-green-100 text-green-700' },
  NEGOTIATING: { label: 'Đang tư vấn', classes: 'bg-yellow-100 text-yellow-700' },
  NEW_LEAD: { label: 'Lead mới', classes: 'bg-sky-100 text-sky-700' },
  SALARY_TEACHER: { label: 'Lương GV', classes: 'bg-violet-100 text-violet-700' },
  OPERATION: { label: 'Vận hành', classes: 'bg-slate-100 text-slate-600' },
  SALARY_SALE: { label: 'Hoa hồng', classes: 'bg-yellow-100 text-yellow-700' },
};

// ─── Shared Components ────────────────────────────────────────────────────────
function Badge({ status }) {
  const c = STATUS_CFG[status] || { label: status, classes: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${c.classes}`}>
      {c.label}
    </span>
  );
}

function Stars({ rating }) {
  return (
    <span className="text-amber-500 text-[13px]">
      {'★'.repeat(Math.floor(rating))}
      {'☆'.repeat(5 - Math.floor(rating))}
      <span className="text-slate-500 text-xs ml-1.5">{rating}/5</span>
    </span>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-600 mb-2.5 uppercase tracking-wide">{title}</p>
      <div className="border border-slate-200 rounded-2xl overflow-hidden">{children}</div>
    </div>
  );
}

function MetricCard({ label, value, highlight, sub }) {
  return (
    <div
      className={`border border-slate-200 rounded-2xl px-4 py-3.5 transition-colors ${highlight ? 'bg-slate-900' : 'bg-slate-50'}`}
    >
      <p className={`text-[11px] mb-1.5 ${highlight ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <p className={`text-lg font-bold m-0 ${highlight ? 'text-white' : 'text-slate-800'}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function Row({ left, right, sub }) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3 border-b border-slate-100 bg-white last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[13px] text-slate-800 m-0 truncate">{left}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400 m-0 mb-0.5">{label}</p>
      <p className="text-xs font-semibold text-slate-700 m-0">{value || '—'}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</p>
      {children}
    </div>
  );
}

function Chip({ label }) {
  return (
    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-[11px] text-slate-600 font-medium">
      {label}
    </div>
  );
}

function AttendanceRing({ pct }) {
  const R = 14;
  const C = 2 * Math.PI * R;
  const color = pct >= 80 ? '#16a34a' : pct >= 65 ? '#ca8a04' : '#dc2626';
  return (
    <div className="relative w-[38px] h-[38px] shrink-0">
      <svg viewBox="0 0 36 36" width="38" height="38">
        <circle cx="18" cy="18" r={R} fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
        <circle
          cx="18"
          cy="18"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct / 100)}
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[8px] font-bold" style={{ color }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({ invoice, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleConfirm = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z- flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[360px] relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          {!done ? (
            <>
              <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Nội dung thanh toán</p>
                <p className="font-bold text-[13px] text-slate-800 m-0">{invoice.title}</p>
                <div className="flex justify-between items-center mt-2.5">
                  <span className="text-[11px] text-slate-400 font-mono">{invoice.code}</span>
                  <span className="text-xl font-extrabold text-blue-600">
                    {fmt(invoice.status === 'PARTIAL' ? invoice.debt : invoice.amount)}
                  </span>
                </div>
                {invoice.status === 'PARTIAL' && (
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    Tổng: {fmt(invoice.amount)} · Đã trả: {fmt(invoice.amount - invoice.debt)}
                  </p>
                )}
              </div>

              <div className="flex justify-center mb-4">
                <div className="p-3 border-2 border-dashed border-slate-200 rounded-[20px] relative overflow-hidden">
                  <div className="w-40 h-40 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400">
                    <QrCode size={52} />
                    <span className="text-[10px] mt-2 font-semibold">VietQR / ZaloPay</span>
                  </div>
                  <div className="absolute left-3 right-3 h-[2px] bg-blue-600/30 rounded-full animate-[scanline_2s_ease-in-out_infinite]" />
                </div>
              </div>

              <p className="text-[11px] text-center text-slate-500 leading-relaxed mb-4">
                Mở app ngân hàng hoặc ZaloPay để quét mã.
                <br />
                Giao dịch cập nhật tự động trong vài phút.
              </p>

              <button
                onClick={handleConfirm}
                disabled={processing}
                className={`w-full p-3 text-white rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all ${
                  processing ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 active:scale-95'
                }`}
              >
                {processing ? (
                  'Đang xác nhận...'
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Tôi đã chuyển khoản xong
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3.5">
                <CheckCircle2 size={28} className="text-green-600" />
              </div>
              <p className="font-bold text-[15px] text-slate-800 mb-1.5">Đã nhận thông tin!</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                Hệ thống sẽ xác nhận trong 5–15 phút. Cảm ơn bạn!
              </p>
              <button
                onClick={onClose}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[13px] transition-colors"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes scanline { 0%,100%{top:15%} 50%{top:85%} }`}</style>
    </div>
  );
}

// ─── Sub-Tabs for Roles ───────────────────────────────────────────────────────
function StudentRoleTab({ user }) {
  const [payingInvoice, setPayingInvoice] = useState(null);
  const pendingInvoices = user.invoices.filter((i) => i.status !== 'PAID');
  const totalDebt = pendingInvoices.reduce((a, i) => a + i.debt, 0);
  const avgAttendance = Math.round(user.classes.reduce((a, c) => a + c.attendance, 0) / user.classes.length);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="Đang học" value={`${user.classes.filter((c) => c.status === 'ACTIVE').length} lớp`} />
        <MetricCard
          label="Chuyên cần TB"
          value={`${avgAttendance}%`}
          sub={avgAttendance >= 80 ? 'Tốt' : 'Cần cải thiện'}
        />
        <MetricCard
          label="Cần thanh toán"
          value={totalDebt > 0 ? fmt(totalDebt) : 'Đủ rồi ✓'}
          highlight={totalDebt > 0}
        />
      </div>

      <Section title="Lớp học">
        <div className="flex flex-col gap-3 p-3">
          {user.classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3.5 hover:shadow-sm transition-shadow"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cls.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}
              >
                <BookOpen size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[13px] font-bold text-slate-800">{cls.name}</span>
                  <Badge status={cls.status} />
                </div>
                <div className="flex gap-3.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <User size={11} /> {cls.teacher}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock size={11} /> {cls.schedule}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin size={11} /> {cls.room}
                  </span>
                </div>
              </div>
              <div className="text-center shrink-0">
                <AttendanceRing pct={cls.attendance} />
                <p className="text-[9px] text-slate-400 mt-1">Chuyên cần</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Kết quả kiểm tra">
        <div className="flex flex-col">
          {user.exams.map((exam, i) => {
            const pct = (exam.score / exam.maxScore) * 100;
            const color = pct >= 80 ? '#16a34a' : pct >= 60 ? '#ca8a04' : '#dc2626';
            return (
              <div
                key={exam.id}
                className={`px-4 py-3.5 bg-white flex items-center gap-3.5 ${i < user.exams.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] text-slate-800 m-0 truncate">{exam.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 mb-1.5 truncate">
                    {exam.class} · {fmtDate(exam.date)}
                  </p>
                  <div className="h-[3px] bg-slate-100 rounded-full overflow-hidden max-w-[200px]">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 italic truncate">💬 {exam.feedback}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[22px] font-extrabold" style={{ color }}>
                    {exam.score}
                  </span>
                  <span className="text-xs text-slate-400">/{exam.maxScore}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Học phí & Thanh toán">
        <div className="flex flex-col">
          {user.invoices.map((inv, i) => {
            const isPaid = inv.status === 'PAID';
            const isPartial = inv.status === 'PARTIAL';
            return (
              <div
                key={inv.id}
                className={`px-4 py-3.5 bg-white flex items-center gap-3.5 ${i < user.invoices.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPaid ? 'bg-green-100 text-green-600' : isPartial ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}
                >
                  <CreditCard size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[13px] text-slate-800 m-0 truncate">{inv.title}</p>
                  <div className="flex gap-3 mt-1 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-mono">{inv.code}</span>
                    <span className="text-[10px] text-slate-400">Hạn: {fmtDate(inv.dueDate)}</span>
                  </div>
                  {isPartial && (
                    <p className="text-[10px] text-yellow-600 mt-1 font-semibold">
                      Đã trả {fmt(inv.amount - inv.debt)} · Còn {fmt(inv.debt)}
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <span className={`text-[15px] font-extrabold ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
                    {fmt(isPaid ? inv.amount : inv.debt)}
                  </span>
                  <Badge status={inv.status} />
                  {!isPaid && (
                    <button
                      onClick={() => setPayingInvoice(inv)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold mt-0.5 transition-colors"
                    >
                      <QrCode size={12} /> Thanh toán
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {payingInvoice && <PaymentModal invoice={payingInvoice} onClose={() => setPayingInvoice(null)} />}
    </div>
  );
}

function TeacherRoleTab({ user }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="Đánh giá TB" value={<Stars rating={user.averageRating} />} />
        <MetricCard label="Tổng reviews" value={user.totalReviews} />
        <MetricCard label="Lớp đang dạy" value={user.classes.filter((c) => c.status === 'ACTIVE').length} />
      </div>
      <Section title="Lịch sắp tới">
        {user.upcomingSchedules.map((s, i) => (
          <Row
            key={i}
            left={s.class}
            sub={`${s.date} · ${s.shift}`}
            right={
              <span className="text-[11px] text-violet-700 font-semibold bg-violet-100 px-2.5 py-1 rounded-lg">
                {s.room}
              </span>
            }
          />
        ))}
      </Section>
      <Section title="Lớp học">
        {user.classes.map((cls) => (
          <Row
            key={cls.id}
            left={cls.name}
            sub={cls.nextSchedule}
            right={
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-[15px] font-bold text-slate-700 m-0">{cls.studentCount}</p>
                  <p className="text-[10px] text-slate-400 m-0">Học viên</p>
                </div>
                <Badge status={cls.status} />
              </div>
            }
          />
        ))}
      </Section>
      <Section title="Lịch sử lương">
        {user.salaryHistory.map((s, i) => (
          <Row
            key={i}
            left={s.month}
            right={
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-bold text-slate-700">{fmt(s.amount)}</span>
                <Badge status={s.status} />
              </div>
            }
          />
        ))}
      </Section>
    </div>
  );
}

function ConsultantRoleTab({ user }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MetricCard label="Tổng hoa hồng" value={fmt(user.totalCommission)} highlight />
        <MetricCard label="Chờ thanh toán" value={fmt(user.pendingCommission)} />
      </div>
      <Section title="Pipeline học viên">
        {user.pipeline.map((p, i) => (
          <Row key={i} left={p.name} sub={`${p.course} · ${p.note}`} right={<Badge status={p.status} />} />
        ))}
      </Section>
      <Section title="Hoa hồng theo hóa đơn">
        {user.commissionInvoices.map((inv, i) => (
          <Row
            key={i}
            left={inv.studentName}
            sub={inv.class}
            right={
              <div className="text-right">
                <p className="text-[13px] font-bold text-emerald-500 m-0">
                  +{fmt((inv.finalAmount * inv.commissionRate) / 100)}
                </p>
                <p className="text-[10px] text-slate-400 m-[2px_0]">
                  {inv.commissionRate}% của {fmt(inv.finalAmount)}
                </p>
                <Badge status={inv.status} />
              </div>
            }
          />
        ))}
      </Section>
      <Section title="Lịch sử nhận hoa hồng">
        {user.payoutHistory.map((p, i) => (
          <Row
            key={i}
            left={p.month}
            right={
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-bold text-slate-700">{fmt(p.amount)}</span>
                <Badge status={p.status} />
              </div>
            }
          />
        ))}
      </Section>
    </div>
  );
}

function AccountantRoleTab({ user }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="Doanh thu tháng" value={fmt(user.summary.totalRevenue)} highlight />
        <MetricCard label="Chi phí tháng" value={fmt(user.summary.totalExpense)} />
        <MetricCard label="Tổng nợ" value={fmt(user.summary.debtTotal)} sub="Chưa thu được" />
      </div>
      <Section title="Hóa đơn gần đây">
        {user.recentInvoices.map((inv, i) => (
          <Row
            key={i}
            left={inv.student}
            sub={`${inv.code} · ${inv.date}`}
            right={
              <div className="text-right">
                <p className="text-[13px] font-bold text-slate-800 m-0 mb-1">{fmt(inv.amount)}</p>
                <Badge status={inv.status} />
              </div>
            }
          />
        ))}
      </Section>
      <Section title="Chi phí gần đây">
        {user.recentExpenditures.map((ex, i) => (
          <Row
            key={i}
            left={ex.desc}
            sub={ex.date}
            right={
              <div className="text-right">
                <p className="text-[13px] font-bold text-red-600 m-0 mb-1">-{fmt(ex.amount)}</p>
                <Badge status={ex.type} />
              </div>
            }
          />
        ))}
      </Section>
    </div>
  );
}

function ManagerRoleTab({ user }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MetricCard label="Doanh thu tháng" value={fmt(user.centerStats.monthlyRevenue)} highlight />
        <MetricCard
          label="Học viên"
          value={user.centerStats.totalStudents}
          sub={`${user.centerStats.activeClasses} lớp đang mở`}
        />
      </div>
      <MetricCard label="Giáo viên" value={user.centerStats.totalTeachers} />
      <Section title="Danh sách nhân sự">
        {user.staffList.map((s, i) => (
          <Row
            key={i}
            left={s.name}
            sub={s.role}
            right={
              <span className="text-[12px] text-green-700 font-semibold bg-green-100 px-2.5 py-1 rounded-lg">
                Active
              </span>
            }
          />
        ))}
      </Section>
      <Section title="Hoạt động gần đây">
        {user.recentActivities.map((a, i) => (
          <Row key={i} left={a.action} sub={a.time} right={null} />
        ))}
      </Section>
    </div>
  );
}

function SuperAdminRoleTab({ user }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Tổng users" value={user.systemStats.totalUsers} highlight />
        <MetricCard label="Roles" value={user.systemStats.totalRoles} />
        <MetricCard label="Khóa học" value={user.systemStats.totalCourses} />
        <MetricCard label="Uptime" value={user.systemStats.uptime} />
      </div>
      <Section title="Quản lý phân quyền">
        {user.roles.map((r, i) => (
          <Row
            key={i}
            left={r.name}
            sub={`${r.permissions} quyền`}
            right={
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-slate-500">{r.users} users</span>
                <button className="text-[11px] px-3 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-slate-600 transition-colors">
                  Sửa quyền
                </button>
              </div>
            }
          />
        ))}
      </Section>
      <Section title="Nhật ký hệ thống">
        {user.recentLogs.map((log, i) => (
          <Row key={i} left={log.action} sub={`${log.user} · ${log.time}`} right={null} />
        ))}
      </Section>
    </div>
  );
}

function NewRoleTab({ user }) {
  return (
    <div className="text-center py-10 px-5">
      <div className="text-5xl mb-4">🔧</div>
      <h3 className="text-[15px] font-bold text-slate-800 m-0 mb-2">Role "{user.roleName}" chưa có giao diện riêng</h3>
      <p className="text-xs text-slate-500 max-w-[300px] mx-auto mb-5 leading-relaxed">
        Tab chuyên biệt sẽ hiển thị tại đây sau khi developer cấu hình đầy đủ cho role này.
      </p>
    </div>
  );
}

function RoleTab({ user }) {
  if (user.role === 'student') return <StudentRoleTab user={user} />;
  if (user.role === 'teacher') return <TeacherRoleTab user={user} />;
  if (user.role === 'consultant') return <ConsultantRoleTab user={user} />;
  if (user.role === 'accountant') return <AccountantRoleTab user={user} />;
  if (user.role === 'manager') return <ManagerRoleTab user={user} />;
  if (user.role === 'superadmin') return <SuperAdminRoleTab user={user} />;
  return <NewRoleTab user={user} />;
}

// ─── Info Tab ─────────────────────────────────────────────────────────────────
function InfoTab({ user, onSave }) {
  const [form, setForm] = useState({ fullName: user.fullName, phone: user.phone || '' });

  const inputClassName =
    'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] bg-white text-slate-800 outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all';

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Họ và tên">
          <input
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            className={inputClassName}
          />
        </Field>
        <Field label="Số điện thoại">
          <input
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            placeholder="Chưa cập nhật"
            className={inputClassName}
          />
        </Field>
      </div>
      <Field label="Email liên hệ">
        <input
          value={user.email}
          disabled
          className={`${inputClassName} bg-slate-50 text-slate-400 cursor-not-allowed hover:border-slate-200`}
        />
      </Field>

      {user.role === 'student' && (
        <div className="bg-slate-50 rounded-[14px] p-4 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">Phụ huynh & Tư vấn</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow label="Phụ huynh" value={user.student_info.parentName} />
            <InfoRow label="SĐT phụ huynh" value={user.student_info.parentPhone} />
            <InfoRow label="Tư vấn viên" value={user.student_info.consultantName} />
            <InfoRow label="Ngày nhập học" value={fmtDate(user.joinDate)} />
          </div>
        </div>
      )}

      {user.role === 'teacher' && (
        <div className="bg-slate-50 rounded-[14px] p-4 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">Thông tin giảng dạy</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow label="Bằng cấp" value={user.teacher_info.degree} />
            <InfoRow label="Lương/giờ" value={fmt(user.teacher_info.hourlyRate)} />
            <InfoRow label="Chứng chỉ" value={user.teacher_info.certifications.join(', ')} />
            <InfoRow label="Ngày vào làm" value={fmtDate(user.joinDate)} />
          </div>
        </div>
      )}

      {['consultant', 'accountant', 'manager', 'superadmin'].includes(user.role) && (
        <div className="bg-slate-50 rounded-[14px] p-4 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wide">Thông tin nhân sự</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow label="Vai trò" value={user.roleName} />
            <InfoRow label="Ngày vào làm" value={fmtDate(user.joinDate)} />
          </div>
        </div>
      )}

      <div className="flex justify-end mt-2">
        <button
          onClick={() => onSave(form)}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-semibold hover:bg-slate-800 transition-colors active:scale-95 shadow-sm"
        >
          <Save size={16} /> Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserProfile() {
  const [activeRole, setActiveRole] = useState('student');
  const [activeTab, setActiveTab] = useState('info');
  const [toast, setToast] = useState(null);

  const user = MOCK_USERS[activeRole];
  const cfg = ROLE_CONFIG[activeRole] || { classes: 'bg-slate-100 text-slate-600', tab: 'Vai trò', chip: () => '' };
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const tabs = [
    { key: 'info', label: 'Thông tin' },
    { key: 'role', label: cfg.tab },
  ];

  return (
    <div className="font-sans bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      {/* Role switcher */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">Xem giao diện Role:</span>
        {Object.entries(MOCK_USERS).map(([key, u]) => {
          const c = ROLE_CONFIG[key] || { classes: 'bg-slate-200 text-slate-600' };
          return (
            <button
              key={key}
              onClick={() => {
                setActiveRole(key);
                setActiveTab('info');
              }}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors ${
                activeRole === key ? c.classes : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {u.roleName}
            </button>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto pb-10">
        {toast && (
          <div className="fixed top-6 right-6 z- bg-emerald-500 text-white px-5 py-3 rounded-xl text-[13px] font-bold shadow-lg animate-in slide-in-from-top-4 flex items-center gap-2">
            <CheckCircle2 size={18} /> {toast}
          </div>
        )}

        {/* Header card */}
        <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden mb-6 shadow-sm">
          <div className="h-[100px] bg-[#0f172a]" />

          <div className="px-6 sm:px-8 pb-0 relative flex flex-col sm:flex-row gap-5">
            <div className="-mt-10 relative shrink-0 z-10 mb-2 sm:mb-0">
              <div className="w-[84px] h-[84px] bg-white rounded-2xl shadow-sm p-1.5 flex items-center justify-center border border-slate-100">
                <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center text-3xl font-black text-slate-800 uppercase">
                  {user.fullName.charAt(0)}
                </div>
              </div>
            </div>

            <div className="flex-1 pt-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-extrabold text-slate-900 m-0 tracking-tight">{user.fullName}</h1>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${cfg.classes}`}>{user.roleName}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 mb-3 font-medium">{user.email}</p>

              <div className="flex gap-2 flex-wrap pb-4">
                <Chip label={cfg.chip(user)} />
                <Chip label={`📅 Tham gia: ${fmtDate(user.joinDate)}`} />
              </div>
            </div>
          </div>

          <div className="flex border-t border-slate-100 px-4 sm:px-6">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-5 py-3 text-[13px] transition-all border-b-[2.5px] ${
                  activeTab === t.key
                    ? 'font-bold text-slate-900 border-slate-900'
                    : 'font-semibold text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 shadow-sm">
          {activeTab === 'info' && <InfoTab user={user} onSave={() => showToast('Cập nhật hồ sơ thành công!')} />}
          {activeTab === 'role' && <RoleTab user={user} />}
        </div>
      </div>
    </div>
  );
}
