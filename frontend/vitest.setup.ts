import { vi } from "vitest";

vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3000/api/proxy");

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
