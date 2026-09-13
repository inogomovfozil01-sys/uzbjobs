import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export type EmployerNotificationMode = "OFF" | "MANUAL" | "AUTOMATIC";

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
      } catch (err) {
        console.error("Failed to initialize Nodemailer transporter:", err);
        this.transporter = null;
      }
    } else {
      this.transporter = null;
    }
  }

  public isConfigured(): boolean {
    return Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    );
  }

  public async getNotificationMode(): Promise<EmployerNotificationMode> {
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: "EMPLOYER_NOTIFICATION_MODE" },
      });
      if (setting && ["OFF", "MANUAL", "AUTOMATIC"].includes(setting.value)) {
        return setting.value as EmployerNotificationMode;
      }
    } catch {}
    return "MANUAL";
  }

  public async sendEmployerNotification({
    toEmail,
    vacancyTitle,
    sourceUrl,
    vacancyId,
  }: {
    toEmail: string;
    vacancyTitle: string;
    sourceUrl: string;
    vacancyId: string;
  }): Promise<{ success: boolean; message: string }> {
    // Check if recipient opted out
    const optedOut = await prisma.emailLog.findFirst({
      where: {
        recipient: toEmail,
        status: "OPTED_OUT",
      },
    });

    if (optedOut) {
      return { success: false, message: "Работодатель отписался от уведомлений (opt-out)" };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://uzbjobs.uz";
    const optOutUrl = `${appUrl}/opt-out?email=${encodeURIComponent(toEmail)}`;

    const subject = `Вакансия «${vacancyTitle}» добавлена в каталог UzbJobs`;
    const textContent = `Здравствуйте!

Мы обнаружили опубликованную вами вакансию и добавили её в каталог UzbJobs, чтобы соискателям из Узбекистана было проще находить актуальные предложения работы.

Ваша вакансия:
${vacancyTitle}

Источник:
${sourceUrl}

Если вы не хотите, чтобы вакансия отображалась на UzbJobs, вы можете перейти по ссылке для исключения из каталога:
${optOutUrl}

Или связаться с нами по обратной связи.

С уважением,
Команда UzbJobs`;

    if (!this.isConfigured() || !this.transporter) {
      // Log as not configured
      try {
        await prisma.emailLog.create({
          data: {
            recipient: toEmail,
            subject,
            type: "EMPLOYER_NOTIFICATION",
            status: "FAILED",
            error: "SMTP not configured",
          },
        });
      } catch {}
      return { success: false, message: "SMTP почтовый сервер не настроен" };
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || "UzbJobs <noreply@uzbjobs.uz>",
        to: toEmail,
        subject,
        text: textContent,
      });

      await prisma.emailLog.create({
        data: {
          recipient: toEmail,
          subject,
          type: "EMPLOYER_NOTIFICATION",
          status: "SENT",
        },
      });

      return { success: true, message: `Уведомление успешно отправлено (${info.messageId})` };
    } catch (err: any) {
      await prisma.emailLog.create({
        data: {
          recipient: toEmail,
          subject,
          type: "EMPLOYER_NOTIFICATION",
          status: "FAILED",
          error: err.message,
        },
      });
      return { success: false, message: `Ошибка отправки email: ${err.message}` };
    }
  }

  /**
   * Probe SMTP connection for integrations status page.
   */
  public async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    if (!this.isConfigured()) {
      return { success: false, latencyMs: 0, message: "SMTP_HOST / SMTP_USER / SMTP_PASSWORD не заданы" };
    }
    const start = Date.now();
    try {
      if (!this.transporter) this.initTransporter();
      await this.transporter!.verify();
      return {
        success: true,
        latencyMs: Date.now() - start,
        message: "SMTP соединение успешно проверено",
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        message: err.message || "Ошибка подключения к SMTP серверу",
      };
    }
  }
}

export const emailService = new EmailService();
export default emailService;
