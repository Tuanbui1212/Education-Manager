import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "@/services/user.service";
import { UserModel } from "@/models/user.model";

// Mock UserModel
vi.mock("@/models/user.model", () => ({
    UserModel: {
        find: vi.fn(),
        findById: vi.fn(),
        findOne: vi.fn(),
        findByIdAndUpdate: vi.fn(),
        findByIdAndDelete: vi.fn(),
    },
}));

describe("UserService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getAllUsers", () => {
        it("Should return list of users (excluding password)", async () => {
            const mockUsers = [
                { _id: "1", name: "User 1", email: "user1@test.com" },
                { _id: "2", name: "User 2", email: "user2@test.com" },
            ];

            const mockSort = vi.fn().mockResolvedValue(mockUsers);
            const mockSelect = vi.fn().mockReturnValue({ sort: mockSort });
            (UserModel.find as any).mockReturnValue({ select: mockSelect });

            const result = await UserService.getAllUsers();

            expect(UserModel.find).toHaveBeenCalled();
            expect(mockSelect).toHaveBeenCalledWith("-password");
            expect(result).toEqual(mockUsers);
        });
    });

    describe("getUserById", () => {
        it("Should return user information when ID is found", async () => {
            const mockUser = { _id: "1", name: "User 1", email: "user1@test.com" };

            const mockSelect = vi.fn().mockResolvedValue(mockUser);
            (UserModel.findById as any).mockReturnValue({ select: mockSelect });

            const result = await UserService.getUserById("1");

            expect(UserModel.findById).toHaveBeenCalledWith("1");
            expect(result).toEqual(mockUser);
        });

        it("Should return null if ID is not found", async () => {
            const mockSelect = vi.fn().mockResolvedValue(null);
            (UserModel.findById as any).mockReturnValue({ select: mockSelect });

            const result = await UserService.getUserById("999");

            expect(result).toBeNull();
        });
    });
});
