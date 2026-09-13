import { z } from "zod";

export const ModerationCategoryEnum = z.enum([
  "CLEAN",
  "ADULT_CONTENT",
  "SEXUAL_SERVICES",
  "ESCORT",
  "PORNOGRAPHIC",
  "SUSPICIOUS",
  "PROMPT_INJECTION_ATTEMPT",
]);

export type ModerationCategory = z.infer<typeof ModerationCategoryEnum>;

export const ModerationDecisionEnum = z.enum(["SAFE", "REVIEW", "BLOCKED"]);
export type ModerationDecision = z.infer<typeof ModerationDecisionEnum>;

export const ModerationResultSchema = z.object({
  allowed: z.boolean().default(true),
  adultContent: z.boolean().default(false),
  sexualServices: z.boolean().default(false),
  pornographic: z.boolean().default(false),
  escort: z.boolean().default(false),
  unsafe: z.boolean().default(false),
  confidence: z.number().min(0).max(1).default(0.9),
  category: ModerationCategoryEnum.default("CLEAN"),
  decision: ModerationDecisionEnum.default("SAFE"),
  reason: z.string().nullable().default(null),
});

export type ModerationResult = z.infer<typeof ModerationResultSchema>;
