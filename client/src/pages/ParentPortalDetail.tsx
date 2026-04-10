import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CreditCard,
  User,
  Bell,
  LogOut,
  ChevronDown,
  Clock,
  MapPin,
  QrCode,
  X,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  GraduationCap,
  ArrowLeft,
  Star,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Award,
  BarChart2,
  Smile,
  Frown,
  Meh,
  BookMarked,
  Filter,
  ChevronUp,
} from 'lucide-react';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_CHILDREN = [
  { id: '1', name: 'Nguyễn Văn An', grade: 'Lớp 5', avatar: 'A' },
  { id: '2', name: 'Nguyễn Thị Bảo', grade: 'Lớp 8', avatar: 'B' },
];

const MOCK_CLASSES = [
  {
    id: 'c1',
    name: 'Tiếng Anh Giao tiếp Kids 1',
    teacher: 'Ms. Sarah',
    teacherAvatar: 'S',
    schedule: 'T2, T4 (18:00 – 19:30)',
    room: 'Phòng 201',
    totalSessions: 24,
    completedSessions: 14,
    color: 'blue',
    subject: 'Tiếng Anh',
    avgScore: 8.4,
  },
  {
    id: 'c2',
    name: 'Toán Tư duy Nâng cao',
    teacher: 'Thầy Hùng',
    teacherAvatar: 'H',
    schedule: 'T7, CN (08:00 – 09:30)',
    room: 'Phòng 105',
    totalSessions: 20,
    completedSessions: 11,
    color: 'indigo',
    subject: 'Toán',
    avgScore: 7.9,
  },
];

const SESSION_MOCK = {
  c1: [
    {
      id: 's14',
      session: 14,
      date: '2024-01-22',
      dayOfWeek: 'Thứ Hai',
      topic: 'Unit 6: Daily Routines – Talking about habits',
      attendance: 'present',
      score: { type: 'quiz', value: 9, max: 10, label: 'Quiz Unit 6' },
      comment:
        'An học rất tập trung hôm nay. Em phát âm từ "routine" và "schedule" chuẩn hơn nhiều so với buổi trước. Tích cực phát biểu xây dựng bài.',
      mood: 'great',
      homework: 'Workbook trang 45–46, luyện viết 5 câu mô tả thói quen hằng ngày.',
      homeworkStatus: 'done',
    },
    {
      id: 's13',
      session: 13,
      date: '2024-01-17',
      dayOfWeek: 'Thứ Tư',
      topic: 'Unit 5: Review & Speaking Test',
      attendance: 'present',
      score: { type: 'speaking', value: 8.5, max: 10, label: 'Speaking Test' },
      comment:
        'An hoàn thành bài kiểm tra nói tốt. Cần luyện thêm intonation khi đặt câu hỏi. Điểm số phản ánh đúng năng lực hiện tại.',
      mood: 'good',
      homework: 'Ôn lại vocabulary Unit 1–5 để chuẩn bị cho kỳ thi giữa kỳ.',
      homeworkStatus: 'done',
    },
    {
      id: 's12',
      session: 12,
      date: '2024-01-15',
      dayOfWeek: 'Thứ Hai',
      topic: 'Unit 5: Places in the City – Giving directions',
      attendance: 'absent',
      score: null,
      comment:
        'Buổi hôm nay An vắng mặt có phép. Phụ huynh vui lòng nhắc em xem lại slide bài giảng trên hệ thống và làm bài tập bù.',
      mood: null,
      homework: 'Xem lại slide Unit 5, làm bài tập trang 40–41 trong workbook.',
      homeworkStatus: 'pending',
    },
    {
      id: 's11',
      session: 11,
      date: '2024-01-10',
      dayOfWeek: 'Thứ Tư',
      topic: 'Unit 5: Places in the City – Vocabulary',
      attendance: 'present',
      score: { type: 'vocab', value: 7, max: 10, label: 'Vocab Check' },
      comment:
        'An nắm được từ vựng cơ bản nhưng còn nhầm lẫn một số từ chỉ phương hướng. Cần ôn luyện thêm ở nhà. Thái độ học tốt, hay cười.',
      mood: 'good',
      homework: 'Flashcard 20 từ vựng Unit 5, luyện nghe bài 5.2 trên ứng dụng.',
      homeworkStatus: 'done',
    },
    {
      id: 's10',
      session: 10,
      date: '2024-01-08',
      dayOfWeek: 'Thứ Hai',
      topic: 'Unit 4: Review – Grammar & Listening',
      attendance: 'present',
      score: { type: 'test', value: 8, max: 10, label: 'Kiểm tra 15 phút' },
      comment:
        'Bài kiểm tra kết quả tốt. An đặc biệt mạnh ở phần nghe và điền từ. Phần viết câu vẫn cần cải thiện ngữ pháp thì hiện tại đơn.',
      mood: 'great',
      homework: 'Hoàn thành Workbook Unit 4, trang 35–38.',
      homeworkStatus: 'done',
    },
    {
      id: 's9',
      session: 9,
      date: '2024-01-03',
      dayOfWeek: 'Thứ Tư',
      topic: 'Unit 4: Food & Drink – Making orders',
      attendance: 'late',
      score: { type: 'participation', value: 7.5, max: 10, label: 'Tham gia lớp' },
      comment:
        'An đến muộn ~10 phút do kẹt xe. Tuy nhiên sau khi vào lớp em rất chăm chú. Nhờ phụ huynh lưu ý giờ giấc để không bỏ lỡ nội dung đầu buổi.',
      mood: 'good',
      homework: 'Workbook trang 30–32, luyện roleplay đặt món ăn với bạn bè.',
      homeworkStatus: 'late',
    },
  ],
  c2: [
    {
      id: 'm11',
      session: 11,
      date: '2024-01-21',
      dayOfWeek: 'Chủ Nhật',
      topic: 'Bài 8: Phương trình và bất phương trình bậc nhất',
      attendance: 'present',
      score: { type: 'test', value: 6.5, max: 10, label: 'Kiểm tra miệng' },
      comment:
        'An cần ôn lại quy tắc chuyển vế. Em còn nhầm dấu khi chuyển bất phương trình. Tư duy logic tốt nhưng hay tính nhẩm vội dẫn đến sai số.',
      mood: 'good',
      homework: 'Bài tập 8.1 → 8.10, SGK trang 56. Đặc biệt chú ý bài 8.7 và 8.8.',
      homeworkStatus: 'pending',
    },
    {
      id: 'm10',
      session: 10,
      date: '2024-01-20',
      dayOfWeek: 'Thứ Bảy',
      topic: 'Bài 7: Hệ phương trình – Luyện tập nâng cao',
      attendance: 'present',
      score: { type: 'quiz', value: 8, max: 10, label: 'Bài kiểm tra 20 phút' },
      comment:
        'Tiến bộ rõ rệt so với tuần trước! An giải đúng 4/5 bài tập nâng cao. Cần trình bày lời giải gọn gàng hơn. Giữ vững tinh thần này!',
      mood: 'great',
      homework: 'Ôn tập toàn bộ Bài 6 & 7, xem trước Bài 8.',
      homeworkStatus: 'done',
    },
  ],
};

const MOCK_INVOICES = [
  { id: 'inv1', title: 'Học phí Tiếng Anh (Tháng 10)', amount: 2500000, dueDate: '2023-10-15', status: 'PENDING' },
  { id: 'inv2', title: 'Giáo trình & Đồng phục', amount: 450000, dueDate: '2023-10-20', status: 'PARTIAL' },
];

const formatCurrency = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const ATTENDANCE_CONFIG = {
  present: {
    label: 'Có mặt',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  absent: { label: 'Vắng phép', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', icon: X },
  late: { label: 'Đi muộn', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', icon: Clock },
};

const MOOD_CONFIG = {
  great: { label: 'Xuất sắc', icon: Smile, color: 'text-emerald-500' },
  good: { label: 'Tốt', icon: Meh, color: 'text-blue-500' },
  bad: { label: 'Cần cố gắng', icon: Frown, color: 'text-red-500' },
};

const COLOR_CONFIG = {
  blue: {
    gradient: 'from-blue-500 to-blue-700',
    light: 'bg-blue-50',
    accent: 'text-blue-600',
    border: 'border-blue-200',
    ring: 'ring-blue-300',
  },
  indigo: {
    gradient: 'from-indigo-500 to-indigo-700',
    light: 'bg-indigo-50',
    accent: 'text-indigo-600',
    border: 'border-indigo-200',
    ring: 'ring-indigo-300',
  },
};

const scoreColor = (v: number, max: number) => {
  const r = v / max;
  if (r >= 0.8) return 'text-emerald-600';
  if (r >= 0.6) return 'text-blue-600';
  return 'text-red-600';
};

const scoreBg = (v: number, max: number) => {
  const r = v / max;
  if (r >= 0.8) return 'bg-emerald-50 border-emerald-200';
  if (r >= 0.6) return 'bg-blue-50 border-blue-200';
  return 'bg-red-50 border-red-200';
};

const hwConfig = {
  done: { label: 'Đã nộp', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  pending: { label: 'Chưa nộp', bg: 'bg-red-100', text: 'text-red-700' },
  late: { label: 'Nộp muộn', bg: 'bg-amber-100', text: 'text-amber-700' },
};

// ─── CLASS DETAIL PAGE ────────────────────────────────────────────────────────
const ClassDetail = ({ cls, sessions, onBack }: { cls: any; sessions: any[]; onBack: () => void }) => {
  const [expandedId, setExpandedId] = useState(sessions[0]?.id ?? null);
  const [filterAttendance, setFilterAttendance] = useState('all');
  const cfg = COLOR_CONFIG[cls.color] || COLOR_CONFIG.blue;

  const filtered = filterAttendance === 'all' ? sessions : sessions.filter((s) => s.attendance === filterAttendance);

  const presentCount = sessions.filter((s) => s.attendance === 'present').length;
  const absentCount = sessions.filter((s) => s.attendance === 'absent').length;
  const lateCount = sessions.filter((s) => s.attendance === 'late').length;
  const scoresArr = sessions.filter((s) => s.score).map((s) => s.score.value);
  const avgScore = scoresArr.length ? (scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length).toFixed(1) : '—';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className={`bg-gradient-to-br ${cfg.gradient} text-white`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
          {/* Back */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Quay lại tổng quan</span>
          </button>

          {/* Class title */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
              <BookMarked size={32} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-1">{cls.subject}</p>
              <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-3">{cls.name}</h2>
              <div className="flex flex-wrap gap-3 text-sm text-white/80">
                <span className="flex items-center gap-1.5">
                  <User size={14} />
                  {cls.teacher}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {cls.schedule}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {cls.room}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-8">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Tiến độ khoá học</span>
              <span className="font-bold text-white">
                {cls.completedSessions}/{cls.totalSessions} buổi
              </span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${(cls.completedSessions / cls.totalSessions) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards – floated */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Buổi có mặt',
              value: presentCount,
              icon: CheckCircle2,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              border: 'border-emerald-200',
            },
            {
              label: 'Vắng / Muộn',
              value: `${absentCount}/${lateCount}`,
              icon: AlertCircle,
              color: 'text-red-500',
              bg: 'bg-red-50',
              border: 'border-red-200',
            },
            {
              label: 'Điểm TB',
              value: avgScore,
              icon: BarChart2,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              border: 'border-blue-200',
            },
            {
              label: 'Bài tập đã nộp',
              value: `${sessions.filter((s) => s.homeworkStatus === 'done').length}/${sessions.length}`,
              icon: Award,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              border: 'border-amber-200',
            },
          ].map((stat, i) => (
            <div key={i} className={`bg-white rounded-2xl p-4 shadow-sm border ${stat.border} flex items-center gap-3`}>
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div>
                <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 font-medium leading-tight">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions list */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Filter bar */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Calendar size={20} className={cfg.accent} />
            Nhật ký buổi học ({sessions.length} buổi)
          </h3>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {[
              { v: 'all', label: 'Tất cả' },
              { v: 'present', label: 'Có mặt' },
              { v: 'absent', label: 'Vắng' },
            ].map((f) => (
              <button
                key={f.v}
                onClick={() => setFilterAttendance(f.v)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterAttendance === f.v ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((session) => {
            const att = ATTENDANCE_CONFIG[session.attendance] || ATTENDANCE_CONFIG.present;
            const isOpen = expandedId === session.id;

            return (
              <div
                key={session.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-blue-200 shadow-blue-50' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                }`}
              >
                {/* Row header – always visible */}
                <button className="w-full text-left" onClick={() => setExpandedId(isOpen ? null : session.id)}>
                  <div className="p-4 sm:p-5 flex items-center gap-4">
                    {/* Session number */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${isOpen ? `${cfg.light} ${cfg.accent}` : 'bg-gray-100 text-gray-500'}`}
                    >
                      {session.session}
                    </div>

                    {/* Date + topic */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-gray-400">
                          {session.dayOfWeek} – {session.date}
                        </span>
                        {/* Attendance badge inline */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${att.bg} ${att.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${att.dot}`}></span>
                          {att.label}
                        </span>
                      </div>
                      <p className="font-bold text-gray-800 text-sm truncate pr-2">{session.topic}</p>
                    </div>

                    {/* Score pill */}
                    {session.score ? (
                      <div
                        className={`hidden sm:flex flex-col items-center px-3 py-1.5 rounded-xl border text-center shrink-0 ${scoreBg(session.score.value, session.score.max)}`}
                      >
                        <span
                          className={`text-lg font-black leading-none ${scoreColor(session.score.value, session.score.max)}`}
                        >
                          {session.score.value}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">/{session.score.max}</span>
                      </div>
                    ) : (
                      <div className="hidden sm:block w-14" />
                    )}

                    {/* Chevron */}
                    <div
                      className={`text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-4 sm:px-5 py-5 space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">
                    {/* Grid: Score + Mood + Homework */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Score */}
                      <div
                        className={`rounded-2xl border p-4 flex items-center gap-3 ${session.score ? scoreBg(session.score.value, session.score.max) : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                          <TrendingUp
                            size={18}
                            className={
                              session.score ? scoreColor(session.score.value, session.score.max) : 'text-gray-400'
                            }
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Điểm số</p>
                          {session.score ? (
                            <>
                              <p className={`text-xl font-black ${scoreColor(session.score.value, session.score.max)}`}>
                                {session.score.value}
                                <span className="text-sm font-medium text-gray-400">/{session.score.max}</span>
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium">{session.score.label}</p>
                            </>
                          ) : (
                            <p className="text-sm font-bold text-gray-400">Không có</p>
                          )}
                        </div>
                      </div>

                      {/* Mood */}
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                          {session.mood ? (
                            React.createElement(MOOD_CONFIG[session.mood].icon, {
                              size: 20,
                              className: MOOD_CONFIG[session.mood].color,
                            })
                          ) : (
                            <Meh size={20} className="text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Thái độ học</p>
                          <p
                            className={`text-sm font-black ${session.mood ? MOOD_CONFIG[session.mood].color : 'text-gray-400'}`}
                          >
                            {session.mood ? MOOD_CONFIG[session.mood].label : 'Không có dữ liệu'}
                          </p>
                        </div>
                      </div>

                      {/* Homework */}
                      <div
                        className={`rounded-2xl border p-4 flex items-center gap-3 ${session.homeworkStatus ? `${hwConfig[session.homeworkStatus].bg} border-${session.homeworkStatus === 'done' ? 'emerald' : session.homeworkStatus === 'pending' ? 'red' : 'amber'}-200` : 'bg-gray-50 border-gray-100'}`}
                      >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                          <BookOpen
                            size={18}
                            className={
                              session.homeworkStatus === 'done'
                                ? 'text-emerald-600'
                                : session.homeworkStatus === 'late'
                                  ? 'text-amber-600'
                                  : 'text-red-500'
                            }
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Bài tập về nhà</p>
                          <p
                            className={`text-sm font-black ${
                              session.homeworkStatus === 'done'
                                ? 'text-emerald-700'
                                : session.homeworkStatus === 'late'
                                  ? 'text-amber-700'
                                  : 'text-red-700'
                            }`}
                          >
                            {hwConfig[session.homeworkStatus]?.label ?? '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Comment */}
                    {session.comment && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 font-black text-white text-sm">
                          {cls.teacherAvatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-blue-700">{cls.teacher}</span>
                            <span className="text-[10px] text-blue-400 font-medium">Nhận xét buổi học</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed italic">"{session.comment}"</p>
                        </div>
                      </div>
                    )}

                    {/* Homework detail */}
                    {session.homework && (
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                        <div className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center shrink-0">
                          <BookMarked size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-amber-700 mb-1">Bài tập được giao</p>
                          <p className="text-sm text-gray-700">{session.homework}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Filter size={24} className="text-gray-400" />
            </div>
            <p className="font-bold text-gray-600">Không có buổi học nào khớp với bộ lọc.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PARENT PORTAL (MAIN) ─────────────────────────────────────────────────────
const ParentPortal = () => {
  const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0]);
  const [showChildDropdown, setShowChildDropdown] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeClassId, setActiveClassId] = useState(null);

  const handleOpenPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  };
  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaymentModalOpen(false);
      alert('Hệ thống đang xác nhận thanh toán. Cảm ơn bạn!');
    }, 1500);
  };

  // Show class detail
  if (activeClassId) {
    const cls = MOCK_CLASSES.find((c) => c.id === activeClassId);
    const sessions = SESSION_MOCK[activeClassId] || [];
    return <ClassDetail cls={cls} sessions={sessions} onBack={() => setActiveClassId(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/20">
                <GraduationCap size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">EduCenter</h1>
                <p className="text-[10px] uppercase tracking-widest text-blue-600 font-bold">Parent Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <button
                  onClick={() => setShowChildDropdown(!showChildDropdown)}
                  className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 py-2 px-4 rounded-full border border-gray-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {selectedChild.avatar}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800">Hồ sơ: {selectedChild.name}</p>
                    <p className="text-xs text-gray-500">{selectedChild.grade}</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>
                {showChildDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-3 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chuyển đổi hồ sơ</p>
                    </div>
                    {MOCK_CHILDREN.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => {
                          setSelectedChild(child);
                          setShowChildDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 p-4 hover:bg-blue-50 transition-colors ${selectedChild.id === child.id ? 'bg-blue-50/50' : ''}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${selectedChild.id === child.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {child.avatar}
                        </div>
                        <div className="text-left">
                          <p
                            className={`text-sm font-bold ${selectedChild.id === child.id ? 'text-blue-700' : 'text-gray-800'}`}
                          >
                            {child.name}
                          </p>
                          <p className="text-xs text-gray-500">{child.grade}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <Bell size={24} />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
              <button className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-red-600 font-medium transition-colors">
                <LogOut size={18} /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <ShieldCheck size={250} />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Xin chào Phụ huynh bé {selectedChild.name}! 👋</h2>
            <p className="text-blue-100 mb-8 max-w-2xl text-lg">
              Chào mừng bạn đến với cổng thông tin. Dưới đây là tình hình học tập và các khoản phí cần lưu ý.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium">Đang theo học</p>
                  <p className="text-2xl font-bold">{MOCK_CLASSES.length} Lớp</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CreditCard size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium">Tổng cần thanh toán</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(MOCK_INVOICES.reduce((a, c) => a + c.amount, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Classes */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-blue-600" /> Lớp học của bé {selectedChild.name}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_CLASSES.map((cls) => {
              const sessions = SESSION_MOCK[cls.id] || [];
              const present = sessions.filter((s) => s.attendance === 'present').length;
              const hasScores = sessions.filter((s) => s.score);
              const avg = hasScores.length
                ? (hasScores.reduce((a, s) => a + s.score.value, 0) / hasScores.length).toFixed(1)
                : '—';
              const cfg = COLOR_CONFIG[cls.color] || COLOR_CONFIG.blue;
              const progress = Math.round((cls.completedSessions / cls.totalSessions) * 100);

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden"
                  onClick={() => setActiveClassId(cls.id)}
                >
                  {/* Colored top strip */}
                  <div className={`h-1.5 bg-gradient-to-r ${cfg.gradient}`} />

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={`w-12 h-12 ${cfg.light} ${cfg.accent} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <BookOpen size={24} />
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                        Đang học
                      </span>
                    </div>

                    <h4 className="font-bold text-lg text-gray-800 mb-4 line-clamp-2 group-hover:text-blue-700 transition-colors">
                      {cls.name}
                    </h4>

                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <User size={15} className="text-gray-400" />
                        <span className="font-medium">{cls.teacher}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Clock size={15} className="text-gray-400" />
                        <span>{cls.schedule}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <MapPin size={15} className="text-gray-400" />
                        <span>{cls.room}</span>
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      {[
                        {
                          label: 'Có mặt',
                          value: `${present}/${sessions.length}`,
                          color: 'text-emerald-600',
                          bg: 'bg-emerald-50',
                        },
                        { label: 'Điểm TB', value: avg, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Tiến độ', value: `${progress}%`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      ].map((s, i) => (
                        <div key={i} className={`${s.bg} rounded-xl p-2.5 text-center`}>
                          <p className={`font-black text-base ${s.color}`}>{s.value}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${cfg.gradient} rounded-full`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* CTA */}
                    <div
                      className={`mt-4 flex items-center justify-between text-sm font-bold ${cfg.accent} opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      <span>Xem chi tiết buổi học</span>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Invoices */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CreditCard className="text-blue-600" />
              Khoản phí chờ thanh toán
            </h3>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {MOCK_INVOICES.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {MOCK_INVOICES.map((invoice, index) => (
                  <div
                    key={invoice.id}
                    className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center shrink-0 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">{invoice.title}</h4>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} /> Hạn chót: {invoice.dueDate}
                          </span>
                          <span>
                            Mã HĐ:{' '}
                            <span className="font-mono text-gray-700 font-medium">#{invoice.id.toUpperCase()}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-3 md:min-w-[200px]">
                      <p className="font-black text-2xl text-red-600">{formatCurrency(invoice.amount)}</p>
                      <button
                        onClick={() => handleOpenPayment(invoice)}
                        className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-blue-600/20"
                      >
                        <QrCode size={18} /> Thanh toán ngay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                <CheckCircle2 size={48} className="text-green-500 mb-3" />
                <p className="font-medium text-lg text-gray-800">Tuyệt vời!</p>
                <p>Bạn không có khoản phí nào đang nợ.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-white">
              <GraduationCap size={28} />
              <span className="text-xl font-bold">EduCenter</span>
            </div>
            <p className="text-sm">Đồng hành cùng sự phát triển toàn diện của học sinh.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Hỗ trợ Phụ huynh</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Hướng dẫn thanh toán
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Quy định học phí
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Câu hỏi thường gặp
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Phone size={16} /> 1900 1234 (Ext: 1)
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} /> hotrophuhuynh@educenter.edu.vn
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="shrink-0 mt-1" /> 123 Đường ABC, Quận X, TP. Y
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-center">
          &copy; {new Date().getFullYear()} EduCenter. Đã đăng ký bản quyền.
        </div>
      </footer>

      {/* PAYMENT MODAL */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
            onClick={() => setIsPaymentModalOpen(false)}
          />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
            <div className="bg-blue-600 p-6 text-white text-center relative">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full"
              >
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold mb-1">Thanh toán Học phí</h3>
              <p className="text-blue-100 text-sm">Quét mã QR qua ứng dụng Ngân hàng/Ví điện tử</p>
            </div>
            <div className="p-8 flex flex-col items-center">
              <div className="w-full bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Nội dung thanh toán</p>
                <p className="font-bold text-gray-800">{selectedInvoice.title}</p>
                <div className="flex justify-between items-end mt-3">
                  <p className="text-sm text-gray-500">Mã: {selectedInvoice.id.toUpperCase()}</p>
                  <p className="font-black text-2xl text-blue-600">{formatCurrency(selectedInvoice.amount)}</p>
                </div>
              </div>
              <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-3xl mb-6">
                <div className="w-48 h-48 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400">
                  <QrCode size={64} className="mb-2" />
                  <span className="text-xs font-medium">Mã QR VietQR/ZaloPay</span>
                </div>
              </div>
              <p className="text-sm text-center text-gray-600 mb-8 max-w-[250px]">
                Mở ứng dụng Ngân hàng hoặc ZaloPay để quét mã.
              </p>
              <button
                disabled={isProcessing}
                onClick={handleConfirmPayment}
                className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold flex justify-center items-center gap-2 transition-all active:scale-95 disabled:bg-gray-400"
              >
                {isProcessing ? (
                  <>Chờ một lát...</>
                ) : (
                  <>
                    <CheckCircle2 size={18} /> Tôi đã chuyển khoản xong
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentPortal;
