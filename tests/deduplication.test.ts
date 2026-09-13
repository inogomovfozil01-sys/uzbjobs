import { describe, it, expect } from "vitest";
import deduplicationService from "@/services/jobs/deduplicator";

describe("Deduplication Engine", () => {
  it("should normalize URLs by stripping tracking query params and fragments", () => {
    const raw = "https://hh.uz/vacancy/123456?utm_source=telegram&utm_medium=channel&from=chat#details";
    const normalized = deduplicationService.normalizeUrl(raw);

    expect(normalized).toBe("https://hh.uz/vacancy/123456");
  });

  it("should normalize hostnames to lowercase and drop trailing slashes", () => {
    const raw = "HTTPS://HH.UZ/careers/software-engineer/";
    const normalized = deduplicationService.normalizeUrl(raw);

    expect(normalized).toBe("https://hh.uz/careers/software-engineer");
  });

  it("should generate identical content hashes regardless of extra whitespace and casing", () => {
    const text1 = "We are hiring a Senior React Developer in Tashkent. Salary: $3000.";
    const text2 = "  we   are HIRING a senior react DEVELOPER in tashkent.   salary: $3000.  \n";

    const hash1 = deduplicationService.hashContent(text1);
    const hash2 = deduplicationService.hashContent(text2);

    expect(hash1).toBe(hash2);
  });
});
