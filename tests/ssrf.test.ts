import { describe, it, expect } from "vitest";
import { validateUrlForSSRF, isPrivateIPv4, isPrivateIPv6 } from "@/lib/security/ssrf";

describe("SSRF Security Defense", () => {
  it("should block private IPv4 addresses", () => {
    expect(isPrivateIPv4("127.0.0.1")).toBe(true);
    expect(isPrivateIPv4("10.0.0.1")).toBe(true);
    expect(isPrivateIPv4("172.16.0.1")).toBe(true);
    expect(isPrivateIPv4("192.168.1.1")).toBe(true);
    expect(isPrivateIPv4("169.254.169.254")).toBe(true);
    expect(isPrivateIPv4("0.0.0.0")).toBe(true);
  });

  it("should allow public IPv4 addresses", () => {
    expect(isPrivateIPv4("8.8.8.8")).toBe(false);
    expect(isPrivateIPv4("1.1.1.1")).toBe(false);
    expect(isPrivateIPv4("142.250.180.14")).toBe(false);
  });

  it("should block loopback and link-local IPv6", () => {
    expect(isPrivateIPv6("::1")).toBe(true);
    expect(isPrivateIPv6("fe80::1")).toBe(true);
    expect(isPrivateIPv6("fc00::1")).toBe(true);
  });

  it("should reject localhost, metadata, and loopback URLs", async () => {
    const res1 = await validateUrlForSSRF("http://localhost:3000/api");
    expect(res1.allowed).toBe(false);

    const res2 = await validateUrlForSSRF("http://127.0.0.1/admin");
    expect(res2.allowed).toBe(false);

    const res3 = await validateUrlForSSRF("http://169.254.169.254/latest/meta-data/");
    expect(res3.allowed).toBe(false);

    const res4 = await validateUrlForSSRF("http://metadata.google.internal/computeMetadata/v1/");
    expect(res4.allowed).toBe(false);
  });

  it("should reject invalid protocols", async () => {
    const resFile = await validateUrlForSSRF("file:///etc/passwd");
    expect(resFile.allowed).toBe(false);

    const resGopher = await validateUrlForSSRF("gopher://127.0.0.1:6379");
    expect(resGopher.allowed).toBe(false);
  });

  it("should allow valid public internet URLs", async () => {
    const res = await validateUrlForSSRF("https://example.com/careers/job-123");
    expect(res.allowed).toBe(true);
  });
});
