export const mockUser = {
    _id: "1",
    fullName: "An",
    email: "user1@test.com",
    password: "123456",
    phone: "1234567890",
};

export const mockUsers = [
    {
        _id: "34bc",
        fullName: "User 1",
        email: "user1@test.com",
        phone: "1234567890",
    },
    {
        _id: "12ab",
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