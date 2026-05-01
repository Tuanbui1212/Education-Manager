import Payroll from '../models/payroll.model';
import ExcelJS from 'exceljs';
import mongoose from 'mongoose';
import { IPayroll, PayrollType, PayrollStatus } from '../types/payroll.type';
import { UserStatus } from '../types/user.type';
import { UserModel } from '../models/user.model';
import { ScheduleModel } from '../models/schedule.model';
import { EmailService } from './email.service';
import RoleModel from '../models/role.model';
import { TransactionModel } from '../models/transaction.model';
import { ExpenditureModel } from '../models/expenditure.model';
import { CourseModel } from '@/models/course.model';

export class PayrollService {
  private emailService = new EmailService();

  async createPayroll(data: Partial<IPayroll>): Promise<IPayroll> {
    return await Payroll.create(data);
  }

  async getAllPayrolls(month: string): Promise<IPayroll[]> {
    if (!month) throw new Error('Month is required');
    return await Payroll.find({ month }).populate('userId', 'fullName email');
  }

  async getPayrollById(id: string): Promise<IPayroll | null> {
    return await Payroll.findById(id).populate('userId', 'fullName email');
  }

  async updatePayroll(id: string, data: Partial<IPayroll>, currentUserId: string): Promise<IPayroll | null> {
    const { allowance, deduction } = data;

    const existingPayroll = await Payroll.findById(id).populate('userId', 'fullName email');
    if (!existingPayroll) throw new Error('Payroll not found');

    if (allowance !== undefined && deduction !== undefined) {
      existingPayroll.totalSalary =
        existingPayroll.totalSalary +
        (allowance || 0) -
        (deduction || 0) -
        existingPayroll.allowance +
        existingPayroll.deduction;

      data.totalSalary = existingPayroll.totalSalary;
    }

    const year = new Date().getFullYear();
    const lastTx = await ExpenditureModel.findOne({ code: new RegExp(`^PC-${year}-`) }).sort({ code: -1 });

    let nextNumber = 1;
    if (lastTx && lastTx.code) {
      const parts = lastTx.code.split('-');
      nextNumber = parseInt(parts[parts.length - 1], 10) + 1;
    }
    const code = `PC-${year}-${nextNumber.toString().padStart(4, '0')}`;

    if (data.status === 'PAID' && existingPayroll.status !== 'PAID') {
      const user = existingPayroll.userId as any;
      const expenditureData = {
        code: code,
        expenditureType: 'SALARY',
        payrollId: existingPayroll._id,
        amount: existingPayroll.totalSalary,
        receiverId: user._id,
        paidBy: currentUserId,
        description: `Thanh toán lương tháng ${existingPayroll.month} - Nhân viên ${user.fullName}`,
        date: new Date(),
      };

      await ExpenditureModel.create(expenditureData);
    }

    return await Payroll.findByIdAndUpdate(id, data, { new: true });
  }

  async deletePayroll(id: string): Promise<IPayroll | null> {
    return await Payroll.findByIdAndDelete(id);
  }

  // Hàm tính số giờ dạy trong tháng cho giáo viên
  async calculateTeachingHours(userId: string, monthStr: string): Promise<number> {
    const [year, month] = monthStr.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const schedules = await ScheduleModel.find({
      teacherId: userId,
      date: { $gte: startDate, $lte: endDate },
    }).populate('shiftId');

    let teachingHours = 0;

    for (const schedule of schedules) {
      const shift = schedule.shiftId as any;
      if (shift?.startTime && shift?.endTime) {
        const [startHour, startMin] = shift.startTime.split(':').map(Number);
        const [endHour, endMin] = shift.endTime.split(':').map(Number);

        const startInHours = startHour + startMin / 60;
        const endInHours = endHour + endMin / 60;

        let hours = endInHours - startInHours;

        if (hours < 0) {
          hours += 24;
        }

        teachingHours += hours;
      }
    }

    return teachingHours;
  }

  // Hàm tính tự động hoa hồng cho tư vấn viên dựa trên doanh số tuyển sinh của tháng
  async calculateCommissionForConsultants(id: string, month: string): Promise<number> {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const students = await UserModel.find({
      status: UserStatus.ACTIVE,
      roleId: await RoleModel.findOne({ name: 'Student' }).select('_id'),
      'student_info.consultantId': id,
    }).select('_id');

    const transactions = await TransactionModel.find({
      studentId: { $in: students.map((s) => s._id) },
      createdAt: { $gte: startDate, $lte: endDate },
    }).select('amount');

    let totalAmount = 0;
    for (const transaction of transactions) {
      totalAmount += transaction.amount;
    }

    return totalAmount;
  }

  // Hàm tự động tạo bảng lương cho tất cả nhân sự đang hoạt động vào đầu mỗi tháng
  async generatePayrollForMonth(month: string): Promise<{ success: boolean; count: number; data: any[] }> {
    const studentId = await RoleModel.findOne({ name: 'Student' }).select('_id');

    const activeUsers = await UserModel.find({
      status: UserStatus.ACTIVE,
      roleId: { $ne: studentId },
    }).populate('roleId', 'name');

    if (!activeUsers || activeUsers.length === 0) {
      throw new Error('Không có nhân sự nào đang hoạt động để tính lương.');
    }

    const paidPayrolls = await Payroll.find({
      month: month,
      status: PayrollStatus.PAID,
    }).select('userId');

    const paidUserIds = new Set(paidPayrolls.map((p) => p.userId.toString()));

    const bulkOperations = [];

    for (const user of activeUsers) {
      if (paidUserIds.has(user._id.toString())) {
        continue;
      }
      const role = user.roleId as any;
      let payrollType = PayrollType.STAFF;
      let teachingHours = 0;
      let hourlyRate = 0;
      let totalSalary = user.baseSalary || 0;
      let allowance = 0;
      let deduction = 0;

      if (role?.name?.toLowerCase().includes('teacher')) {
        payrollType =
          user.teacher_info?.type === 'FULL_TIME' ? PayrollType.TEACHER_FULL_TIME : PayrollType.TEACHER_PART_TIME;

        hourlyRate = user.teacher_info?.hourlyRate || 0;

        teachingHours = (await this.calculateTeachingHours(user._id.toString(), month)) || 0;

        if (payrollType === PayrollType.TEACHER_PART_TIME) {
          totalSalary = teachingHours * hourlyRate;
        } else {
          totalSalary = (user.baseSalary || 0) + Math.max(0, teachingHours - 50) * hourlyRate;
        }
      } else if (role?.name?.toLowerCase().includes('consultant')) {
        payrollType = PayrollType.STAFF;
        const commission = await this.calculateCommissionForConsultants(user._id.toString(), month);
        allowance = commission * 0.1;
      } else {
        totalSalary = user.baseSalary || 0;
      }

      const payrollData = {
        userId: user._id,
        month: month,
        roleName: role.name,
        payrollType: payrollType,
        baseSalary: user.baseSalary || 0,
        hourlyRate: hourlyRate,
        metrics: {
          standardDays: 22,
          actualDays: 22,
          standardHours: 50,
          teachingHours: teachingHours,
        },
        allowance: allowance,
        deduction: deduction,
        totalSalary: totalSalary,
        status: PayrollStatus.PENDING,
        bankInfo: user.bankInfo || { bankName: '', bankBin: '', accountNo: '', accountName: '' },
      };

      bulkOperations.push({
        updateOne: {
          filter: {
            userId: user._id,
            month: month,
          },
          update: { $set: payrollData },
          upsert: true,
        },
      });
    }

    if (bulkOperations.length > 0) {
      await Payroll.bulkWrite(bulkOperations);
    }

    return { success: true, count: 0, data: bulkOperations };
  }

  // Hàm gửi email thông báo bảng lương cho nhân sự
  async sendPayrollEmail(payrollIds: string[]): Promise<{ successCount: number; failedCount: number }> {
    const payrolls = await Payroll.find({ _id: { $in: payrollIds } }).populate('userId', 'email fullName');

    if (!payrolls || payrolls.length === 0) {
      throw new Error('Không tìm thấy phiếu lương nào để gửi email.');
    }

    let successCount = 0;
    let failedCount = 0;

    for (const payroll of payrolls) {
      const user = payroll.userId as any;

      if (!user || !user.email) {
        failedCount++;
        continue;
      }

      const [year, month] = payroll.month.split('-');
      const formattedMonth = `${month}/${year}`;

      const payrollData = {
        fullName: user.fullName,
        month: formattedMonth,
        roleName: payroll.roleName,
        payrollType: payroll.payrollType,
        baseSalary: payroll.baseSalary,
        hourlyRate: payroll.hourlyRate,
        metrics: payroll.metrics,
        allowance: payroll.allowance,
        deduction: payroll.deduction,
        totalSalary: payroll.totalSalary,
      };

      const isSent = await this.emailService.sendEmailWithTemplate(user.email, 'MONTHLY_PAYROLL_NOTICE', payrollData);

      if (isSent) {
        successCount++;
      } else {
        failedCount++;
      }

      payroll.isEmailSent = isSent;
      payroll.emailSentAt = new Date().toISOString();
      await payroll.save();
    }

    return { successCount, failedCount };
  }

  // Hàm đánh dấu phiếu lương là đã thanh toán
  async markPayrollAsPaid(payrollIds: string[], currentUserId: string): Promise<{ count: number; data: string[] }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const pendingPayrolls = await Payroll.find({
        _id: { $in: payrollIds },
        status: 'PENDING',
      }).populate('userId', 'fullName');

      if (pendingPayrolls.length === 0) {
        throw new Error('Không tìm thấy phiếu lương nào hợp lệ để thanh toán (có thể đã được thanh toán trước đó).');
      }

      const year = new Date().getFullYear();
      const lastTx = await ExpenditureModel.findOne({ code: new RegExp(`^PC-${year}-`) }).sort({ code: -1 });

      let nextNumber = 1;
      if (lastTx && lastTx.code) {
        const parts = lastTx.code.split('-');
        nextNumber = parseInt(parts[parts.length - 1], 10) + 1;
      }

      const expendituresToInsert = [];
      const validIds = [];

      for (const p of pendingPayrolls) {
        const user = p.userId as any;
        const code = `PC-${year}-${nextNumber.toString().padStart(4, '0')}`;

        expendituresToInsert.push({
          code: code,
          expenditureType: 'SALARY',
          payrollId: p._id,
          amount: p.totalSalary,
          receiverId: user._id,
          paidBy: currentUserId,
          description: `Thanh toán lương tháng ${p.month} - Nhân viên ${user.fullName || 'Không rõ'}`,
          date: new Date(),
        });

        validIds.push(p._id);
        nextNumber++;
      }
      await ExpenditureModel.insertMany(expendituresToInsert, { session });

      const updateResult = await Payroll.updateMany(
        { _id: { $in: validIds }, status: 'PENDING' },
        { $set: { status: 'PAID' } },
      ).session(session);
      await session.commitTransaction();

      return {
        count: updateResult.modifiedCount,
        data: validIds.map((id) => id.toString()),
      };
    } catch (error) {
      console.log('=== LỖI THANH TOÁN LƯƠNG ===', error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Hàm xuất bảng lương ra Excel
  async exportPayrollToExcel(month: string): Promise<ExcelJS.Buffer> {
    const payrolls = await Payroll.find({ month }).populate('userId', 'fullName');

    if (!payrolls || payrolls.length === 0) {
      throw new Error(`Không có dữ liệu bảng lương cho tháng ${month}`);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Bảng Lương ${month}`);

    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 5 },
      { header: 'Họ và tên', key: 'fullName', width: 25 },
      { header: 'Vị trí', key: 'roleName', width: 20 },
      { header: 'Lương cơ bản', key: 'baseSalary', width: 15 },
      { header: 'Phụ cấp / Thưởng', key: 'allowance', width: 18 },
      { header: 'Khấu trừ / Phạt', key: 'deduction', width: 18 },
      { header: 'Thực lãnh', key: 'totalSalary', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    payrolls.forEach((payroll, index) => {
      const user = payroll.userId as any;

      const row = worksheet.addRow({
        stt: index + 1,
        fullName: user?.fullName || 'N/A',
        roleName: payroll.roleName,
        baseSalary: payroll.baseSalary,
        allowance: payroll.allowance,
        deduction: payroll.deduction,
        totalSalary: payroll.totalSalary,
        status: payroll.status === 'PAID' ? 'Đã thanh toán' : 'Chờ duyệt',
      });

      row.getCell('baseSalary').numFmt = '#,##0';
      row.getCell('allowance').numFmt = '#,##0';
      row.getCell('deduction').numFmt = '#,##0';
      row.getCell('totalSalary').numFmt = '#,##0';
    });

    return await workbook.xlsx.writeBuffer();
  }

  async generatePayrollForUsers(payRollIds: string[], month: string): Promise<{ success: boolean; count: number }> {
    if (!payRollIds || payRollIds.length === 0) {
      return { success: true, count: 0 };
    }

    const targetPayrolls = await Payroll.find({
      _id: { $in: payRollIds },
    });

    if (targetPayrolls.length === 0) {
      return { success: true, count: 0 };
    }

    const validUserIds = targetPayrolls.filter((p) => p.status !== PayrollStatus.PAID).map((p) => p.userId.toString());

    if (validUserIds.length === 0) {
      return { success: true, count: 0 };
    }

    const usersToProcess = await UserModel.find({
      _id: { $in: validUserIds },
      status: UserStatus.ACTIVE,
    }).populate('roleId', 'name');

    const bulkOperations = [];

    for (const user of usersToProcess) {
      const role = user.roleId as any;
      let payrollType = PayrollType.STAFF;
      let teachingHours = 0;
      let hourlyRate = 0;
      let totalSalary = user.baseSalary || 0;
      let allowance = 0;
      let deduction = 0;

      if (role?.name?.toLowerCase().includes('teacher')) {
        payrollType =
          user.teacher_info?.type === 'FULL_TIME' ? PayrollType.TEACHER_FULL_TIME : PayrollType.TEACHER_PART_TIME;
        hourlyRate = user.teacher_info?.hourlyRate || 0;
        teachingHours = (await this.calculateTeachingHours(user._id.toString(), month)) || 0;

        if (payrollType === PayrollType.TEACHER_PART_TIME) {
          totalSalary = teachingHours * hourlyRate;
        } else {
          totalSalary = (user.baseSalary || 0) + Math.max(0, teachingHours - 50) * hourlyRate;
        }
      } else if (role?.name?.toLowerCase().includes('consultant')) {
        payrollType = PayrollType.STAFF;
        const commission = await this.calculateCommissionForConsultants(user._id.toString(), month);
        allowance = commission * 0.1;
      } else {
        totalSalary = user.baseSalary || 0;
      }

      const payrollData = {
        userId: user._id,
        month: month,
        roleName: role.name,
        payrollType: payrollType,
        baseSalary: user.baseSalary || 0,
        hourlyRate: hourlyRate,
        metrics: { standardDays: 22, actualDays: 22, standardHours: 50, teachingHours: teachingHours },
        allowance: allowance,
        deduction: deduction,
        totalSalary: totalSalary,
        status: PayrollStatus.PENDING,
        bankInfo: user.bankInfo || { bankName: '', bankBin: '', accountNo: '', accountName: '' },
      };

      bulkOperations.push({
        updateOne: {
          filter: { userId: user._id, month: month },
          update: { $set: payrollData },
          upsert: true,
        },
      });
    }

    if (bulkOperations.length > 0) {
      await Payroll.bulkWrite(bulkOperations);
    }

    return { success: true, count: bulkOperations.length };
  }
}

export default new PayrollService();
