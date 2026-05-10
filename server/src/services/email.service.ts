import nodemailer from 'nodemailer';
import { createTransport, TransportOptions } from 'nodemailer';
import dotenv from 'dotenv';
import { NotificationTemplateModel } from '../models/notificationTemplate.model';
import { NotificationType } from '../types/notificationTemplate.type';

dotenv.config();

export class EmailService {
  private transporter: nodemailer.Transporter;

  // constructor() {
  //   this.transporter = nodemailer.createTransport({
  //     service: 'gmail',
  //     auth: {
  //       user: process.env.EMAIL_USER,
  //       pass: process.env.EMAIL_PASS,
  //     },
  //   });
  // }

  constructor() {
    this.transporter = createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      family: 4,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    } as TransportOptions);
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  async sendEmailWithTemplate(toEmail: string, templateCode: string, payload: Record<string, any>): Promise<boolean> {
    try {
      const template = await NotificationTemplateModel.findOne({
        code: templateCode,
        type: NotificationType.EMAIL,
      });

      if (!template) {
        console.error(`[EmailService] Không tìm thấy mẫu thông báo cho mã sự kiện: ${templateCode}`);
        return false;
      }

      let subject = template.title;
      let htmlContent = template.content;

      const processedPayload = { ...payload };
      if (processedPayload.debtAmount) processedPayload.debtAmount = this.formatCurrency(processedPayload.debtAmount);
      if (processedPayload.finalAmount)
        processedPayload.finalAmount = this.formatCurrency(processedPayload.finalAmount);

      Object.keys(processedPayload).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        const value = String(processedPayload[key]);
        subject = subject.replace(regex, value);
        htmlContent = htmlContent.replace(regex, value);
      });

      const finalHtml = `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #edf2f7; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">THÔNG BÁO HỆ THỐNG</h2>
                    </div>
                    <div style="padding: 32px; line-height: 1.7; color: #2d3748; background-color: #ffffff; white-space: pre-wrap;">
                        ${htmlContent}
                    </div>
                    <div style="background-color: #f7fafc; padding: 20px; text-align: center; font-size: 13px; color: #718096; border-top: 1px solid #edf2f7;">
                        <p style="margin: 0;">Đây là email tự động từ hệ thống quản lý đào tạo.</p>
                        <p style="margin: 4px 0 0 0;">Vui lòng không phản hồi trực tiếp email này.</p>
                    </div>
                </div>
            `;

      await this.transporter.sendMail({
        from: `"Trung Tâm Giáo Dục" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: subject,
        html: finalHtml,
      });

      console.log(`[EmailService] Đã gửi thành công mã ${templateCode} tới ${toEmail}`);
      return true;
    } catch (error) {
      console.error('[EmailService Error] Gửi mail thất bại:', error);
      return false;
    }
  }
}
