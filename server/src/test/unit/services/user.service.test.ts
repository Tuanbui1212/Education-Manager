import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "@/services/user.service";
import { UserModel } from "@/models/user.model";
import bcrypt from "bcryptjs";
import { ZodValidationError } from "@/types/error.type";
import { createMockUser, mockUser, mockUsers, databaseConnectionError } from "@/test/mocks/userService.mock";

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
                ...createMockUser({ _id: "mock_id", ...data, password: "hashed_password_123", role: "STUDENT" })
            });
            return this;
        } as any);
    });

    describe("createUser", () => {
        it(`Thành công: Tạo User với dữ liệu hợp lệ, 
            Thành công Email: Tạo user với email hợp lệ, 
            Thành công Password: Tạo user thành công với mật khẩu 6 ký tự, 
            Thành công Password: Tạo user thành công và trả về hash password, 
            Thành công Phone: Nhập số điện thoại với 10 ký tự
            Thành công Fullname: Nhập họ tên với 2 ký tự,
            Thành công Role: Không nhập trường role`, async () => {
            const result = await UserService.createUser(mockUser);

            expect(UserModel.findOne).toHaveBeenCalledWith({ email: mockUser.email });
            expect(bcrypt.hash).toHaveBeenCalledWith(mockUser.password, "salt");
            expect(UserModel).toHaveBeenCalled();

            expect(result.email).toBe(mockUser.email);
            expect(result.phone).toBe(mockUser.phone);
            expect(result.fullName).toBe(mockUser.fullName);
            expect(result._id).toBe("mock_id");
            expect(result.role).toBe("STUDENT")
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
                expect(err.errors).toEqual({ email: "Email không hợp lệ" });
            });
        })
        it("Trả về lỗi Email: Không nhập trường email", async () => {
            const {email, ...user} = mockUser
            const result = UserService.createUser(user);

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ email: "Email là bắt buộc" });
            });
            
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
                expect(err.errors).toEqual({ password: "Mật khẩu phải có ít nhất 6 ký tự" });
            });
        })
        it("Trả về lỗi Password: Không nhập trường password", async () => {
            const {password, ...user} = mockUser
            const result = UserService.createUser(user);

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ password: "Mật khẩu là bắt buộc" });
            });
        })
        it("Thành công Password: Tạo user thành công với mật khẩu 50 ký tự", async () => {
            const validPassword = "12345678901234567890123456789012345678901234567890";
            const result = await UserService.createUser({ ...mockUser, password: validPassword });

            expect(result.password).toBe("hashed_password_123");
            expect(result._id).toBe("mock_id");
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
                expect(err.errors).toEqual({ fullName: "Họ tên phải có ít nhất 2 ký tự" });
            });
        })
        it("Trả về lỗi Fullname: Không nhập trường fullName", async () => {
            const {fullName, ...user} = mockUser
            const result = UserService.createUser(user);

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ fullName: "Họ tên là bắt buộc" });
            });
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
                expect(err.errors).toEqual({ phone: "Số điện thoại phải có 10 số" });
            });
        })
        it("Trả về lỗi Phone: Không nhập trường phone", async () => {
            const {phone, ...user} = mockUser
            const result = UserService.createUser(user);

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ phone: "Số điện thoại là bắt buộc" });
            });
        })
        it("Trả về lỗi Role: Nhập sai role", async () => {
            const user = createMockUser({role: "Abc"});
            const result = UserService.createUser(user);

            await expect(result).rejects.toThrow(ZodValidationError);
            await result.catch((err) => {
                expect(err.errors).toEqual({ role: "Role không hợp lệ" });
            });
        })
        it("Mongoose trả lỗi khi mất kết nỗi mạng hoặc timeout", async () => {
            vi.spyOn(UserModel, 'findOne').mockRejectedValue(databaseConnectionError)
            await expect(UserService.createUser({ ...mockUser })).rejects.toThrow(databaseConnectionError)
            expect(UserModel.findOne).toHaveBeenCalledWith({ email: mockUser.email });
        })
    });

    describe("getAllUser", () => {
        it(`Tìm tất cả user khi database có bản ghi,
            Kiểm trả khi dữ liệu trả về không nhận về password,
            Kiểm tra sắp xếp khi dữ liệu trả về,
            Database function gọi đúng thứ tự find -> select -> sort`, async () => {
            const mockSort = vi.fn().mockReturnValue(mockUsers)
            const mockSelect = vi.fn().mockReturnValue({ sort: mockSort })
            const mockFind = vi.spyOn(UserModel, 'find').mockReturnValue({ select: mockSelect })
            const result = await UserService.getAllUsers();
            expect(result).toEqual(mockUsers)
            expect(mockFind).toHaveBeenCalledTimes(1)
            expect(mockFind).toHaveBeenCalledWith()
            expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 })
            expect(mockSort).toHaveBeenCalledTimes(1)
            expect(mockSelect).toHaveBeenCalledTimes(1)
            expect(mockSelect).toHaveBeenCalledWith("-password")
        })
        it("Tìm tất cả user khi database không có bản ghi", async () => {
            const mockSort = vi.fn().mockReturnValue([])
            const mockSelect = vi.fn().mockReturnValue({ sort: mockSort })
            const mockFind = vi.spyOn(UserModel, 'find').mockReturnValue({ select: mockSelect })
            const result = await UserService.getAllUsers();
            expect(result).toEqual([])
            expect(mockFind).toHaveBeenCalledTimes(1)
        })
        it("Mongoose trả lỗi khi mất kết nỗi mạng hoặc timeout", async () => {
            const mockSort = vi.fn().mockRejectedValue(databaseConnectionError);
            const mockSelect = vi.fn().mockReturnValue({ sort: mockSort });
            vi.spyOn(UserModel, 'find').mockReturnValue({ select: mockSelect });
            await expect(UserService.getAllUsers()).rejects.toThrow(databaseConnectionError)
            expect(UserModel.find).toHaveBeenCalled();
            expect(mockSelect).toHaveBeenCalledWith("-password")
            expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
        })
    })

    describe("getUserById", () => {
        it(`Tìm user theo id khi database có bản ghi,
             Kiểm trả khi dữ liệu trả về không nhận về password,
             Database function gọi đúng thứ tự findById -> select`, async () => {
            const {password, ...user} = mockUser
            const mockSelect = vi.fn().mockReturnValue(user)
            const mockFindById = vi.spyOn(UserModel, 'findById').mockReturnValue({ select: mockSelect })
            const result = await UserService.getUserById("69981dfa6a264a99712a404d")
            expect(result).toEqual(user)
            expect(mockFindById).toHaveBeenCalledTimes(1)
            expect(mockFindById).toHaveBeenCalledWith("69981dfa6a264a99712a404d")
            expect(mockSelect).toHaveBeenCalledTimes(1)
            expect(mockSelect).toHaveBeenCalledWith('-password')
            expect(result).not.toHaveProperty('password')
        })
        it("Tìm user theo id khi database không có bản ghi", async () => {
            const mockSelect = vi.fn().mockReturnValue(null)
            const mockFindById = vi.spyOn(UserModel, 'findById').mockReturnValue({ select: mockSelect })
            const result = await UserService.getUserById("69981dfa6a264a99712a40ee")
            expect(result).toBeNull()
            expect(mockFindById).toHaveBeenCalledTimes(1)
            expect(mockFindById).toHaveBeenCalledWith("69981dfa6a264a99712a40ee")
            expect(mockSelect).toHaveBeenCalledTimes(1)
            expect(mockSelect).toHaveBeenCalledWith('-password')
        })
        it("Không truyền vào id hoặc id toàn khoảng trắng khi tìm user", async () => {
            await expect(UserService.getUserById("     ")).rejects.toThrow(Error)
        })
        it("Tim user theo id khi id không hợp lệ", async () => {
            await expect(UserService.getUserById("1")).rejects.toThrow(Error)
        })
        it("Mongoose trả lỗi khi mất kết nỗi mạng hoặc timeout", async () => {
            const mockSelect = vi.fn().mockRejectedValue(databaseConnectionError);
            vi.spyOn(UserModel, 'findById').mockReturnValue({ select: mockSelect });
            await expect(UserService.getUserById("69981dfa6a264a99712a40ee")).rejects.toThrow(databaseConnectionError)
            expect(UserModel.findById).toHaveBeenCalled();
            expect(mockSelect).toHaveBeenCalledWith("-password")
        })
    })
});