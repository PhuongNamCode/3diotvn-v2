import { RegistrationEmailData } from '../types';

export function generateRegistrationConfirmEmail(data: RegistrationEmailData): { html: string; text: string } {
  const { userName, userEmail, eventTitle, eventDate, eventTime, eventLocation, eventPrice, onlineLink } = data;

  const formattedDate = new Date(eventDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const priceDisplay = eventPrice && eventPrice > 0 
    ? `${eventPrice.toLocaleString('vi-VN')} VNĐ`
    : 'Miễn phí';

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận đăng ký sự kiện</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 10px 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #2d3748;
            margin-bottom: 20px;
        }
        .event-card {
            background: #f7fafc;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border-left: 4px solid #667eea;
        }
        .event-title {
            font-size: 24px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 15px;
        }
        .event-details {
            color: #4a5568;
        }
        .detail-row {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            font-size: 16px;
        }
        .detail-icon {
            width: 20px;
            margin-right: 12px;
            color: #667eea;
        }
        .price-badge {
            background: ${eventPrice && eventPrice > 0 ? '#f6ad55' : '#48bb78'};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            display: inline-block;
            margin-top: 10px;
        }
        .next-steps {
            background: #e6fffa;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #38b2ac;
        }
        .next-steps h3 {
            color: #234e52;
            margin-top: 0;
            font-size: 18px;
        }
        .next-steps ul {
            color: #2c7a7b;
            margin: 15px 0;
            padding-left: 20px;
        }
        .footer {
            background: #2d3748;
            color: #a0aec0;
            padding: 30px;
            text-align: center;
        }
        .footer a {
            color: #81e6d9;
            text-decoration: none;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #81e6d9;
            text-decoration: none;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .event-card {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Đăng ký thành công!</h1>
            <p>Cảm ơn bạn đã tham gia cộng đồng 3DIoT</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Xin chào <strong>${userName}</strong>,
            </div>
            
            <p>Chúng tôi rất vui mừng xác nhận rằng bạn đã đăng ký thành công cho sự kiện:</p>
            
            <div class="event-card">
                <div class="event-title">${eventTitle}</div>
                
                <div class="event-details">
                    <div class="detail-row">
                        <span class="detail-icon">📅</span>
                        <span><strong>Ngày:</strong> ${formattedDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-icon">🕒</span>
                        <span><strong>Thời gian:</strong> ${eventTime}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-icon">📍</span>
                        <span><strong>Địa điểm:</strong> ${eventLocation}</span>
                    </div>
                    ${onlineLink ? `
                    <div class="detail-row">
                        <span class="detail-icon">🔗</span>
                        <span><strong>Link tham gia online:</strong></span>
                    </div>
                    <div style="margin: 15px 0; padding: 15px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 8px; text-align: center;">
                        <a href="${onlineLink}" style="color: white; text-decoration: none; font-weight: 600; font-size: 16px; display: block; padding: 5px 0;">
                            🚀 Tham gia sự kiện online
                        </a>
                        <p style="margin: 8px 0 0; font-size: 12px; color: rgba(255,255,255,0.8);">
                            Vui lòng click vào link này vào thời gian sự kiện diễn ra
                        </p>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                        <span class="detail-icon">💰</span>
                        <span><strong>Phí tham gia:</strong></span>
                    </div>
                    <div class="price-badge">${priceDisplay}</div>
                </div>
            </div>
            
            <div class="next-steps">
                <h3>📋 Bước tiếp theo:</h3>
                <ul>
                    <li>Lưu lại email này để tham chiếu</li>
                    <li>Chuẩn bị tài liệu cá nhân nếu cần thiết</li>
                    <li>Đến đúng giờ để không bỏ lỡ những thông tin quan trọng</li>
                    <li>Mang theo tinh thần học hỏi và networking!</li>
                </ul>
            </div>
            
            <p>Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi.</p>
            
            <p>Một lần nữa, cảm ơn bạn đã tham gia! Chúng tôi rất mong được gặp bạn tại sự kiện.</p>
            
            <p style="margin-top: 30px;">
                <strong>Trân trọng,</strong><br>
                <strong>Đội ngũ 3DIoT</strong>
            </p>
        </div>
        
    </div>
</body>
</html>`;

  const text = `
Xác nhận đăng ký sự kiện - 3D IoT Community

Xin chào ${userName},

Chúng tôi rất vui mừng xác nhận rằng bạn đã đăng ký thành công cho sự kiện:

${eventTitle}

Thông tin sự kiện:
- Ngày: ${formattedDate}
- Thời gian: ${eventTime}
- Địa điểm: ${eventLocation}${onlineLink ? `
- Link tham gia online: ${onlineLink}` : ''}
- Phí tham gia: ${priceDisplay}

Bước tiếp theo:
- Lưu lại email này để tham chiếu
- Chuẩn bị tài liệu cá nhân nếu cần thiết
- Đến đúng giờ để không bỏ lỡ những thông tin quan trọng
- Mang theo tinh thần học hỏi và networking!

Nếu bạn có bất kỳ câu hỏi nào hoặc cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi tại contact.3diot@gmail.com.

Một lần nữa, cảm ơn bạn đã tham gia! Chúng tôi rất mong được gặp bạn tại sự kiện.

Trân trọng,
Đội ngũ 3D IoT Community

`;

  return { html, text };
}
