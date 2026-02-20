export const mockUser = {
    fullName: "An",
    email: "user1@test.com",
    password: "123456",
    phone: "1234567890",
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