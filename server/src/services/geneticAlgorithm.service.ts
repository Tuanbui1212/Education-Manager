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

      let possibleDays = [1, 2, 3, 4, 5, 6];
      const blockedDays = reqs.filter((r) => r.startsWith('noDay.')).map((r) => parseInt(r.split('.')[1], 10));
      possibleDays = possibleDays.filter((d) => !blockedDays.includes(d));

      if (possibleDays.length === 0) possibleDays = [1, 2, 3, 4, 5, 6];

      const sessionPrefs = ['morning', 'afternoon', 'evening'].filter((s) => reqs.includes(s));
      let possibleShifts = shifts;
      if (sessionPrefs.length > 0) {
        const filtered = shifts.filter((s: any) => sessionPrefs.includes(s.sessionType));
        if (filtered.length > 0) possibleShifts = filtered;
      }

      const validRooms = rooms.filter((r: any) => r.capacity >= req.maxNumberOfStudents);
      //const safeRooms = validRooms.length > 0 ? validRooms : [rooms.sort((a: any, b: any) => b.capacity - a.capacity)];
      const safeRooms = validRooms.length > 0 ? validRooms : rooms.sort((a: any, b: any) => b.capacity - a.capacity);

      let availableDaysForThisClass = [...possibleDays];

      for (let i = 0; i < req.lessonsPerWeek; i++) {
        let day;

        if (reqs.includes('noSameDay') && availableDaysForThisClass.length > 0) {
          const randomIdx = Math.floor(Math.random() * availableDaysForThisClass.length);
          day = availableDaysForThisClass[randomIdx];
          availableDaysForThisClass.splice(randomIdx, 1);
        } else {
          day = possibleDays[Math.floor(Math.random() * possibleDays.length)];
        }

        const shift = possibleShifts[Math.floor(Math.random() * possibleShifts.length)];
        const room = safeRooms[Math.floor(Math.random() * safeRooms.length)];

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

    const shiftMap = new Map<string, any>();
    shifts.forEach((s: any) => shiftMap.set(s._id.toString(), s));

    const reqMap = new Map<string, string[]>();
    enrichedRequests.forEach((r: any) => {
      reqMap.set(r._id.toString(), r.optionalRequirements || []);
    });

    const usedRooms = new Set<string>();
    const usedTeachers = new Set<string>();

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
    const mutationRate = 0.08;
    return chromosome.map((gene) => {
      if (Math.random() >= mutationRate) return gene;

      const currentReq = data.enrichedRequests.find((r: any) => r._id.toString() === gene.classRequestId.toString());
      const reqs: string[] = currentReq?.optionalRequirements || [];

      const blockedDays = reqs.filter((r) => r.startsWith('noDay.')).map((r) => parseInt(r.split('.')[1], 10));
      let possibleDays = [1, 2, 3, 4, 5, 6].filter((d) => !blockedDays.includes(d));
      if (possibleDays.length === 0) possibleDays = [1, 2, 3, 4, 5, 6];

      // Pool ca (lọc theo morning/afternoon/evening)
      const sessionPrefs = ['morning', 'afternoon', 'evening'].filter((s) => reqs.includes(s));
      let possibleShifts = data.shifts;
      if (sessionPrefs.length > 0) {
        const filtered = data.shifts.filter((s: any) => sessionPrefs.includes(s.sessionType));
        if (filtered.length > 0) possibleShifts = filtered;
      }

      const validRooms = data.rooms.filter((r: any) => r.capacity >= gene.maxNumberOfStudents);
      const safeRooms =
        validRooms.length > 0 ? validRooms : [data.rooms.sort((a: any, b: any) => b.capacity - a.capacity)];
      const newRoom = safeRooms[Math.floor(Math.random() * safeRooms.length)];

      return {
        ...gene,
        day: possibleDays[Math.floor(Math.random() * possibleDays.length)],
        shiftId: possibleShifts[Math.floor(Math.random() * possibleShifts.length)]._id,
        roomId: newRoom._id,
        roomCapacity: newRoom.capacity,
      };
    });
  }

  // ═══════════════════════════════════════════
  // BƯỚC CUỐI: Chạy GA
  // ═══════════════════════════════════════════
  async runGA(creatorId: string) {
    const data = await this.prepareData(creatorId);
    const totalClass = data.enrichedRequests.length;

    console.log('[GA] Running...');
    //console.log('Dữ liệu đầu vào: ', data.enrichedRequests);

    // const POPULATION_SIZE = 600;
    // const GENERATIONS = 600;
    // const ELITE_SIZE = 15;
    // const TOURNAMENT_K = 5;
    const POPULATION_SIZE = Math.min(600, Math.max(50, totalClass * 20));
    const GENERATIONS = Math.min(600, Math.max(30, totalClass * 15));
    const ELITE_SIZE = Math.max(3, Math.floor(POPULATION_SIZE * 0.03));
    const TOURNAMENT_K = totalClass < 10 ? 3 : totalClass < 50 ? 5 : 7;

    let population = Array.from({ length: POPULATION_SIZE }, () => this.generateRandomChromosome(data));

    let scoredPop = population.map((chrom) => ({
      chrom,
      score: this.calculateFitness(chrom, data),
    }));

    // === 1. KHAI BÁO BIẾN DỪNG SỚM (TRƯỚC VÒNG LẶP FOR) ===
    let bestOverallScore = -Infinity;
    let stagnantGenerations = 0;
    let MAX_STAGNANT_GENERATIONS = 50;

    if (totalClass < 3) MAX_STAGNANT_GENERATIONS = 3;
    else if (totalClass < 5) MAX_STAGNANT_GENERATIONS = 5;
    else if (totalClass < 8) MAX_STAGNANT_GENERATIONS = 10;
    else if (totalClass < 10) MAX_STAGNANT_GENERATIONS = 15;
    else if (totalClass < 15) MAX_STAGNANT_GENERATIONS = 20;
    else if (totalClass < 20) MAX_STAGNANT_GENERATIONS = 25;
    else if (totalClass < 30) MAX_STAGNANT_GENERATIONS = 30;
    else if (totalClass < 50) MAX_STAGNANT_GENERATIONS = 35;
    else if (totalClass < 80) MAX_STAGNANT_GENERATIONS = 40;
    else if (totalClass < 100) MAX_STAGNANT_GENERATIONS = 45;

    let actualGenerations = 0;
    for (let g = 0; g < GENERATIONS; g++) {
      scoredPop.sort((a, b) => b.score - a.score);
      // console.log(`[GA] Thế hệ ${g + 1} - Best Score: ${scoredPop[0].score}`);

      // === 2. LOGIC KIỂM TRA DỪNG SỚM ===
      const currentBestScore = scoredPop[0].score;
      console.log(`[GA] Thế hệ ${g + 1} - Best Score: ${currentBestScore}`);
      if (currentBestScore > bestOverallScore) {
        bestOverallScore = currentBestScore;
        stagnantGenerations = 0;
      } else {
        stagnantGenerations++;
      }

      if (stagnantGenerations >= MAX_STAGNANT_GENERATIONS) {
        console.log(
          `[GA] 🛑 DỪNG SỚM tại thế hệ ${g + 1}! Lý do: ${MAX_STAGNANT_GENERATIONS} thế hệ liên tiếp không tiến bộ.`,
        );
        break;
      }

      const newScoredPop = scoredPop.slice(0, ELITE_SIZE);

      while (newScoredPop.length < POPULATION_SIZE) {
        const t1 = this.tournamentSelect(scoredPop, TOURNAMENT_K);
        const t2 = this.tournamentSelect(scoredPop, TOURNAMENT_K);

        let child = this.crossover(t1.chrom, t2.chrom);
        child = this.mutate(child, data);
        newScoredPop.push({ chrom: child, score: this.calculateFitness(child, data) });
      }

      scoredPop = newScoredPop;
      actualGenerations = g + 1;
    }

    scoredPop.sort((a, b) => b.score - a.score);
    const best = scoredPop[0];

    console.log(`[GA] Best fitness after ${actualGenerations} generations: ${best.score}`);

    // Enrich kết quả: gắn thêm tên ca, index lớp, slotScore
    const shiftMap = new Map<string, any>();
    data.shifts.forEach((s: any) => shiftMap.set(s._id.toString(), s));

    const reqMap = new Map<string, any>();
    data.enrichedRequests.forEach((r: any) => reqMap.set(r._id.toString(), r));

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
