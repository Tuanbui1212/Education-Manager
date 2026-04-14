import cron from 'node-cron';
import { ClassModel } from '../models/class.model';
import { ScheduleModel } from '../models/schedule.model';
import { InvoiceModel } from '../models/invoice.model';

export class CronService {
  public init() {
    console.log('⏰ Cron Job đã được kích hoạt. Sẵn sàng quét trạng thái lớp học...');

    // Chạy ngay khi khởi động để đảm bảo trạng thái luôn được cập nhật chính xác
    this.runJobsImmediately();

    // Lên lịch chạy vào lúc 00:01 hàng ngày
    cron.schedule('1 0 * * *', async () => {
      console.log('🔄 Bắt đầu tiến trình cập nhật trạng thái lớp học tự động...');
      await this.updateClassStatuses();
      await this.updateOverdueInvoices();
    });
  }

  private async runJobsImmediately() {
    console.log('🚀 Chạy cron ngay khi start server...');
    await this.updateClassStatuses();
    await this.updateOverdueInvoices();
  }

  private async updateClassStatuses() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingClasses = await ClassModel.find({ status: 'UPCOMING' });
      for (const cls of upcomingClasses) {
        const firstSchedule = await ScheduleModel.findOne({ classId: cls._id }).sort({ date: 1 });

        if (firstSchedule) {
          const startDate = new Date(firstSchedule.date);
          startDate.setHours(0, 0, 0, 0);

          if (startDate <= today) {
            await ClassModel.findByIdAndUpdate(cls._id, { status: 'ACTIVE' });
            console.log(`✅ Lớp ${cls.name} đã khai giảng -> Chuyển thành ACTIVE`);
          }
        }
      }

      const activeClasses = await ClassModel.find({ status: 'ACTIVE' });
      for (const cls of activeClasses) {
        const lastSchedule = await ScheduleModel.findOne({ classId: cls._id }).sort({ date: -1 });

        if (lastSchedule) {
          const endDate = new Date(lastSchedule.date);
          endDate.setHours(0, 0, 0, 0);

          if (endDate < today) {
            await ClassModel.findByIdAndUpdate(cls._id, { status: 'COMPLETED' });
            console.log(`🎓 Lớp ${cls.name} đã học xong -> Chuyển thành COMPLETED`);
          }
        }
      }

      console.log('✅ Hoàn thành tiến trình cập nhật trạng thái lớp học.');
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật trạng thái lớp học tự động:', error);
    }
  }

  private async updateOverdueInvoices() {
    try {
      const today = new Date();

      const overdueUnpaid = await InvoiceModel.updateMany(
        { status: 'UNPAID', dueDate: { $lt: today } },
        { $set: { status: 'OVERDUE' } },
      );

      const overduePartial = await InvoiceModel.updateMany(
        { status: 'PARTIAL', 'installmentConfig.nextDueDate': { $lt: today } },
        { $set: { status: 'OVERDUE' } },
      );

      console.log(
        `✅ Cập nhật quá hạn: ${overdueUnpaid.modifiedCount} UNPAID, ${overduePartial.modifiedCount} PARTIAL → OVERDUE`,
      );
    } catch (error) {
      console.error('❌ Lỗi cập nhật invoice quá hạn:', error);
    }
  }
}
