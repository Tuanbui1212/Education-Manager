import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "@/services/user.service";
import { UserModel } from "@/models/user.model";
import bcrypt from "bcryptjs";
import { ZodValidationError } from "@/types/error.type";
import { createMockUser, mockUser } from "@/test/mocks/userService.mock";

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

describe("UserService", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock Static methods
        UserModel.findOne = vi.fn().mockResolvedValue(null);
        UserModel.find = vi.fn().mockReturnValue({
            select: vi.fn().mockReturnThis(),
            sort: vi.fn().mockResolvedValue([]),
        } as any);
        UserModel.findById = vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue(null),
        } as any);
        UserModel.findByIdAndUpdate = vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue(null),
        } as any);
        UserModel.findByIdAndDelete = vi.fn().mockResolvedValue(null);

        // Mock bcrypt
        (bcrypt.genSalt as any).mockResolvedValue("salt");
        (bcrypt.hash as any).mockResolvedValue("hashed_password_123");

        // Mock constructor implementation
        vi.mocked(UserModel).mockImplementation(function (this: any, data: any) {
            Object.assign(this, data);
            this.save = vi.fn().mockResolvedValue({
                ...createMockUser({ _id: "mock_id", ...data, password: "hashed_password_123" })
            });
            return this;
        } as any);
    });

    describe("createUser", () => {
        it("Thành công: Tạo User với dữ liệu hợp lệ", async () => {
            const result = await UserService.createUser(mockUser);

            expect(UserModel.findOne).toHaveBeenCalledWith({ email: mockUser.email });
            expect(bcrypt.hash).toHaveBeenCalledWith(mockUser.password, "salt");
            expect(UserModel).toHaveBeenCalled();

            expect(result.email).toBe(mockUser.email);
            expect(result._id).toBe("mock_id");
            expect(result.password).toBe("hashed_password_123");
        });

        it("Trả về lỗi Email: Tạo User với email tồn tại", async () => {
            vi.mocked(UserModel.findOne).mockResolvedValue({ email: mockUser.email } as any);

            await expect(UserService.createUser(mockUser)).rejects.toThrow(
                ZodValidationError
            );
            expect(UserModel.findOne).toHaveBeenCalledWith({ email: mockUser.email });
            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(UserModel).not.toHaveBeenCalled();
        });

        it("Trả về lỗi Email: Tạo User với email 51 ký tự", async () => {
            const invalidEmail = "test@gmail.loremipsumdolorsitametconsectetueradipis";
            const result = UserService.createUser({ ...mockUser, email: invalidEmail });

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ email: "Email tối đa 50 ký tự" });
            });
        })

        it("Trả về lỗi Email: Tạo User với email 50 ký tự", async () => {
            const validEmail = "test@gmail.loremipsumdolorsitametconsectetueradipi";
            const result = await UserService.createUser({ ...mockUser, email: validEmail });

            expect(result.email).toBe(validEmail);
            expect(result._id).toBe("mock_id");
            expect(result.password).toBe("hashed_password_123");
        })

        it("Trả về lỗi Email: Định dạng sai (thiếu @)", async () => {
            const invalidEmail = "testgmail.com";
            const result = UserService.createUser({ ...mockUser, email: invalidEmail });

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ email: "Email không hợp lệ" });
            });
        })

        it("Trả về lỗi Email: Rỗng hoặc Null hoặc toàn khoảng trắng", async () => {
            const invalidEmail = "       ";
            const result = UserService.createUser({ ...mockUser, email: invalidEmail });

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ email: "Email không hợp lệ, Email không được để trống" });
            });
        })

        it("Thành công Email: Tạo user với email hợp lệ", async () => {
            const validEmail = "valid@test.com";
            const result = await UserService.createUser({ ...mockUser, email: validEmail });

            expect(result.email).toBe(validEmail);
            expect(result._id).toBe("mock_id");
            expect(result.password).toBe("hashed_password_123");
        })

        it("Trả về lỗi Password: Nhập password với 5 ký tự", async () => {
            const invalidPassword = "12345";
            const result = UserService.createUser({ ...mockUser, password: invalidPassword });

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ password: "Mật khẩu phải có ít nhất 6 ký tự" });
            });
        })

        it("Trả về lỗi Password: Nhập password với 51 ký tự", async () => {
            const invalidPassword = "123456789012345678901234567890123456789012345678901";
            const result = UserService.createUser({ ...mockUser, password: invalidPassword });

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ password: "Mật khẩu tối đa 50 ký tự" });
            });
        })

        it("Trả về lỗi Password: Rỗng hoặc Null hoặc toàn khoảng trắng", async () => {
            const invalidPassword = "       ";
            const result = UserService.createUser({ ...mockUser, password: invalidPassword });

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ password: "Mật khẩu không được để trống" });
            });
        })

        it("Trả về lỗi Password: Tạo user thành công với mật khẩu 50 ký tự", async () => {
            const validPassword = "12345678901234567890123456789012345678901234567890";
            const result = await UserService.createUser({ ...mockUser, password: validPassword });

            expect(result.password).toBe("hashed_password_123");
            expect(result._id).toBe("mock_id");
        })

        it("Thành công Password: Tạo user thành công với mật khẩu 6 ký tự", async () => {
            const validPassword = "123456"
            const result = await UserService.createUser({ ...mockUser, password: validPassword });

            expect(result.password).toBe("hashed_password_123");
            expect(result._id).toBe("mock_id");
        })

        it("Thành công Password: Tạo user thành công và trả về hash password", async () => {
            const result = await UserService.createUser({ ...mockUser });
            expect(result.password).toBe("hashed_password_123");
        })

        it("Trả về lỗi Fullname: Nhập họ tên với 1 ký tự", async () => {
            const invalidFullName = "A";
            const result = UserService.createUser({ ...mockUser, fullName: invalidFullName });

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ fullName: "Họ tên phải có ít nhất 2 ký tự" });
            });
        })

        it("Trả về lỗi Fullname: Nhập họ tên với 51 ký tự", async () => {
            const invalidFullName = "The quick, brown fox jumps over a lazy dog. DJs fle";
            const result = UserService.createUser({ ...mockUser, fullName: invalidFullName });

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ fullName: "Họ tên tối đa 50 ký tự" });
            });
        })

        it("Trả về lỗi Fullname: Rỗng hoặc Null hoặc toàn khoảng trắng", async () => {
            const invalidFullName = "       ";
            const result = UserService.createUser({ ...mockUser, fullName: invalidFullName });

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ fullName: "Họ tên không được để trống" });
            });
        })

        it("Thành công Fullname: Nhập họ tên với 2 ký tự", async () => {
            const validFullName = "An";
            const result = await UserService.createUser({ ...mockUser, fullName: validFullName });

            expect(result.fullName).toBe(validFullName);
            expect(result._id).toBe("mock_id");
        })

        it("Thành công Fullname: Nhập họ tên với 50 ký tự", async () => {
            const validFullName = "The quick, brown fox jumps over a lazy dog. DJs fl";
            const result = await UserService.createUser({ ...mockUser, fullName: validFullName });

            expect(result.fullName).toBe(validFullName);
            expect(result._id).toBe("mock_id");
        })

        it("Trả về lỗi Phone: Nhập số điện thoại với 9 ký tự", async () => {
            const invalidPhone = "123456789";
            const result = UserService.createUser({ ...mockUser, phone: invalidPhone });

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ phone: "Số điện thoại phải có 10 số" });
            });
        })

        it("Trả về lỗi Phone: Nhập số điện thoại với 11 ký tự", async () => {
            const invalidPhone = "12345678901";
            const result = UserService.createUser({ ...mockUser, phone: invalidPhone });

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ phone: "Số điện thoại phải có 10 số" });
            });
        })

        it("Trả về lỗi Phone: Rỗng hoặc Null hoặc toàn khoảng trắng", async () => {
            const invalidPhone = "       ";
            const result = UserService.createUser({ ...mockUser, phone: invalidPhone });

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ phone: "Số điện thoại phải có 10 số, Số điện thoại không được để trống" });
            });
        })

        it("Thành công Phone: Nhập số điện thoại với 10 ký tự", async () => {
            const validPhone = "1234567890";
            const result = await UserService.createUser({ ...mockUser, phone: validPhone });

            expect(result.phone).toBe(validPhone);
            expect(result._id).toBe("mock_id");
        })
    });
});