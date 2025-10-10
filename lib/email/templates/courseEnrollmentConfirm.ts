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
      <p>Cảm ơn bạn đã đăng ký tham gia khóa học <strong>"${courseTitle}"</strong>.</p>
      
      <div style="background-color:#f0f9ff;border-left:4px solid #0ea5e9;padding:15px;margin:20px 0;border-radius:4px">
        <h3 style="color:#0ea5e9;margin-top:0">Thông tin khóa học:</h3>
        <p><strong>Tên khóa học:</strong> ${courseTitle}</p>
        <p><strong>Học phí:</strong> ${formattedPrice}</p>
      </div>

      <p>Chúng tôi sẽ liên hệ với bạn sớm nhất để hướng dẫn các bước tiếp theo và cung cấp thông tin truy cập khóa học.</p>
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

    Cảm ơn bạn đã đăng ký tham gia khóa học "${courseTitle}".

    Thông tin khóa học:
    Tên khóa học: ${courseTitle}
    Học phí: ${formattedPrice}

    Chúng tôi sẽ liên hệ với bạn sớm nhất để hướng dẫn các bước tiếp theo và cung cấp thông tin truy cập khóa học.
    Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.

    Trân trọng,
    Đội ngũ 3DIoT
    © ${new Date().getFullYear()} 3DIoT. All rights reserved.
  `;

  return { html, text };
}
