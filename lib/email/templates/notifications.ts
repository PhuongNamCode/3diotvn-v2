interface CourseNotificationEmailProps {
  courseTitle: string;
  courseDescription: string;
  coursePrice: number;
  courseInstructor: string;
  courseCategory: string;
  websiteUrl: string;
}

interface EventNotificationEmailProps {
  eventTitle: string;
  eventDescription: string;
  eventDate: string;
  eventLocation: string;
  eventPrice: number;
  websiteUrl: string;
}

export function generateCourseNotificationTemplate({
  courseTitle,
  courseDescription,
  coursePrice,
  courseInstructor,
  courseCategory,
  websiteUrl
}: CourseNotificationEmailProps) {
  const formattedPrice = coursePrice > 0 
    ? coursePrice.toLocaleString('vi-VN') + ' VNĐ' 
    : 'Miễn phí';

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;background-color:#ffffff">
      <div style="text-align:center;margin-bottom:20px">
        <h1 style="color:#10b981;font-size:1.8rem;margin-bottom:10px">🎓 Khóa học mới từ 3DIoT!</h1>
        <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;padding:8px 16px;border-radius:20px;display:inline-block;font-weight:600;font-size:1.1rem">
          3DIoT
        </div>
      </div>
      
      <p>Xin chào,</p>
      <p>Chúng tôi rất vui thông báo về khóa học mới mà chúng tôi vừa ra mắt!</p>
      
      <div style="background-color:#f0f9ff;border-left:4px solid #0ea5e9;padding:15px;margin:20px 0;border-radius:4px">
        <h3 style="color:#0ea5e9;margin-top:0">📚 Thông tin khóa học:</h3>
        <p><strong>🎯 Tên khóa học:</strong> ${courseTitle}</p>
        <p><strong>👨‍🏫 Giảng viên:</strong> ${courseInstructor}</p>
        <p><strong>📂 Chuyên môn:</strong> ${courseCategory}</p>
        <p><strong>💰 Học phí:</strong> ${formattedPrice}</p>
      </div>

      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;padding:15px;margin:20px 0;border-radius:8px">
        <h4 style="color:#374151;margin-top:0">📖 Mô tả khóa học:</h4>
        <p style="color:#6b7280;line-height:1.6">${courseDescription}</p>
      </div>

      <div style="text-align:center;margin:25px 0">
        <a href="https://3diot.vn/" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Xem chi tiết khóa học
        </a>
      </div>
      
      <p>Đừng bỏ lỡ cơ hội nâng cao kỹ năng của bạn! Hãy đăng ký ngay hôm nay.</p>
      <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua email: <strong>contact.3diot@gmail.com</strong></p>
      
      <p>Trân trọng,<br>Đội ngũ 3DIoT</p>
    </div>
  `;

  const text = `
    Khóa học mới từ 3DIoT! 🎓
    
    Xin chào,
    
    Chúng tôi rất vui thông báo về khóa học mới mà chúng tôi vừa ra mắt!
    
    📚 Thông tin khóa học:
    🎯 Tên khóa học: ${courseTitle}
    👨‍🏫 Giảng viên: ${courseInstructor}
    📂 Chuyên môn: ${courseCategory}
    💰 Học phí: ${formattedPrice}
    
    📖 Mô tả khóa học:
    ${courseDescription}
    
    Xem chi tiết khóa học: https://3diot.vn/
    
    Đừng bỏ lỡ cơ hội nâng cao kỹ năng của bạn! Hãy đăng ký ngay hôm nay.
    Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua email: contact.3diot@gmail.com
    
    Trân trọng,
    Đội ngũ 3DIoT
  `;

  return { html, text };
}

export function generateEventNotificationTemplate({
  eventTitle,
  eventDescription,
  eventDate,
  eventLocation,
  eventPrice,
  websiteUrl
}: EventNotificationEmailProps) {
  const formattedPrice = eventPrice > 0 
    ? eventPrice.toLocaleString('vi-VN') + ' VNĐ' 
    : 'Miễn phí';

  const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Sẽ được thông báo sau';

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;background-color:#ffffff">
      <div style="text-align:center;margin-bottom:20px">
        <h1 style="color:#10b981;font-size:1.8rem;margin-bottom:10px">🎉 Sự kiện mới từ 3DIoT!</h1>
        <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;padding:8px 16px;border-radius:20px;display:inline-block;font-weight:600;font-size:1.1rem">
          3DIoT
        </div>
      </div>
      
      <p>Xin chào,</p>
      <p>Chúng tôi rất vui thông báo về sự kiện mới mà chúng tôi sắp tổ chức!</p>
      
      <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:4px">
        <h3 style="color:#d97706;margin-top:0">🎊 Thông tin sự kiện:</h3>
        <p><strong>🎯 Tên sự kiện:</strong> ${eventTitle}</p>
        <p><strong>📅 Thời gian:</strong> ${formattedDate}</p>
        <p><strong>📍 Địa điểm:</strong> ${eventLocation}</p>
        <p><strong>💰 Phí tham dự:</strong> ${formattedPrice}</p>
      </div>

      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;padding:15px;margin:20px 0;border-radius:8px">
        <h4 style="color:#374151;margin-top:0">📝 Mô tả sự kiện:</h4>
        <p style="color:#6b7280;line-height:1.6">${eventDescription}</p>
      </div>

      <div style="text-align:center;margin:25px 0">
        <a href="https://3diot.vn/" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Đăng ký tham dự ngay
        </a>
      </div>
      
      <p>Hãy tham gia cùng chúng tôi để có những trải nghiệm tuyệt vời và học hỏi thêm nhiều kiến thức mới!</p>
      <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua email: <strong>contact.3diot@gmail.com</strong></p>
      
      <p>Trân trọng,<br>Đội ngũ 3DIoT</p>
    </div>
  `;

  const text = `
    Sự kiện mới từ 3DIoT! 🎉
    
    Xin chào,
    
    Chúng tôi rất vui thông báo về sự kiện mới mà chúng tôi sắp tổ chức!
    
    🎊 Thông tin sự kiện:
    🎯 Tên sự kiện: ${eventTitle}
    📅 Thời gian: ${formattedDate}
    📍 Địa điểm: ${eventLocation}
    💰 Phí tham dự: ${formattedPrice}
    
    📝 Mô tả sự kiện:
    ${eventDescription}
    
    Đăng ký tham dự ngay: https://3diot.vn/
    
    Hãy tham gia cùng chúng tôi để có những trải nghiệm tuyệt vời và học hỏi thêm nhiều kiến thức mới!
    Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua email: contact.3diot@gmail.com
    
    Trân trọng,
    Đội ngũ 3DIoT
  `;

  return { html, text };
}
