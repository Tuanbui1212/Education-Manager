import { UserRole } from "../../types/user.type";

export const mockUser = {
    fullName: 'An',
    email: 'valid@gmail.com',
    phone: '0912345678',
    password: '123456',
};

export const mockUsers = [
    {
        fullName: "User 1",
        email: "user1@test.com",
        phone: "1234567890",
    },
    {
        fullName: "User 2",
        email: "user2@test.com",
        phone: "3334442221",
    }
]

export const createMockUser = (overrides = {}) => ({
    ...mockUser,
    ...overrides,
});

export const databaseConnectionError = new Error("Lỗi server");

export const mockUserResponse = {
    _id: '69981dfa6a264a99712a404d',
    fullName: 'Nguyen Van A',
    email: 'test@gmail.com',
    phone: '0123456789',
    role: UserRole.STUDENT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};