import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobQuerySchema } from "@/validators/job";
import { VacancyStatus, Prisma } from "@prisma/client";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, "jobs_search", RATE_LIMITS.SEARCH_GUEST);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Превышен лимит запросов поиска. Попробуйте позже." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const queryObj = Object.fromEntries(searchParams.entries());
  const parsed = JobQuerySchema.safeParse(queryObj);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные параметры поиска", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const {
    q,
    city,
    remote,
    experience,
    type,
    category,
    minSalary,
    maxSalary,
    company,
    sort,
    page,
    limit,
  } = parsed.data;

  const where: Prisma.VacancyWhereInput = {
    status: VacancyStatus.ACTIVE,
  };

  // Keyword search across title, description, skills, company
  if (q && q.trim().length > 0) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
      { skills: { hasSome: [q.trim()] } },
    ];
  }

  // City filter
  if (city && city !== "all") {
    where.city = { contains: city, mode: "insensitive" };
  }

  // Remote filter
  if (remote === "true") {
    where.isRemote = true;
  } else if (remote === "false") {
    where.isRemote = false;
  }

  // Experience level
  if (experience && experience !== "all") {
    where.experienceLevel = { equals: experience, mode: "insensitive" };
  }

  // Employment type
  if (type && type !== "all") {
    where.employmentType = { contains: type, mode: "insensitive" };
  }

  // Category
  if (category && category !== "all") {
    where.category = { contains: category, mode: "insensitive" };
  }

  // Company
  if (company) {
    where.companyName = { contains: company, mode: "insensitive" };
  }

  // Salary range
  if (minSalary !== undefined) {
    where.salaryMin = { gte: minSalary };
  }
  if (maxSalary !== undefined) {
    where.salaryMax = { lte: maxSalary };
  }

  // Ordering
  let orderBy: Prisma.VacancyOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "salary") {
    orderBy = { salaryMax: "desc" };
  } else if (sort === "relevance") {
    orderBy = { qualityScore: "desc" };
  }

  const skip = (page - 1) * limit;

  try {
    const [vacancies, total] = await Promise.all([
      prisma.vacancy.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              city: true,
              isVerified: true,
            },
          },
        },
      }),
      prisma.vacancy.count({ where }),
    ]);

    return NextResponse.json({
      vacancies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Error fetching vacancies:", err);
    return NextResponse.json(
      { error: "Ошибка при получении вакансий", vacancies: [], pagination: { total: 0, page: 1, limit, totalPages: 0 } },
      { status: 500 }
    );
  }
}
