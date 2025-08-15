import { describe, expect, test, vi, beforeEach } from 'vitest';
import DbService from '../../../src/services/database.service';
import { PrismaClient } from '@prisma/client/extension';

import bcrypt from "bcrypt";

const prismaMock = {
    user: {
        create: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
    }
} as PrismaClient;

const db = new DbService(prismaMock);

describe("registerUser", async () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("Should register and insert a user", async () => {
        const user1 = {
            login: "user1",
            hashedPassword: "someHashedPassword",
            isAdmin: true,
        }

        prismaMock.user.create.mockResolvedValue(user1);

        const result = await db.registerUser({
            login: user1.login,
            password: user1.hashedPassword
        });

        expect(result).toEqual({ user: user1 });
        expect(prismaMock.user.create).toHaveBeenCalledWith({
            data: {
                login: user1.login,
                hashedPassword: expect.any(String),
                isAdmin: true,
            }
        });

        //check if hashed passwords matches
        const [[callArgs]] = prismaMock.user.create.mock.calls;
        const matchPasswords = await bcrypt.compare(
            user1.hashedPassword,
            callArgs.data.hashedPassword,
        );
        expect(matchPasswords).toBe(true);
    });

    test("Should return the correct data about user", async () => {
        const mockUser = { id: 1, login: "admin", hashedPassword: "hash" };
        prismaMock.user.findUnique.mockResolvedValue(mockUser);

        const result = await db.getUserByLogin("admin");

        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
            where: { login: "admin" },
        });
        expect(result).toEqual(mockUser);
    });

    test("Should retrn by id correct user", async () => {
        const user1 = { id: 36, login: "someUsername", hashedPassword: "hashedPass" };
        prismaMock.user.findUnique.mockResolvedValue(user1);

        const result = await db.getUserById(user1.id);

        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
            where: { id: user1.id },
        });
        expect(result).toEqual(user1);
    });
});