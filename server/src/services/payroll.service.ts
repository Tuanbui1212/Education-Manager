import Payroll from '../models/payroll.model';
import ExcelJS from 'exceljs';
import { IPayroll, PayrollType, PayrollStatus } from '../types/payroll.type';
import { UserStatus } from '../types/user.type';
import { UserModel } from '../models/user.model';
import { ScheduleModel } from '../models/schedule.model';
import { EmailService } from './email.service';
import RoleModel from '../models/role.model';

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

  async updatePayroll(id: string, data: Partial<IPayroll>): Promise<IPayroll | null> {
    const { allowance, deduction } = data;

    const existingPayroll = await Payroll.findById(id);
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

    return await Payroll.findByIdAndUpdate(id, data, { new: true });
  }

  async deletePayroll(id: string): Promise<IPayroll | null> {
    return await Payroll.findByIdAndDelete(id);
  }

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

  async generatePayrollForMonth(month: string): Promise<{ success: boolean; count: number; data: any[] }> {
    const studentId = await RoleModel.findOne({ name: 'Student' }).select('_id');

    const activeUsers = await UserModel.find({
      status: UserStatus.ACTIVE,
      roleId: { $ne: studentId },
    }).populate('roleId', 'name');

    if (!activeUsers || activeUsers.length === 0) {
      throw new Error('Không có nhân sự nào đang hoạt động để tính lương.');
    }

    const bulkOperations = [];

    for (const user of activeUsers) {
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
  async markPayrollAsPaid(payrollIds: string[]): Promise<{ count: number; data: string[] }> {
    const pendingPayrolls = await Payroll.find({
      _id: { $in: payrollIds },
      status: 'PENDING',
    });

    if (pendingPayrolls.length === 0) {
      throw new Error('Không tìm thấy phiếu lương nào hợp lệ để thanh toán (có thể đã được thanh toán trước đó).');
    }

    const validIds = pendingPayrolls.map((p) => p._id);

    const updateResult = await Payroll.updateMany(
      { _id: { $in: validIds }, status: 'PENDING' },
      { $set: { status: 'PAID' } },
    );

    return {
      count: updateResult.modifiedCount,
      data: validIds.map((id) => id.toString()),
    };
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
}

export default new PayrollService();
