import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "@/services/user.service";
import { UserModel } from "@/models/user.model";
import bcrypt from "bcryptjs";
import { ZodValidationError } from "@/types/error.type";
import { createMockUser, mockUser, mockUsers, databaseConnectionError } from "@/test/mocks/userService.mock";
import { UserRole } from "@/types/user.type";

vi.mock("@/models/user.model", () => ({
    UserModel: vi.fn()
}));
vi.mock("bcryptjs", () => ({
    default: {
        genSalt: vi.fn(),
        hash: vi.fn(),
        compare: vi.fn(),
    },
    genSalt: vi.fn(),
    hash: vi.fn(),
    compare: vi.fn(),
}));

describe("userService", () => {
    const userService = new UserService()
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock Static methods
        UserModel.findOne = vi.fn().mockResolvedValue(null);
        UserModel.find = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            sort: vi.fn().mockResolvedValue([]),
        } as any);
        UserModel.findById = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
        } as any);
        UserModel.findByIdAndUpdate = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
        } as any);
        UserModel.findByIdAndDelete = vi.fn().mockResolvedValue(null);

        // Mock bcrypt
        (bcrypt.genSalt as any).mockResolvedValue("salt");
        (bcrypt.hash as any).mockResolvedValue("hashed_password_123");

        // Mock constructor implementation
        vi.mocked(UserModel).mockImplementation(function (this: any, data: any) {
            Object.assign(this, data);
            this.save = vi.fn().mockResolvedValue({
                ...createMockUser({ _id: "mock_id", ...data, password: "hashed_password_123", role: "STUDENT" })
            });
            return this;
        } as any);
    });

    describe("createUser", () => {
        it("Thành công: Tạo User với dữ liệu hợp lệ và trả về hashed password", async () => {
            const result = await userService.createUser(mockUser);

            expect(UserModel.findOne).toHaveBeenCalledWith({ email: mockUser.email });
            expect(bcrypt.hash).toHaveBeenCalledWith(mockUser.password, "salt");
            expect(UserModel).toHaveBeenCalled();

            expect(result.email).toBe(mockUser.email);
            expect(result._id).toBe("mock_id");
            expect(result.password).toBe("hashed_password_123");
        });

        it("Trả về lỗi: Email đã tồn tại", async () => {
            vi.mocked(UserModel.findOne).mockResolvedValue({ email: mockUser.email } as any);

            await expect(userService.createUser(mockUser)).rejects.toThrow(
                "Email đã tồn tại trong hệ thống!"
            );
            expect(UserModel.findOne).toHaveBeenCalledWith({ email: mockUser.email });
        });

        it("Mongoose trả lỗi khi mất kết nối mạng hoặc timeout", async () => {
            vi.spyOn(UserModel, 'findOne').mockRejectedValue(databaseConnectionError)
            await expect(userService.createUser({ ...mockUser })).rejects.toThrow(databaseConnectionError)
        })
    });

    describe("getAllUsers", () => {
        it(`Tìm tất cả user và không nhận về password,
            Database function gọi đúng thứ tự find -> select -> sort`, async () => {
            const mockSort = vi.fn().mockReturnValue(mockUsers)
            const mockSelect = vi.fn().mockReturnValue({ sort: mockSort })
            const mockFind = vi.spyOn(UserModel, 'find').mockReturnValue({ select: mockSelect } as any)

            const result = await userService.getAllUsers();

            expect(result).toEqual(mockUsers)
            expect(mockFind).toHaveBeenCalled()
            expect(mockSelect).toHaveBeenCalledWith("-password")
            expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 })
        })
    })

    describe("getUserById", () => {
        it("Tìm user theo id khi database có bản ghi (không nhận về password)", async () => {
            const { password, ...user } = mockUser
            const mockSelect = vi.fn().mockReturnValue(user)
            const mockFindById = vi.spyOn(UserModel, 'findById').mockReturnValue({ select: mockSelect } as any)

            const result = await userService.getUserById("mock_id")

            expect(result).toEqual(user)
            expect(mockFindById).toHaveBeenCalledWith("mock_id")
            expect(mockSelect).toHaveBeenCalledWith('-password')
            expect(result).not.toHaveProperty('password')
        })

        it("Tìm user theo id khi database không có bản ghi", async () => {
            const mockSelect = vi.fn().mockReturnValue(null)
            vi.spyOn(UserModel, 'findById').mockReturnValue({ select: mockSelect } as any)

            const result = await userService.getUserById("non_existent")
            expect(result).toBeNull()
        })

        it("Database function gọi đúng thứ tự findById -> select", async () => {
            const mockSelect = vi.fn().mockReturnValue(mockUser)
            const mockFindById = vi.spyOn(UserModel, 'findById').mockReturnValue({ select: mockSelect } as any)

            await userService.getUserById("mock_id")

            expect(mockFindById).toHaveBeenCalledWith("mock_id")
            expect(mockSelect).toHaveBeenCalledWith('-password')
        })
    })

    describe("updateUser", () => {
        it("Cập nhật user thành công (hash password nếu có, không nhận về password)", async () => {
            const updateData = { fullName: "Updated Name", password: "new_password" };
            const { password, ...updatedUser } = { ...mockUser, ...updateData };
            const id = "mock_id"

            const mockSelect = vi.fn().mockReturnValue(updatedUser);
            const mockFindByIdAndUpdate = vi.spyOn(UserModel, 'findByIdAndUpdate').mockReturnValue({ select: mockSelect } as any);

            const result = await userService.updateUser(id, updateData);

            expect(result).toEqual(updatedUser);
            expect(bcrypt.hash).toHaveBeenCalledWith("new_password", "salt");
            expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(id, { ...updateData, password: "hashed_password_123" }, { new: true });
            expect(mockSelect).toHaveBeenCalledWith('-password')
        });

        it("Trả về lỗi nếu Role không hợp lệ", async () => {
            await expect(userService.updateUser("id", { role: "INVALID" as any }))
                .rejects.toThrow("không tồn tại");
        });
    });

    describe("deleteUser", () => {
        it("Xóa user theo id thành công", async () => {
            const deletedUser = { _id: "id", ...mockUser };
            vi.spyOn(UserModel, 'findByIdAndDelete').mockResolvedValue(deletedUser);

            const result = await userService.deleteUser("id");
            expect(result).toEqual(deletedUser);
            expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("id");
        });
    });
});