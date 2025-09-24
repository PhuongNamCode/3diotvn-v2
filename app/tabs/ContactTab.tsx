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
      <form className="contact-form" onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}>
        <h2>🤝 Liên hệ hợp tác</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Chúng tôi luôn chào đón các đối tác và cơ hội hợp tác để phát triển cộng đồng IoT</p>

        {!success ? (
          <>
            <div className="contact-grid">
              <div className="form-group input-group">
                <label htmlFor="fullName">Họ và tên *</label>
                <span className="input-icon"><i className="fas fa-user"></i></span>
                <input type="text" id="fullName" name="fullName" placeholder="VD: Nguyễn Văn A" required />
              </div>
              <div className="form-group input-group">
                <label htmlFor="email">Email *</label>
                <span className="input-icon"><i className="fas fa-envelope"></i></span>
                <input type="email" id="email" name="email" placeholder="you@company.com" required />
              </div>
              <div className="form-group input-group">
                <label htmlFor="phone">Số điện thoại *</label>
                <span className="input-icon"><i className="fas fa-phone"></i></span>
                <input type="tel" id="phone" name="phone" placeholder="VD: 0901 234 567" required />
              </div>
              <div className="form-group input-group">
                <label htmlFor="organization">Đơn vị/Tổ chức *</label>
                <span className="input-icon"><i className="fas fa-building"></i></span>
                <input type="text" id="organization" name="organization" placeholder="Tên công ty/Trường học" required />
              </div>
              <div className="form-group col-span-2">
                <label htmlFor="details">Thông tin chi tiết về hợp tác *</label>
                <textarea id="details" name="details" placeholder="Mô tả mục tiêu, phạm vi, thời gian dự kiến..." required></textarea>
              </div>
            </div>
            {error && <p style={{ color: 'var(--danger)', marginTop: '0.5rem' }}>{error}</p>}
            <div className="form-actions">
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
                {submitting ? (<><i className="fas fa-spinner fa-spin"></i> Đang gửi...</>) : (<><i className="fas fa-paper-plane"></i> Gửi thông tin hợp tác</>)}
              </button>
            </div>
          </>
        ) : (
          <div className="success-message">
            <h3>🎉 Gửi thành công!</h3>
            <p>Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ phản hồi trong vòng 24 giờ.</p>
            <button className="btn-primary" onClick={() => setSuccess(false)} style={{ marginTop: '1rem' }}>Gửi yêu cầu khác</button>
          </div>
        )}
      </form>
    </div>
  );
}


