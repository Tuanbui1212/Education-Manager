export const mockUser = {
    fullName: "User 1",
    email: "user1@test.com",
    password: "password",
    phone: "1234567890",
};

export const createMockUser = (overrides = {}) => ({
    ...mockUser,
    ...overrides,
});