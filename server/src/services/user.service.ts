import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model';
import RoleModel from '../models/role.model';
import { ClassModel } from '../models/class.model';
import { ScheduleModel } from '../models/schedule.model';
import { IUser, GetUsersQuery, UserStatus } from '../types/user.type';
import { InvoiceModel } from '../models/invoice.model';

export class UserService {
  // 1. Tạo mới User (Create)
  async createUser(data: Partial<IUser>): Promise<IUser> {
    if (data.email) {
      const existingUser = await UserModel.findOne({ email: data.email });
      if (existingUser) {
        throw new Error('Email đã tồn tại trong hệ thống!');
      }
    }

    if (data.roleId) {
      const roleExists = await RoleModel.findById(data.roleId);
      if (!roleExists) throw new Error('Vai trò (Role) này không tồn tại trong hệ thống!');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password as string, salt);

    const newUser = new UserModel({
      ...data,
      password: hashedPassword,
    });

    await newUser.save();

    return newUser.populate('roleId', 'name permissions');
  }

  // 2. Lấy danh sách User
  async getAllUsers(query: GetUsersQuery): Promise<{ users: IUser[]; totalCount: number }> {
    const { page = 1, limit = 10, search = '', roleId = '', status = '' } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (roleId) {
      filter.roleId = roleId;
    }

    if (status) {
      filter.status = status;
    }

    const [users, totalCount] = await Promise.all([
      UserModel.find(filter)
        .select('-password')
        .populate('roleId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(filter),
    ]);

    return { users, totalCount };
  }

  // 3. Lấy chi tiết 1 User
  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id)
      .select('-password')
      .populate('roleId', 'name permissions')
      .populate('student_info.consultantId', 'fullName email');
  }

  // 4. Cập nhật User
  async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
    if (data.roleId) {
      const roleExists = await RoleModel.findById(data.roleId);
      if (!roleExists) {
        throw new Error(`Vai trò không tồn tại. Đừng có hack nhé!`);
      }
    }

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    return await UserModel.findByIdAndUpdate(id, data, { new: true }).select('-password').populate('roleId', 'name'); // Populate để trả về data mới nhất cho Frontend
  }

  // 5. Xóa User
  async deleteUser(id: string): Promise<{ action: 'SOFT_DELETE' | 'HARD_DELETE'; user: IUser; message: string }> {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('Người dùng không tồn tại!');
    }

    const isLinkedToClass = await ClassModel.exists({
      $or: [{ teacherId: id }, { studentIds: id }],
    });

    const isLinkedToSchedule = await ScheduleModel.exists({ teacherId: id });

    const isLinkedToInvoice = await InvoiceModel.exists({
      $or: [{ studentId: id }, { consultantId: id }],
    });

    const isExist = await UserModel.exists({
      'student_info.consultantId': id,
    });

    if (isLinkedToClass || isLinkedToSchedule || isLinkedToInvoice || isExist) {
      user.status = UserStatus.INACTIVE;
      await user.save();

      let reason = 'Đã chuyển tài khoản sang trạng thái Vô hiệu hóa (Soft Delete) vì người dùng này: ';
      const reasons = [];
      if (isLinkedToClass) reasons.push('đang liên kết với lớp học');
      if (isLinkedToSchedule) reasons.push('có lịch giảng dạy');
      if (isLinkedToInvoice) reasons.push('có dữ liệu hóa đơn/tài chính');
      if (isExist) reasons.push('có dữ liệu chăm sóc khách hàng liên quan');

      return {
        action: 'SOFT_DELETE',
        user: user,
        message: reason + reasons.join(', ') + '.',
      };
    } else {
      const deletedUser = await UserModel.findByIdAndDelete(id);

      return {
        action: 'HARD_DELETE',
        user: deletedUser as IUser,
        message: 'Xóa người dùng thành công (Đã xóa vĩnh viễn khỏi hệ thống).',
      };
    }
  }

  async updatePassword(id: string, data: { oldPassword: string; newPassword: string }): Promise<IUser | null> {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('Người dùng không tồn tại!');
    }

    const isPasswordCorrect = await bcrypt.compare(data.oldPassword, user.password as string);
    if (!isPasswordCorrect) {
      throw new Error('Mật khẩu cũ không đúng!');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return user;
  }

  async getStaff(
    query: GetUsersQuery,
  ): Promise<{ users: IUser[]; totalCount: number; allCount: number; activeCount: number; inactiveCount: number }> {
    const { page = 1, limit = 10, search = '', roleId = '', status = '' } = query;
    const skip = (page - 1) * limit;

    const roles = await RoleModel.find({ name: { $in: ['Student', 'Teacher', 'Super Admin'] } }).select('_id');

    const otherRoleId = roles.map((r) => r._id.toString());

    const filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (roleId) {
      if (otherRoleId.includes(roleId)) {
        throw new Error('Bạn không có quyền truy cập');
      } else {
        filter.roleId = roleId;
      }
    } else {
      filter.roleId = filter.roleId = { $nin: roles };
    }

    if (status) {
      filter.status = status;
    }

    const [users, totalCount, allCount, activeCount, inactiveCount] = await Promise.all([
      UserModel.find(filter)
        .select('-password')
        .populate('roleId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(filter),
      UserModel.countDocuments({ roleId: filter.roleId }),
      UserModel.countDocuments({ roleId: filter.roleId, status: UserStatus.ACTIVE }),
      UserModel.countDocuments({ roleId: filter.roleId, status: UserStatus.INACTIVE }),
    ]);

    return { users, totalCount, allCount, activeCount, inactiveCount };
  }

  // Hàm lấy danh sách giáo viên
  async getAllTeachers(
    query: GetUsersQuery,
  ): Promise<{ teachers: IUser[]; totalCount: number; activeCount: number; inactiveCount: number; allCount: number }> {
    const { page = 1, limit = 10, search = '', status = '' } = query;
    const skip = (page - 1) * limit;

    const teacherRoleId = await RoleModel.findOne({ name: 'Teacher' }).select('_id');

    const filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (teacherRoleId) {
      filter.roleId = teacherRoleId._id;
    }

    if (status) {
      filter.status = status;
    }

    const [teachers, totalCount, allCount, activeCount, inactiveCount] = await Promise.all([
      UserModel.find(filter)
        .select('-password')
        .populate('roleId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(filter),
      UserModel.countDocuments({ roleId: filter.roleId }),
      UserModel.countDocuments({ roleId: filter.roleId, status: UserStatus.ACTIVE }),
      UserModel.countDocuments({ roleId: filter.roleId, status: UserStatus.INACTIVE }),
    ]);

    return { teachers, totalCount, allCount, activeCount, inactiveCount };
  }

  async getAllStudents(query: GetUsersQuery): Promise<{ users: IUser[]; totalCount: number; summary: any }> {
    const { page = 1, limit = 10, search = '', status = '' } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const roleId = await RoleModel.findOne({ name: 'Student' }).select('_id');

    if (roleId) {
      filter.roleId = roleId;
    }

    if (status) {
      filter.status = status;
    }

    const [users, totalCount, countActive, countInactive, countPotential, countReserved] = await Promise.all([
      UserModel.find(filter)
        .select('-password')
        .populate('roleId', 'name')
        .populate('student_info.consultantId', 'fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(filter),
      UserModel.countDocuments({ ...filter, status: UserStatus.ACTIVE }),
      UserModel.countDocuments({ ...filter, status: UserStatus.INACTIVE }),
      UserModel.countDocuments({ ...filter, status: UserStatus.POTENTIAL }),
      UserModel.countDocuments({ ...filter, status: UserStatus.RESERVED }),
    ]);

    const summary = {
      active: countActive,
      inactive: countInactive,
      potential: countPotential,
      reserved: countReserved,
    };

    return { users, totalCount, summary };
  }
}
