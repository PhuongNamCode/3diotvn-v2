interface CourseEnrollmentConfirmEmailProps {
  userName: string;
  userEmail: string;
  courseTitle: string;
  coursePrice: number;
}

export function generateCourseEnrollmentConfirmEmail({
  userName,
  userEmail,
  courseTitle,
  coursePrice
}: CourseEnrollmentConfirmEmailProps) {
  const formattedPrice = coursePrice.toLocaleString('vi-VN') + ' VNĐ';

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;background-color:#ffffff">
      <div style="text-align:center;margin-bottom:20px">
        <h1 style="color:#10b981">🎉 Đăng ký khóa học thành công!</h1>
      </div>
      <p>Xin chào <strong>${userName}</strong>,</p>
      <p>Cảm ơn bạn đã đăng ký tham gia khóa học <strong>"${courseTitle}"</strong>. Đăng ký của bạn đã được xác nhận thành công!</p>
      
      <div style="background-color:#f0f9ff;border-left:4px solid #0ea5e9;padding:15px;margin:20px 0;border-radius:4px">
        <h3 style="color:#0ea5e9;margin-top:0">Thông tin khóa học:</h3>
        <p><strong>Tên khóa học:</strong> ${courseTitle}</p>
        <p><strong>Học phí:</strong> ${formattedPrice}</p>
      </div>

      <div style="background-color:#ecfdf5;border-left:4px solid #10b981;padding:15px;margin:20px 0;border-radius:4px">
        <h3 style="color:#10b981;margin-top:0">📚 Cách truy cập khóa học:</h3>
        <ol style="margin:0;padding-left:20px;color:#374151">
          <li style="margin-bottom:8px">Đăng nhập vào website <strong>3diot.vn</strong> bằng tài khoản của bạn</li>
          <li style="margin-bottom:8px">Nhấp vào menu <strong>"Khóa học của tôi"</strong> (ở góc trên bên phải)</li>
          <li style="margin-bottom:8px">Chọn khóa học <strong>"${courseTitle}"</strong></li>
          <li style="margin-bottom:8px">Nhấn nút <strong>"Vào học ngay"</strong> để bắt đầu học tập</li>
        </ol>
      </div>

      <div style="text-align:center;margin:25px 0">
        <a href="https://3diot.vn/my-courses" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:1rem">
          🎓 Vào "Khóa học của tôi" ngay
        </a>
      </div>

      <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.</p>
      
      <p>Trân trọng,<br>Đội ngũ 3DIoT</p>
      <div style="text-align:center;margin-top:30px;font-size:12px;color:#888">
        <p>&copy; ${new Date().getFullYear()} 3DIoT. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
    Đăng ký khóa học thành công!

    Xin chào ${userName},

    Cảm ơn bạn đã đăng ký tham gia khóa học "${courseTitle}". Đăng ký của bạn đã được xác nhận thành công!

    Thông tin khóa học:
    Tên khóa học: ${courseTitle}
    Học phí: ${formattedPrice}

    📚 Cách truy cập khóa học:
    1. Đăng nhập vào website 3diot.vn bằng tài khoản của bạn
    2. Nhấp vào menu "Khóa học của tôi" (ở góc trên bên phải)
    3. Chọn khóa học "${courseTitle}"
    4. Nhấn nút "Vào học ngay" để bắt đầu học tập

    Vào "Khóa học của tôi": https://3diot.vn/my-courses

    Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.

    Trân trọng,
    Đội ngũ 3DIoT
    © ${new Date().getFullYear()} 3DIoT. All rights reserved.
  `;

  return { html, text };
}
