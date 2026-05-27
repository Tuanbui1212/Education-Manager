import mongoose from 'mongoose';
import { fakerVI as faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import { UserModel } from '../models/user.model';
import { CourseModel } from '../models/course.model';
import { RoomModel } from '../models/room.model';
import { ClassModel } from '../models/class.model';
import { ScheduleModel } from '../models/schedule.model';
import { AttendanceModel } from '../models/attendance.model';
import { InvoiceModel } from '../models/invoice.model';
import { TransactionModel } from '../models/transaction.model';
import RoleModel from '../models/role.model';
import { ShiftModel } from '../models/shift.model';
import { AttendanceNotificationModel } from '../models/attendanceNotification.model';
import { NotificationTemplateModel } from '../models/notificationTemplate.model';
import FixedCostModel from '../models/fixedCost.model';
import { ExamModel } from '../models/exam.model';
import { ExamSubmissionModel } from '../models/examSubmission.model';
import { ExpenditureModel } from '../models/expenditure.model';
import PayrollModel from '../models/payroll.model';

// ==========================================
// ENUMS — căn đúng với model thực tế
// ==========================================
enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  RESERVED = 'RESERVED',
  POTENTIAL = 'POTENTIAL',
}
enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}
enum TeacherType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
}
enum ClassStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  MAINTENANCE = 'MAINTENANCE',
  PENDING = 'PENDING',
}
enum RoomStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  INACTIVE = 'INACTIVE',
}
enum InvoiceStatus {
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  UNPAID = 'UNPAID',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  OVERDUE = 'OVERDUE',
}
enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CARD = 'CARD',
  VNPAY = 'VNPAY',
}
enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
}
enum HomeworkStatus {
  DONE = 'DONE',
  NOT_DONE = 'NOT_DONE',
  NO_HOMEWORK = 'NO_HOMEWORK',
}
enum FixedCostCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}
enum ExamStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
}
enum ExamSubmissionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
}
enum ExpenditureType {
  SALARY = 'SALARY',
  OPERATION = 'OPERATION',
}
enum PayrollType {
  STAFF = 'STAFF',
  TEACHER_FULL_TIME = 'TEACHER_FULL_TIME',
  TEACHER_PART_TIME = 'TEACHER_PART_TIME',
}
enum PayrollStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

// ==========================================
// THÔNG SỐ
// ==========================================
const MONGO_URI = process.env.MONGO_URI as string;

const NUM_STUDENTS = 3000;
const NUM_TEACHERS = 100;
const NUM_CONSULTANTS = 20;
const NUM_ACCOUNTANTS = 10;
const NUM_MANAGERS = 5;
const NUM_ADMINS = 3;
const NUM_CLASSES = 400;
const NUM_PENDING_CLASSES = 60; // lớp chưa có lịch — dùng để test GA

const MIN_SESSIONS = 24;
const MAX_SESSIONS = 48;
const MAX_STUDENTS_PER_CLASS = 30;
const MAX_CLASSES_PER_STUDENT = 3;
const MAX_CLASSES_PER_TEACHER = 8;

const START_DATE = new Date('2023-01-01');
const NOW = new Date('2026-04-17');
const BATCH_SIZE = 5000;

// ==========================================
// STATIC DATA
// ==========================================

/** Danh sách ngân hàng Việt Nam */
const VN_BANKS = [
  { bankName: 'Vietcombank', bankBin: '970436' },
  { bankName: 'VietinBank', bankBin: '970415' },
  { bankName: 'BIDV', bankBin: '970418' },
  { bankName: 'Agribank', bankBin: '970405' },
  { bankName: 'Techcombank', bankBin: '970407' },
  { bankName: 'MB Bank', bankBin: '970422' },
  { bankName: 'VPBank', bankBin: '970432' },
  { bankName: 'ACB', bankBin: '970416' },
  { bankName: 'TPBank', bankBin: '970423' },
  { bankName: 'VIB', bankBin: '970441' },
  { bankName: 'SHB', bankBin: '970443' },
  { bankName: 'HDBank', bankBin: '970437' },
  { bankName: 'CAKE', bankBin: '546034' },
  { bankName: 'KienLongBank', bankBin: '970452' },
  { bankName: 'OCB', bankBin: '970448' },
];

const TEACHER_DEGREES = [
  'Cử nhân Sư phạm Tiếng Anh',
  'Thạc sĩ Ngôn ngữ Anh',
  'Tiến sĩ Giáo dục học',
  'Cử nhân Toán học',
  'Thạc sĩ Khoa học Máy tính',
  'Cử nhân Ngôn ngữ Nhật',
  'Thạc sĩ Hàn Quốc học',
];
const TEACHER_CERTS = ['IELTS 7.5+', 'TOEIC 900+', 'CELTA', 'DELTA', 'Cambridge TKT', 'JLPT N2', 'TOPIK II'];
const STUDENT_SCHOOLS = [
  'THPT Chu Văn An',
  'THPT Lê Hồng Phong',
  'THPT Trần Phú',
  'THPT Nguyễn Trãi',
  'THCS Nguyễn Du',
  'Tiểu học Đoàn Thị Điểm',
  'THPT Nguyễn Hiền',
  'THPT Gia Định',
];
const TEACHER_COMMENTS = [
  'Tốt',
  'Cần cố gắng thêm',
  'Tiến bộ rõ rệt',
  'Chưa tập trung',
  'Làm bài đầy đủ',
  'Hiểu bài nhanh',
  'Cần ôn lại bài cũ',
  'Xuất sắc',
  'Cần luyện tập thêm ở nhà',
  'Chăm chỉ, đáng khen',
  'none',
  '',
];

/** Danh sách khóa học thực tế */
const COURSE_DATA = [
  // ── LẬP TRÌNH & CÔNG NGHỆ ──────────────────────────────────────────────
  {
    title: 'Lập Trình Web Fullstack (Node.js + React)',
    basePrice: 12_000_000,
    totalLessons: 48,
    syllabus: 'Xây dựng ứng dụng web hoàn chỉnh: REST API với Express, giao diện với ReactJS, triển khai lên cloud.',
  },
  {
    title: 'Frontend Developer (ReactJS)',
    basePrice: 9_500_000,
    totalLessons: 36,
    syllabus: 'Component, hooks, state management với Redux Toolkit, React Query, tối ưu hiệu năng SPA.',
  },
  {
    title: 'Python & Data Analysis',
    basePrice: 10_000_000,
    totalLessons: 40,
    syllabus: 'Python cơ bản đến nâng cao, xử lý dữ liệu với Pandas/NumPy, trực quan hoá với Matplotlib.',
  },
  {
    title: 'Java Backend (Spring Boot)',
    basePrice: 11_000_000,
    totalLessons: 44,
    syllabus: 'Lập trình hướng đối tượng, Spring Boot REST API, JPA/Hibernate, bảo mật JWT, unit test.',
  },
  {
    title: 'Lập Trình Mobile Flutter',
    basePrice: 10_500_000,
    totalLessons: 40,
    syllabus: 'Dart cơ bản, UI/UX với Flutter Widget, kết nối API, publish app lên CH Play & App Store.',
  },
  {
    title: 'DevOps & CI/CD Căn Bản',
    basePrice: 8_500_000,
    totalLessons: 30,
    syllabus: 'Linux căn bản, Docker, Git workflow, GitHub Actions CI/CD, triển khai ứng dụng lên VPS.',
  },
  {
    title: 'SQL & Database Design',
    basePrice: 7_000_000,
    totalLessons: 28,
    syllabus: 'Thiết kế CSDL quan hệ, câu lệnh SQL nâng cao, tối ưu query, giới thiệu NoSQL (MongoDB).',
  },
  {
    title: 'Lập Trình Web Cơ Bản (HTML/CSS/JS)',
    basePrice: 5_500_000,
    totalLessons: 24,
    syllabus: 'Nền tảng HTML5, CSS3 responsive, JavaScript ES6+, DOM manipulation, fetch API.',
  },
  // ── NGOẠI NGỮ ──────────────────────────────────────────────────────────
  {
    title: 'Tiếng Anh Giao Tiếp Thực Chiến',
    basePrice: 4_500_000,
    totalLessons: 24,
    syllabus: 'Luyện phản xạ nói, phát âm chuẩn, xử lý tình huống giao tiếp công sở và đời sống hàng ngày.',
  },
  {
    title: 'IELTS Master 6.5+',
    basePrice: 10_500_000,
    totalLessons: 48,
    syllabus: 'Chiến thuật làm bài 4 kỹ năng, giải đề Cambridge thực tế, Writing Task 2 và Speaking band 6.5+.',
  },
  {
    title: 'TOEIC 700+ (Listening & Reading)',
    basePrice: 5_000_000,
    totalLessons: 32,
    syllabus: 'Từ vựng theo chủ đề, luyện nghe Part 1–4, đọc hiểu Part 5–7, mẹo phá bẫy câu hỏi.',
  },
  {
    title: 'Tiếng Nhật N4–N3',
    basePrice: 6_500_000,
    totalLessons: 36,
    syllabus: 'Từ vựng và ngữ pháp N4–N3, luyện đọc hiểu văn bản trung cấp, hội thoại tình huống thực tế.',
  },
  {
    title: 'Tiếng Hàn Giao Tiếp (TOPIK I)',
    basePrice: 5_000_000,
    totalLessons: 30,
    syllabus: 'Hangul, ngữ pháp sơ cấp đến trung cấp, luyện hội thoại và ôn thi TOPIK I.',
  },
  // ── THIẾT KẾ & SÁNG TẠO ────────────────────────────────────────────────
  {
    title: 'UI/UX Design (Figma)',
    basePrice: 8_000_000,
    totalLessons: 32,
    syllabus: 'Tư duy thiết kế UX, wireframe, prototype trên Figma, design system, bàn giao cho lập trình viên.',
  },
  {
    title: 'Thiết Kế Đồ Hoạ (Photoshop + Illustrator)',
    basePrice: 7_000_000,
    totalLessons: 30,
    syllabus: 'Xử lý ảnh chuyên nghiệp với Photoshop, thiết kế vector với Illustrator, áp dụng thực tế làm banner, logo.',
  },
  {
    title: 'Quay & Dựng Video (Premiere Pro)',
    basePrice: 7_500_000,
    totalLessons: 28,
    syllabus: 'Kỹ thuật quay phim cơ bản, dựng phim với Premiere Pro, After Effects motion graphic, xuất video chuẩn.',
  },
  // ── KỸ NĂNG & VĂN PHÒNG ────────────────────────────────────────────────
  {
    title: 'Excel Nâng Cao & Power BI',
    basePrice: 4_500_000,
    totalLessons: 24,
    syllabus: 'Hàm nâng cao, PivotTable, Power Query, xây dựng dashboard báo cáo với Power BI.',
  },
  {
    title: 'Kỹ Năng Thuyết Trình & Public Speaking',
    basePrice: 3_000_000,
    totalLessons: 20,
    syllabus: 'Cấu trúc bài nói logic, kỹ năng xử lý câu hỏi khó, ngôn ngữ cơ thể, thực hành thuyết trình thực tế.',
  },
  {
    title: 'Marketing Online & SEO',
    basePrice: 6_500_000,
    totalLessons: 28,
    syllabus: 'Xây dựng chiến lược digital marketing, SEO On-page & Off-page, Google Ads, Facebook Ads, đo lường ROI.',
  },
  {
    title: 'Kế Toán Thực Hành (MISA)',
    basePrice: 5_500_000,
    totalLessons: 32,
    syllabus: 'Nghiệp vụ kế toán thuế, lập báo cáo tài chính, thực hành phần mềm MISA SME theo quy trình doanh nghiệp.',
  },
];

/** Danh sách phòng học */
const ROOM_DATA = [
  { name: 'Phòng 101 (Lý thuyết)', capacity: 30, status: RoomStatus.ACTIVE },
  { name: 'Phòng 102 (Lý thuyết)', capacity: 30, status: RoomStatus.ACTIVE },
  { name: 'Phòng 103 (Phòng Lab)', capacity: 20, status: RoomStatus.ACTIVE },
  { name: 'Phòng 104 (Lý thuyết)', capacity: 25, status: RoomStatus.ACTIVE },
  { name: 'Phòng 105 (Thực hành)', capacity: 20, status: RoomStatus.ACTIVE },
  { name: 'Phòng 201 (VIP)', capacity: 15, status: RoomStatus.INACTIVE },
  { name: 'Phòng 202 (Lý thuyết)', capacity: 30, status: RoomStatus.ACTIVE },
  { name: 'Phòng 203 (Phòng Lab)', capacity: 20, status: RoomStatus.ACTIVE },
  { name: 'Phòng 204 (Lý thuyết)', capacity: 25, status: RoomStatus.ACTIVE },
  { name: 'Phòng 205 (Lý thuyết)', capacity: 25, status: RoomStatus.ACTIVE },
  { name: 'Phòng 301 (VIP)', capacity: 12, status: RoomStatus.ACTIVE },
  { name: 'Phòng 302 (Lý thuyết)', capacity: 30, status: RoomStatus.ACTIVE },
  { name: 'Phòng 303 (Lý thuyết)', capacity: 25, status: RoomStatus.ACTIVE },
  { name: 'Phòng 304 (Thực hành)', capacity: 25, status: RoomStatus.ACTIVE },
  { name: 'Phòng 305 (Thực hành)', capacity: 25, status: RoomStatus.ACTIVE },
  { name: 'Phòng 401 (Phòng Nghe nhìn)', capacity: 20, status: RoomStatus.ACTIVE },
  { name: 'Phòng 402 (Thảo luận nhóm)', capacity: 15, status: RoomStatus.MAINTENANCE },
  { name: 'Phòng 403 (Phòng thi)', capacity: 35, status: RoomStatus.ACTIVE },
  { name: 'Hội trường nhỏ A', capacity: 60, status: RoomStatus.ACTIVE },
  { name: 'Hội trường lớn B', capacity: 120, status: RoomStatus.ACTIVE },
];

/** Template thông báo */
const NOTIFICATION_TEMPLATES = [
  {
    code: 'REMIND_DEBT',
    title: '[Thông báo] Yêu cầu hoàn tất học phí - {{studentName}}',
    content:
      'Trung tâm xin gửi thông báo về khoản học phí còn thiếu của hóa đơn {{invoiceCode}}.\nSố tiền cần thanh toán: {{debtAmount}}\nHạn chót thanh toán: {{dueDate}}\n\nQuý phụ huynh vui lòng hoàn tất để đảm bảo tiến độ học tập của học viên không bị gián đoạn. Nếu đã thanh toán, xin vui lòng bỏ qua thông báo này.\n\nTrân trọng!',
    type: 'EMAIL',
  },
  {
    code: 'ENROLL_SUCCESS',
    title: 'Chào mừng {{studentName}} gia nhập Trung tâm!',
    content:
      'Xin chào {{studentName}},\n\nChúc mừng bạn đã ghi danh thành công vào khóa học. Chúng tôi rất vui mừng được đồng hành cùng bạn trên con đường chinh phục kiến thức sắp tới.\n\nThông tin tài khoản và lịch khai giảng sẽ được gửi đến bạn trong thời gian sớm nhất.\n\nTrân trọng,\nPhòng đào tạo.',
    type: 'EMAIL',
  },
  {
    code: 'PAYMENT_SUCCESS',
    title: '[Xác nhận] Thanh toán học phí thành công - HĐ {{invoiceCode}}',
    content:
      'Chào {{studentName}},\n\nHệ thống ghi nhận bạn đã hoàn tất thanh toán cho hóa đơn {{invoiceCode}}.\nSố tiền đã thu: {{finalAmount}}\n\nCảm ơn bạn đã tin tưởng và đồng hành cùng trung tâm!',
    type: 'EMAIL',
  },
  {
    code: 'INSTALLMENT_CREATED',
    title: '[Xác nhận] Thiết lập thanh toán trả góp thành công - HĐ {{invoiceCode}}',
    content:
      'Kính gửi Học viên {{studentName}},\n\nTrung tâm xin thông báo hóa đơn {{invoiceCode}} của bạn đã được hệ thống ghi nhận chuyển đổi sang hình thức thanh toán trả góp thành công.\n\n- Tổng công nợ hiện tại: {{debtAmount}}\n- Tổng số kỳ trả góp: {{totalMonths}} kỳ\n- Số tiền cần thanh toán mỗi kỳ: {{amountPerMonth}}\n\nTrân trọng,\nHệ thống Quản lý Đào tạo.',
    type: 'EMAIL',
  },
  {
    code: 'REMIND_INSTALLMENT',
    title: '[Thông báo] Nhắc nợ học phí trả góp kỳ này - {{studentName}}',
    content:
      'Xin chào {{studentName}},\n\nTrung tâm xin thông báo về kỳ thanh toán tiếp theo của hóa đơn {{invoiceCode}}.\n- Số tiền cần thanh toán kỳ này: {{debtAmount}}\n- Hạn chót thanh toán: {{dueDate}}\n\nQuý phụ huynh/Học viên vui lòng hoàn tất thanh toán đúng hạn.\n\nTrân trọng,\nPhòng Kế toán.',
    type: 'EMAIL',
  },
  {
    code: 'FORGOT_PASSWORD',
    title: '[TN Education] Yêu cầu đặt lại mật khẩu',
    content:
      'Xin chào {{fullName}},\n\nHệ thống vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\nVui lòng truy cập vào đường link dưới đây để thiết lập mật khẩu mới:\n{{resetUrl}}\n\nLưu ý:\n- Đường link này chỉ có hiệu lực trong vòng 15 phút.\n- Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua thông báo này.\n\nTrân trọng,\nHệ thống quản trị TN Education',
    type: 'EMAIL',
  },
  {
    code: 'MONTHLY_PAYROLL_NOTICE',
    title: '[Tên Trung Tâm] - Thông báo phiếu lương tháng {{month}} - {{fullName}}',
    content:
      'Kính gửi {{fullName}},\n\nPhòng Kế toán xin gửi đến bạn thông tin chi tiết phiếu lương của tháng {{month}} đối với vị trí {{roleName}}.\n\n- Lương cơ bản / Lương dạy: {{baseSalary}}\n- Phụ cấp / Thưởng / Hoa hồng: {{allowance}}\n- Khấu trừ / Phạt: {{deduction}}\n--------------------------------------------------\n💰 TỔNG TIỀN THỰC LÃNH: {{totalSalary}}\n\nNếu có bất kỳ thắc mắc nào, vui lòng phản hồi trong vòng 24h.\n\nTrân trọng,\nPhòng Kế toán & Nhân sự.',
    type: 'EMAIL',
  },
];

/** Chi phí cố định */
const FIXED_COSTS_DATA = [
  {
    name: 'Tiền thuê mặt bằng cơ sở 1',
    amount: 35_000_000,
    cycle: FixedCostCycle.MONTHLY,
    payDay: 5,
    status: 'ACTIVE',
    description: 'Thanh toán tiền thuê nhà hàng tháng cho chủ mặt bằng.',
  },
  {
    name: 'Phí quản lý tòa nhà & rác thải',
    amount: 2_500_000,
    cycle: FixedCostCycle.MONTHLY,
    payDay: 5,
    status: 'ACTIVE',
    description: 'Đóng cho ban quản lý tòa nhà.',
  },
  {
    name: 'Tiền mạng Internet FPT Gói Doanh nghiệp',
    amount: 880_000,
    cycle: FixedCostCycle.MONTHLY,
    payDay: 15,
    status: 'ACTIVE',
    description: 'Gói mạng tốc độ cao phục vụ các phòng máy và wifi học viên.',
  },
  {
    name: 'Lương cứng đội ngũ Bảo vệ',
    amount: 14_000_000,
    cycle: FixedCostCycle.MONTHLY,
    payDay: 10,
    status: 'ACTIVE',
    description: 'Trả lương cứng hàng tháng cho 2 nhân viên bảo vệ giữ xe.',
  },
  {
    name: 'Lương cứng nhân viên Tạp vụ',
    amount: 6_500_000,
    cycle: FixedCostCycle.MONTHLY,
    payDay: 10,
    status: 'ACTIVE',
    description: 'Trả lương cứng cho cô tạp vụ dọn dẹp trung tâm.',
  },
  {
    name: 'Phí thuê máy Photocopy Ricoh',
    amount: 1_200_000,
    cycle: FixedCostCycle.MONTHLY,
    payDay: 20,
    status: 'ACTIVE',
    description: 'Chi phí thuê máy in/photocopy hàng tháng (đã bao gồm bơm mực, bảo trì).',
  },
  {
    name: 'Thuê bao Zoom Pro (Gói 5 Host)',
    amount: 1_800_000,
    cycle: FixedCostCycle.MONTHLY,
    payDay: 2,
    status: 'ACTIVE',
    description: 'Duy trì tài khoản Zoom bản quyền không giới hạn thời gian cho các lớp học Online.',
  },
  {
    name: 'Dịch vụ Kế toán & Báo cáo thuế thuê ngoài',
    amount: 9_000_000,
    cycle: FixedCostCycle.QUARTERLY,
    payDay: 25,
    status: 'ACTIVE',
    description: 'Thanh toán theo quý cho công ty dịch vụ kế toán để làm sổ sách, khai thuế.',
  },
  {
    name: 'Gia hạn phần mềm quản lý, Server & VPS',
    amount: 18_000_000,
    cycle: FixedCostCycle.YEARLY,
    payDay: 1,
    status: 'ACTIVE',
    description: 'Phí gia hạn hệ thống server lưu trữ database và mã nguồn ứng dụng hàng năm.',
  },
  {
    name: 'Tên miền trung tâm & Chứng chỉ bảo mật SSL',
    amount: 1_500_000,
    cycle: FixedCostCycle.YEARLY,
    payDay: 10,
    status: 'ACTIVE',
    description: 'Phí duy trì domain website và chứng chỉ HTTPS.',
  },
];

/** Ngân hàng câu hỏi trắc nghiệm cho các đề thi */
const EXAM_QUESTION_POOL = [
  // Tiếng Anh / Ngôn ngữ
  {
    content: 'Chọn đáp án đúng để điền vào chỗ trống: "She ___ to school every day."',
    options: [
      { content: 'go', isCorrect: false },
      { content: 'goes', isCorrect: true },
      { content: 'going', isCorrect: false },
      { content: 'gone', isCorrect: false },
    ],
  },
  {
    content: 'Từ nào là TÍNH TỪ trong câu: "The beautiful flower smells nice"?',
    options: [
      { content: 'flower', isCorrect: false },
      { content: 'smells', isCorrect: false },
      { content: 'beautiful', isCorrect: true },
      { content: 'nice', isCorrect: false },
    ],
  },
  {
    content: 'Chọn từ đồng nghĩa với "HAPPY":',
    options: [
      { content: 'Sad', isCorrect: false },
      { content: 'Joyful', isCorrect: true },
      { content: 'Angry', isCorrect: false },
      { content: 'Tired', isCorrect: false },
    ],
  },
  {
    content: '"He has lived in Hanoi ___ 2010." — Điền giới từ thích hợp:',
    options: [
      { content: 'for', isCorrect: false },
      { content: 'since', isCorrect: true },
      { content: 'from', isCorrect: false },
      { content: 'at', isCorrect: false },
    ],
  },
  {
    content: 'Dạng quá khứ đơn của động từ "write" là gì?',
    options: [
      { content: 'writed', isCorrect: false },
      { content: 'written', isCorrect: false },
      { content: 'wrote', isCorrect: true },
      { content: 'writing', isCorrect: false },
    ],
  },
  {
    content: 'Câu nào SAI về mặt ngữ pháp?',
    options: [
      { content: 'She doesn\'t like coffee.', isCorrect: false },
      { content: 'They are playing football now.', isCorrect: false },
      { content: 'He don\'t go to school today.', isCorrect: true },
      { content: 'I have never been to Paris.', isCorrect: false },
    ],
  },
  {
    content: 'Chọn nghĩa đúng của cụm từ "break a leg":',
    options: [
      { content: 'Bị gãy chân', isCorrect: false },
      { content: 'Chúc may mắn', isCorrect: true },
      { content: 'Làm điều gì đó nguy hiểm', isCorrect: false },
      { content: 'Chạy thật nhanh', isCorrect: false },
    ],
  },
  {
    content: 'Thì nào được dùng để diễn tả hành động đang xảy ra tại thời điểm nói?',
    options: [
      { content: 'Present Simple', isCorrect: false },
      { content: 'Past Simple', isCorrect: false },
      { content: 'Present Continuous', isCorrect: true },
      { content: 'Future Simple', isCorrect: false },
    ],
  },
  {
    content: '"Vocabulary" có nghĩa là gì trong tiếng Việt?',
    options: [
      { content: 'Ngữ pháp', isCorrect: false },
      { content: 'Phát âm', isCorrect: false },
      { content: 'Từ vựng', isCorrect: true },
      { content: 'Đọc hiểu', isCorrect: false },
    ],
  },
  {
    content: 'Câu nào thể hiện đúng thì Hiện tại hoàn thành?',
    options: [
      { content: 'I eat breakfast this morning.', isCorrect: false },
      { content: 'She has finished her homework.', isCorrect: true },
      { content: 'They were playing tennis yesterday.', isCorrect: false },
      { content: 'He will go to the gym tomorrow.', isCorrect: false },
    ],
  },
  // Toán học
  {
    content: 'Giá trị của 15% × 200 bằng bao nhiêu?',
    options: [
      { content: '20', isCorrect: false },
      { content: '25', isCorrect: false },
      { content: '30', isCorrect: true },
      { content: '35', isCorrect: false },
    ],
  },
  {
    content: 'Diện tích hình tròn có bán kính r = 7 cm là bao nhiêu? (π ≈ 3.14)',
    options: [
      { content: '43.96 cm²', isCorrect: false },
      { content: '153.86 cm²', isCorrect: true },
      { content: '21.98 cm²', isCorrect: false },
      { content: '98 cm²', isCorrect: false },
    ],
  },
  {
    content: 'Nếu 3x + 6 = 18, thì x bằng bao nhiêu?',
    options: [
      { content: '2', isCorrect: false },
      { content: '4', isCorrect: true },
      { content: '6', isCorrect: false },
      { content: '8', isCorrect: false },
    ],
  },
  {
    content: 'Tổng của tất cả các góc trong một tam giác bằng bao nhiêu độ?',
    options: [
      { content: '90°', isCorrect: false },
      { content: '180°', isCorrect: true },
      { content: '270°', isCorrect: false },
      { content: '360°', isCorrect: false },
    ],
  },
  {
    content: 'Căn bậc hai của 144 là bao nhiêu?',
    options: [
      { content: '10', isCorrect: false },
      { content: '11', isCorrect: false },
      { content: '12', isCorrect: true },
      { content: '14', isCorrect: false },
    ],
  },
  {
    content: 'Phân số nào bằng 0.75?',
    options: [
      { content: '3/5', isCorrect: false },
      { content: '2/3', isCorrect: false },
      { content: '3/4', isCorrect: true },
      { content: '4/5', isCorrect: false },
    ],
  },
  {
    content: 'Chu vi hình chữ nhật có chiều dài 10 cm và chiều rộng 6 cm là bao nhiêu?',
    options: [
      { content: '32 cm', isCorrect: true },
      { content: '60 cm', isCorrect: false },
      { content: '16 cm', isCorrect: false },
      { content: '20 cm', isCorrect: false },
    ],
  },
  // Lập trình / CNTT
  {
    content: 'Kiểu dữ liệu nào dùng để lưu chuỗi văn bản trong JavaScript?',
    options: [
      { content: 'int', isCorrect: false },
      { content: 'string', isCorrect: true },
      { content: 'boolean', isCorrect: false },
      { content: 'float', isCorrect: false },
    ],
  },
  {
    content: 'HTML là viết tắt của cụm từ nào?',
    options: [
      { content: 'Hyper Text Markup Language', isCorrect: true },
      { content: 'High Tech Modern Language', isCorrect: false },
      { content: 'Hyper Transfer Markup Language', isCorrect: false },
      { content: 'Home Tool Markup Language', isCorrect: false },
    ],
  },
  {
    content: 'Trong CSS, thuộc tính nào dùng để thay đổi màu chữ?',
    options: [
      { content: 'background-color', isCorrect: false },
      { content: 'font-size', isCorrect: false },
      { content: 'color', isCorrect: true },
      { content: 'text-style', isCorrect: false },
    ],
  },
  {
    content: 'Kết quả của 5 % 3 trong hầu hết các ngôn ngữ lập trình là bao nhiêu?',
    options: [
      { content: '1', isCorrect: false },
      { content: '2', isCorrect: true },
      { content: '3', isCorrect: false },
      { content: '0', isCorrect: false },
    ],
  },
  {
    content: 'Hàm nào dùng để in ra màn hình trong Python?',
    options: [
      { content: 'console.log()', isCorrect: false },
      { content: 'echo()', isCorrect: false },
      { content: 'print()', isCorrect: true },
      { content: 'write()', isCorrect: false },
    ],
  },
  {
    content: 'Git là công cụ dùng để làm gì?',
    options: [
      { content: 'Thiết kế giao diện', isCorrect: false },
      { content: 'Quản lý phiên bản mã nguồn', isCorrect: true },
      { content: 'Chạy máy chủ web', isCorrect: false },
      { content: 'Quản lý cơ sở dữ liệu', isCorrect: false },
    ],
  },
  // Kỹ năng / Kiến thức chung
  {
    content: 'Kỹ năng nào KHÔNG thuộc nhóm kỹ năng mềm (soft skills)?',
    options: [
      { content: 'Giao tiếp hiệu quả', isCorrect: false },
      { content: 'Làm việc nhóm', isCorrect: false },
      { content: 'Lập trình Python', isCorrect: true },
      { content: 'Quản lý thời gian', isCorrect: false },
    ],
  },
  {
    content: 'Phương pháp học tập nào giúp ghi nhớ thông tin lâu nhất?',
    options: [
      { content: 'Đọc lại nhiều lần', isCorrect: false },
      { content: 'Ghi chép thụ động', isCorrect: false },
      { content: 'Dạy lại cho người khác', isCorrect: true },
      { content: 'Nghe giảng một chiều', isCorrect: false },
    ],
  },
  {
    content: 'Trong thuyết trình, yếu tố nào ảnh hưởng nhiều nhất đến ấn tượng đầu tiên?',
    options: [
      { content: 'Nội dung slide', isCorrect: false },
      { content: 'Ngôn ngữ cơ thể và giọng nói', isCorrect: true },
      { content: 'Số lượng từ trong bài', isCorrect: false },
      { content: 'Thời gian trình bày', isCorrect: false },
    ],
  },
  {
    content: 'Phần mềm Microsoft Excel thuộc nhóm ứng dụng nào?',
    options: [
      { content: 'Xử lý ảnh', isCorrect: false },
      { content: 'Bảng tính', isCorrect: true },
      { content: 'Trình chiếu', isCorrect: false },
      { content: 'Soạn thảo văn bản', isCorrect: false },
    ],
  },
  {
    content: 'TOPIK là kỳ thi đánh giá năng lực ngôn ngữ nào?',
    options: [
      { content: 'Tiếng Nhật', isCorrect: false },
      { content: 'Tiếng Trung', isCorrect: false },
      { content: 'Tiếng Hàn', isCorrect: true },
      { content: 'Tiếng Anh', isCorrect: false },
    ],
  },
  {
    content: 'JLPT N1 là cấp độ nào của kỳ thi năng lực tiếng Nhật?',
    options: [
      { content: 'Cơ bản nhất', isCorrect: false },
      { content: 'Trung cấp', isCorrect: false },
      { content: 'Cao nhất', isCorrect: true },
      { content: 'Sơ cấp', isCorrect: false },
    ],
  },
  {
    content: 'Công cụ Photoshop được dùng chủ yếu để làm gì?',
    options: [
      { content: 'Lập trình web', isCorrect: false },
      { content: 'Chỉnh sửa và thiết kế đồ họa', isCorrect: true },
      { content: 'Quản lý cơ sở dữ liệu', isCorrect: false },
      { content: 'Biên tập video', isCorrect: false },
    ],
  },
];

const SESSION_PAIRS = [
  { days: [2, 5], label: 'T2-T5' }, // Thứ 2 & Thứ 5
  { days: [3, 6], label: 'T3-T6' }, // Thứ 3 & Thứ 6
  { days: [4, 7], label: 'T4-T7' }, // Thứ 4 & Thứ 7
  { days: [2, 4], label: 'T2-T4' }, // Thứ 2 & Thứ 4
  { days: [3, 5], label: 'T3-T5' }, // Thứ 3 & Thứ 5
  { days: [6, 0], label: 'T6-CN' }, // Thứ 6 & Chủ nhật
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function batchInsert<T>(model: any, data: T[], batchSize = BATCH_SIZE) {
  for (let i = 0; i < data.length; i += batchSize) {
    await model.insertMany(data.slice(i, i + batchSize), { ordered: false });
  }
}

function safeBetween(from: Date, to: Date): Date {
  if (from >= to) return new Date(from);
  return faker.date.between({ from, to });
}

/** Sinh chuỗi ngày học theo cặp ngày cố định */
function generateSessionDates(startDate: Date, totalSessions: number, pair: { days: number[]; label: string }): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);

  // Tìm ngày đầu tiên khớp với day của cặp
  while (current.getDay() !== pair.days[0]) current.setDate(current.getDate() + 1);

  let generated = 0;
  while (generated < totalSessions) {
    for (const dayOfWeek of pair.days) {
      if (generated >= totalSessions) break;
      const d = new Date(current);
      const diff = (dayOfWeek - current.getDay() + 7) % 7;
      d.setDate(current.getDate() + diff);
      dates.push(d);
      generated++;
    }
    current.setDate(current.getDate() + 7);
  }

  return dates.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Điểm số phân phối thực tế: tập trung quanh 7–8.
 */
function generateMark(): number {
  return faker.helpers.weightedArrayElement([
    { weight: 2, value: 5 },
    { weight: 5, value: 6 },
    { weight: 12, value: 7 },
    { weight: 14, value: 8 },
    { weight: 5, value: 9 },
    { weight: 2, value: 10 },
  ]);
}

/**
 * Gán status lớp & startDate nhất quán nhau.
 */
function resolveClassStatusAndDates(): { status: ClassStatus; startDate: Date } {
  const status = faker.helpers.weightedArrayElement([
    { weight: 30, value: ClassStatus.COMPLETED },
    { weight: 40, value: ClassStatus.ACTIVE },
    { weight: 20, value: ClassStatus.UPCOMING },
    { weight: 10, value: ClassStatus.PENDING },
    { weight: 10, value: ClassStatus.MAINTENANCE },
  ]);

  let startDate: Date;
  switch (status) {
    case ClassStatus.COMPLETED:
      startDate = faker.date.between({ from: START_DATE, to: new Date('2025-06-01') });
      break;
    case ClassStatus.ACTIVE:
      startDate = faker.date.between({ from: new Date('2025-07-01'), to: new Date('2026-03-01') });
      break;
    case ClassStatus.UPCOMING:
      startDate = faker.date.between({ from: new Date('2026-04-18'), to: new Date('2026-12-31') });
      break;
    case ClassStatus.PENDING:
    default:
      startDate = faker.date.between({ from: new Date('2026-03-01'), to: new Date('2026-05-31') });
      break;
  }

  return { status, startDate };
}

/**
 * Tạo bankInfo ngẫu nhiên.
 * Một số user (học viên, admin) sẽ có bankInfo rỗng.
 */
function generateBankInfo(hasBank: boolean) {
  if (!hasBank) {
    return { bankName: '', bankBin: '', accountNo: '', accountName: '' };
  }
  const bank = faker.helpers.arrayElement(VN_BANKS);
  return {
    bankName: bank.bankName,
    bankBin: bank.bankBin,
    accountNo: faker.string.numeric({ length: { min: 8, max: 12 } }),
    accountName: faker.person.fullName().toUpperCase(),
  };
}

/**
 * Format ngày kiểu "D/M/YYYY" (không padding) cho tiêu đề notification.
 */
function formatDateVN(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

/**
 * Tạo nội dung notification điểm danh (khớp format thực tế).
 */
function buildAttendanceNotificationContent(
  status: AttendanceStatus,
  homework: HomeworkStatus,
  mark: number | null,
  comment: string,
): string {
  const statusText =
    status === AttendanceStatus.PRESENT ? 'Có mặt' : status === AttendanceStatus.ABSENT ? 'Vắng mặt' : 'Đi trễ';

  const homeworkText =
    homework === HomeworkStatus.DONE
      ? 'Đã nộp bài tập'
      : homework === HomeworkStatus.NOT_DONE
        ? 'Chưa nộp bài tập'
        : '';

  const markText = mark !== null && mark !== undefined ? `- Điểm: ${mark} ` : '';
  const commentText = comment ? `- Nhận xét: ${comment}` : '';

  return `${statusText} - \n                    ${homeworkText} \n                     ${markText}\n                    ${commentText}`;
}

/** Format tháng dạng "YYYY-MM" */
function formatMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Số giờ của một ca học, tính từ startTime/endTime "HH:mm" */
function shiftDuration(shift: any): number {
  if (!shift?.startTime || !shift?.endTime) return 1.5;
  const [sh, sm] = (shift.startTime as string).split(':').map(Number);
  const [eh, em] = (shift.endTime as string).split(':').map(Number);
  return Math.max(0.5, (eh * 60 + em - sh * 60 - sm) / 60);
}

/** Tạo danh sách câu hỏi ngẫu nhiên từ pool */
function generateExamQuestions(count: number) {
  const shuffled = faker.helpers.shuffle([...EXAM_QUESTION_POOL]);
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((q) => {
    const questionId = new mongoose.Types.ObjectId();
    return {
      _id: questionId,
      content: q.content,
      points: faker.helpers.weightedArrayElement([
        { weight: 5, value: 1 },
        { weight: 3, value: 2 },
        { weight: 2, value: 3 },
      ]),
      options: q.options.map((opt) => ({
        _id: new mongoose.Types.ObjectId(),
        content: opt.content,
        isCorrect: opt.isCorrect,
      })),
    };
  });
}

/** Tạo đáp án ngẫu nhiên cho học sinh — 70% chọn đúng */
function generateStudentAnswers(questions: ReturnType<typeof generateExamQuestions>) {
  return questions.map((q) => {
    const correct = q.options.find((o) => o.isCorrect)!;
    const wrong = q.options.filter((o) => !o.isCorrect);
    const picksCorrect = Math.random() < 0.7;
    const picked = picksCorrect ? correct : faker.helpers.arrayElement(wrong);
    return {
      questionId: q._id,
      selectedOptionIds: [picked._id],
    };
  });
}

/** Tính điểm bài thi */
function calculateExamScore(
  questions: ReturnType<typeof generateExamQuestions>,
  answers: ReturnType<typeof generateStudentAnswers>,
): number {
  let score = 0;
  for (const ans of answers) {
    const q = questions.find((x) => x._id.toString() === ans.questionId.toString());
    if (!q) continue;
    const correctId = q.options.find((o) => o.isCorrect)?._id.toString();
    if (correctId && ans.selectedOptionIds.some((id) => id.toString() === correctId)) {
      score += q.points;
    }
  }
  return score;
}

// ==========================================
// MAIN SEEDER
// ==========================================
async function runSeeder() {
  try {
    console.log('⏳ Đang kết nối MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Kết nối thành công!');
    console.log('👉 DB NAME:', mongoose.connection.name, '\n');

    const defaultPassword = await bcrypt.hash('123456', 10);

    // --- Load roles & shifts (đã có sẵn trong DB) ---
    const roles = await RoleModel.find();
    const shifts = await ShiftModel.find();

    if (!roles.length || !shifts.length) {
      console.error('❌ Bảng Role hoặc Shift đang trống! Hãy chạy role/shift seeder trước.');
      process.exit(1);
    }

    // Map roles theo tên (case-insensitive)
    const findRole = (keyword: string) => roles.find((r) => r.name.toLowerCase().includes(keyword.toLowerCase()));

    const studentRole = findRole('student');
    const teacherRole = findRole('teacher');
    const consultantRole = findRole('consultant');
    const accountantRole = findRole('accountant');
    const managerRole = findRole('manager');
    const adminRole = findRole('admin'); // Super Admin hoặc Admin

    if (!studentRole || !teacherRole || !consultantRole) {
      console.error('❌ Thiếu role student / teacher / consultant!');
      process.exit(1);
    }

    // ==========================================
    // XÓA DỮ LIỆU CŨ
    // ==========================================
    console.log('🗑️  Đang dọn dẹp dữ liệu cũ...');
    await Promise.all([
      UserModel.deleteMany({}),
      CourseModel.deleteMany({}),
      RoomModel.deleteMany({}),
      ClassModel.deleteMany({}),
      ScheduleModel.deleteMany({}),
      AttendanceModel.deleteMany({}),
      InvoiceModel.deleteMany({}),
      TransactionModel.deleteMany({}),
      AttendanceNotificationModel.deleteMany({}),
      NotificationTemplateModel.deleteMany({}),
      FixedCostModel.deleteMany({}),
      ExamModel.deleteMany({}),
      ExamSubmissionModel.deleteMany({}),
      ExpenditureModel.deleteMany({}),
      PayrollModel.deleteMany({}),
    ]);
    console.log('✅ Dọn dẹp xong!\n');

    // ==========================================
    // NOTIFICATION TEMPLATES
    // ==========================================
    console.log('📧 Tạo Notification Templates...');
    await NotificationTemplateModel.insertMany(NOTIFICATION_TEMPLATES);
    console.log(`✅ Đã tạo ${NOTIFICATION_TEMPLATES.length} template.\n`);

    // ==========================================
    // FIXED COSTS
    // ==========================================
    console.log('💸 Tạo Chi phí cố định...');
    const fixedCostsData = FIXED_COSTS_DATA.map((fc) => ({
      ...fc,
      startDate: new Date('2026-01-01'),
      endDate: null,
    }));
    const insertedFixedCosts = await FixedCostModel.insertMany(fixedCostsData);
    console.log(`✅ Đã tạo ${fixedCostsData.length} chi phí cố định.\n`);

    // ==========================================
    // COURSES
    // ==========================================
    console.log(`📚 Tạo ${COURSE_DATA.length} Khóa học...`);
    const courses = await CourseModel.insertMany(COURSE_DATA);
    console.log(`✅ Đã tạo ${courses.length} khóa học.\n`);

    // ==========================================
    // ROOMS
    // ==========================================
    console.log(`🏫 Tạo ${ROOM_DATA.length} Phòng học...`);
    const rooms = await RoomModel.insertMany(ROOM_DATA);
    const activeRooms = rooms.filter((r) => (r as any).status === RoomStatus.ACTIVE);
    console.log(`✅ Đã tạo ${rooms.length} phòng học.\n`);

    // ==========================================
    // USERS
    // ==========================================
    console.log(`👥 Tạo Users...`);
    const consultantIds = Array.from({ length: NUM_CONSULTANTS }, () => new mongoose.Types.ObjectId());
    const usersData: any[] = [];

    // Super Admin
    if (adminRole) {
      for (let i = 0; i < NUM_ADMINS; i++) {
        usersData.push({
          email: i === 0 ? 'admin@edu.vn' : `admin${i}@edu.vn`,
          phone: faker.phone.number(),
          password: defaultPassword,
          fullName: faker.person.fullName(),
          gender: faker.helpers.enumValue(Gender),
          date: faker.date.birthdate({ min: 28, max: 50, mode: 'age' }),
          status: UserStatus.ACTIVE,
          roleId: adminRole._id,
          degrees: faker.helpers.arrayElements(['Thạc sĩ Quản trị Kinh doanh', 'Cử nhân Công nghệ thông tin'], 1),
          certificates: [],
          baseSalary: faker.number.int({ min: 20_000_000, max: 40_000_000 }),
          bankInfo: generateBankInfo(true),
          student_info: { crmHistory: [] },
          teacher_info: { type: TeacherType.PART_TIME, hourlyRate: 0 },
        });
      }
    }

    // Manager
    if (managerRole) {
      for (let i = 0; i < NUM_MANAGERS; i++) {
        usersData.push({
          email: `manager${i}@edu.vn`,
          phone: faker.phone.number(),
          password: defaultPassword,
          fullName: faker.person.fullName(),
          gender: faker.helpers.enumValue(Gender),
          date: faker.date.birthdate({ min: 25, max: 45, mode: 'age' }),
          status: UserStatus.ACTIVE,
          roleId: managerRole._id,
          degrees: faker.helpers.arrayElements(['Thạc sĩ Giáo dục học', 'Cử nhân Quản lý Giáo dục'], 1),
          certificates: [],
          baseSalary: faker.number.int({ min: 15_000_000, max: 25_000_000 }),
          bankInfo: generateBankInfo(true),
          student_info: { crmHistory: [] },
          teacher_info: { type: TeacherType.PART_TIME, hourlyRate: 0 },
        });
      }
    }

    // Accountant
    if (accountantRole) {
      for (let i = 0; i < NUM_ACCOUNTANTS; i++) {
        usersData.push({
          email: `accountant${i}@edu.vn`,
          phone: faker.phone.number(),
          password: defaultPassword,
          fullName: faker.person.fullName(),
          gender: faker.helpers.enumValue(Gender),
          date: faker.date.birthdate({ min: 22, max: 45, mode: 'age' }),
          status: UserStatus.ACTIVE,
          roleId: accountantRole._id,
          degrees: faker.helpers.arrayElements(
            ['Cử nhân Kế toán', 'Thạc sĩ Tài chính - Kế toán', 'Cử nhân Kiểm toán'],
            1,
          ),
          certificates: faker.helpers.arrayElements(
            ['Chứng chỉ Kế toán viên', 'Chứng chỉ tin học'],
            faker.number.int({ min: 0, max: 2 }),
          ),
          baseSalary: faker.number.int({ min: 8_000_000, max: 18_000_000 }),
          bankInfo: generateBankInfo(true),
          student_info: { crmHistory: [] },
          teacher_info: { type: TeacherType.PART_TIME, hourlyRate: 0 },
        });
      }
    }

    // Consultant — pre-generate _id để student có thể tham chiếu
    for (let i = 0; i < NUM_CONSULTANTS; i++) {
      usersData.push({
        _id: consultantIds[i],
        email: `consultant${i}@edu.vn`,
        phone: faker.phone.number(),
        password: defaultPassword,
        fullName: faker.person.fullName(),
        gender: faker.helpers.enumValue(Gender),
        date: faker.date.birthdate({ min: 22, max: 40, mode: 'age' }),
        status: UserStatus.ACTIVE,
        roleId: consultantRole._id,
        degrees: faker.helpers.arrayElements(['Cử nhân Kinh tế', 'Cử nhân Marketing', 'Cử nhân Quan hệ công chúng'], 1),
        certificates: faker.helpers.arrayElements(
          ['Chứng chỉ bán hàng', 'Chứng chỉ CNTT'],
          faker.number.int({ min: 0, max: 1 }),
        ),
        baseSalary: faker.number.int({ min: 5_000_000, max: 15_000_000 }),
        bankInfo: generateBankInfo(true),
        student_info: { crmHistory: [] },
        teacher_info: { type: TeacherType.PART_TIME, hourlyRate: 0 },
      });
    }

    // Teacher
    for (let i = 0; i < NUM_TEACHERS; i++) {
      const teacherType = faker.helpers.enumValue(TeacherType);
      const isFullTime = teacherType === TeacherType.FULL_TIME;
      usersData.push({
        email: `teacher${i}@edu.vn`,
        phone: faker.phone.number(),
        password: defaultPassword,
        fullName: faker.person.fullName(),
        gender: faker.helpers.enumValue(Gender),
        date: faker.date.birthdate({ min: 24, max: 55, mode: 'age' }),
        status: faker.helpers.weightedArrayElement([
          { weight: 8, value: UserStatus.ACTIVE },
          { weight: 2, value: UserStatus.INACTIVE },
        ]),
        roleId: teacherRole._id,
        degrees: faker.helpers.arrayElements(TEACHER_DEGREES, faker.number.int({ min: 1, max: 2 })),
        certificates: faker.helpers.arrayElements(TEACHER_CERTS, faker.number.int({ min: 0, max: 2 })),
        baseSalary: isFullTime ? faker.number.int({ min: 8_000_000, max: 20_000_000 }) : 0,
        bankInfo: generateBankInfo(true),
        student_info: { crmHistory: [] },
        teacher_info: {
          type: teacherType,
          hourlyRate: isFullTime
            ? faker.number.int({ min: 80_000, max: 200_000 }) // overtime
            : faker.number.int({ min: 150_000, max: 500_000 }), // chính
        },
      });
    }

    // Student
    for (let i = 0; i < NUM_STUDENTS; i++) {
      usersData.push({
        email: `student${i}@edu.vn`,
        phone: faker.phone.number(),
        password: defaultPassword,
        fullName: faker.person.fullName(),
        gender: faker.helpers.enumValue(Gender),
        date: faker.date.birthdate({ min: 7, max: 30, mode: 'age' }),
        status: faker.helpers.weightedArrayElement([
          { weight: 7, value: UserStatus.ACTIVE },
          { weight: 2, value: UserStatus.INACTIVE },
          { weight: 1, value: UserStatus.POTENTIAL },
        ]),
        roleId: studentRole._id,
        degrees: faker.helpers.arrayElements(STUDENT_SCHOOLS, 1),
        certificates: [],
        baseSalary: 0,
        bankInfo: generateBankInfo(false),
        student_info: {
          parentsName: faker.person.fullName(),
          parentsPhone: faker.phone.number(),
          address: faker.location.streetAddress(),
          school: faker.helpers.arrayElement(STUDENT_SCHOOLS),
          crmHistory: [],
          consultantId: faker.helpers.arrayElement(consultantIds),
        },
        teacher_info: { type: TeacherType.PART_TIME, hourlyRate: 0 },
      });
    }

    const insertedUsers = await UserModel.insertMany(usersData, { ordered: false });
    const students = insertedUsers.filter((u) => u.roleId.toString() === studentRole._id.toString());
    const teachers = insertedUsers.filter((u) => u.roleId.toString() === teacherRole._id.toString());
    const consultants = insertedUsers.filter((u) => u.roleId.toString() === consultantRole._id.toString());
    console.log(
      `✅ Đã tạo ${insertedUsers.length} user (${students.length} HV, ${teachers.length} GV, ${consultants.length} TV).\n`,
    );

    // ==========================================
    // PHÂN CÔNG & TẠO LỚP (CHỐNG TRÙNG LỊCH)
    // ==========================================
    console.log('🔀 Chuẩn bị phân bổ Lớp học, Học viên, Giáo viên và Phòng...');

    // 1. TẠO CÁC BỘ ĐẾM TRACKING CHỐNG TRÙNG COMBO (SessionPair_ShiftId)
    const studentBusyCombos = new Map<string, Set<string>>();
    const teacherBusyCombos = new Map<string, Set<string>>();
    const roomBusyCombos = new Map<string, Set<string>>();

    for (const s of students) studentBusyCombos.set(s._id.toString(), new Set());
    for (const t of teachers) teacherBusyCombos.set(t._id.toString(), new Set());
    for (const r of activeRooms) roomBusyCombos.set(r._id.toString(), new Set());

    const studentCourseSet = new Map<string, Set<string>>();
    const studentClassCount = new Map<string, number>();
    for (const s of students) {
      studentCourseSet.set(s._id.toString(), new Set());
      studentClassCount.set(s._id.toString(), 0);
    }
    const teacherClassCount = new Map<string, number>(teachers.map((t) => [t._id.toString(), 0]));

    // 2. TẠO DRAFT CLASSES VỚI LỊCH CỐ ĐỊNH
    const draftClasses = Array.from({ length: NUM_CLASSES }).map((_, index) => {
      const course = faker.helpers.arrayElement(courses);
      const { status, startDate } = resolveClassStatusAndDates();

      // Chọn cố định Cặp ngày và Ca học cho cả Lớp
      const sessionPair = faker.helpers.arrayElement(SESSION_PAIRS);
      const shift = faker.helpers.arrayElement(shifts);
      const combo = `${sessionPair.label}_${shift._id.toString()}`;

      return { index, courseId: course._id.toString(), course, status, startDate, sessionPair, shift, combo };
    });

    const classStudentMap = new Map<number, mongoose.Types.ObjectId[]>(draftClasses.map((_, i) => [i, []]));

    // 3. PHÂN CÔNG HỌC VIÊN VÀO LỚP
    for (const s of faker.helpers.shuffle([...students])) {
      const sid = s._id.toString();
      const wantNum = faker.number.int({ min: 1, max: MAX_CLASSES_PER_STUDENT });
      const busy = studentBusyCombos.get(sid)!;

      const eligible = draftClasses.filter(
        (dc) =>
          !studentCourseSet.get(sid)!.has(dc.courseId) && // Không học lại môn đã có
          classStudentMap.get(dc.index)!.length < MAX_STUDENTS_PER_CLASS && // Lớp chưa đầy
          !busy.has(dc.combo), // KHÔNG TRÙNG LỊCH CÁC LỚP KHÁC CỦA HỌC VIÊN NÀY
      );

      const picks = faker.helpers.arrayElements(eligible, Math.min(wantNum, eligible.length));
      for (const pick of picks) {
        if (studentClassCount.get(sid)! >= MAX_CLASSES_PER_STUDENT) break;
        classStudentMap.get(pick.index)!.push(s._id);
        studentCourseSet.get(sid)!.add(pick.courseId);
        studentClassCount.set(sid, studentClassCount.get(sid)! + 1);
        busy.add(pick.combo); // Đánh dấu học viên đã bận vào Combo (Cặp ngày + Ca) này
      }
    }

    // 4. CHỌN GIÁO VIÊN VÀ PHÒNG HỌC CHO CLASS
    console.log(`🏛️  Tạo ${NUM_CLASSES} Lớp học...`);

    function abbreviate(title: string, maxLen = 4): string {
      return title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/gi, 'd')
        .split(' ')
        .map((w) => w ?? '')
        .join('')
        .toUpperCase()
        .substring(0, maxLen);
    }

    const classesData = draftClasses.map((dc) => {
      // Tìm phòng rảnh
      const availableRooms = activeRooms.filter((r) => !roomBusyCombos.get(r._id.toString())!.has(dc.combo));
      const room =
        availableRooms.length > 0
          ? faker.helpers.arrayElement(availableRooms)
          : faker.helpers.arrayElement(activeRooms); // Ép kiểu nếu quá xui xẻo

      if (availableRooms.length > 0) roomBusyCombos.get(room._id.toString())!.add(dc.combo);

      // Tìm giáo viên rảnh
      const availableTeachers = teachers.filter((t) => {
        const tid = t._id.toString();
        const count = teacherClassCount.get(tid) ?? 0;
        const isActive = (t as any).status === UserStatus.ACTIVE;
        return isActive && count < MAX_CLASSES_PER_TEACHER && !teacherBusyCombos.get(tid)!.has(dc.combo);
      });

      const teacher =
        availableTeachers.length > 0
          ? faker.helpers.arrayElement(availableTeachers)
          : faker.helpers.arrayElement(teachers); // Ép kiểu nếu quá xui xẻo

      const teacherId = teacher._id;
      if (availableTeachers.length > 0) teacherBusyCombos.get(teacherId.toString())!.add(dc.combo);
      teacherClassCount.set(teacherId.toString(), (teacherClassCount.get(teacherId.toString()) ?? 0) + 1);

      return {
        name: `${abbreviate(dc.course.title)}-${faker.string.alpha(2).toUpperCase()}${faker.number.int({ min: 10, max: 99 })}`,
        courseId: dc.course._id,
        teacherId: teacherId,
        roomId: room._id,
        documents: [],
        studentIds: classStudentMap.get(dc.index) ?? [],
        status: dc.status,
        startDate: dc.startDate,
        totalLessons: (dc.course as any).totalLessons ?? faker.number.int({ min: MIN_SESSIONS, max: MAX_SESSIONS }),
        lessonsPerWeek: dc.sessionPair.days.length,
        maxNumberOfStudents: MAX_STUDENTS_PER_CLASS,
        schedule: (classStudentMap.get(dc.index) ?? []).length > 0,
      };
    });

    const classes = await ClassModel.insertMany(classesData);
    console.log(`✅ Đã tạo ${classes.length} lớp học không đụng lịch.\n`);

    // ==========================================
    // LỚP CHƯA CÓ LỊCH (để test hiệu năng GA)
    // ==========================================
    console.log(`⏳ Tạo ${NUM_PENDING_CLASSES} lớp PENDING chưa có lịch...`);

    const existingClassNames = new Set(classes.map((c) => c.name));
    const pendingClassesData: any[] = [];
    const activeTeachers = teachers.filter((t) => (t as any).status === 'ACTIVE');

    for (let i = 0; i < NUM_PENDING_CLASSES; i++) {
      const course = courses[i % courses.length];
      const teacher = activeTeachers[i % activeTeachers.length];
      const lessonsPerWeek = i % 3 === 0 ? 3 : 2;

      // Tên dạng PEND-XXXX-001 — đảm bảo không trùng với lớp đã tồn tại
      let name = `PEND-${abbreviate((course as any).title)}-${String(i + 1).padStart(3, '0')}`;
      let suffix = i + 1;
      while (existingClassNames.has(name)) {
        suffix++;
        name = `PEND-${abbreviate((course as any).title)}-${String(suffix).padStart(3, '0')}`;
      }
      existingClassNames.add(name);

      pendingClassesData.push({
        name,
        courseId: (course as any)._id,
        teacherId: teacher._id,
        roomId: undefined,           // chưa xếp phòng — GA sẽ gán
        documents: [],
        studentIds: [],
        startDate: faker.date.between({ from: new Date('2026-06-01'), to: new Date('2026-12-31') })
          .toISOString().slice(0, 10),
        totalLessons: (course as any).totalLessons ?? faker.number.int({ min: MIN_SESSIONS, max: MAX_SESSIONS }),
        lessonsPerWeek,
        maxNumberOfStudents: faker.number.int({ min: 15, max: MAX_STUDENTS_PER_CLASS }),
        optionalRequirements: [],
        status: ClassStatus.PENDING,
        schedule: false,
      });
    }

    await ClassModel.insertMany(pendingClassesData);
    console.log(`✅ Đã tạo ${pendingClassesData.length} lớp PENDING (schedule=false, roomId=null).\n`);

    // ==========================================
    // EXAMS & SUBMISSIONS
    // ==========================================
    console.log('📝 Tạo Đề thi & Bài nộp...');
    const examsData: any[] = [];
    const submissionsData: any[] = [];

    for (let i = 0; i < classes.length; i++) {
      const cls = classes[i];
      const draft = draftClasses[i];
      const studentIds = classStudentMap.get(i) ?? [];
      if (!studentIds.length) continue;

      const numExams = faker.number.int({ min: 1, max: 3 });
      const examTitles = ['Kiểm tra giữa kỳ', 'Kiểm tra cuối kỳ', 'Kiểm tra định kỳ'];

      for (let e = 0; e < numExams; e++) {
        let examStatus: ExamStatus;
        if (draft.status === ClassStatus.COMPLETED) {
          examStatus = faker.helpers.weightedArrayElement([
            { weight: 7, value: ExamStatus.CLOSED },
            { weight: 3, value: ExamStatus.PUBLISHED },
          ]);
        } else if (draft.status === ClassStatus.ACTIVE) {
          examStatus = faker.helpers.weightedArrayElement([
            { weight: 4, value: ExamStatus.PUBLISHED },
            { weight: 3, value: ExamStatus.CLOSED },
            { weight: 3, value: ExamStatus.DRAFT },
          ]);
        } else {
          examStatus = faker.helpers.weightedArrayElement([
            { weight: 6, value: ExamStatus.DRAFT },
            { weight: 4, value: ExamStatus.PUBLISHED },
          ]);
        }

        const duration = faker.helpers.arrayElement([45, 60, 90, 120]);

        let examStart: Date;
        if (draft.status === ClassStatus.COMPLETED || draft.status === ClassStatus.ACTIVE) {
          examStart = safeBetween(draft.startDate, NOW);
        } else {
          examStart = safeBetween(NOW, new Date('2026-12-31'));
        }
        const examEnd = new Date(examStart.getTime() + duration * 60 * 1000);

        const questionCount = faker.number.int({ min: 5, max: 10 });
        const questions = generateExamQuestions(questionCount);

        const examId = new mongoose.Types.ObjectId();
        examsData.push({
          _id: examId,
          title: `${examTitles[e] ?? 'Kiểm tra'} - ${(cls as any).name}`,
          description: `Bài ${examTitles[e] ?? 'kiểm tra'} dành cho lớp ${(cls as any).name}.`,
          classId: cls._id,
          teacherId: cls.teacherId,
          startDate: examStart,
          endDate: examEnd,
          duration,
          questions,
          status: examStatus,
        });

        // Tạo bài nộp cho đề thi đã ĐÓNG
        if (examStatus === ExamStatus.CLOSED) {
          const seenStudents = new Set<string>();
          for (const studentId of studentIds) {
            const sid = studentId.toString();
            if (seenStudents.has(sid)) continue;
            seenStudents.add(sid);

            const answers = generateStudentAnswers(questions);
            const score = calculateExamScore(questions, answers);
            const startedAt = new Date(examStart.getTime() + faker.number.int({ min: 0, max: 5 * 60_000 }));
            const timeTaken = faker.number.int({ min: Math.floor(duration * 0.5), max: duration }) * 60;
            const completedAt = new Date(startedAt.getTime() + timeTaken * 1000);

            submissionsData.push({
              examId,
              studentId,
              classId: cls._id,
              answers,
              score,
              startedAt,
              completedAt,
              timeTaken,
              status: ExamSubmissionStatus.SUBMITTED,
            });
          }
        }
      }
    }

    await batchInsert(ExamModel, examsData);
    await batchInsert(ExamSubmissionModel, submissionsData);
    console.log(`✅ Đã tạo ${examsData.length} đề thi và ${submissionsData.length} bài nộp.\n`);

    // ==========================================
    // INVOICES & TRANSACTIONS
    // ==========================================
    console.log('💰 Tạo Hoá đơn & Giao dịch...');

    // Bộ đếm mã phiếu thu theo năm: PT-YYYY-NNNN
    const txCounters = new Map<number, number>();
    const nextPT = (date: Date): string => {
      const y = date.getFullYear();
      const n = (txCounters.get(y) ?? 0) + 1;
      txCounters.set(y, n);
      return `PT-${y}-${String(n).padStart(4, '0')}`;
    };

    // Mô tả phương thức thanh toán dùng cho note
    const PM_LABEL: Record<string, string> = {
      CASH: 'Nộp tiền mặt tại quầy',
      TRANSFER: 'Chuyển khoản ngân hàng',
      CARD: 'Quẹt thẻ POS',
      VNPAY: 'Thanh toán qua cổng VNPay',
    };
    const invoicesData: any[] = [];
    const transactionsData: any[] = [];

    for (let i = 0; i < classes.length; i++) {
      const cls = classes[i];
      const draft = draftClasses[i];

      for (const studentId of classStudentMap.get(i) ?? []) {
        const finalAmount = Math.round(
          draft.course.basePrice * faker.number.float({ min: 0.92, max: 1.05, fractionDigits: 2 }),
        );

        // Trạng thái hoá đơn theo trạng thái lớp
        let invoiceStatus: InvoiceStatus;
        if (draft.status === ClassStatus.UPCOMING || draft.status === ClassStatus.PENDING) {
          invoiceStatus = faker.helpers.weightedArrayElement([
            { weight: 4, value: InvoiceStatus.UNPAID },
            { weight: 3, value: InvoiceStatus.PAID },
            { weight: 2, value: InvoiceStatus.PARTIAL },
            { weight: 1, value: InvoiceStatus.CANCELLED },
          ]);
        } else {
          invoiceStatus = faker.helpers.weightedArrayElement([
            { weight: 65, value: InvoiceStatus.PAID },
            { weight: 15, value: InvoiceStatus.PARTIAL },
            { weight: 8, value: InvoiceStatus.UNPAID },
            { weight: 7, value: InvoiceStatus.OVERDUE },
            { weight: 3, value: InvoiceStatus.REFUNDED },
            { weight: 2, value: InvoiceStatus.CANCELLED },
          ]);
        }

        // Tính debt theo status
        let debt = 0;
        if (invoiceStatus === InvoiceStatus.UNPAID || invoiceStatus === InvoiceStatus.OVERDUE) {
          debt = finalAmount;
        } else if (invoiceStatus === InvoiceStatus.PARTIAL) {
          const paidFraction = faker.number.float({ min: 0.3, max: 0.7, fractionDigits: 2 });
          debt = Math.round(finalAmount * (1 - paidFraction));
        } else {
          debt = 0; // PAID, REFUNDED, CANCELLED
        }

        // Thời điểm tạo hoá đơn (trong vòng 14 ngày trước/sau khai giảng)
        const classStart = draft.startDate;
        const invoiceFrom = new Date(classStart.getTime() - 14 * 86_400_000);
        const invoiceUntil = new Date(Math.min(classStart.getTime() + 3 * 86_400_000, NOW.getTime()));
        const invoiceCreatedAt = safeBetween(
          invoiceFrom < START_DATE ? START_DATE : invoiceFrom,
          invoiceUntil > NOW ? NOW : invoiceUntil,
        );

        // dueDate = 7 ngày sau ngày tạo hoá đơn
        const dueDate = new Date(invoiceCreatedAt.getTime() + 7 * 86_400_000);

        const invoiceId = new mongoose.Types.ObjectId();
        invoicesData.push({
          _id: invoiceId,
          code: `INV-${faker.string.alphanumeric(8).toUpperCase()}`,
          studentId,
          classId: cls._id,
          consultantId: faker.helpers.arrayElement(consultants)._id,
          finalAmount,
          debt,
          status: invoiceStatus,
          installmentConfig: { paidMonths: 0 },
          dueDate,
          remindCount: 0,
          createdAt: invoiceCreatedAt,
        });

        // Tạo giao dịch cho PAID / REFUNDED / PARTIAL
        const txWindowFrom = new Date(classStart.getTime() - 7 * 86_400_000);
        const txWindowTo = new Date(classStart.getTime() + 14 * 86_400_000);
        const txFrom = txWindowFrom < invoiceCreatedAt ? invoiceCreatedAt : txWindowFrom;
        const txTo = txWindowTo > NOW ? NOW : txWindowTo;

        if (invoiceStatus === InvoiceStatus.PAID || invoiceStatus === InvoiceStatus.REFUNDED) {
          const pm = faker.helpers.enumValue(PaymentMethod);
          const txDate = safeBetween(txFrom, txTo);
          const isRefund = invoiceStatus === InvoiceStatus.REFUNDED;
          transactionsData.push({
            code: nextPT(txDate),
            invoiceId,
            studentId,
            amount: finalAmount,
            paymentMethod: pm,
            note: isRefund
              ? `${PM_LABEL[pm] ?? pm} — Hoàn học phí theo yêu cầu — ${draft.course.title}`
              : `${PM_LABEL[pm] ?? pm} — Thanh toán đầy đủ học phí — ${draft.course.title}`,
            processedBy: faker.helpers.arrayElement(consultants)._id,
            createdAt: txDate,
          });
        } else if (invoiceStatus === InvoiceStatus.PARTIAL) {
          const paidAmount = finalAmount - debt;
          const numPayments = faker.number.int({ min: 1, max: 2 });
          let remaining = paidAmount;

          for (let p = 0; p < numPayments; p++) {
            const partial =
              p === numPayments - 1
                ? remaining
                : Math.round(remaining * faker.number.float({ min: 0.4, max: 0.6, fractionDigits: 2 }));
            remaining -= partial;

            const secondFrom = new Date(txTo.getTime() + 14 * 86_400_000);
            const secondTo = new Date(txTo.getTime() + 42 * 86_400_000);

            const pm = faker.helpers.enumValue(PaymentMethod);
            const txDate =
              p === 0
                ? safeBetween(txFrom, txTo)
                : safeBetween(secondFrom > NOW ? NOW : secondFrom, secondTo > NOW ? NOW : secondTo);
            transactionsData.push({
              code: nextPT(txDate),
              invoiceId,
              studentId,
              amount: partial,
              paymentMethod: pm,
              note: `${PM_LABEL[pm] ?? pm} — Học phí ${draft.course.title} (Đợt ${p + 1}/${numPayments})`,
              processedBy: faker.helpers.arrayElement(consultants)._id,
              createdAt: txDate,
            });
          }
        }
      }
    }

    await InvoiceModel.insertMany(invoicesData);
    await TransactionModel.insertMany(transactionsData);
    console.log(`✅ Đã tạo ${invoicesData.length} hoá đơn và ${transactionsData.length} giao dịch.\n`);

    // ==========================================
    // SCHEDULES, ATTENDANCE & NOTIFICATIONS
    //
    // - UPCOMING / PENDING → chỉ tạo schedule, không điểm danh.
    // - ACTIVE             → điểm danh những buổi date ≤ NOW.
    // - COMPLETED          → điểm danh toàn bộ.
    // - Notification       → tạo cho TẤT CẢ các lượt điểm danh (kể cả PRESENT).
    // ==========================================
    console.log('📅 Tạo Lịch học, Điểm danh & Thông báo...');

    let totalSchedules = 0;
    let totalAttendances = 0;
    let totalNotifications = 0;

    // Map tổng hợp số giờ dạy thực tế: teacherId → (YYYY-MM → hours)
    const teacherMonthHours = new Map<string, Map<string, number>>();

    for (let i = 0; i < classes.length; i++) {
      const cls = classes[i];
      const draft = draftClasses[i];
      const studentIds = classStudentMap.get(i) ?? [];
      if (!studentIds.length) continue;

      const numSessions = faker.number.int({ min: MIN_SESSIONS, max: MAX_SESSIONS });

      // Sử dụng draft.sessionPair đã lưu từ trước
      const sessionDates = generateSessionDates(draft.startDate, numSessions, draft.sessionPair);

      // Tích lũy giờ dạy thực tế (chỉ buổi đã qua) cho payroll
      const hoursPerSession = shiftDuration(draft.shift);
      const tid = cls.teacherId.toString();
      if (!teacherMonthHours.has(tid)) teacherMonthHours.set(tid, new Map());
      const tMonthMap = teacherMonthHours.get(tid)!;
      for (const d of sessionDates.filter((sd) => sd <= NOW)) {
        const mk = formatMonth(d);
        tMonthMap.set(mk, (tMonthMap.get(mk) ?? 0) + hoursPerSession);
      }

      const schedulesData = sessionDates.map((date) => ({
        classId: cls._id,
        shiftId: draft.shift._id, // Cố định 1 shift thay vì faker ở từng dòng
        roomId: cls.roomId,
        teacherId: cls.teacherId,
        date,
        attendances: [],
      }));

      const savedSchedules = await ScheduleModel.insertMany(schedulesData);
      totalSchedules += savedSchedules.length;

      // UPCOMING / PENDING → chỉ tạo schedule
      if (draft.status === ClassStatus.UPCOMING || draft.status === ClassStatus.PENDING) continue;

      // ACTIVE → chỉ điểm danh buổi đã qua
      const attendableSchedules =
        draft.status === ClassStatus.ACTIVE
          ? savedSchedules.filter((s) => new Date((s as any).date) <= NOW)
          : savedSchedules; // COMPLETED → tất cả

      const attendancesData: any[] = [];
      const notificationsData: any[] = [];

      for (const schedule of attendableSchedules) {
        const scheduleDate = new Date((schedule as any).date);

        for (const studentId of studentIds) {
          const status = faker.helpers.weightedArrayElement([
            { weight: 7, value: AttendanceStatus.PRESENT },
            { weight: 2, value: AttendanceStatus.ABSENT },
            { weight: 1, value: AttendanceStatus.LATE },
          ]);
          const homework = faker.helpers.enumValue(HomeworkStatus);
          const mark = generateMark();
          const comment = faker.helpers.arrayElement(TEACHER_COMMENTS);
          const attId = new mongoose.Types.ObjectId();

          attendancesData.push({
            _id: attId,
            scheduleId: schedule._id,
            studentId,
            classId: cls._id,
            homework,
            status,
            mark,
            teacherComment: comment,
          });

          // Notification cho TẤT CẢ attendance (kể cả PRESENT)
          notificationsData.push({
            userId: studentId,
            title: `Lớp ${(cls as any).name} điểm danh ngày ${formatDateVN(scheduleDate)}`,
            content: buildAttendanceNotificationContent(status, homework, mark, comment),
            attendanceId: attId,
            isRead: faker.datatype.boolean({ probability: 0.3 }),
            createdAt: scheduleDate,
          });
        }
      }

      await batchInsert(AttendanceModel, attendancesData);
      await batchInsert(AttendanceNotificationModel, notificationsData);
      totalAttendances += attendancesData.length;
      totalNotifications += notificationsData.length;
    }

    // ==========================================
    // PAYROLL (BẢNG LƯƠNG)
    // ==========================================
    console.log('💼 Tạo Bảng lương...');
    const payrollsData: any[] = [];
    const roleNameMap = new Map(roles.map((r) => [r._id.toString(), r.name as string]));

    // Tháng cần tạo lương cho nhân viên văn phòng (2025-01 → tháng hiện tại)
    const staffPayMonths: string[] = [];
    {
      const cur = new Date('2025-01-01');
      const limit = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
      while (cur <= limit) {
        staffPayMonths.push(formatMonth(cur));
        cur.setMonth(cur.getMonth() + 1);
      }
    }

    // 1. Lương giáo viên — dựa trên giờ dạy thực tế
    for (const [tid, monthMap] of teacherMonthHours) {
      const teacher = teachers.find((t) => t._id.toString() === tid);
      if (!teacher) continue;

      const isFullTime = (teacher as any).teacher_info?.type === TeacherType.FULL_TIME;
      const payrollType = isFullTime ? PayrollType.TEACHER_FULL_TIME : PayrollType.TEACHER_PART_TIME;
      const baseSalary = isFullTime ? ((teacher as any).baseSalary ?? 0) : 0;
      const hourlyRate = (teacher as any).teacher_info?.hourlyRate ?? 0;

      for (const [month, teachingHours] of monthMap) {
        const monthDate = new Date(`${month}-01`);
        const standardDays = isFullTime ? 22 : 0;
        const actualDays = isFullTime ? faker.number.int({ min: 18, max: 22 }) : 0;
        const standardHours = isFullTime ? standardDays * 8 : 0;
        const allowance = faker.number.int({ min: 0, max: 500_000 });
        const deduction = faker.number.int({ min: 0, max: 200_000 });

        let salary: number;
        if (isFullTime) {
          // Lương cứng × (ngày thực tế / chuẩn) + giờ vượt định mức × hourlyRate
          const overtimeHours = Math.max(0, teachingHours - 40);
          salary = Math.round((baseSalary * actualDays) / standardDays + overtimeHours * hourlyRate);
        } else {
          salary = Math.round(teachingHours * hourlyRate);
        }

        const totalSalary = Math.max(0, salary + allowance - deduction);
        const isPast = monthDate < new Date(NOW.getFullYear(), NOW.getMonth(), 1);
        const status = isPast
          ? faker.helpers.weightedArrayElement([
              { weight: 7, value: PayrollStatus.PAID },
              { weight: 3, value: PayrollStatus.PENDING },
            ])
          : PayrollStatus.PENDING;

        const payrollId = new mongoose.Types.ObjectId();
        payrollsData.push({
          _id: payrollId,
          userId: teacher._id,
          month,
          roleName: roleNameMap.get((teacher as any).roleId.toString()) ?? 'Giáo viên',
          payrollType,
          baseSalary,
          hourlyRate,
          metrics: { standardDays, actualDays, standardHours, teachingHours: Math.round(teachingHours * 10) / 10 },
          allowance,
          deduction,
          totalSalary,
          status,
          isEmailSent: status === PayrollStatus.PAID,
          emailSentAt: status === PayrollStatus.PAID ? new Date(`${month}-28`) : null,
          bankInfo: (teacher as any).bankInfo ?? {},
        });
      }
    }

    // 2. Lương nhân viên văn phòng (Manager, Accountant, Consultant)
    const officeStaff = insertedUsers.filter((u) => {
      const rid = u.roleId.toString();
      return (
        (managerRole && rid === managerRole._id.toString()) ||
        (accountantRole && rid === accountantRole._id.toString()) ||
        (consultantRole && rid === consultantRole._id.toString())
      );
    });

    for (const staff of officeStaff) {
      const baseSalary = (staff as any).baseSalary ?? 0;
      if (!baseSalary) continue;

      for (const month of staffPayMonths) {
        const monthDate = new Date(`${month}-01`);
        const standardDays = 22;
        const actualDays = faker.number.int({ min: 18, max: 22 });
        const allowance = faker.number.int({ min: 200_000, max: 1_500_000 });
        const deduction = faker.number.int({ min: 0, max: 300_000 });
        const totalSalary = Math.max(0, Math.round((baseSalary * actualDays) / standardDays) + allowance - deduction);

        const isPast = monthDate < new Date(NOW.getFullYear(), NOW.getMonth(), 1);
        const status = isPast
          ? faker.helpers.weightedArrayElement([
              { weight: 8, value: PayrollStatus.PAID },
              { weight: 2, value: PayrollStatus.PENDING },
            ])
          : PayrollStatus.PENDING;

        const payrollId = new mongoose.Types.ObjectId();
        payrollsData.push({
          _id: payrollId,
          userId: staff._id,
          month,
          roleName: roleNameMap.get((staff as any).roleId.toString()) ?? 'Nhân viên',
          payrollType: PayrollType.STAFF,
          baseSalary,
          hourlyRate: 0,
          metrics: { standardDays, actualDays, standardHours: standardDays * 8, teachingHours: 0 },
          allowance,
          deduction,
          totalSalary,
          status,
          isEmailSent: status === PayrollStatus.PAID,
          emailSentAt: status === PayrollStatus.PAID ? new Date(`${month}-28`) : null,
          bankInfo: (staff as any).bankInfo ?? {},
        });
      }
    }

    await batchInsert(PayrollModel, payrollsData);
    console.log(`✅ Đã tạo ${payrollsData.length.toLocaleString()} bảng lương.\n`);

    // ==========================================
    // EXPENDITURES (CHI TIÊU)
    // ==========================================
    console.log('🧾 Tạo Chi tiêu...');
    const expendituresData: any[] = [];

    // Bộ đếm mã phiếu chi theo năm: PC-YYYY-NNNN
    const expCounters = new Map<number, number>();
    const nextPC = (date: Date): string => {
      const y = date.getFullYear();
      const n = (expCounters.get(y) ?? 0) + 1;
      expCounters.set(y, n);
      return `PC-${y}-${String(n).padStart(4, '0')}`;
    };

    const accountantUsers = insertedUsers.filter(
      (u) => accountantRole && u.roleId.toString() === accountantRole._id.toString(),
    );
    const adminUsers = insertedUsers.filter(
      (u) => adminRole && u.roleId.toString() === adminRole._id.toString(),
    );
    const paidByPool = [...accountantUsers, ...adminUsers];
    const fallbackPaidBy = paidByPool.length > 0 ? paidByPool : [insertedUsers[0]];

    // SALARY: tạo 1 phiếu chi tương ứng cho mỗi bảng lương đã PAID — liên kết trực tiếp payrollId
    for (const pr of payrollsData) {
      if (pr.status !== PayrollStatus.PAID) continue;
      // Ngày chi lương: cuối tháng (ngày 25)
      const expDate = new Date(`${pr.month}-25`);
      expendituresData.push({
        code: nextPC(expDate),
        expenditureType: ExpenditureType.SALARY,
        amount: pr.totalSalary,
        payrollId: pr._id,
        receiverId: pr.userId,
        paidBy: faker.helpers.arrayElement(fallbackPaidBy)._id,
        description: `Chi lương tháng ${pr.month} — ${pr.roleName} (${pr.payrollType === PayrollType.TEACHER_PART_TIME ? 'Part-time' : pr.payrollType === PayrollType.TEACHER_FULL_TIME ? 'Full-time' : 'Nhân viên'})`,
        date: expDate,
      });
    }

    // OPERATION: chi phí vận hành — liên kết fixedCostId, trải đều các tháng từ 2025-01
    for (const fc of insertedFixedCosts) {
      const fcData = fc as any;
      // Số lần thanh toán dựa theo chu kỳ
      const paymentsPerYear = fcData.cycle === FixedCostCycle.MONTHLY ? 12 : fcData.cycle === FixedCostCycle.QUARTERLY ? 4 : 1;
      const totalMonths = staffPayMonths.length;
      const numPayments = Math.min(totalMonths, Math.round((totalMonths / 12) * paymentsPerYear));

      for (let p = 0; p < numPayments; p++) {
        // Trải đều các tháng
        const monthIdx = Math.floor((p / numPayments) * totalMonths);
        const monthStr = staffPayMonths[monthIdx] ?? staffPayMonths[staffPayMonths.length - 1];
        const expDate = new Date(`${monthStr}-${String(fcData.payDay ?? 5).padStart(2, '0')}`);
        const paidByUser = faker.helpers.arrayElement(fallbackPaidBy);
        expendituresData.push({
          code: nextPC(expDate),
          expenditureType: ExpenditureType.OPERATION,
          amount: Math.round(fcData.amount * faker.number.float({ min: 0.98, max: 1.02, fractionDigits: 3 })),
          fixedCostId: fcData._id,
          receiverId: paidByUser._id,
          paidBy: paidByUser._id,
          description: `Thanh toán ${fcData.name} — tháng ${monthStr}`,
          date: expDate,
        });
      }
    }

    await batchInsert(ExpenditureModel, expendituresData);
    const salaryExpCount = expendituresData.filter((e) => e.expenditureType === ExpenditureType.SALARY).length;
    const opExpCount = expendituresData.filter((e) => e.expenditureType === ExpenditureType.OPERATION).length;
    console.log(`✅ Đã tạo ${expendituresData.length.toLocaleString()} chi tiêu (${salaryExpCount} lương, ${opExpCount} vận hành).\n`);

    // ==========================================
    // TỔNG KẾT
    // ==========================================
    console.log('\n🎉 ========== HOÀN TẤT ==========');
    console.log(`   👤 Users:            ${insertedUsers.length.toLocaleString()}`);
    console.log(`   📘 Courses:          ${courses.length}`);
    console.log(`   🏢 Rooms:            ${rooms.length}`);
    console.log(`   🏛️  Classes:          ${classes.length} + ${NUM_PENDING_CLASSES} PENDING (chưa có lịch)`);
    console.log(`   📅 Schedules:        ${totalSchedules.toLocaleString()}`);
    console.log(`   ✅ Attendances:      ${totalAttendances.toLocaleString()}`);
    console.log(`   🔔 Notifications:    ${totalNotifications.toLocaleString()}`);
    console.log(`   💰 Invoices:         ${invoicesData.length.toLocaleString()}`);
    console.log(`   💳 Transactions:     ${transactionsData.length.toLocaleString()}`);
    console.log(`   📝 Exams:            ${examsData.length.toLocaleString()}`);
    console.log(`   📄 Submissions:      ${submissionsData.length.toLocaleString()}`);
    console.log(`   💼 Payrolls:         ${payrollsData.length.toLocaleString()}`);
    console.log(`   🧾 Expenditures:     ${expendituresData.length.toLocaleString()} (${expendituresData.filter(e=>e.expenditureType===ExpenditureType.SALARY).length} lương / ${expendituresData.filter(e=>e.expenditureType===ExpenditureType.OPERATION).length} vận hành)`);
    console.log(`   📧 Notif Templates:  ${NOTIFICATION_TEMPLATES.length}`);
    console.log(`   💸 Fixed Costs:      ${fixedCostsData.length}`);
    console.log('=================================\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi trong quá trình chạy Seeder:', error);
    process.exit(1);
  }
}

runSeeder();
