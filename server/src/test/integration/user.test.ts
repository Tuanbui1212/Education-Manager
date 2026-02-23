import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { UserService } from '../../services/user.service';
import { mockUserResponse, mockUser } from '../mocks/userService.mock';
import { verifyToken, checkAdmin } from '../../middlewares/auth.middleware';

// Mock UserService
vi.mock('../../services/user.service');

// Mock Auth Middleware
vi.mock('../../middlewares/auth.middleware', () => ({
    verifyToken: vi.fn((req, res, next) => {
        (req as any).user = { role: 'ADMIN' };
        next();
    }),
    checkAdmin: vi.fn((req, res, next) => next()),
}));

describe('User API Integration Tests', () => {
    const validId = '69981dfa6a264a99712a404d';
    const invalidId = '000000000000000000000000';

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(verifyToken).mockImplementation((req, res, next): any => {
            (req as any).user = { role: 'ADMIN' };
            return next();
        });
        vi.mocked(checkAdmin).mockImplementation((req, res, next): any => next());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Authorization & Authentication', () => {
        it('Trả về 401: Khi không có Token (verifyToken failed)', async () => {
            vi.mocked(verifyToken).mockImplementationOnce((req, res, next) => {
                return res.status(401).json({ message: 'Không tìm thấy mã xác thực!' });
            });

            const response = await request(app).get('/api/users');
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Không tìm thấy mã xác thực!');
        });

        it('Trả về 403: Khi Token không hợp lệ hoặc hết hạn', async () => {
            vi.mocked(verifyToken).mockImplementationOnce((req, res, next) => {
                return res.status(403).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn Token!' });
            });

            const response = await request(app).get('/api/users');
            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Mã xác thực không hợp lệ hoặc đã hết hạn Token!');
        });

        it('Trả về 403: Khi role không phải ADMIN (checkAdmin failed)', async () => {
            vi.mocked(verifyToken).mockImplementationOnce((req, _res, next): any => {
                (req as any).user = { role: 'STUDENT' };
                return next();
            });
            vi.mocked(checkAdmin).mockImplementationOnce((req, res, next): any => {
                return res.status(403).json({ message: 'Chỉ ADMIN mới có quyền này!' });
            });

            const response = await request(app).get('/api/users');
            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Chỉ ADMIN mới có quyền này!');
        });
    });

    describe('POST /api/users (Create User)', () => {
        it(`Tạo User thành công với dữ liệu hợp lệ,
            Email: Tạo user với email hợp lệ,
            Password: Tạo user thành công với mật khẩu 6 ký tự,
            Password: Tạo user thành công và trả về hash password,
            Fullname: Tạo user thành công với tên 2 ký tự,
            Phone: Tạo user thành công với số điện thoại 10 số,
            Role: Không nhập trường role`, async () => {
            vi.spyOn(UserService.prototype, 'createUser').mockResolvedValue({
                ...mockUserResponse,
                ...mockUser,
                password: 'hashed_password_123',
            } as any);

            const response = await request(app).post('/api/users').send(mockUser);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe(mockUser.email);
            expect(response.body.data.password).toBe('hashed_password_123');
        });

        it("Email: Tạo User với email 50 ký tự", async () => {
            vi.spyOn(UserService.prototype, 'createUser').mockResolvedValue({
                ...mockUserResponse,
                ...mockUser,
                email: "test@gmail.loremipsumdolorsitametconsectetueradipi",
                password: 'hashed_password_123',
            } as any);

            const response = await request(app).post('/api/users').send({ ...mockUser, email: "test@gmail.loremipsumdolorsitametconsectetueradipi" });

            expect(response.status).toBe(201);
            expect(response.body.data.email).toBe("test@gmail.loremipsumdolorsitametconsectetueradipi");
        });

        it(`Email: Tạo User với email tồn tại,
            Email: Tạo User với email 51 ký tự,
            Email: Định dạng sai,
            Email: Rỗng hoặc Null hoặc toàn khoảng trắng,
            Email: Không nhập trường email`, async () => {
            vi.spyOn(UserService.prototype, 'createUser').mockRejectedValue(new Error('Email đã tồn tại trong hệ thống!'));
            const resExist = await request(app).post('/api/users').send({ ...mockUser });
            expect(resExist.status).toBe(400);
            expect(resExist.body.message).toBe('Email đã tồn tại trong hệ thống!');

            const resLong = await request(app).post('/api/users').send({ ...mockUser, email: "test@gmail.loremipsumdolorsitametconsectetueradipis" });
            expect(resLong.status).toBe(400);

            const resFormat = await request(app).post('/api/users').send({ ...mockUser, email: "wrongformat" });
            expect(resFormat.status).toBe(400);
        });

        it(`Password: Tạo user thành công với mật khẩu 50 ký tự`, async () => {
            vi.spyOn(UserService.prototype, 'createUser').mockResolvedValue({
                ...mockUserResponse,
                ...mockUser,
                password: 'hashed_password_123',
            } as any);

            const response = await request(app).post('/api/users').send({ ...mockUser, password: "12345678901234567890123456789012345678901234567890" });

            expect(response.status).toBe(201);
            expect(response.body.data.password).toBe('hashed_password_123');
        });

        it(`Password: Nhập password với 5 ký tự,
            Password: Nhập password với 51 ký tự,
            Password: Rỗng hoặc Null hoặc toàn khoảng trắng,
            Password: Không nhập trường password`, async () => {
            const scenarios = [{ password: '12345' }, { password: 'a'.repeat(51) }, { password: '     ' }, { password: undefined }];
            for (const data of scenarios) {
                const res = await request(app).post('/api/users').send({ ...mockUser, ...data });
                expect(res.status).toBe(400);
            }
        });

        it(`Fullname: Nhập họ tên với 1 ký tự,
            Fullname: Nhập họ tên với 51 ký tự,
            Fullname: Nhập họ tên rỗng hoặc Null hoặc toàn khoảng trắng,
            Fullname: Không nhập trường Fullname`, async () => {
            const scenarios = [{ fullName: 'A' }, { fullName: 'a'.repeat(51) }, { fullName: '     ' }, { fullName: undefined }];
            for (const data of scenarios) {
                const res = await request(app).post('/api/users').send({ ...mockUser, ...data });
                expect(res.status).toBe(400);
            }
        });

        it(`Phone: Nhập số điện thoại với 9 số,
            Phone: Nhập số điện thoại với 11 số,
            Phone: Nhập số điện thoại rỗng hoặc Null hoặc toàn khoảng trắng,
            Phone: Không nhập trường số điện thoại`, async () => {
            const scenarios = [{ phone: '123456789' }, { phone: '12345678901' }, { phone: '     ' }, { phone: undefined }];
            for (const data of scenarios) {
                const res = await request(app).post('/api/users').send({ ...mockUser, ...data });
                expect(res.status).toBe(400);
            }
        });
    });

    describe('GET /api/users (GetAllUser)', () => {
        it(`Tìm tất cả user khi database có bản ghi,
            Kiểm trả khi dữ liệu trả về không nhận về password,
            Kiểm tra sắp xếp khi dữ liệu trả về`, async () => {
            vi.spyOn(UserService.prototype, 'getAllUsers').mockResolvedValue([mockUserResponse] as any);
            const response = await request(app).get('/api/users');
            expect(response.status).toBe(200);
            expect(response.body.data[0]).not.toHaveProperty('password');
        });

        it("Tìm tất cả user khi database không có bản ghi", async () => {
            vi.spyOn(UserService.prototype, 'getAllUsers').mockResolvedValue([]);
            const response = await request(app).get('/api/users');
            expect(response.status).toBe(200);
            expect(response.body.data).toEqual([]);
        });
    });

    describe('GET /api/users/:id (GetUserById)', () => {
        it(`Tìm user theo id khi database có bản ghi, 
            Kiểm trả khi dữ liệu trả về không nhận về password`, async () => {
            vi.spyOn(UserService.prototype, 'getUserById').mockResolvedValue(mockUserResponse as any);
            const response = await request(app).get(`/api/users/${validId}`);
            expect(response.status).toBe(200);
            expect(response.body.data).not.toHaveProperty('password');
        });

        it(`Tìm user theo id khi database không có bản ghi`, async () => {
            vi.spyOn(UserService.prototype, 'getUserById').mockResolvedValue(null);
            const response = await request(app).get(`/api/users/${invalidId}`);
            expect(response.status).toBe(404);
        });

        it(`Sai định dạng ObjectId hoặc ID rỗng`, async () => {
            const resFormat = await request(app).get('/api/users/1');
            expect(resFormat.status).toBe(400);

            const resEmpty = await request(app).get("/api/users/%20%20%20%20");
            expect(resEmpty.status).toBe(400);
        });
    });

    describe('PUT /api/users/:id (UpdateUser)', () => {
        it(`Cập nhật user thành công với dữ liệu hợp lệ,
            Kiểm tra khi dữ liệu trả về không nhận về password`, async () => {
            const updateData = { fullName: "Nguyen Van A", phone: "0123456789" };
            vi.spyOn(UserService.prototype, 'updateUser').mockResolvedValue({ ...mockUserResponse, ...updateData, _id: validId, password: undefined } as any);

            const response = await request(app).put(`/api/users/${validId}`).send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.data).not.toHaveProperty('password');
            expect(response.body.data.fullName).toBe(updateData.fullName);
        });

        it('Id: Lỗi khi không có bản ghi hoặc sai định dạng', async () => {
            vi.spyOn(UserService.prototype, 'updateUser').mockResolvedValue(null);
            const resMissing = await request(app).put(`/api/users/${invalidId}`).send({ fullName: 'Update' });
            expect(resMissing.status).toBe(404);

            const resFormat = await request(app).put('/api/users/invalid-id').send({});
            expect(resFormat.status).toBe(400);
        });
    });

    describe('DELETE /api/users/:id (DeleteUser)', () => {
        it('Xóa user theo id khi database có bản ghi', async () => {
            vi.spyOn(UserService.prototype, 'deleteUser').mockResolvedValue(mockUserResponse as any);
            const response = await request(app).delete(`/api/users/${validId}`);
            expect(response.status).toBe(200);
        });

        it('Sai định dạng ObjectId', async () => {
            const response = await request(app).delete('/api/users/invalid-id');
            expect(response.status).toBe(400);
        });
    });
});
