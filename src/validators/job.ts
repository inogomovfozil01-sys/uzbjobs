import { z } from "zod";

export const JobQuerySchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  remote: z.enum(["true", "false", "all"]).optional(),
  experience: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  minSalary: z.coerce.number().optional(),
  maxSalary: z.coerce.number().optional(),
  company: z.string().optional(),
  sort: z.enum(["newest", "salary", "relevance"]).default("newest"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
});

export type JobQuery = z.infer<typeof JobQuerySchema>;

export const ReportSubmissionSchema = z.object({
  vacancyId: z.string().min(1, "Vacancy ID required"),
  reason: z.enum(["FAKE", "EXPIRED", "WRONG_INFO", "SPAM", "OTHER"]),
  details: z.string().max(1000).optional(),
});

export type ReportSubmission = z.infer<typeof ReportSubmissionSchema>;

export const ProfileUpdateSchema = z.object({
  headline: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  city: z.string().max(100).optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  experienceLevel: z.enum(["Junior", "Mid", "Senior", "Lead"]).optional(),
  education: z.string().max(300).optional(),
  desiredSalaryMin: z.number().min(0).optional(),
  desiredSalaryCurrency: z.string().default("USD"),
  employmentType: z.string().optional(),
  desiredCity: z.string().optional(),
  isRemoteOnly: z.boolean().default(false),
  skills: z.array(z.string()).default([]),
  resumeText: z.string().max(10000).optional(),
});

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

export const RegisterUserSchema = z.object({
  name: z.string().min(2, "Имя должно содержать от 2 символов"),
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Пароль должен быть от 6 символов"),
});

export type RegisterUser = z.infer<typeof RegisterUserSchema>;
