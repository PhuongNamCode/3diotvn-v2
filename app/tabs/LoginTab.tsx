export default function LoginTab() {
  return (
    <div className="container">
      {/* Login Form Section */}
      <div className="login-form-section">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>🚀 Tham gia ngay</h2>
            <p>Đăng nhập để truy cập đầy đủ tính năng cộng đồng</p>
          </div>
          
          <div className="login-form-content">
            <div className="login-benefits">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="benefit-text">
                  <strong>Đăng ký sự kiện</strong>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="benefit-text">
                  <strong>Kết nối cộng đồng</strong>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <div className="benefit-text">
                  <strong>Tài nguyên học tập</strong>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-briefcase"></i>
                </div>
                <div className="benefit-text">
                  <strong>Cơ hội nghề nghiệp</strong>
                </div>
              </div>
            </div>
            
            <div className="google-signin-container">
              <div id="gsiContainer" aria-label="Đăng nhập với Google"></div>
            </div>
            
            <div className="login-footer">
              <p>
                Bằng việc đăng nhập, bạn đồng ý với{' '}
                <a href="#" style={{ color: 'var(--accent)' }}>
                  Điều khoản sử dụng
                </a>{' '}
                và{' '}
                <a href="#" style={{ color: 'var(--accent)' }}>
                  Chính sách bảo mật
                </a>{' '}
                của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


