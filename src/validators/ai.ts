import { z } from "zod";

export const VacancyAnalysisSchema = z.object({
  title: z.string().default("Вакансия без названия"),
  company: z.string().nullable().default(null),
  description: z.string().default(""),
  shortDescription: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  salaryMin: z.number().nullable().default(null),
  salaryMax: z.number().nullable().default(null),
  salaryCurrency: z.string().nullable().default("UZS"),
  salaryText: z.string().nullable().default(null),
  employmentType: z.string().nullable().default("Full-time"),
  experienceLevel: z.string().nullable().default(null),
  skills: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  sourceUrl: z.string().default(""),
  sourceName: z.string().nullable().default(null),
  publishedAt: z.string().nullable().default(null),
  applicationUrl: z.string().nullable().default(null),
  contactEmail: z.string().nullable().default(null),
  contactPhone: z.string().nullable().default(null),
  isRemote: z.boolean().default(false),
  country: z.string().nullable().default("Uzbekistan"),
  city: z.string().nullable().default("Tashkent"),
  qualityScore: z.number().min(0).max(100).default(70),
  relevanceScore: z.number().min(0).max(100).default(70),
  isVacancy: z.boolean().default(true),
  isExpired: z.boolean().default(false),
  isDuplicateCandidate: z.boolean().default(false),
  confidence: z.number().min(0).max(1).default(0.8),
  category: z.string().nullable().default("IT / Software"),
});

export type VacancyAnalysis = z.infer<typeof VacancyAnalysisSchema>;

export const AIMatchResultSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  matchingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  experienceMatch: z.string(), // "Подходит", "Выше требуемого", "Ниже требуемого"
  salaryMatch: z.string(), // "Соответствует ожиданиям", "Ниже ожиданий", "Не указана"
  recommendations: z.array(z.string()),
});

export type AIMatchResult = z.infer<typeof AIMatchResultSchema>;

export const AICoverLetterRequestSchema = z.object({
  vacancyId: z.string(),
  language: z.enum(["Russian", "Uzbek", "English"]).default("Russian"),
  customNotes: z.string().optional(),
});

export type AICoverLetterRequest = z.infer<typeof AICoverLetterRequestSchema>;
