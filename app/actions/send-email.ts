"use server";

import nodemailer from "nodemailer";
import { circularTemplate } from "@/HTML/emails/index";

export type EmailAttachment = {
  /** Nombre del archivo que verá el destinatario */
  filename: string;
  /** Contenido del archivo: Buffer, string base64, o URL pública */
  content?: Buffer | string;
  /** URL pública del archivo (alternativa a content) */
  path?: string;
  /** MIME type, ej: "application/pdf", "image/png" */
  contentType?: string;
  /** Codificación del content. Usa "base64" cuando content es una cadena base64 */
  encoding?: string;
};

export type SendEmailParams = {
  /** Destinatario(s) visible(s) en el campo "Para:" */
  to?: string | string[];
  /** Copia oculta: los destinatarios no se ven entre sí — ideal para envíos masivos */
  bcc?: string | string[];
  subject: string;
  html: string;
  /** Nombre visible del remitente. Por defecto usa SMTP_FROM_NAME del .env */
  fromName?: string;
  /** Archivos adjuntos opcionales */
  attachments?: EmailAttachment[];
  /** Si true, envía el HTML tal cual sin envolverlo en circularTemplate */
  skipTemplate?: boolean;
};

export type SendEmailResult =
  | { success: true }
  | { success: false; error: string };

// Transporter reutilizable (se crea una sola vez por proceso de Node)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // App Password de Gmail (no la contraseña normal)
  },
});

export async function sendEmail({
  to,
  bcc,
  subject,
  html,
  fromName,
  attachments,
  skipTemplate = false,
}: SendEmailParams): Promise<SendEmailResult> {
  try {
    const from = `"${fromName ?? process.env.SMTP_FROM_NAME ?? "Colegio"}" <jaimequijano.incconection-kids@gmail.com>`;

    const schoolName = process.env.SMTP_FROM_NAME ?? "Colegio";
    const resolvedTo =
      to ?? `"${schoolName}" <jaimequijano.incconection-kids@gmail.com>`;

    const finalHtml = skipTemplate
      ? html
      : circularTemplate({ content: html, schoolName, logoUrl: process.env.SCHOOL_LOGO_URL });

    await transporter.sendMail({
      from,
      to: resolvedTo,
      bcc,
      subject,
      html: finalHtml,
      attachments,
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[sendEmail]", message);
    return { success: false, error: message };
  }
}
