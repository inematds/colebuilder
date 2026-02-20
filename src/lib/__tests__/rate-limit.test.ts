import { afterEach, describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "../rate-limit";

describe("createRateLimiter", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("allows requests under the limit", () => {
		const limiter = createRateLimiter(3, 60_000);
		const r1 = limiter.check("user1");
		const r2 = limiter.check("user1");
		const r3 = limiter.check("user1");

		expect(r1.success).toBe(true);
		expect(r1.remaining).toBe(2);
		expect(r2.success).toBe(true);
		expect(r2.remaining).toBe(1);
		expect(r3.success).toBe(true);
		expect(r3.remaining).toBe(0);
	});

	it("blocks requests over the limit", () => {
		const limiter = createRateLimiter(2, 60_000);
		limiter.check("user1");
		limiter.check("user1");
		const r3 = limiter.check("user1");

		expect(r3.success).toBe(false);
		expect(r3.remaining).toBe(0);
	});

	it("tracks different keys independently", () => {
		const limiter = createRateLimiter(1, 60_000);
		const r1 = limiter.check("user1");
		const r2 = limiter.check("user2");

		expect(r1.success).toBe(true);
		expect(r2.success).toBe(true);

		const r3 = limiter.check("user1");
		expect(r3.success).toBe(false);
	});

	it("resets after the window expires", () => {
		vi.useFakeTimers();
		const limiter = createRateLimiter(1, 1000);

		const r1 = limiter.check("user1");
		expect(r1.success).toBe(true);

		const r2 = limiter.check("user1");
		expect(r2.success).toBe(false);

		vi.advanceTimersByTime(1001);

		const r3 = limiter.check("user1");
		expect(r3.success).toBe(true);

		vi.useRealTimers();
	});
});
