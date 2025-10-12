export const newsletterWelcomeTemplate = {
  subject: 'Chào mừng bạn đến với 3DIoT Newsletter! 🎉',
  
  html: `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chào mừng đến với 3DIoT Newsletter</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }
        .title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .subtitle {
          color: #6b7280;
          font-size: 1.1rem;
          margin-bottom: 30px;
        }
        .welcome-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 2rem;
          color: white;
        }
        .content {
          margin-bottom: 30px;
        }
        .content p {
          margin-bottom: 15px;
          color: #374151;
        }
        .benefits {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 12px;
          padding: 25px;
          margin: 25px 0;
          border-left: 4px solid #3b82f6;
        }
        .benefits h3 {
          color: #1e40af;
          margin-bottom: 15px;
          font-size: 1.2rem;
        }
        .benefits ul {
          margin: 0;
          padding-left: 20px;
        }
        .benefits li {
          margin-bottom: 8px;
          color: #374151;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 15px 30px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          text-align: center;
          margin: 20px 0;
          transition: transform 0.2s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 0.9rem;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #6b7280;
          text-decoration: none;
          font-size: 1.2rem;
        }
        .social-links a:hover {
          color: #3b82f6;
        }
        .unsubscribe {
          font-size: 0.8rem;
          color: #9ca3af;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">3DIoT</div>
          <div class="welcome-icon">🎉</div>
          <h1 class="title">Chào mừng bạn đến với 3DIoT Newsletter!</h1>
          <p class="subtitle">Cảm ơn bạn đã đăng ký nhận tin tức từ chúng tôi</p>
        </div>
        
        <div class="content">
          <p>Xin chào <strong>{{email}}</strong>,</p>
          
          <p>Chúng tôi rất vui khi bạn đã tham gia cộng đồng 3DIoT! Bạn sẽ là một trong những người đầu tiên nhận được những thông tin mới nhất về:</p>
          
          <div class="benefits">
            <h3>🚀 Những gì bạn sẽ nhận được:</h3>
            <ul>
              <li><strong>Tin tức công nghệ IoT mới nhất</strong> - Cập nhật xu hướng và phát triển</li>
              <li><strong>Khóa học và sự kiện</strong> - Thông báo về các khóa học và workshop miễn phí</li>
              <li><strong>Tips và Tutorials</strong> - Hướng dẫn thực hành IoT và Embedded Systems</li>
              <li><strong>Cơ hội nghề nghiệp</strong> - Việc làm và dự án thú vị trong lĩnh vực IoT</li>
            </ul>
          </div>
          
          <p>Chúng tôi cam kết chỉ gửi nội dung có giá trị và không spam. Bạn có thể hủy đăng ký bất cứ lúc nào.</p>
          
          <div style="text-align: center;">
            <a href="{{websiteUrl}}" class="cta-button">
              Khám phá 3DIoT ngay
            </a>
          </div>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://facebook.com/3diot" target="_blank">📘 Facebook</a>
            <a href="https://linkedin.com/company/3diot" target="_blank">💼 LinkedIn</a>
            <a href="https://youtube.com/@3diot" target="_blank">📺 YouTube</a>
          </div>
          
          <p><strong>3DIoT - Nền tảng IoT và Embedded Systems</strong></p>
          <p>Email: contact@3diot.vn | Website: {{websiteUrl}}</p>
          
          <div class="unsubscribe">
            <p>Bạn nhận được email này vì đã đăng ký newsletter tại {{websiteUrl}}</p>
            <p>Nếu không muốn nhận email này nữa, bạn có thể <a href="{{unsubscribeUrl}}" style="color: #6b7280;">hủy đăng ký tại đây</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
  
  text: `
    Chào mừng bạn đến với 3DIoT Newsletter! 🎉
    
    Xin chào {{email}},
    
    Chúng tôi rất vui khi bạn đã tham gia cộng đồng 3DIoT! Bạn sẽ là một trong những người đầu tiên nhận được những thông tin mới nhất về:
    
    🚀 Những gì bạn sẽ nhận được:
    • Tin tức công nghệ IoT mới nhất - Cập nhật xu hướng và phát triển
    • Khóa học và sự kiện - Thông báo về các khóa học và workshop miễn phí
    • Tips và Tutorials - Hướng dẫn thực hành IoT và Embedded Systems
    • Cơ hội nghề nghiệp - Việc làm và dự án thú vị trong lĩnh vực IoT
    
    Chúng tôi cam kết chỉ gửi nội dung có giá trị và không spam. Bạn có thể hủy đăng ký bất cứ lúc nào.
    
    Khám phá 3DIoT ngay: {{websiteUrl}}
    
    ---
    3DIoT - Nền tảng IoT và Embedded Systems
    Email: contact@3diot.vn | Website: {{websiteUrl}}
    
    Bạn nhận được email này vì đã đăng ký newsletter tại {{websiteUrl}}
    Nếu không muốn nhận email này nữa, bạn có thể hủy đăng ký tại: {{unsubscribeUrl}}
  `
};
