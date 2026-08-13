import { customAlphabet } from 'nanoid';
import { Injectable } from '@nestjs/common';
import { HashingService, redis, redisKeys, TTL } from 'src/common/Utils';
import { ICreatedBookingEmail } from 'src/common/interfaces/email.interface';

const createOTP = customAlphabet(`0123456789zxcvbnmalksjdhfgqwretruop`, 6);
@Injectable()
export class EmailServices {
  constructor(private readonly hashService: HashingService) {}

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
    await redis.set(redisKeys.OTP(email), hashOTP, 'EX', TTL.OTP);
    return html;
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
    await redis.set(redisKeys.resetPassword(email), hashOTP, 'EX', TTL.OTP);
    return resetHtml;
  };
  bannedUser_email = () => {
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
    return bannedHtml;
  };
  createdBookingEmail = (data: ICreatedBookingEmail) => {
    return `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#333;">  
      <div style="max-width:650px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,.08);">
        <!-- Header -->
        <div style="background:#2563eb;padding:25px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:26px;">
            Booking Created Successfully
          </h1>
        </div>
        <!-- Content -->
        <div style="padding:30px;">
          <p style="font-size:16px;margin-top:0;">
            Hello <strong>${data.username}</strong>,
          </p>
          <p style="font-size:15px;color:#555;line-height:1.6;">
            Your hotel booking has been created successfully.
            Here are your booking details:
          </p>
          <!-- Booking Number -->
          <div style="background:#eff6ff;padding:18px;border-radius:8px;margin:20px 0;">
            <p style="margin:0;color:#64748b;font-size:13px;">
              Booking Number
            </p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:#2563eb;">
              #${data.bookingNumber}
            </p>
          </div>
          <!-- Booking Details -->
          <h3 style="color:#1e293b;border-bottom:1px solid #e5e7eb;padding-bottom:10px;">
            Booking Details
          </h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;color:#64748b;">
                Hotel
              </td>
              <td style="padding:10px 0;text-align:right;font-weight:bold;color:#1e293b;">
                ${data.hotelName}
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#64748b;">
                Check-in
              </td>
              <td style="padding:10px 0;text-align:right;color:#1e293b;">
                ${data.checkIn}
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#64748b;">
                Check-out
              </td>
              <td style="padding:10px 0;text-align:right;color:#1e293b;">
                ${data.checkOut}
              </td>
            </tr>
          </table>
          <!-- Information -->
          <div style="margin-top:25px;padding:15px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
            <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
              Your booking has been created and is currently being processed.
              Please keep your booking number for future reference.
            </p>
          </div>
        </div>
        <!-- Footer -->
        <div style="background:#f8fafc;padding:20px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            Thank you for choosing our service.
          </p>
          <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">
            © 2026 Hotel Booking System. All rights reserved.
          </p>
        </div>
      </div>
    </body>
  </html>
`;
  };
  confirmedBookingEmail = (data: {
    bookingNumber: string;
    hotelName: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    paymentStatus: string;
    paymentMethod?: string;
    transactionId?: string;
  }) => {
    return `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#333;">

        <div style="max-width:650px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,.08);">

          <!-- Header -->
          <div style="background:#16a34a;padding:25px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:26px;">
              Booking Confirmed
            </h1>

            <p style="color:#dcfce7;margin:8px 0 0;font-size:14px;">
              Your reservation has been confirmed successfully
            </p>
          </div>
          <div style="padding:30px;">
            <p style="font-size:15px;color:#555;line-height:1.6;">
              Your hotel booking has been confirmed successfully.
              Below you can find your booking and payment details.
            </p>
            <!-- Confirmation Status -->
            <div style="text-align:center;margin:25px 0;">
              <span style="display:inline-block;padding:12px 25px;background:#dcfce7;color:#15803d;border-radius:30px;font-weight:bold;">
                ✓ CONFIRMED
              </span>
            </div>

            <!-- Booking Number -->
            <div style="background:#eff6ff;padding:18px;border-radius:8px;margin:20px 0;">
              <p style="margin:0;color:#64748b;font-size:13px;">
                Booking Number
              </p>

              <p style="margin:6px 0 0;font-size:22px;font-weight:bold;color:#2563eb;">
                #${data.bookingNumber}
              </p>
            </div>

            <!-- Booking Details -->
            <h3 style="color:#1e293b;border-bottom:1px solid #e5e7eb;padding-bottom:10px;">
              Booking Details
            </h3>

            <table style="width:100%;border-collapse:collapse;">

              <tr>
                <td style="padding:9px 0;color:#64748b;">Hotel</td>
                <td style="padding:9px 0;text-align:right;font-weight:bold;">
                  ${data.hotelName}
                </td>
              </tr>


              <tr>
                <td style="padding:9px 0;color:#64748b;">Check-in</td>
                <td style="padding:9px 0;text-align:right;">
                  ${data.checkIn}
                </td>
              </tr>
              <tr>
                <td style="padding:9px 0;color:#64748b;">Check-out</td>
                <td style="padding:9px 0;text-align:right;">
                  ${data.checkOut}
                </td>
              </tr>
                  
                  : ''
              }
            </table>
            <!-- Payment Details -->
            <h3 style="color:#1e293b;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-top:30px;">
              Payment Details
            </h3>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:9px 0;color:#64748b;">
                  Total Price
                </td>
                <td style="padding:9px 0;text-align:right;font-size:20px;font-weight:bold;">
                  ${data.totalPrice} 
                </td>
              </tr>
              <tr>
                <td style="padding:9px 0;color:#64748b;">
                  Payment Status
                </td>
                <td style="padding:9px 0;text-align:right;color:#16a34a;font-weight:bold;">
                  ${data.paymentStatus}
                </td>
              </tr>
              ${
                data.paymentMethod
                  ? `
                    <tr>
                      <td style="padding:9px 0;color:#64748b;">
                        Payment Method
                      </td>
                      <td style="padding:9px 0;text-align:right;">
                        ${data.paymentMethod}
                      </td>
                    </tr>
                  `
                  : ''
              }
              ${
                data.transactionId
                  ? `
                    <tr>
                      <td style="padding:9px 0;color:#64748b;">
                        Transaction ID
                      </td>
                      <td style="padding:9px 0;text-align:right;font-size:13px;">
                        ${data.transactionId}
                      </td>
                    </tr>
                  `
                  : ''
              }
            </table>
            <!-- Success Message -->
            <div style="margin-top:25px;padding:16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;">
              <p style="margin:0;color:#047857;font-size:14px;line-height:1.6;">
                Your reservation is confirmed and your payment has been processed.
                Please keep this email for your records.
              </p>
            </div>
          </div>
          <!-- Footer -->
          <div style="background:#f8fafc;padding:20px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              Thank you for choosing our service.
            </p>
            <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">
              © 2026 Hotel Booking System. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  };
  canceledBookingEmail = (bookingNumber:string) => {
    return `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#333;">
        <div style="max-width:650px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,.08);">
          <!-- Header -->
          <div style="background:#dc2626;padding:25px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:26px;">
              Booking Canceled
            </h1>
          </div>
          <!-- Content -->
          <div style="padding:30px;">
            <p style="font-size:16px;margin-top:0;">
              Hello,
            </p>
            <p style="font-size:15px;color:#555;line-height:1.6;">
              Your hotel booking has been
              <strong style="color:#dc2626;">canceled successfully</strong>.
            </p>
            <!-- Booking Number -->
            <div style="background:#fef2f2;padding:20px;border-radius:8px;margin:25px 0;border:1px solid #fecaca;text-align:center;">
              <p style="margin:0;color:#64748b;font-size:13px;">
                Canceled Booking Number
              </p>
              <p style="margin:8px 0 0;font-size:24px;font-weight:bold;color:#dc2626;">
                #${bookingNumber}
              </p>
            </div>
            <!-- Cancellation Status -->
            <div style="text-align:center;margin:25px 0;">
              <span style="display:inline-block;padding:12px 25px;background:#fee2e2;color:#b91c1c;border-radius:30px;font-weight:bold;">
                ✕ CANCELED
              </span>
            </div>
            <div style="margin-top:25px;padding:15px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
              <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
                Your reservation has been successfully canceled.
                Please keep this email for your records.
              </p>
            </div>
          </div>
          <!-- Footer -->
          <div style="background:#f8fafc;padding:20px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              If you have any questions, please contact our support team.
            </p>
            <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">
              © 2026 Hotel Booking System. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  };
}
