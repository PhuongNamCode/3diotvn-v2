export const newsletterWelcomeTemplate = {
  subject: '🎉 Chào mừng bạn đến với 3DIoT Newsletter!',
  
  html: `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;background-color:#ffffff">
      <div style="text-align:center;margin-bottom:20px">
        <h1 style="color:#10b981;font-size:1.8rem;margin-bottom:10px">🎉 Chào mừng bạn đến với 3DIoT Newsletter!</h1>
        <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;padding:8px 16px;border-radius:20px;display:inline-block;font-weight:600;font-size:1.1rem">
          3DIoT
        </div>
      </div>
      
      <p>Xin chào <strong>{{email}}</strong>,</p>
      <p>Cảm ơn bạn đã đăng ký nhận tin tức từ 3DIoT! Chúng tôi rất vui khi bạn tham gia cộng đồng của chúng tôi.</p>
      
      <div style="background-color:#f0f9ff;border-left:4px solid #0ea5e9;padding:15px;margin:20px 0;border-radius:4px">
        <h3 style="color:#0ea5e9;margin-top:0">🚀 Những gì bạn sẽ nhận được:</h3>
        <p><strong>📰 Tin tức công nghệ IoT mới nhất</strong> - Cập nhật xu hướng và phát triển trong lĩnh vực IoT</p>
        <p><strong>🎓 Khóa học và sự kiện</strong> - Thông báo về các khóa học và workshop miễn phí</p>
        <p><strong>💡 Tips và Tutorials</strong> - Hướng dẫn thực hành IoT và Embedded Systems</p>
        <p><strong>💼 Cơ hội nghề nghiệp</strong> - Việc làm và dự án thú vị trong lĩnh vực IoT</p>
      </div>

      <p>Chúng tôi cam kết chỉ gửi nội dung có giá trị và không spam. Bạn có thể hủy đăng ký bất cứ lúc nào.</p>
      
      <div style="text-align:center;margin:25px 0">
        <a href="https://www.facebook.com/groups/3diot.laptrinhnhungiot" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Tham gia cộng đồng 3DIoT
        </a>
      </div>
      
      <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua email: <strong>contact.3diot@gmail.com</strong></p>
      
      <p>Trân trọng,<br>Đội ngũ 3DIoT</p>
    </div>
  `,
  
  text: `
    Chào mừng bạn đến với 3DIoT Newsletter! 🎉
    
    Xin chào {{email}},
    
    Cảm ơn bạn đã đăng ký nhận tin tức từ 3DIoT! Chúng tôi rất vui khi bạn tham gia cộng đồng của chúng tôi.
    
    🚀 Những gì bạn sẽ nhận được:
    📰 Tin tức công nghệ IoT mới nhất - Cập nhật xu hướng và phát triển trong lĩnh vực IoT
    🎓 Khóa học và sự kiện - Thông báo về các khóa học và workshop miễn phí
    💡 Tips và Tutorials - Hướng dẫn thực hành IoT và Embedded Systems
    💼 Cơ hội nghề nghiệp - Việc làm và dự án thú vị trong lĩnh vực IoT
    
    Chúng tôi cam kết chỉ gửi nội dung có giá trị và không spam. Bạn có thể hủy đăng ký bất cứ lúc nào.
    
    Tham gia cộng đồng 3DIoT: https://www.facebook.com/groups/3diot.laptrinhnhungiot
    
    Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua email: contact.3diot@gmail.com
    
    Trân trọng,
    Đội ngũ 3DIoT
    
    Bạn nhận được email này vì đã đăng ký newsletter tại {{websiteUrl}}
    Nếu không muốn nhận email này nữa, bạn có thể hủy đăng ký tại: {{unsubscribeUrl}}
    
    © ${new Date().getFullYear()} 3DIoT. All rights reserved.
  `
};
