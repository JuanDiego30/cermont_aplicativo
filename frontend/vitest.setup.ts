import { vi } from "vitest";
import "@testing-library/jest-dom";

vi.stubEnv("BACKEND_URL", "http://127.0.0.1:5000");

// Default: return null (no session) - tests requiring session must override
vi.mock("@/lib/auth/session", () => ({
	getSession: vi.fn().mockResolvedValue(null),
	getRequiredSession: vi.fn().mockRejectedValue(new Error("No session")),
	auth: vi.fn().mockResolvedValue(null),
}));

// Mock next-auth
vi.mock("next-auth", () => ({
	default: vi.fn(),
	getServerSession: vi.fn().mockResolvedValue(null),
}));
