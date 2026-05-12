import { ClassModel } from '../models/class.model';
import { ScheduleModel } from '../models/schedule.model';
import { CreateScheduleType, UpdateScheduleType } from '../validations/schedule.validation';
import { ShiftModel } from '../models/shift.model';
import { RoomModel } from '../models/room.model';
import { UserModel } from '../models/user.model';
import { GetSchedulesQuery, IGAClassInput, IGAGene, IGAChromosome } from '../types/schedule.type';
import { Types } from 'mongoose';
import mongoose from 'mongoose';

export class ScheduleService {
  async createSchedule(schedule: CreateScheduleType) {
    const roomConflict = await ScheduleModel.findOne({
      date: schedule.date,
      shiftId: schedule.shiftId,
      roomId: schedule.roomId,
    });
    if (roomConflict) {
      throw new Error(`Phòng học này đã có lớp ${roomConflict.classId} đăng ký trong khung giờ này`);
    }

    if (schedule.teacherId) {
      const teacherConflict = await ScheduleModel.findOne({
        date: schedule.date,
        shiftId: schedule.shiftId,
        teacherId: schedule.teacherId,
      });
      if (teacherConflict) {
        throw new Error('Giáo viên này đã có lịch dạy lớp khác trong khung giờ này');
      }
    }

    const classConflict = await ScheduleModel.findOne({
      date: schedule.date,
      shiftId: schedule.shiftId,
      classId: schedule.classId,
    });
    if (classConflict) {
      throw new Error('Lớp học này đã có lịch học trong khung giờ này rồi');
    }

    const existingSchedule = await ScheduleModel.findOne({
      classId: schedule.classId,
      shiftId: schedule.shiftId,
      roomId: schedule.roomId,
      date: schedule.date,
    });
    if (existingSchedule) {
      throw new Error('Lịch học đã tồn tại');
    }

    if (schedule.teacherId) {
      const existingUser = await UserModel.findById(schedule.teacherId);
      if (!existingUser) {
        throw new Error('Người dùng không tồn tại');
      }
      if (existingUser.status !== 'ACTIVE') {
        throw new Error('Giáo viên này hiện đang ngừng hoạt động, không thể gán lịch');
      }
    }

    const [existingClass, existingShift, existingRoom] = await Promise.all([
      ClassModel.findById(schedule.classId),
      ShiftModel.findById(schedule.shiftId),
      RoomModel.findById(schedule.roomId),
    ]);

    if (!existingClass) throw new Error('Lớp học không tồn tại');
    if (!existingShift) throw new Error('Ca học không tồn tại');
    if (!existingRoom) throw new Error('Phòng học không tồn tại');

    return await ScheduleModel.create(schedule);
  }

  async getAllSchedules(query: GetSchedulesQuery) {
    const { page = 1, limit = 10, classId, roomId, teacherId, date } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (classId) filter.classId = new Types.ObjectId(classId);
    if (roomId) filter.roomId = new Types.ObjectId(roomId);
    if (teacherId) filter.teacherId = new Types.ObjectId(teacherId);
    if (date) {
      const [day, month, year] = date.split('/');
      const formattedDate = `${month}/${day}/${year}`;
      filter.date = new Date(formattedDate);
    }
    const [total, schedules] = await Promise.all([
      ScheduleModel.countDocuments(filter),
      ScheduleModel.find(filter)
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .populate('classId', 'name')
        .populate('shiftId', 'name')
        .populate('roomId', 'name')
        .populate('teacherId', 'fullName')
        .populate('attendances', 'fullName'),
    ]);
    return { schedules, total };
  }

  async getScheduleById(id: string) {
    return await ScheduleModel.findById(id)
      .populate('classId', 'name')
      .populate('shiftId', 'name')
      .populate('roomId', 'name')
      .populate('teacherId', 'fullName')
      .populate('attendances', 'fullName');
  }

  async updateSchedule(id: string, schedule: UpdateScheduleType) {
    const existingSchedule = await ScheduleModel.findById(id);
    if (!existingSchedule) {
      throw new Error('Lịch học không tồn tại');
    }
    if (schedule.classId) {
      const existingClass = await ClassModel.findById(schedule.classId);
      if (!existingClass) {
        throw new Error('Lớp học không tồn tại');
      }
    }
    if (schedule.shiftId) {
      const existingShift = await ShiftModel.findById(schedule.shiftId);
      if (!existingShift) {
        throw new Error('Ca học không tồn tại');
      }
    }
    if (schedule.roomId) {
      const existingRoom = await RoomModel.findById(schedule.roomId);
      if (!existingRoom) {
        throw new Error('Phòng học không tồn tại');
      }
    }
    if (schedule.teacherId) {
      const existingUser = await UserModel.findById(schedule.teacherId);
      if (!existingUser) {
        throw new Error('Người dùng không tồn tại');
      }
    }
    return await ScheduleModel.findByIdAndUpdate(id, schedule, { new: true })
      .populate('classId', 'name')
      .populate('shiftId', 'name')
      .populate('roomId', 'name')
      .populate('teacherId', 'fullName')
      .populate('attendances', 'fullName');
  }

  async deleteSchedule(id: string) {
    return await ScheduleModel.findByIdAndDelete(id);
  }

  async createSchedulesBulk(schedules: CreateScheduleType[], startClass: string) {
    if (!Array.isArray(schedules)) {
      throw new Error('Dữ liệu đầu vào không phải là một danh sách hợp lệ');
    }

    // 1. Khởi tạo session cho Transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstSchedule = schedules[0];
    const lastSchedule = schedules[schedules.length - 1];

    try {
      if (firstSchedule && firstSchedule.classId) {
        const startDate = new Date(firstSchedule.date);
        startDate.setHours(0, 0, 0, 0);

        if (startDate <= today) {
          await ClassModel.findByIdAndUpdate(
            firstSchedule.classId,
            { status: 'ACTIVE', startDate: startClass },
            { session },
          );
        } else if (startDate > today) {
          await ClassModel.findByIdAndUpdate(
            firstSchedule.classId,
            { status: 'UPCOMING', startDate: startClass },
            { session },
          );
        }
      }

      if (lastSchedule && lastSchedule.classId) {
        const endDate = new Date(lastSchedule.date);
        endDate.setHours(23, 59, 59, 999);

        if (endDate <= today) {
          await ClassModel.findByIdAndUpdate(lastSchedule.classId, { status: 'COMPLETED' }, { session });
        }
      }

      const createdSchedules = [];

      for (const schedule of schedules) {
        // 2. Kiểm tra xung đột
        const roomConflict = await ScheduleModel.findOne({
          date: schedule.date,
          shiftId: schedule.shiftId,
          roomId: schedule.roomId,
        }).session(session);

        if (roomConflict) {
          throw new Error(`Ngày ${schedule.date}: Phòng này đã được sử dụng.`);
        }

        if (schedule.teacherId) {
          const teacherConflict = await ScheduleModel.findOne({
            date: schedule.date,
            shiftId: schedule.shiftId,
            teacherId: schedule.teacherId,
          }).session(session);

          if (teacherConflict) {
            throw new Error(`Ngày ${schedule.date}: Giáo viên đã có lịch dạy.`);
          }
        }

        // 3. Tạo bản ghi tạm trong session
        const [newSchedule] = await ScheduleModel.create([schedule], { session });
        createdSchedules.push(newSchedule);
      }

      // 4. Nếu mọi thứ ổn -> Chốt dữ liệu
      await session.commitTransaction();
      return createdSchedules;
    } catch (error) {
      // 5. Nếu có bất kỳ lỗi nào -> Hủy bỏ toàn bộ những gì đã làm ở bước 3
      await session.abortTransaction();
      throw error;
    } finally {
      // 6. Đóng phiên
      session.endSession();
    }
  }

  async deleteSchedulesBulk(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new Error('Danh sách ID không hợp lệ');
    }

    const scheduleData = await ScheduleModel.findById(ids[0]);
    if (!scheduleData) {
      throw new Error('Không tìm thấy dữ liệu lịch học để xóa');
    }

    const classId = scheduleData.classId;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await ScheduleModel.deleteMany({ _id: { $in: ids } }, { session });

      await ClassModel.findByIdAndUpdate(classId, { status: 'PENDING' }, { session });

      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getStartDateClass(classData: any) {
    const startDate = await ScheduleModel.find({ classId: classData._id }).sort({ date: 1 }).limit(1);
    return startDate;
  }

  async getTodaySchedules() {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const query: any = {
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };

    // const schedules = await ScheduleModel.find(query)
    //   .populate('classId', 'name studentIds')
    //   .populate('teacherId', 'fullName')
    //   .populate('roomId', 'name')
    //   .populate('shiftId', 'name startTime endTime')
    //   .sort({ 'shiftId.startTime': 1 })
    //   .lean();

    const schedules = await ScheduleModel.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'classes',
          localField: 'classId',
          foreignField: '_id',
          as: 'classInfo',
        },
      },
      { $unwind: '$classInfo' },
      { $match: { 'classInfo.status': 'ACTIVE' } },
      {
        $lookup: {
          from: 'users',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'teacherInfo',
        },
      },
      { $unwind: '$teacherInfo' },
      {
        $lookup: {
          from: 'rooms',
          localField: 'roomId',
          foreignField: '_id',
          as: 'roomInfo',
        },
      },
      { $unwind: '$roomInfo' },
      {
        $lookup: {
          from: 'shifts',
          localField: 'shiftId',
          foreignField: '_id',
          as: 'shiftInfo',
        },
      },
      { $unwind: '$shiftInfo' },
      {
        $sort: {
          'shiftInfo.startTime': 1,
        },
      },
      {
        $project: {
          _id: 1,
          date: 1,

          classId: {
            _id: '$classInfo._id',
            name: '$classInfo.name',
            studentCount: { $size: '$classInfo.studentIds' },
          },

          teacherId: {
            _id: '$teacherInfo._id',
            fullName: '$teacherInfo.fullName',
          },

          roomId: {
            _id: '$roomInfo._id',
            name: '$roomInfo.name',
          },

          shiftId: {
            _id: '$shiftInfo._id',
            name: '$shiftInfo.name',
            startTime: '$shiftInfo.startTime',
            endTime: '$shiftInfo.endTime',
          },
        },
      },
    ]);

    return schedules;
  }

  // ============================================================================
  // TÍCH HỢP THUẬT TOÁN DI TRUYỀN (GENETIC ALGORITHM - GA)
  // ============================================================================

  /**
   * Hàm chính để Frontend gọi API.
   * Bước 1: Nhận tham số
   * Bước 2: Chạy thuật toán tìm Tuần Mẫu (Weekly Template)
   * Bước 3: Nhân bản tuần mẫu theo Date thực tế
   */
  async autoGenerateSchedule(classesInput: IGAClassInput[]) {
    if (!classesInput || classesInput.length === 0) {
      throw new Error('Danh sách lớp trống!');
    }

    // 1. Fetch dữ liệu môi trường từ Database
    const classIds = classesInput.map((c) => c.classId);

    const [dbClasses, dbRooms, dbShifts] = await Promise.all([
      ClassModel.find({ _id: { $in: classIds } }).lean(),
      RoomModel.find({}).lean(),
      ShiftModel.find({}).sort({ startTime: 1 }).lean(), // Sắp xếp Ca theo giờ để phân biệt Sáng/Chiều/Tối
    ]);

    if (dbRooms.length === 0 || dbShifts.length === 0) {
      throw new Error('Chưa có dữ liệu Phòng học hoặc Ca học trong hệ thống!');
    }

    // Map dữ liệu đầu vào với DB
    const processedClasses = classesInput.map((input) => {
      const dbClass = dbClasses.find((c) => c._id.toString() === input.classId);
      if (!dbClass) throw new Error(`Không tìm thấy lớp ${input.classId}`);
      return {
        ...input,
        teacherId: dbClass.teacherId.toString(),
        lessonsPerWeek: dbClass.lessonsPerWeek || 2, // Mặc định 2 buổi/tuần nếu thiếu
        totalLessons: dbClass.totalLessons || 24,
        startDate: dbClass.startDate || new Date(),
      };
    });

    // 2. Chạy thuật toán GA tìm Lịch Tuần (Weekly Pattern) tốt nhất
    const bestWeeklyTemplate = this.runGeneticAlgorithm(processedClasses, dbRooms, dbShifts);

    // 3. Nhân bản Tuần mẫu thành Lịch theo ngày cụ thể (Real Dates)
    const finalRealSchedules = this.expandTemplateToRealDates(bestWeeklyTemplate, processedClasses);

    // Xử lý output chuẩn format trả về cho Frontend (giống IBackendResult)
    return {
      finalSchedule: finalRealSchedules,
      classResults: this.formatClassResults(bestWeeklyTemplate, processedClasses, dbRooms, dbShifts),
      totalScore: bestWeeklyTemplate.fitness,
    };
  }

  /**
   * Engine Thuật toán Di truyền (GA)
   */
  private runGeneticAlgorithm(classes: any[], rooms: any[], shifts: any[]): IGAChromosome {
    const POPULATION_SIZE = 100;
    const MAX_GENERATIONS = 300;
    const MUTATION_RATE = 0.1;

    // A. Khởi tạo quần thể ban đầu
    let population: IGAChromosome[] = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
      const genes: IGAGene[] = [];
      for (const cls of classes) {
        for (let l = 0; l < cls.lessonsPerWeek; l++) {
          genes.push({
            classId: cls.classId,
            teacherId: cls.teacherId,
            // Random Thứ 2 đến Thứ 7 (1 đến 6)
            dayOfWeek: Math.floor(Math.random() * 6) + 1,
            shiftId: shifts[Math.floor(Math.random() * shifts.length)]._id.toString(),
            roomId: rooms[Math.floor(Math.random() * rooms.length)]._id.toString(),
          });
        }
      }
      population.push({ genes, fitness: 0, conflicts: 0 });
    }

    // B. Vòng lặp tiến hoá
    for (let gen = 0; gen < MAX_GENERATIONS; gen++) {
      // 1. Tính độ thích nghi (Fitness)
      population.forEach((chromosome) => this.calculateFitness(chromosome, classes, shifts));

      // Sắp xếp giảm dần theo điểm Fitness
      population.sort((a, b) => b.fitness - a.fitness);

      // Nếu tìm được lịch hoàn hảo (0 xung đột), có thể dừng sớm để tối ưu tốc độ
      if (population[0].conflicts === 0 && population[0].fitness > 5000) {
        break;
      }

      // 2. Chọn lọc (Lai ghép)
      const newPopulation: IGAChromosome[] = [];
      // Giữ lại 10% cá thể tinh anh
      const eliteCount = Math.floor(POPULATION_SIZE * 0.1);
      for (let i = 0; i < eliteCount; i++) newPopulation.push(population[i]);

      while (newPopulation.length < POPULATION_SIZE) {
        // Chọn ngẫu nhiên 2 cá thể (ưu tiên cá thể điểm cao)
        const parent1 = population[Math.floor(Math.random() * (POPULATION_SIZE / 2))];
        const parent2 = population[Math.floor(Math.random() * (POPULATION_SIZE / 2))];

        // Lai ghép (Crossover)
        let childGenes: IGAGene[] = [];
        for (const cls of classes) {
          const inheritFromParent1 = Math.random() > 0.5;
          const sourceGenes = (inheritFromParent1 ? parent1 : parent2).genes.filter((g) => g.classId === cls.classId);
          childGenes.push(...sourceGenes);
        }

        // Đột biến (Mutation)
        if (Math.random() < MUTATION_RATE) {
          const mutateIdx = Math.floor(Math.random() * childGenes.length);
          const mutationType = Math.floor(Math.random() * 3);
          if (mutationType === 0) childGenes[mutateIdx].dayOfWeek = Math.floor(Math.random() * 6) + 1;
          else if (mutationType === 1)
            childGenes[mutateIdx].shiftId = shifts[Math.floor(Math.random() * shifts.length)]._id.toString();
          else childGenes[mutateIdx].roomId = rooms[Math.floor(Math.random() * rooms.length)]._id.toString();
        }

        newPopulation.push({ genes: childGenes, fitness: 0, conflicts: 0 });
      }
      population = newPopulation;
    }

    // Đánh giá lại lần cuối và trả về cá thể tốt nhất
    population.forEach((chromosome) => this.calculateFitness(chromosome, classes, shifts));
    population.sort((a, b) => b.fitness - a.fitness);

    return population[0];
  }

  /**
   * Tính điểm Fitness (Rất quan trọng - quyết định lịch tốt hay xấu)
   */
  private calculateFitness(chromosome: IGAChromosome, classes: any[], shifts: any[]) {
    let score = 10000; // Điểm gốc
    let conflicts = 0;

    const roomTimeMap = new Set<string>();
    const teacherTimeMap = new Set<string>();
    const classTimeMap = new Set<string>();

    for (const gene of chromosome.genes) {
      const timeKey = `${gene.dayOfWeek}-${gene.shiftId}`;
      const roomKey = `${timeKey}-${gene.roomId}`;
      const teacherKey = `${timeKey}-${gene.teacherId}`;
      const classKey = `${timeKey}-${gene.classId}`;

      // Yêu cầu 4 & 5: Ràng buộc Cứng (Hard Constraints)
      // 1 ngày, 1 ca không được trùng Phòng
      if (roomTimeMap.has(roomKey)) {
        conflicts++;
        score -= 2000;
      } else roomTimeMap.add(roomKey);

      // 1 ngày, 1 ca Giáo viên không được dạy 2 lớp
      if (teacherTimeMap.has(teacherKey)) {
        conflicts++;
        score -= 2000;
      } else teacherTimeMap.add(teacherKey);

      // 1 lớp không thể học 2 phòng cùng lúc
      if (classTimeMap.has(classKey)) {
        conflicts++;
        score -= 2000;
      } else classTimeMap.add(classKey);
    }

    // Yêu cầu 3: Ràng buộc Mềm (Optional Requirements)
    for (const cls of classes) {
      const clsGenes = chromosome.genes.filter((g) => g.classId === cls.classId);
      const reqs = cls.optionalRequirements || [];

      // Sắp xếp ngày học để check dãn cách
      const days = clsGenes.map((g) => g.dayOfWeek).sort((a, b) => a - b);

      clsGenes.forEach((gene) => {
        // Tìm index của ca học (để xác định Sáng/Chiều/Tối)
        const shiftIndex = shifts.findIndex((s) => s._id.toString() === gene.shiftId);

        if (reqs.includes('morning') && shiftIndex <= 2) score += 100;
        else if (reqs.includes('morning') && shiftIndex > 2) score -= 50;

        if (reqs.includes('evening') && shiftIndex >= 4) score += 100;

        // Ngày cụ thể (day.1 là thứ 3, day.0 là thứ 2 trong quy ước của FE)
        // Trong hệ thống Date JS: 1 là Thứ 2, 2 là Thứ 3...
        // Để mapping khớp: day.X của FE (0-5) => Day JS (1-6)
        if (reqs.includes(`day.${gene.dayOfWeek - 1}`)) score += 150;
        if (reqs.includes(`noDay.${gene.dayOfWeek - 1}`)) score -= 300;
      });

      // Check không học cùng 1 ngày
      if (reqs.includes('noSameDay')) {
        const uniqueDays = new Set(days);
        if (uniqueDays.size < days.length) score -= 500;
      }

      // Check không học ngày liên tiếp
      if (reqs.includes('noConsec')) {
        let hasConsecutive = false;
        for (let i = 0; i < days.length - 1; i++) {
          if (days[i + 1] - days[i] === 1) hasConsecutive = true;
        }
        if (hasConsecutive) score -= 400;
        else score += 200;
      }
    }

    if (conflicts === 0) score += 5000; // Thưởng cực lớn nếu không có lỗi trùng lặp

    chromosome.conflicts = conflicts;
    chromosome.fitness = Math.max(0, score);
  }

  /**
   * Nhân bản Tuần Mẫu (Weekly Template) ra số buổi thực tế (Total Lessons)
   */
  private expandTemplateToRealDates(chromosome: IGAChromosome, classes: any[]) {
    const finalSchedules: any[] = [];

    for (const cls of classes) {
      // Lấy lịch của lớp này trong 1 tuần (đã được sort theo ngày)
      const weeklyPattern = chromosome.genes
        .filter((g) => g.classId === cls.classId)
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

      if (weeklyPattern.length === 0) continue;

      let scheduledCount = 0;
      let currentDate = new Date(cls.startDate);
      currentDate.setHours(0, 0, 0, 0); // Reset giờ

      // Duyệt từng ngày cho đến khi đạt đủ totalLessons
      // Giới hạn vòng lặp chống loop vô hạn (VD max 2 năm)
      let safetyCounter = 0;

      while (scheduledCount < cls.totalLessons && safetyCounter < 730) {
        const currentDayOfWeek = currentDate.getDay(); // 0: CN, 1: T2, ..., 6: T7

        // Kiểm tra xem ngày hiện tại có nằm trong Tuần Mẫu không
        const patternMatches = weeklyPattern.filter((p) => p.dayOfWeek === currentDayOfWeek);

        for (const pattern of patternMatches) {
          if (scheduledCount >= cls.totalLessons) break;

          finalSchedules.push({
            classId: cls.classId,
            teacherId: cls.teacherId,
            date: new Date(currentDate), // Clone date object
            shiftId: pattern.shiftId,
            roomId: pattern.roomId,
            // Format thêm để trả về cho Frontend dễ đọc
            day: pattern.dayOfWeek - 1, // Để đồng bộ mapping với FE (T2=0, T3=1)
            slot: 0, // Placeholder, FE sẽ map lại
          });

          scheduledCount++;
        }

        // Tăng thêm 1 ngày
        currentDate.setDate(currentDate.getDate() + 1);
        safetyCounter++;
      }
    }

    return finalSchedules;
  }

  /**
   * Helper function định dạng lại Kết quả gửi cho Frontend UI
   */
  private formatClassResults(chromosome: IGAChromosome, classes: any[], rooms: any[], shifts: any[]) {
    return classes.map((cls, idx) => {
      const clsGenes = chromosome.genes.filter((g) => g.classId === cls.classId);

      const sessions = clsGenes.map((g) => ({
        day: g.dayOfWeek - 1, // Map lại ngày cho FE
        slot: shifts.findIndex((s) => s._id.toString() === g.shiftId),
        roomId: g.roomId,
        roomName: rooms.find((r) => r._id.toString() === g.roomId)?.name || 'Unknown',
      }));

      return {
        cls: {
          _id: cls.classId,
          name: `Lớp ${cls.classId.substring(0, 4)}`, // FE dùng name thật nếu truyền đủ data
        },
        sessions: sessions,
        days: sessions.map((s) => s.day),
        totalScore: clsGenes.length > 0 ? (chromosome.conflicts === 0 ? 100 : 50) : 0,
        colorIdx: idx,
      };
    });
  }
}
