import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/security/rate-limiter";

describe("Rate Limiter", () => {
  it("should allow requests within limit and reject once exhausted", () => {
    const config = { limit: 3, windowMs: 10000 };
    const clientId = "test-client-" + Math.random().toString(36);

    const r1 = checkRateLimit(clientId, "test", config);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(clientId, "test", config);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(clientId, "test", config);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);

    // 4th request must fail
    const r4 = checkRateLimit(clientId, "test", config);
    expect(r4.success).toBe(false);
    expect(r4.remaining).toBe(0);
  });
});
