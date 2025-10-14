"use client";

import { useState } from "react";
import { useContacts } from "@/lib/hooks/useData";

export default function ContactTab() {
  const { createContact } = useContacts();
  const [activeForm, setActiveForm] = useState<'partnership' | 'support'>('partnership');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    // Get selected support categories if it's support form
    let supportCategories: string[] = [];
    if (activeForm === 'support') {
      const checkboxes = document.querySelectorAll('input[name="supportCategory"]:checked') as NodeListOf<HTMLInputElement>;
      supportCategories = Array.from(checkboxes).map(cb => cb.value);
      
      // Validate that at least one category is selected
      if (supportCategories.length === 0) {
        setError("Vui lòng chọn ít nhất một nội dung hỗ trợ");
        return;
      }
    }

    // Build message with support categories if applicable
    let message = String(formData.get("details") || "");
    if (activeForm === 'support' && supportCategories.length > 0) {
      const categoryLabels = {
        'iot-deployment': 'Triển khai giải pháp IoT',
        'hardware-design': 'Thiết kế phần cứng',
        'software-design': 'Thiết kế phần mềm',
        'technical-issues': 'Vấn đề kỹ thuật',
        'other': 'Khác'
      };
      
      const selectedLabels = supportCategories.map(cat => categoryLabels[cat as keyof typeof categoryLabels] || cat);
      message = `Nội dung hỗ trợ: ${selectedLabels.join(', ')}\n\nMô tả chi tiết:\n${message}`;
    }

    const payload = {
      name: String(formData.get("fullName") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      company: String(formData.get("organization") || ""),
      role: "Contact",
      message: message,
      type: activeForm === 'partnership' ? "partnership" as const : "support" as const,
      status: "new" as const,
      priority: "medium" as const,
      notes: supportCategories.length > 0 ? supportCategories : []
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
              <span style={{ color: 'var(--accent)' }}>Liên hệ</span> hỗ trợ & hợp tác
            </h1>
            <p className="contact-hero-description">
              Chúng tôi luôn sẵn sàng hỗ trợ và hợp tác để phát triển cộng đồng IoT. 
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
                <i className="fas fa-headset"></i>
                <h4>Hỗ trợ</h4>
                <p>Giải đáp thắc mắc</p>
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
            </div>
          </div>
        </div>
      </section>

      {/* Form Navigation Tabs */}
      <div className="contact-form-tabs">
        <button 
          className={`form-tab ${activeForm === 'partnership' ? 'active' : ''}`}
          onClick={() => setActiveForm('partnership')}
        >
          <i className="fas fa-handshake"></i>
          <span>Liên hệ hợp tác</span>
        </button>
        <button 
          className={`form-tab ${activeForm === 'support' ? 'active' : ''}`}
          onClick={() => setActiveForm('support')}
        >
          <i className="fas fa-headset"></i>
          <span>Liên hệ hỗ trợ</span>
        </button>
      </div>

      <form className="contact-form" onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}>

        {!success ? (
          <>
            <div className="contact-form-header">
              <h2>
                {activeForm === 'partnership' ? '🤝 Thông tin hợp tác' : '🎧 Thông tin hỗ trợ'}
              </h2>
              <p>
                {activeForm === 'partnership' 
                  ? 'Vui lòng điền đầy đủ thông tin về dự án hợp tác để chúng tôi có thể liên hệ lại với bạn'
                  : 'Vui lòng điền đầy đủ thông tin về vấn đề cần hỗ trợ để chúng tôi có thể hỗ trợ bạn tốt nhất'
                }
              </p>
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
              {activeForm === 'support' && (
                <div className="form-group col-span-2">
                  <label>Nội dung hỗ trợ *</label>
                  <div className="support-categories">
                    <label className="checkbox-label">
                      <input type="checkbox" name="supportCategory" value="iot-deployment" />
                      <span className="checkmark"></span>
                      <div className="label-content">
                        <i className="fas fa-network-wired category-icon"></i>
                        <span className="label-text">Triển khai giải pháp IoT</span>
                      </div>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" name="supportCategory" value="hardware-design" />
                      <span className="checkmark"></span>
                      <div className="label-content">
                        <i className="fas fa-microchip category-icon"></i>
                        <span className="label-text">Thiết kế phần cứng</span>
                      </div>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" name="supportCategory" value="software-design" />
                      <span className="checkmark"></span>
                      <div className="label-content">
                        <i className="fas fa-code category-icon"></i>
                        <span className="label-text">Thiết kế phần mềm</span>
                      </div>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" name="supportCategory" value="technical-issues" />
                      <span className="checkmark"></span>
                      <div className="label-content">
                        <i className="fas fa-tools category-icon"></i>
                        <span className="label-text">Vấn đề kỹ thuật</span>
                      </div>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" name="supportCategory" value="other" />
                      <span className="checkmark"></span>
                      <div className="label-content">
                        <i className="fas fa-ellipsis-h category-icon"></i>
                        <span className="label-text">Khác</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
              
              <div className="form-group col-span-2">
                <label htmlFor="details">
                  {activeForm === 'partnership' ? 'Thông tin chi tiết về hợp tác *' : 'Mô tả chi tiết yêu cầu hỗ trợ *'}
                </label>
                <textarea 
                  id="details" 
                  name="details" 
                  placeholder={
                    activeForm === 'partnership' 
                      ? "Mô tả mục tiêu, phạm vi, thời gian dự kiến, ngân sách, lợi ích mong muốn..."
                      : "Mô tả chi tiết vấn đề, lỗi gặp phải, thiết bị sử dụng, bước đã thử..."
                  }
                  required
                ></textarea>
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
                    {activeForm === 'partnership' ? 'Gửi thông tin hợp tác' : 'Gửi yêu cầu hỗ trợ'}
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
            <p>
              {activeForm === 'partnership' 
                ? 'Cảm ơn bạn đã quan tâm đến hợp tác với chúng tôi. Chúng tôi sẽ liên hệ lại trong vòng 24 giờ.'
                : 'Cảm ơn bạn đã gửi yêu cầu hỗ trợ. Chúng tôi sẽ phản hồi trong vòng 12 giờ.'
              }
            </p>
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


