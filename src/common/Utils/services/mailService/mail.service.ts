import { customAlphabet } from 'nanoid';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailData } from 'src/common/Interfaces';
import { HashingService } from '../../Hashing/hash.service';
import { redis, redisKeys } from '../redis';
import { PinoLogger } from 'nestjs-pino';
import { emailType } from 'src/common/Enum';
import * as nodemailer from 'nodemailer';

const createOTP = customAlphabet(`0123456789zxcvbnmalksjdhfgqwretruop`, 6);

@Injectable()
export class EmailServices implements IEmailData {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly hashService: HashingService,
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('BREVO_USER'),
        pass: this.configService.get<string>('BREVO_API_KEY'),
      },
    });
  }

  sendEmail = async (to: string, subject: string, html: string) => {
    try {
      const info = await this.transporter.sendMail({
        from: `"ChatAI" <${this.configService.get<string>('BREVO_USER')}>`,
        to,
        subject,
        html,
      });
      this.logger.info(info.response);
    } catch (error) {
      this.logger.error(error);
    }
  };

  createAndSendOTP = async (email: string) => {
    const OTP = createOTP();
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f2f2f2;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">مرحبا بك!</h2>
          <p>شكراً لتسجيلك. الكود الخاص بك لتأكيد الحساب هو:</p>
          <h2 style="color: #191a1bff; text-align: center;">${OTP}</h2>
          <p>من فضلك أدخل هذا الكود في التطبيق لتفعيل حسابك.</p>
          <hr />
          <p style="font-size: 12px; color: #888;">إذا لم تطلب هذا الكود، تجاهل هذه الرسالة.</p>
        </div>
      </div>
    `;
    const hashOTP = await this.hashService.generateHash(OTP);
    await redis.set(redisKeys.OTP(email), hashOTP, 'EX', 2 * 60);
    await this.sendEmail(email, emailType.confirmation, html);
  };

  createAndSendOTP_password = async (email: string) => {
    const OTP = createOTP();
    const resetHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333;">طلب إعادة تعيين كلمة المرور</h2>
          <p style="font-size: 16px; color: #555;">من فضلك استخدم رمز التحقق أدناه:</p>
          <div style="margin: 20px 0; padding: 20px; background-color: #f1f5ff; border-radius: 8px; text-align: center;">
            <h1 style="font-size: 36px; letter-spacing: 4px; color: #007BFF;">${OTP}</h1>
          </div>
          <p style="font-size: 14px; color: #777;">الرمز صالح لفترة محدودة فقط.</p>
          <hr style="margin-top: 30px;" />
          <p style="font-size: 12px; color: #999;">© 2025 Notes. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    `;
    const hashOTP = await this.hashService.generateHash(OTP);
    await redis.set(redisKeys.resetPassword(email), hashOTP, 'EX', 2 * 60);
    await this.sendEmail(email, emailType.resetPassword, resetHtml);
  };

  bannedUser_email = async (email: string) => {
    const bannedHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #d9534f;">تم حظر حسابك</h2>
          <p style="font-size: 16px; color: #555;">تم <strong style="color:#d9534f;">حظر حسابك</strong> بسبب مخالفة سياسات الاستخدام.</p>
          <div style="margin: 20px 0; padding: 20px; background-color: #fff3cd; border-radius: 8px; text-align: center; border: 1px solid #ffeeba;">
            <h3 style="color: #856404; margin: 0;">📩 تواصل معنا:</h3>
            <p style="font-size: 18px; color: #333; margin: 5px 0 0 0;">
              <a href="mailto:support@notes.com" style="color: #007BFF; text-decoration: none;">support@notes.com</a>
            </p>
          </div>
          <hr style="margin-top: 30px;" />
          <p style="font-size: 12px; color: #999;">© 2025 Notes. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    `;
    await this.sendEmail(email, 'تم حظر حسابك', bannedHtml);
  };
}
