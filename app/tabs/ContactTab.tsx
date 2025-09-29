"use client";

import { useState } from "react";
import { useContacts } from "@/lib/hooks/useData";

export default function ContactTab() {
  const { createContact } = useContacts();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    const payload = {
      name: String(formData.get("fullName") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      company: String(formData.get("organization") || ""),
      role: "Contact",
      message: String(formData.get("details") || ""),
      type: "partnership" as const,
      status: "new" as const,
      priority: "medium" as const,
      notes: []
    };
    setSubmitting(true);
    setSuccess(false);
    setError(null);
    try {
      await createContact(payload);
      setSuccess(true);
    } catch (e: any) {
      setError(e?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      {/* Hero Banner Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <div className="contact-hero-text">
            <h1>
              <span style={{ color: 'var(--accent)' }}>Liên hệ</span> hợp tác
            </h1>
            <p className="contact-hero-description">
              Chúng tôi luôn chào đón các đối tác và cơ hội hợp tác để phát triển cộng đồng IoT. 
              Hãy kết nối với chúng tôi để cùng tạo ra những giá trị tuyệt vời.
            </p>
          </div>
          <div className="contact-hero-visual">
            <div className="contact-features">
              <div className="feature-card">
                <i className="fas fa-handshake"></i>
                <h4>Hợp tác</h4>
                <p>Dự án chung</p>
              </div>
              <div className="feature-card">
                <i className="fas fa-users"></i>
                <h4>Cộng đồng</h4>
                <p>Kết nối mạng lưới</p>
              </div>
              <div className="feature-card">
                <i className="fas fa-lightbulb"></i>
                <h4>Đổi mới</h4>
                <p>Ý tưởng sáng tạo</p>
              </div>
              <div className="feature-card">
                <i className="fas fa-rocket"></i>
                <h4>Phát triển</h4>
                <p>Thúc đẩy tăng trưởng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <form className="contact-form" onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}>

        {!success ? (
          <>
            <div className="contact-form-header">
              <h2>📝 Thông tin liên hệ</h2>
              <p>Vui lòng điền đầy đủ thông tin để chúng tôi có thể liên hệ lại với bạn</p>
            </div>
            
            <div className="contact-grid">
              <div className="form-group">
                <label htmlFor="fullName">Họ và tên *</label>
                <input type="text" id="fullName" name="fullName" placeholder="VD: Nguyễn Văn A" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input type="email" id="email" name="email" placeholder="you@company.com" required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại *</label>
                <input type="tel" id="phone" name="phone" placeholder="VD: 0901 234 567" required />
              </div>
              <div className="form-group">
                <label htmlFor="organization">Đơn vị/Tổ chức *</label>
                <input type="text" id="organization" name="organization" placeholder="Tên công ty/Trường học" required />
              </div>
              <div className="form-group col-span-2">
                <label htmlFor="details">Thông tin chi tiết về hợp tác *</label>
                <textarea id="details" name="details" placeholder="Mô tả mục tiêu, phạm vi, thời gian dự kiến..." required></textarea>
              </div>
            </div>
            
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            )}
            
            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Gửi thông tin hợp tác
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="success-message">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3>🎉 Gửi thành công!</h3>
            <p>Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ phản hồi trong vòng 24 giờ.</p>
            <button className="btn-primary" onClick={() => setSuccess(false)}>
              <i className="fas fa-plus"></i>
              Gửi yêu cầu khác
            </button>
          </div>
        )}
      </form>
    </div>
  );
}


