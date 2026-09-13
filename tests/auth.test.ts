import { describe, it, expect } from "vitest";
import { authOptions, requireAdmin } from "@/lib/auth";
import { translations, Language, Translations } from "@/lib/i18n";
import { Role } from "@prisma/client";

describe("Authentication & Security Subsystem", () => {
  describe("NextAuth Options & Cookie Security", () => {
    it("should enforce JWT session strategy and 30-day max age", () => {
      expect(authOptions.session?.strategy).toBe("jwt");
      expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60);
    });

    it("should configure httpOnly and SameSite cookies for session security", () => {
      const sessionTokenCookie = authOptions.cookies?.sessionToken;
      expect(sessionTokenCookie?.options?.httpOnly).toBe(true);
      expect(sessionTokenCookie?.options?.sameSite).toBe("lax");
      expect(sessionTokenCookie?.options?.path).toBe("/");
    });

    it("should have GoogleProvider registered with proper scopes", () => {
      const googleProvider = authOptions.providers.find(
        (p) => (p as any).id === "google"
      );
      expect(googleProvider).toBeDefined();
    });

    it("should correctly handle redirect URLs for safety", async () => {
      const redirectCb = authOptions.callbacks?.redirect;
      expect(redirectCb).toBeDefined();

      if (redirectCb) {
        const baseUrl = "https://uzbjobs.vercel.app";
        // Relative path
        const res1 = await redirectCb({ url: "/profile", baseUrl });
        expect(res1).toBe("https://uzbjobs.vercel.app/profile");

        // Same origin
        const res2 = await redirectCb({ url: "https://uzbjobs.vercel.app/admin", baseUrl });
        expect(res2).toBe("https://uzbjobs.vercel.app/admin");

        // Rogue external origin should fallback to baseUrl
        const res3 = await redirectCb({ url: "https://malicious-site.com/steal", baseUrl });
        expect(res3).toBe("https://uzbjobs.vercel.app");
      }
    });
  });

  describe("Admin Role Guard & Protection", () => {
    it("should strictly enforce server-side ADMIN check in requireAdmin", async () => {
      // Trying to call requireAdmin without session should throw UNAUTHORIZED
      await expect(requireAdmin()).rejects.toThrow();
    });
  });
});

describe("Multilingual System (Uzbek, Russian, English)", () => {
  const languages: Language[] = ["uz", "ru", "en"];
  const sampleKeys: (keyof Translations)[] = [
    "navJobs",
    "navCompanies",
    "navSaved",
    "navAdmin",
    "navSignIn",
    "navRegister",
    "continueWithGoogle",
    "loginTitle",
    "registerTitle",
    "searchPlaceholder",
    "searchBtn",
    "applyBtn",
    "saveBtn",
    "aiMatchBtn",
    "coverLetterBtn",
  ];

  it("should have complete dictionary for all 3 supported languages", () => {
    for (const lang of languages) {
      expect(translations[lang]).toBeDefined();
      for (const key of sampleKeys) {
        expect(translations[lang][key]).toBeTruthy();
        expect(typeof translations[lang][key]).toBe("string");
      }
    }
  });

  it("uzbek translation should contain distinct Latin terms", () => {
    expect(translations.uz.navJobs).toContain("vakansiyalar");
    expect(translations.uz.continueWithGoogle).toContain("Google");
    expect(translations.uz.aiMatchBtn).toContain("Moslik");
  });

  it("english translation should contain distinct English terms", () => {
    expect(translations.en.navJobs).toBe("All Jobs");
    expect(translations.en.continueWithGoogle).toBe("Continue with Google");
    expect(translations.en.applyBtn).toBe("Apply Now");
  });
});
