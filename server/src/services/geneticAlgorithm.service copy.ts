import { ClassRequestModel } from '../models/classRequest.model';
import { RoomModel } from '../models/room.model';
import { ShiftModel } from '../models/shift.model';
import { ScheduleModel } from '../models/schedule.model';

// ─────────────────────────────────────────────
// HELPER: Phân loại ca theo startTime
// morning   : HH < 12
// afternoon : 12 ≤ HH < 18
// evening   : HH ≥ 18
// ─────────────────────────────────────────────
function getShiftSession(startTime: string): 'morning' | 'afternoon' | 'evening' {
  const hour = parseInt(startTime.split(':')[0], 10);
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

// ─────────────────────────────────────────────
// HELPER: Ngày đầu tuần (Thứ 2 = 1, Thứ 3 = 2 … Thứ 6 = 5)
// preferEarlyWeek thưởng nếu day ∈ {1, 2, 3}
// ─────────────────────────────────────────────
function isEarlyWeek(day: number): boolean {
  return day >= 1 && day <= 3;
}

// HELPER: Tính toán mảng các ngày học thực tế
function generateClassDates(
  startDateStr: string | number | Date,
  totalLessons: number,
  lessonsPerWeek: number,
  day: number,
): string[] {
  const dates: string[] = [];
  const currentDate = new Date(startDateStr);
  const jsDay = day === 7 ? 0 : day;
  while (currentDate.getDay() !== jsDay) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const totalWeeks = Math.ceil(totalLessons / lessonsPerWeek);

  for (let i = 0; i < totalWeeks; i++) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const date = String(currentDate.getDate()).padStart(2, '0');

    dates.push(`${year}-${month}-${date}`);

    currentDate.setDate(currentDate.getDate() + 7);
  }

  return dates;
}

export class GeneticAlgorithmService {
  async saveResults(enrichedChromosome: any[]) {
    const scheduleMap = new Map<string, { day: number; shiftId: any; roomId: any; slotScore: number }[]>();

    for (const gene of enrichedChromosome) {
      const id = gene.classRequestId.toString();
      if (!scheduleMap.has(id)) scheduleMap.set(id, []);
      scheduleMap.get(id)!.push({
        day: gene.day,
        shiftId: gene.shiftId,
        roomId: gene.roomId,
        slotScore: gene.slotScore,
      });
    }

    const bulkOps = [...scheduleMap.entries()].map(([classRequestId, schedule]) => ({
      updateOne: {
        filter: { _id: classRequestId },
        update: { $set: { schedule } },
      },
    }));

    if (bulkOps.length === 0) return;

    const result = await ClassRequestModel.bulkWrite(bulkOps, {
      ordered: false,
    });
    console.log(`[GA] Saved schedules: ${result.modifiedCount}/${bulkOps.length} ClassRequests updated`);
    return result;
  }

  // ═══════════════════════════════════════════
  // BƯỚC 1: Chuẩn bị dữ liệu
  // ═══════════════════════════════════════════
  async prepareData(creatorId: string) {
    const [requests, rooms, shifts, schedules] = await Promise.all([
      ClassRequestModel.find({ creatorId }),
      RoomModel.find({ status: 'ACTIVE' }),
      ShiftModel.find({ status: 'ACTIVE' }),
      ScheduleModel.find(),
    ]);

    // Bản đồ bận từ lịch thật
    const busySlots = new Set<string>();
    schedules.forEach((s) => {
      const d = new Date(s.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');

      const dateString = `${year}-${month}-${date}`;
      busySlots.add(`ROOM_${s.roomId}_DAY_${dateString}_SHIFT_${s.shiftId}`);
      busySlots.add(`TEACHER_${s.teacherId}_DAY_${dateString}_SHIFT_${s.shiftId}`);
    });

    // Enrich requests + đánh index thứ tự (dùng để resolve tên sau)
    const enrichedRequests = requests.map((req, idx) => {
      const startDt = req.startDate ? new Date(req.startDate) : new Date();
      const jsDay = startDt.getDay();
      return {
        ...req.toObject(),
        classIdx: idx,
        startDayOfWeek: jsDay === 0 ? 1 : jsDay,
        absoluteStartTimestamp: startDt.getTime(),
      };
    });

    // Gắn thêm session type vào từng shift để không tính lại nhiều lần
    const enrichedShifts = shifts.map((s) => ({
      ...s.toObject(),
      sessionType: getShiftSession(s.startTime),
    }));

    return { enrichedRequests, rooms, shifts: enrichedShifts, busySlots };
  }

  // ═══════════════════════════════════════════
  // BƯỚC 2: Sinh chromosome ngẫu nhiên
  // Ràng buộc cứng ngay từ đầu:
  //   • day >= startDayOfWeek
  //   • Nếu có noDay.X → loại ngay khỏi pool ngẫu nhiên
  //   • Nếu có morning/afternoon/evening → chỉ lấy ca đúng loại
  // ═══════════════════════════════════════════
  generateRandomChromosome(data: any) {
    const chromosome: any[] = [];
    const { enrichedRequests, rooms, shifts } = data;

    enrichedRequests.forEach((req: any) => {
      const reqs: string[] = req.optionalRequirements || [];

      // Pool ngày hợp lệ (loại bỏ noDay ngay từ đầu)
      let possibleDays = [1, 2, 3, 4, 5, 6].filter((d) => d >= req.startDayOfWeek);
      const blockedDays = reqs.filter((r) => r.startsWith('noDay.')).map((r) => parseInt(r.split('.')[1], 10));
      possibleDays = possibleDays.filter((d) => !blockedDays.includes(d));
      if (possibleDays.length === 0) possibleDays = [1, 2, 3, 4, 5, 6].filter((d) => d >= req.startDayOfWeek);

      // Pool ca hợp lệ (lọc theo morning/afternoon/evening nếu có)
      const sessionPrefs = ['morning', 'afternoon', 'evening'].filter((s) => reqs.includes(s));
      let possibleShifts = shifts;
      if (sessionPrefs.length > 0) {
        const filtered = shifts.filter((s: any) => sessionPrefs.includes(s.sessionType));
        if (filtered.length > 0) possibleShifts = filtered;
      }

      for (let i = 0; i < req.lessonsPerWeek; i++) {
        const day = possibleDays[Math.floor(Math.random() * possibleDays.length)];
        const shift = possibleShifts[Math.floor(Math.random() * possibleShifts.length)];
        const room = rooms[Math.floor(Math.random() * rooms.length)];

        chromosome.push({
          classRequestId: req._id,
          classIdx: req.classIdx,
          teacherId: req.teacherId,
          maxNumberOfStudents: req.maxNumberOfStudents,
          startDate: req.startDate,
          totalLessons: req.totalLessons,
          lessonsPerWeek: req.lessonsPerWeek,
          day,
          shiftId: shift._id,
          roomId: room._id,
          roomCapacity: room.capacity,
        });
      }
    });

    return chromosome;
  }

  // ═══════════════════════════════════════════
  // BƯỚC 3: Hàm tính điểm Fitness
  //
  // PHẠT (ràng buộc cứng):
  //   -2000  trùng phòng/GV với lịch thật
  //   -2000  trùng phòng/GV nội bộ
  //   -800   phòng không đủ sức chứa
  //   -1500  dạy ngày bị chặn (noDay.X)
  //   -1000  hai buổi của cùng lớp cùng ngày (nếu có noSameDay)
  //   -1000  hai buổi của cùng lớp liên tiếp (nếu có noConsec)
  //
  // THƯỞNG (ràng buộc mềm):
  //   +300   đúng ca sáng/chiều/tối (morning/afternoon/evening)
  //   +300   đúng ngày ưu tiên (day.X)
  //   +200   ngày đầu tuần (preferEarlyWeek)
  //   +200   chọn phòng hợp lý tránh chọn phòng quá to
  // ═══════════════════════════════════════════
  calculateFitness(chromosome: any[], data: any) {
    let fitness = 0;
    const { busySlots, enrichedRequests, shifts } = data;

    // Map shiftId → shift object để tra nhanh
    const shiftMap = new Map<string, any>();
    shifts.forEach((s: any) => shiftMap.set(s._id.toString(), s));

    // Map classRequestId → optionalRequirements
    const reqMap = new Map<string, string[]>();
    enrichedRequests.forEach((r: any) => {
      reqMap.set(r._id.toString(), r.optionalRequirements || []);
    });

    // Theo dõi xung đột nội bộ
    const usedRooms = new Set<string>();
    const usedTeachers = new Set<string>();

    // Gom các buổi theo lớp để kiểm tra noSameDay / noConsec
    const classDayMap = new Map<string, number[]>();

    chromosome.forEach((gene) => {
      const { teacherId, day, shiftId, roomId, maxNumberOfStudents, roomCapacity, classRequestId } = gene;
      const rid = classRequestId.toString();
      const sid = shiftId.toString();

      const days = generateClassDates(gene.startDate, gene.totalLessons, gene.lessonsPerWeek, day);

      days.forEach((date) => {
        const timeKey = `DAY_${date}_SHIFT_${sid}`;
        const roomKey = `ROOM_${roomId}_${timeKey}`;
        const teacherKey = `TEACHER_${teacherId}_${timeKey}`;

        // 1. Xung đột với lịch thật
        if (busySlots.has(roomKey)) fitness -= 5000;
        if (busySlots.has(teacherKey)) fitness -= 5000;

        // 2. Xung đột nội bộ
        if (usedRooms.has(roomKey)) fitness -= 5000;
        else usedRooms.add(roomKey);

        if (usedTeachers.has(teacherKey)) fitness -= 5000;
        else usedTeachers.add(teacherKey);
      });

      // 3. Sức chứa phòng
      if (maxNumberOfStudents > roomCapacity) fitness -= 3000;
      if (roomCapacity >= maxNumberOfStudents && roomCapacity - maxNumberOfStudents <= 10) fitness += 200;

      // Gom ngày của lớp này
      if (!classDayMap.has(rid)) classDayMap.set(rid, []);
      classDayMap.get(rid)!.push(day);

      // ── RÀNG BUỘC MỀM (optionalRequirements) ────────
      const reqs = reqMap.get(rid) || [];
      const shift = shiftMap.get(sid);

      if (reqs.length === 0 || !shift) return;

      // (a) noDay.X — phạt nếu vẫn chọn ngày bị chặn
      if (reqs.includes(`noDay.${day}`)) fitness -= 4000;

      // (b) Ưu tiên ngày cụ thể day.X
      if (reqs.includes(`day.${day}`)) fitness += 300;

      // (c) Ca sáng / chiều / tối
      const sessionType: string = shift.sessionType; // 'morning' | 'afternoon' | 'evening'
      if (reqs.includes(sessionType)) fitness += 300;

      // (d) Ưu tiên đầu tuần
      if (reqs.includes('preferEarlyWeek') && isEarlyWeek(day)) fitness += 200;
    });

    // ── Kiểm tra noSameDay & noConsec sau khi gom xong ──
    classDayMap.forEach((days, rid) => {
      const reqs = reqMap.get(rid) || [];

      // noSameDay: không muốn 2 buổi cùng ngày
      if (reqs.includes('noSameDay')) {
        const unique = new Set(days);
        const dupes = days.length - unique.size;
        fitness -= dupes * 3000;
      }

      // noConsec: không muốn 2 buổi ở 2 ngày liền kề nhau
      if (reqs.includes('noConsec')) {
        const sorted = [...days].sort((a, b) => a - b);
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i] - sorted[i - 1] === 1) fitness -= 2000;
        }
      }
    });

    return fitness;
  }

  // ═══════════════════════════════════════════
  // BƯỚC 4: Crossover (lai ghép tại điểm ngẫu nhiên)
  // ═══════════════════════════════════════════
  private crossover(parent1: any[], parent2: any[]) {
    const midpoint = Math.floor(Math.random() * parent1.length);
    return [...parent1.slice(0, midpoint), ...parent2.slice(midpoint)];
  }

  // ═══════════════════════════════════════════
  // BƯỚC 5: Mutation (đột biến)
  // Tôn trọng optionalRequirements khi chọn ngẫu nhiên lại
  // ═══════════════════════════════════════════
  private mutate(chromosome: any[], data: any) {
    const mutationRate = 0.08; // tăng lên 8% để đa dạng hơn
    return chromosome.map((gene) => {
      if (Math.random() >= mutationRate) return gene;

      const currentReq = data.enrichedRequests.find((r: any) => r._id.toString() === gene.classRequestId.toString());
      const reqs: string[] = currentReq?.optionalRequirements || [];
      const startDay = currentReq ? currentReq.startDayOfWeek : 0;

      // Pool ngày (loại bỏ noDay)
      const blockedDays = reqs.filter((r) => r.startsWith('noDay.')).map((r) => parseInt(r.split('.')[1], 10));
      let possibleDays = [1, 2, 3, 4, 5, 6].filter((d) => d >= startDay && !blockedDays.includes(d));
      if (possibleDays.length === 0) possibleDays = [1, 2, 3, 4, 5, 6].filter((d) => d >= startDay);

      // Pool ca (lọc theo morning/afternoon/evening)
      const sessionPrefs = ['morning', 'afternoon', 'evening'].filter((s) => reqs.includes(s));
      let possibleShifts = data.shifts;
      if (sessionPrefs.length > 0) {
        const filtered = data.shifts.filter((s: any) => sessionPrefs.includes(s.sessionType));
        if (filtered.length > 0) possibleShifts = filtered;
      }

      return {
        ...gene,
        day: possibleDays[Math.floor(Math.random() * possibleDays.length)],
        shiftId: possibleShifts[Math.floor(Math.random() * possibleShifts.length)]._id,
        roomId: data.rooms[Math.floor(Math.random() * data.rooms.length)]._id,
      };
    });
  }

  // ═══════════════════════════════════════════
  // BƯỚC CUỐI: Chạy GA
  // ═══════════════════════════════════════════
  async runGA(creatorId: string) {
    const data = await this.prepareData(creatorId);

    console.log('[GA] Running...');
    console.log('Dữ liệu đầu vào: ', data.enrichedRequests);

    const POPULATION_SIZE = 600;
    const GENERATIONS = 600;
    const ELITE_SIZE = 15;
    const TOURNAMENT_K = 5;

    // Khởi tạo quần thểs
    let population = Array.from({ length: POPULATION_SIZE }, () => this.generateRandomChromosome(data));

    // Cache điểm để không tính lại nhiều lần trong cùng 1 thế hệ
    let scoredPop = population.map((chrom) => ({
      chrom,
      score: this.calculateFitness(chrom, data),
    }));

    for (let g = 0; g < GENERATIONS; g++) {
      // Sắp xếp giảm dần
      scoredPop.sort((a, b) => b.score - a.score);

      // Elitism: giữ lại top ELITE_SIZE
      const newScoredPop = scoredPop.slice(0, ELITE_SIZE);

      // Tournament selection + crossover + mutation để tạo phần còn lại
      while (newScoredPop.length < POPULATION_SIZE) {
        // Chọn parent1 bằng tournament
        const t1 = this.tournamentSelect(scoredPop, TOURNAMENT_K);
        const t2 = this.tournamentSelect(scoredPop, TOURNAMENT_K);

        let child = this.crossover(t1.chrom, t2.chrom);
        child = this.mutate(child, data);
        newScoredPop.push({ chrom: child, score: this.calculateFitness(child, data) });
      }

      scoredPop = newScoredPop;
    }

    // Sắp xếp lần cuối và lấy chromosome tốt nhất
    scoredPop.sort((a, b) => b.score - a.score);
    const best = scoredPop[0];

    console.log(`[GA] Best fitness after ${GENERATIONS} generations: ${best.score}`);

    // Enrich kết quả: gắn thêm tên ca, index lớp, slotScore
    const shiftMap = new Map<string, any>();
    data.shifts.forEach((s: any) => shiftMap.set(s._id.toString(), s));

    const reqMap = new Map<string, any>();
    data.enrichedRequests.forEach((r: any) => reqMap.set(r._id.toString(), r));

    // Tính slotScore riêng từng gene để trả về FE
    const enrichedChromosome = best.chrom.map((gene: any) => {
      const shift = shiftMap.get(gene.shiftId.toString());
      const req = reqMap.get(gene.classRequestId.toString());
      const reqs: string[] = req?.optionalRequirements || [];

      let slotScore = 0;
      if (reqs.includes(`day.${gene.day}`)) slotScore += 300;
      if (shift && reqs.includes(shift.sessionType)) slotScore += 300;
      if (reqs.includes('preferEarlyWeek') && isEarlyWeek(gene.day)) slotScore += 200;

      return {
        ...gene,
        classIdx: req?.classIdx ?? 0,
        shiftName: shift?.name ?? '',
        slotScore,
      };
    });

    await this.saveResults(enrichedChromosome);
    return enrichedChromosome;
  }

  // ═══════════════════════════════════════════
  // HELPER: Tournament Selection
  // ═══════════════════════════════════════════
  private tournamentSelect(scoredPop: { chrom: any[]; score: number }[], k: number) {
    let best = scoredPop[Math.floor(Math.random() * scoredPop.length)];
    for (let i = 1; i < k; i++) {
      const candidate = scoredPop[Math.floor(Math.random() * scoredPop.length)];
      if (candidate.score > best.score) best = candidate;
    }
    return best;
  }
}
