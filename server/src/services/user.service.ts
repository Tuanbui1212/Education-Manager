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
    return await UserModel.findById(id).select('-password').populate('roleId', 'name permissions');
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

  async getStaff(query: GetUsersQuery): Promise<{ users: IUser[]; totalCount: number }> {
    const { page = 1, limit = 10, search = '', roleId = '', status = '' } = query;
    const skip = (page - 1) * limit;

    const otherRoleId = await RoleModel.find({ name: { $in: ['Student', 'Teacher', 'Super Admin'] } }).select('_id');

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
    } else {
      filter.roleId = { $nin: otherRoleId };
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
}
