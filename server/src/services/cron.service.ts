import cron from 'node-cron';
import { ClassModel } from '../models/class.model';
import { ScheduleModel } from '../models/schedule.model';

export class CronService {
  public init() {
    console.log('⏰ Cron Job đã được kích hoạt. Sẵn sàng quét trạng thái lớp học...');

    // Cấu hình chạy vào đúng 00:01 sáng mỗi ngày ('1 0 * * *')
    // Nếu bạn muốn test ngay bây giờ, hãy đổi thành '* * * * *' (Chạy mỗi phút)
    cron.schedule('1 0 * * *', async () => {
      console.log('🔄 Bắt đầu tiến trình cập nhật trạng thái lớp học tự động...');
      await this.updateClassStatuses();
    });
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
}
