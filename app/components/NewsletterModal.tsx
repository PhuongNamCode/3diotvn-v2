'use client';

import React, { useState } from 'react';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (email: string) => Promise<void>;
}

const NewsletterModal: React.FC<NewsletterModalProps> = ({ isOpen, onClose, onSubscribe }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    try {
      await onSubscribe(email);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setEmail('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="newsletter-overlay">
      <div className="newsletter-modal">
        <button className="newsletter-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="newsletter-content">
          <div className="newsletter-icon">
            <i className="fas fa-envelope-open-text"></i>
          </div>
          
          <h2 className="newsletter-title">
            📰 Đăng ký nhận tin tức mới
          </h2>
          
          <p className="newsletter-description">
            Nhận những tin tức công nghệ mới nhất về IoT, Embedded, AI và xu hướng công nghệ 
            trực tiếp vào hộp thư của bạn!
          </p>

          {isSuccess ? (
            <div className="newsletter-success">
              <div className="success-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <h3>Cảm ơn bạn đã đăng ký! 🎉</h3>
              <p>Chúng tôi sẽ gửi tin tức mới nhất đến email của bạn.</p>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <div className="newsletter-input-group">
                <div className="newsletter-input-wrapper">
                  <i className="fas fa-envelope newsletter-input-icon"></i>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn..."
                    className="newsletter-input"
                    required
                    disabled={isLoading}
                  />
                </div>
                <button 
                  type="submit" 
                  className="newsletter-submit"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Đăng ký ngay
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="newsletter-benefits">
            <h4>🎯 Bạn sẽ nhận được:</h4>
            <ul>
              <li><i className="fas fa-check"></i> Tin tức IoT & Embedded mới nhất</li>
              <li><i className="fas fa-check"></i> Xu hướng AI & Machine Learning</li>
              <li><i className="fas fa-check"></i> Cơ hội nghề nghiệp trong tech</li>
              <li><i className="fas fa-check"></i> Thông báo sự kiện & workshop</li>
            </ul>
          </div>

          <div className="newsletter-privacy">
            <p>
              <i className="fas fa-shield-alt"></i>
              Chúng tôi cam kết bảo mật thông tin của bạn và chỉ gửi nội dung liên quan đến công nghệ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterModal;
