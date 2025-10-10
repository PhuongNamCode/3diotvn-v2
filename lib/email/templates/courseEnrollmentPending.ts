interface CourseEnrollmentPendingEmailProps {
  userName: string;
  userEmail: string;
  courseTitle: string;
  coursePrice: number;
  transactionId: string;
}

export function generateCourseEnrollmentPendingEmail({
  userName,
  userEmail,
  courseTitle,
  coursePrice,
  transactionId
}: CourseEnrollmentPendingEmailProps) {
  const formattedPrice = coursePrice.toLocaleString('vi-VN') + ' VNĐ';

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;background-color:#ffffff">
      <div style="text-align:center;margin-bottom:20px">
        <h1 style="color:#f59e0b">⏳ Đăng ký khóa học đang được xử lý!</h1>
      </div>
      <p>Xin chào <strong>${userName}</strong>,</p>
      <p>Cảm ơn bạn đã đăng ký tham gia khóa học <strong>"${courseTitle}"</strong>. Chúng tôi đã nhận được thông tin đăng ký và mã giao dịch của bạn.</p>
      
      <div style="background-color:#fffbe6;border-left:4px solid #f59e0b;padding:15px;margin:20px 0;border-radius:4px">
        <h3 style="color:#f59e0b;margin-top:0">Thông tin khóa học:</h3>
        <p><strong>Tên khóa học:</strong> ${courseTitle}</p>
        <p><strong>Học phí:</strong> ${formattedPrice}</p>
        <p><strong>Mã giao dịch của bạn:</strong> <strong style="color:#f59e0b">${transactionId}</strong></p>
      </div>

      <p>Chúng tôi đang trong quá trình xác thực thông tin thanh toán của bạn. Quá trình này có thể mất từ <strong>24-48 giờ làm việc</strong>.</p>
      <p>Bạn sẽ nhận được một email xác nhận chính thức ngay sau khi giao dịch được xác thực thành công.</p>
      <p>Vui lòng kiểm tra hộp thư đến (bao gồm cả thư mục spam) thường xuyên để không bỏ lỡ thông tin quan trọng.</p>
      
      <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.</p>
      <p>Trân trọng,<br>Đội ngũ 3DIoT</p>
      <div style="text-align:center;margin-top:30px;font-size:12px;color:#888">
        <p>&copy; ${new Date().getFullYear()} 3DIoT. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
    Đăng ký khóa học đang được xử lý!

    Xin chào ${userName},

    Cảm ơn bạn đã đăng ký tham gia khóa học "${courseTitle}". Chúng tôi đã nhận được thông tin đăng ký và mã giao dịch của bạn.

    Thông tin khóa học:
    Tên khóa học: ${courseTitle}
    Học phí: ${formattedPrice}
    Mã giao dịch của bạn: ${transactionId}

    Chúng tôi đang trong quá trình xác thực thông tin thanh toán của bạn. Quá trình này có thể mất từ 24-48 giờ làm việc.
    Bạn sẽ nhận được một email xác nhận chính thức ngay sau khi giao dịch được xác thực thành công.
    Vui lòng kiểm tra hộp thư đến (bao gồm cả thư mục spam) thường xuyên để không bỏ lỡ thông tin quan trọng.

    Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.

    Trân trọng,
    Đội ngũ 3DIoT
    © ${new Date().getFullYear()} 3DIoT. All rights reserved.
  `;

  return { html, text };
}
