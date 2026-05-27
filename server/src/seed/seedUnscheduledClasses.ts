/**
 * SEED: Tạo lớp chưa có lịch để test hiệu năng thuật toán di truyền (GA)
 *
 * Chạy:  npx ts-node src/seed/seedUnscheduledClasses.ts
 * Xoá:   npx ts-node src/seed/seedUnscheduledClasses.ts --clean
 *
 * Cấu hình số lượng tại hằng số bên dưới.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { ClassModel } from '../models/class.model';
import { ClassRequestModel } from '../models/classRequest.model';
import { CourseModel } from '../models/course.model';
import { UserModel } from '../models/user.model';
import RoleModel from '../models/role.model';

// ══════════════════════════════════════════
// CẤU HÌNH — chỉnh tại đây
// ══════════════════════════════════════════

/** Số lớp cần tạo để test GA */
const NUM_UNSCHEDULED = 80;

/** Tạo luôn ClassRequest (để chạy GA ngay, không cần vào UI chọn)?
 *  true  → tạo cả Class lẫn ClassRequest → vào trang GA chạy ngay
 *  false → chỉ tạo Class → vào UI chọn lớp rồi mới tạo ClassRequest */
const ALSO_CREATE_CLASS_REQUESTS = true;

/** Email của admin/manager dùng làm creatorId trong ClassRequest */
const CREATOR_EMAIL = 'admin0@edu.vn';

/** startDate cho các lớp (format YYYY-MM-DD) */
const CLASS_START_DATE = '2026-06-01';

/** Prefix tên lớp — dễ nhận biết và xoá sạch sau khi test */
const NAME_PREFIX = 'PERF-TEST-';

// ══════════════════════════════════════════

const MONGO_URI = process.env.MONGO_URI as string;

async function main() {
  const isClean = process.argv.includes('--clean');

  await mongoose.connect(MONGO_URI);
  console.log('✅ Kết nối MongoDB thành công.\n');

  if (isClean) {
    await cleanUp();
    process.exit(0);
  }

  await seed();
  process.exit(0);
}

async function cleanUp() {
  console.log(`🗑️  Xoá tất cả dữ liệu có prefix "${NAME_PREFIX}"...`);
  const regex = new RegExp(`^${NAME_PREFIX}`);

  const classes = await ClassModel.find({ name: regex }).select('_id');
  const classIds = classes.map((c) => c._id);

  const delClasses = await ClassModel.deleteMany({ _id: { $in: classIds } });
  const delRequests = await ClassRequestModel.deleteMany({ name: regex });

  console.log(`   Đã xoá ${delClasses.deletedCount} Class`);
  console.log(`   Đã xoá ${delRequests.deletedCount} ClassRequest`);
  console.log('✅ Xong!');
  await mongoose.disconnect();
}

async function seed() {
  // ── Lấy dữ liệu tham chiếu ──────────────────
  const [courses, teacherRole] = await Promise.all([
    CourseModel.find({}).lean(),
    RoleModel.findOne({ name: 'Teacher' }).lean(),
  ]);

  if (!courses.length) throw new Error('Không có khóa học nào trong DB. Hãy chạy seed chính trước.');
  if (!teacherRole) throw new Error('Không tìm thấy role Teacher.');

  const teachers = await UserModel.find({
    roleId: teacherRole._id,
    status: 'ACTIVE',
  })
    .select('_id')
    .lean();

  if (!teachers.length) throw new Error('Không có giáo viên ACTIVE nào trong DB.');

  let creatorId: mongoose.Types.ObjectId | null = null;
  if (ALSO_CREATE_CLASS_REQUESTS) {
    const creator = await UserModel.findOne({ email: CREATOR_EMAIL }).select('_id').lean();
    if (!creator) throw new Error(`Không tìm thấy user với email "${CREATOR_EMAIL}". Sửa CREATOR_EMAIL trong script.`);
    creatorId = creator._id as mongoose.Types.ObjectId;
  }

  // Lấy tên đã tồn tại để tránh trùng unique
  const existingNames = new Set(
    (await ClassModel.find({ name: new RegExp(`^${NAME_PREFIX}`) }).select('name').lean()).map((c) => c.name),
  );

  // ── Tạo Class objects ────────────────────────
  console.log(`🏗️  Đang tạo ${NUM_UNSCHEDULED} lớp chưa có lịch...`);

  const classesData: any[] = [];
  let counter = 1;

  while (classesData.length < NUM_UNSCHEDULED) {
    const padded = String(counter).padStart(3, '0');
    const name = `${NAME_PREFIX}${padded}`;
    counter++;
    if (existingNames.has(name)) continue;

    const course = courses[classesData.length % courses.length];
    const teacher = teachers[classesData.length % teachers.length];
    const lessonsPerWeek = classesData.length % 2 === 0 ? 2 : 3;

    classesData.push({
      name,
      courseId: course._id,
      teacherId: teacher._id,
      roomId: undefined,
      documents: [],
      studentIds: [],
      startDate: CLASS_START_DATE,
      totalLessons: (course as any).totalLessons ?? 36,
      lessonsPerWeek,
      maxNumberOfStudents: 20,
      optionalRequirements: [],
      status: 'PENDING',
      schedule: false,
    });
  }

  const insertedClasses = await ClassModel.insertMany(classesData);
  console.log(`✅ Đã tạo ${insertedClasses.length} Class với schedule=false.\n`);

  // ── Tạo ClassRequest objects ─────────────────
  if (ALSO_CREATE_CLASS_REQUESTS && creatorId) {
    console.log(`📋 Đang tạo ${insertedClasses.length} ClassRequest cho creatorId="${CREATOR_EMAIL}"...`);

    const requestsData = insertedClasses.map((cls: any) => ({
      creatorId,
      name: cls.name,
      courseId: cls.courseId,
      teacherId: cls.teacherId,
      roomId: cls.roomId,
      startDate: cls.startDate,
      totalLessons: cls.totalLessons,
      maxNumberOfStudents: cls.maxNumberOfStudents,
      lessonsPerWeek: cls.lessonsPerWeek,
      optionalRequirements: cls.optionalRequirements ?? [],
      schedule: [],
    }));

    await ClassRequestModel.insertMany(requestsData);
    console.log(`✅ Đã tạo ${requestsData.length} ClassRequest (schedule=[]) cho creatorId="${CREATOR_EMAIL}".\n`);
  }

  // ── Tổng kết ─────────────────────────────────
  console.log('🎉 Hoàn tất! Tóm tắt:');
  console.log(`   📘 Class mới (schedule=false): ${insertedClasses.length}`);
  if (ALSO_CREATE_CLASS_REQUESTS) {
    console.log(`   📋 ClassRequest mới (schedule=[]):  ${insertedClasses.length}`);
    console.log(`   👤 creatorId: ${CREATOR_EMAIL}`);
    console.log('');
    console.log('➡️  Vào trang quản lý lịch học → chọn creatorId → chạy GA ngay.');
  } else {
    console.log('');
    console.log('➡️  Vào UI → chọn các lớp PERF-TEST-* → tạo ClassRequest → chạy GA.');
  }
  console.log(`\n🗑️  Dọn dẹp sau khi test: npm run seed:unscheduled -- --clean`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});
