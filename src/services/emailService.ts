import nodemailer from 'nodemailer';
import { SubmissionData } from '../models/Submission';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendSubmissionNotification(
    recipientEmail: string,
    formName: string,
    submissionData: SubmissionData,
    submissionId: string
  ): Promise<void> {
    const htmlContent = this.generateSubmissionEmail(formName, submissionData, submissionId);
    const textContent = this.generateSubmissionTextEmail(formName, submissionData);

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: recipientEmail,
        subject: `New Form Submission: ${formName}`,
        text: textContent,
        html: htmlContent,
      });
      console.log(`✅ Email sent to ${recipientEmail} for form: ${formName}`);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  private generateSubmissionEmail(
    formName: string,
    data: SubmissionData,
    submissionId: string
  ): string {
    const fields = Object.entries(data)
      .map(([key, value]) => {
        const displayValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 30%;">
              ${this.escapeHtml(key)}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">
              ${this.escapeHtml(String(displayValue))}
            </td>
          </tr>
        `;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <div style="background-color: #3b82f6; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                New Form Submission
              </h1>
            </div>
            <div style="padding: 24px;">
              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
                You have received a new submission for <strong>${this.escapeHtml(formName)}</strong>
              </p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                ${fields}
              </table>
              <div style="margin-top: 24px; padding: 16px; background-color: #f9fafb; border-radius: 6px;">
                <p style="margin: 0; font-size: 12px; color: #6b7280;">
                  <strong>Submission ID:</strong> ${submissionId}<br>
                  <strong>Received:</strong> ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
            <div style="padding: 16px 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                This email was sent by your Form Collector service
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateSubmissionTextEmail(formName: string, data: SubmissionData): string {
    const fields = Object.entries(data)
      .map(([key, value]) => {
        const displayValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
        return `${key}: ${displayValue}`;
      })
      .join('\n');

    return `
New Form Submission: ${formName}

${fields}

Received: ${new Date().toLocaleString()}
    `.trim();
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service is ready');
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }
}

export default new EmailService();