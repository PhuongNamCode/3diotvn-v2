export interface RegistrationPendingEmailData {
  userName: string;
  userEmail: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventPrice: number;
  transactionId: string;
  onlineLink?: string;
}

export function generateRegistrationPendingEmail(data: RegistrationPendingEmailData) {
  const { userName, eventTitle, eventDate, eventTime, eventLocation, eventPrice, transactionId, onlineLink } = data;
  
  const eventDateFormatted = new Date(eventDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đang xử lý đăng ký</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e0e0e0;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
            }
            .status-badge {
                background: linear-gradient(135deg, #f59e0b, #f97316);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                display: inline-block;
                margin-bottom: 20px;
            }
            .event-details {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #2563eb;
            }
            .event-title {
                font-size: 20px;
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 15px;
            }
            .detail-row {
                display: flex;
                margin-bottom: 10px;
                align-items: center;
            }
            .detail-label {
                font-weight: 600;
                color: #374151;
                min-width: 120px;
            }
            .detail-value {
                color: #6b7280;
                flex: 1;
            }
            .transaction-info {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
            }
            .transaction-id {
                font-family: 'Courier New', monospace;
                font-weight: bold;
                color: #92400e;
                font-size: 16px;
            }
            .note {
                background: #dbeafe;
                border-left: 4px solid #2563eb;
                padding: 15px;
                margin: 20px 0;
                border-radius: 0 8px 8px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
                color: #6b7280;
                font-size: 14px;
            }
            .contact-info {
                background: #f3f4f6;
                padding: 15px;
                border-radius: 8px;
                margin-top: 20px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">3DIoT</div>
                <div class="status-badge">⏳ ĐANG XỬ LÝ THANH TOÁN</div>
                <h1>Đăng ký của bạn đang được xử lý</h1>
            </div>

            <p>Xin chào <strong>${userName}</strong>,</p>

            <p>Cảm ơn bạn đã đăng ký tham gia sự kiện! Chúng tôi đã nhận được thông tin đăng ký và mã giao dịch của bạn. Hiện tại chúng tôi đang xác thực thông tin thanh toán.</p>

            <div class="event-details">
                <div class="event-title">📅 ${eventTitle}</div>
                <div class="detail-row">
                    <span class="detail-label">📅 Ngày:</span>
                    <span class="detail-value">${eventDateFormatted}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">🕒 Giờ:</span>
                    <span class="detail-value">${eventTime}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📍 Địa điểm:</span>
                    <span class="detail-value">${eventLocation}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">💰 Phí tham gia:</span>
                    <span class="detail-value">${eventPrice.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <!-- Link online sẽ được gửi sau khi admin duyệt -->
            </div>

            <div class="transaction-info">
                <h3 style="margin-top: 0; color: #92400e;">💳 Thông tin giao dịch</h3>
                <p><strong>Mã giao dịch:</strong></p>
                <div class="transaction-id">${transactionId}</div>
                <p style="margin-bottom: 0; font-size: 14px; color: #92400e;">Chúng tôi đang xác thực giao dịch này với ngân hàng</p>
            </div>

            <div class="note">
                <h3 style="margin-top: 0; color: #1e40af;">📝 Lưu ý quan trọng</h3>
                <ul style="margin-bottom: 0;">
                    <li>Chúng tôi sẽ xác thực thông tin thanh toán trong vòng <strong>24-48 giờ</strong></li>
                    <li>Sau khi xác thực thành công, bạn sẽ nhận được email xác nhận cuối cùng <strong>kèm link tham gia online</strong></li>
                    <li>Nếu có vấn đề với giao dịch, chúng tôi sẽ liên hệ với bạn</li>
                    <li>Vui lòng giữ lại mã giao dịch để tham khảo</li>
                </ul>
            </div>

            <div class="contact-info">
                <p><strong>📞 Hỗ trợ</strong></p>
                <p>Nếu bạn có thắc mắc, vui lòng liên hệ:</p>
                <p>📧 Email: support@3diot.vn</p>
                <p>📱 Hotline: 0339830128</p>
            </div>

            <div class="footer">
                <p>Trân trọng,<br><strong>Đội ngũ 3DIoT</strong></p>
                <p>© 2024 3DIoT - Cộng đồng lập trình nhúng & IoT Việt Nam</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
ĐĂNG KÝ ĐANG ĐƯỢC XỬ LÝ - 3DIoT

Xin chào ${userName},

Cảm ơn bạn đã đăng ký tham gia sự kiện! Chúng tôi đã nhận được thông tin đăng ký và mã giao dịch của bạn.

THÔNG TIN SỰ KIỆN:
- Tên sự kiện: ${eventTitle}
- Ngày: ${eventDateFormatted}
- Giờ: ${eventTime}
- Địa điểm: ${eventLocation}
- Phí tham gia: ${eventPrice.toLocaleString('vi-VN')} VNĐ
- Link online: Sẽ được gửi sau khi admin duyệt

THÔNG TIN GIAO DỊCH:
- Mã giao dịch: ${transactionId}
- Trạng thái: Đang xác thực

LƯU Ý QUAN TRỌNG:
- Chúng tôi sẽ xác thực thông tin thanh toán trong vòng 24-48 giờ
- Sau khi xác thực thành công, bạn sẽ nhận được email xác nhận cuối cùng
- Nếu có vấn đề với giao dịch, chúng tôi sẽ liên hệ với bạn
- Vui lòng giữ lại mã giao dịch để tham khảo

HỖ TRỢ:
Email: support@3diot.vn
Hotline: 0339830128

Trân trọng,
Đội ngũ 3DIoT

© 2024 3DIoT - Cộng đồng lập trình nhúng & IoT Việt Nam
  `;

  return { html, text };
}
