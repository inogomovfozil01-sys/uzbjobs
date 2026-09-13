import dns from "node:dns/promises";
import net from "node:net";

export interface SSRFCheckResult {
  allowed: boolean;
  reason?: string;
  ip?: string;
}

const BLOCKED_HOSTNAMES = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "169.254.169.254",
  "instance-data",
];

const BLOCKED_DOMAINS_SUFFIXES = [
  ".localhost",
  ".local",
  ".internal",
  ".lan",
  ".arpa",
];

/**
 * Checks if an IPv4 address is in a private, loopback, or reserved range.
 */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // invalid format -> reject
  }

  const [a, b] = parts;

  // 0.0.0.0/8
  if (a === 0) return true;
  // 10.0.0.0/8
  if (a === 10) return true;
  // 127.0.0.0/8 (loopback)
  if (a === 127) return true;
  // 169.254.0.0/16 (link-local, cloud metadata)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;
  // 100.64.0.0/10 (carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0 && parts[2] === 2) return true;
  // 198.51.100.0/24 (TEST-NET-2)
  if (a === 198 && b === 51 && parts[2] === 100) return true;
  // 203.0.113.0/24 (TEST-NET-3)
  if (a === 203 && b === 0 && parts[2] === 113) return true;
  // 224.0.0.0/4 (multicast)
  if (a >= 224 && a <= 239) return true;
  // 240.0.0.0/4 (reserved)
  if (a >= 240) return true;

  return false;
}

/**
 * Checks if an IPv6 address is in a private, loopback, or reserved range.
 */
export function isPrivateIPv6(ip: string): boolean {
  const clean = ip.toLowerCase();
  if (clean === "::1" || clean === "::") return true;
  // Link-local unicast fe80::/10
  if (clean.startsWith("fe8") || clean.startsWith("fe9") || clean.startsWith("fea") || clean.startsWith("feb")) return true;
  // Unique local addresses fc00::/7
  if (clean.startsWith("fc") || clean.startsWith("fd")) return true;
  // IPv4-mapped IPv6 (::ffff:x.x.x.x)
  if (clean.startsWith("::ffff:")) {
    const ipv4 = clean.replace("::ffff:", "");
    return isPrivateIPv4(ipv4);
  }
  return false;
}

/**
 * Validates a target URL against SSRF vulnerabilities before fetching.
 */
export async function validateUrlForSSRF(rawUrl: string): Promise<SSRFCheckResult> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { allowed: false, reason: "Malformed URL" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { allowed: false, reason: `Unsupported protocol: ${parsed.protocol}` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Check static blocklist
  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    return { allowed: false, reason: `Blocked hostname: ${hostname}` };
  }

  for (const suffix of BLOCKED_DOMAINS_SUFFIXES) {
    if (hostname.endsWith(suffix)) {
      return { allowed: false, reason: `Blocked internal domain suffix: ${suffix}` };
    }
  }

  // If hostname is directly an IP
  if (net.isIPv4(hostname)) {
    if (isPrivateIPv4(hostname)) {
      return { allowed: false, reason: `Blocked private IPv4: ${hostname}`, ip: hostname };
    }
    return { allowed: true, ip: hostname };
  }

  if (net.isIPv6(hostname)) {
    if (isPrivateIPv6(hostname)) {
      return { allowed: false, reason: `Blocked private IPv6: ${hostname}`, ip: hostname };
    }
    return { allowed: true, ip: hostname };
  }

  // Resolve hostname via DNS to prevent DNS rebinding or internal resolving
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const record of addresses) {
      if (record.family === 4 && isPrivateIPv4(record.address)) {
        return { allowed: false, reason: `Hostname resolves to private IP: ${record.address}`, ip: record.address };
      }
      if (record.family === 6 && isPrivateIPv6(record.address)) {
        return { allowed: false, reason: `Hostname resolves to private IPv6: ${record.address}`, ip: record.address };
      }
    }
    return { allowed: true, ip: addresses[0]?.address };
  } catch (err: any) {
    return { allowed: false, reason: `DNS lookup failed: ${err.message}` };
  }
}

/**
 * Safely fetches a web page with timeout and size limits (max 2MB).
 */
export async function safeFetchHtml(url: string, timeoutMs: number = 8000): Promise<{ html: string; status: number }> {
  const ssrfCheck = await validateUrlForSSRF(url);
  if (!ssrfCheck.allowed) {
    throw new Error(`SSRF validation rejected URL: ${ssrfCheck.reason}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "UzbJobs-Bot/1.0 (+https://uzbjobs.uz; vacancy aggregator)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ru-RU,ru;q=0.9,uz;q=0.8,en;q=0.7",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return { html: "", status: response.status };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml") && !contentType.includes("text/plain")) {
      return { html: "", status: response.status };
    }

    // Limit read size to 2MB to prevent memory exhaustion
    const reader = response.body?.getReader();
    if (!reader) {
      const text = await response.text();
      return { html: text.slice(0, 2 * 1024 * 1024), status: response.status };
    }

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    const MAX_BYTES = 2 * 1024 * 1024;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        totalBytes += value.length;
        if (totalBytes >= MAX_BYTES) {
          controller.abort();
          break;
        }
      }
    }

    const decoder = new TextDecoder("utf-8", { fatal: false });
    const buffer = Buffer.concat(chunks);
    const html = decoder.decode(buffer);

    return { html, status: response.status };
  } finally {
    clearTimeout(timer);
  }
}
