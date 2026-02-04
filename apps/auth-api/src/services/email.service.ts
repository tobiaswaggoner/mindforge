import { config } from "../config.js";

export interface EmailService {
  sendVerificationEmail(to: string, token: string): Promise<void>;
  sendPasswordResetEmail(to: string, token: string): Promise<void>;
}

/**
 * Console email service for development (logs emails to console)
 */
export class ConsoleEmailService implements EmailService {
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verifyUrl = `${config.AUTH_UI_URL}/verify-email?token=${token}`;

    console.log("\n📧 === VERIFICATION EMAIL ===");
    console.log(`To: ${to}`);
    console.log(`Subject: Bestätige deine Email-Adresse`);
    console.log(`\nHallo,\n`);
    console.log(`bitte klicke auf den folgenden Link um deine Email-Adresse zu bestätigen:\n`);
    console.log(`  ${verifyUrl}\n`);
    console.log(`Der Link ist 24 Stunden gültig.\n`);
    console.log(`Falls du dich nicht bei MindForge registriert hast,`);
    console.log(`kannst du diese Email ignorieren.\n`);
    console.log(`Dein MindForge Team`);
    console.log("==============================\n");
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${config.AUTH_UI_URL}/reset-password?token=${token}`;

    console.log("\n📧 === PASSWORD RESET EMAIL ===");
    console.log(`To: ${to}`);
    console.log(`Subject: Passwort zurücksetzen`);
    console.log(`\nHallo,\n`);
    console.log(`du hast ein neues Passwort angefordert.`);
    console.log(`Klicke auf den folgenden Link:\n`);
    console.log(`  ${resetUrl}\n`);
    console.log(`Der Link ist 1 Stunde gültig.\n`);
    console.log(`Falls du kein neues Passwort angefordert hast,`);
    console.log(`kannst du diese Email ignorieren.\n`);
    console.log(`Dein MindForge Team`);
    console.log("================================\n");
  }
}

/**
 * Mailgun email service for production
 */
export class MailgunEmailService implements EmailService {
  private apiKey: string;
  private domain: string;
  private from: string;

  constructor() {
    if (!config.MAILGUN_API_KEY || !config.MAILGUN_DOMAIN) {
      throw new Error("Mailgun configuration missing");
    }
    this.apiKey = config.MAILGUN_API_KEY;
    this.domain = config.MAILGUN_DOMAIN;
    this.from = config.MAILGUN_FROM;
  }

  private async send(to: string, subject: string, text: string): Promise<void> {
    const url = `https://api.eu.mailgun.net/v3/${this.domain}/messages`;

    const formData = new FormData();
    formData.append("from", this.from);
    formData.append("to", to);
    formData.append("subject", subject);
    formData.append("text", text);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${this.apiKey}`).toString("base64")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mailgun error: ${error}`);
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verifyUrl = `${config.AUTH_UI_URL}/verify-email?token=${token}`;

    await this.send(
      to,
      "Bestätige deine Email-Adresse",
      `Hallo,

bitte klicke auf den folgenden Link um deine Email-Adresse zu bestätigen:

${verifyUrl}

Der Link ist 24 Stunden gültig.

Falls du dich nicht bei MindForge registriert hast,
kannst du diese Email ignorieren.

Dein MindForge Team`
    );
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${config.AUTH_UI_URL}/reset-password?token=${token}`;

    await this.send(
      to,
      "Passwort zurücksetzen",
      `Hallo,

du hast ein neues Passwort angefordert.
Klicke auf den folgenden Link:

${resetUrl}

Der Link ist 1 Stunde gültig.

Falls du kein neues Passwort angefordert hast,
kannst du diese Email ignorieren.

Dein MindForge Team`
    );
  }
}

/**
 * Create appropriate email service based on environment
 */
export function createEmailService(): EmailService {
  if (config.MAILGUN_API_KEY && config.MAILGUN_DOMAIN) {
    console.log("📧 Using Mailgun email service");
    return new MailgunEmailService();
  }

  console.log("📧 Using console email service (development mode)");
  return new ConsoleEmailService();
}
