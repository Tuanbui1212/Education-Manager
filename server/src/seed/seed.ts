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

// ==========================================
// THÔNG SỐ
// ==========================================
const MONGO_URI = process.env.MONGO_URI as string;

const NUM_STUDENTS = 3000;
const NUM_TEACHERS = 100;
const NUM_CONSULTANTS = 50;
const NUM_ACCOUNTANTS = 10;
const NUM_MANAGERS = 5;
const NUM_ADMINS = 3;
const NUM_CLASSES = 400;

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
  {
    title: 'Tiếng Anh Giao Tiếp Cơ Bản',
    basePrice: 3_000_000,
    syllabus: 'Luyện phát âm chuẩn, giao tiếp các tình huống hàng ngày.',
  },
  {
    title: 'Tiếng Anh Giao Tiếp Nâng Cao',
    basePrice: 4_500_000,
    syllabus: 'Kỹ năng thuyết trình, phỏng vấn và giao tiếp môi trường công sở.',
  },
  {
    title: 'IELTS Foundation',
    basePrice: 5_500_000,
    syllabus: 'Củng cố nền tảng ngữ pháp, từ vựng và làm quen 4 kỹ năng IELTS.',
  },
  {
    title: 'IELTS Master 6.5+',
    basePrice: 8_500_000,
    syllabus: 'Chiến thuật làm bài chuyên sâu, giải đề thi thực tế.',
  },
  {
    title: 'IELTS Intensive 7.5+',
    basePrice: 10_500_000,
    syllabus: 'Tối ưu hóa điểm Writing & Speaking, luyện phản xạ thi thật.',
  },
  {
    title: 'TOEIC Starter 350+',
    basePrice: 2_500_000,
    syllabus: 'Ngữ pháp căn bản, làm quen format đề TOEIC Listening & Reading.',
  },
  { title: 'TOEIC Target 700+', basePrice: 4_000_000, syllabus: 'Mẹo tránh bẫy trong bài thi, tăng tốc độ đọc hiểu.' },
  {
    title: 'Tiếng Nhật N5',
    basePrice: 3_500_000,
    syllabus: 'Bảng chữ cái Hiragana/Katakana, ngữ pháp sơ cấp, giao tiếp cơ bản.',
  },
  {
    title: 'Tiếng Nhật N4',
    basePrice: 4_500_000,
    syllabus: 'Từ vựng và ngữ pháp N4, luyện kỹ năng đọc hiểu và nghe hiểu.',
  },
  { title: 'Tiếng Hàn Sơ Cấp 1', basePrice: 3_000_000, syllabus: 'Bảng chữ cái tiếng Hàn (Hangul), chào hỏi, số đếm.' },
  {
    title: 'Tiếng Hàn Sơ Cấp 2',
    basePrice: 3_500_000,
    syllabus: 'Giao tiếp chủ đề mua sắm, sở thích, thời tiết, giao thông.',
  },
  {
    title: 'Toán Tư Duy Tiểu Học',
    basePrice: 4_000_000,
    syllabus: 'Phát triển tư duy logic, phương pháp tính nhẩm siêu tốc.',
  },
  { title: 'Toán Nâng Cao THCS', basePrice: 5_000_000, syllabus: 'Chuyên đề bồi dưỡng học sinh giỏi, giải toán khó.' },
  {
    title: 'Ngữ Văn Bồi Dưỡng Lớp 9',
    basePrice: 4_500_000,
    syllabus: 'Tổng ôn kiến thức, rèn kỹ năng viết văn chuẩn bị thi vào lớp 10.',
  },
  {
    title: 'Lập Trình Web Cơ Bản',
    basePrice: 6_000_000,
    syllabus: 'Nền tảng HTML, CSS, JavaScript xây dựng giao diện tĩnh.',
  },
  {
    title: 'Lập Trình Frontend (ReactJS)',
    basePrice: 8_000_000,
    syllabus: 'Xây dựng ứng dụng SPA hiện đại với ReactJS và Redux.',
  },
  {
    title: 'Python Cho Người Mới',
    basePrice: 5_000_000,
    syllabus: 'Cú pháp cơ bản, cấu trúc dữ liệu, thuật toán tư duy.',
  },
  {
    title: 'Thiết Kế Đồ Họa Cơ Bản',
    basePrice: 5_500_000,
    syllabus: 'Sử dụng công cụ Photoshop, Illustrator và tư duy thiết kế.',
  },
  {
    title: 'Tin Học Văn Phòng (MOS)',
    basePrice: 2_000_000,
    syllabus: 'Làm chủ Word, Excel, PowerPoint theo chuẩn quốc tế.',
  },
  {
    title: 'Kỹ Năng Thuyết Trình',
    basePrice: 3_500_000,
    syllabus: 'Vượt qua nỗi sợ đám đông, cấu trúc bài nói, ngôn ngữ cơ thể.',
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
    await FixedCostModel.insertMany(fixedCostsData);
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
        email: `student${i}_${faker.string.alphanumeric(4)}@gmail.com`,
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
      };
    });

    const classes = await ClassModel.insertMany(classesData);
    console.log(`✅ Đã tạo ${classes.length} lớp học không đụng lịch.\n`);

    // ==========================================
    // INVOICES & TRANSACTIONS
    // ==========================================
    console.log('💰 Tạo Hoá đơn & Giao dịch...');
    const invoicesData: any[] = [];
    const transactionsData: any[] = [];

    for (let i = 0; i < classes.length; i++) {
      const cls = classes[i];
      const draft = draftClasses[i];

      for (const studentId of classStudentMap.get(i) ?? []) {
        const finalAmount = Math.round(
          draft.course.basePrice * faker.number.float({ min: 0.75, max: 1.0, fractionDigits: 2 }),
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
            { weight: 5, value: InvoiceStatus.PAID },
            { weight: 2, value: InvoiceStatus.PARTIAL },
            { weight: 1, value: InvoiceStatus.UNPAID },
            { weight: 1, value: InvoiceStatus.OVERDUE },
            { weight: 0.5, value: InvoiceStatus.REFUNDED },
            { weight: 0.5, value: InvoiceStatus.CANCELLED },
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
          transactionsData.push({
            code: `TRX-${faker.string.alphanumeric(10).toUpperCase()}`,
            invoiceId,
            studentId,
            amount: finalAmount,
            paymentMethod: faker.helpers.enumValue(PaymentMethod),
            processedBy: faker.helpers.arrayElement(consultants)._id,
            createdAt: safeBetween(txFrom, txTo),
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

            transactionsData.push({
              code: `TRX-${faker.string.alphanumeric(10).toUpperCase()}`,
              invoiceId,
              studentId,
              amount: partial,
              paymentMethod: faker.helpers.enumValue(PaymentMethod),
              processedBy: faker.helpers.arrayElement(consultants)._id,
              createdAt:
                p === 0
                  ? safeBetween(txFrom, txTo)
                  : safeBetween(secondFrom > NOW ? NOW : secondFrom, secondTo > NOW ? NOW : secondTo),
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

    for (let i = 0; i < classes.length; i++) {
      const cls = classes[i];
      const draft = draftClasses[i];
      const studentIds = classStudentMap.get(i) ?? [];
      if (!studentIds.length) continue;

      const numSessions = faker.number.int({ min: MIN_SESSIONS, max: MAX_SESSIONS });

      // Sử dụng draft.sessionPair đã lưu từ trước
      const sessionDates = generateSessionDates(draft.startDate, numSessions, draft.sessionPair);

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
    // TỔNG KẾT
    // ==========================================
    console.log('\n🎉 ========== HOÀN TẤT ==========');
    console.log(`   👤 Users:            ${insertedUsers.length.toLocaleString()}`);
    console.log(`   📘 Courses:          ${courses.length}`);
    console.log(`   🏢 Rooms:            ${rooms.length}`);
    console.log(`   🏛️  Classes:          ${classes.length}`);
    console.log(`   📅 Schedules:        ${totalSchedules.toLocaleString()}`);
    console.log(`   ✅ Attendances:      ${totalAttendances.toLocaleString()}`);
    console.log(`   🔔 Notifications:    ${totalNotifications.toLocaleString()}`);
    console.log(`   💰 Invoices:         ${invoicesData.length.toLocaleString()}`);
    console.log(`   💳 Transactions:     ${transactionsData.length.toLocaleString()}`);
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
