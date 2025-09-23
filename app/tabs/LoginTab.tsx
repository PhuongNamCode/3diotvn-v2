export default function LoginTab() {
  return (
    <div className="container">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">Chào mừng đến với 3DIoT</h2>
            <p className="login-subtitle">Đăng nhập để truy cập đầy đủ tính năng cộng đồng</p>
          </div>
          <div className="login-content">
            <div className="login-benefits">
              <div className="benefit-item"><div className="benefit-icon"><i className="fas fa-calendar-check"></i></div><div className="benefit-text"><strong>Đăng ký sự kiện</strong><br />Tham gia các workshop, hackathon và seminar độc quyền</div></div>
              <div className="benefit-item"><div className="benefit-icon"><i className="fas fa-users"></i></div><div className="benefit-text"><strong>Kết nối cộng đồng</strong><br />Networking với hàng ngàn IoT developers Việt Nam</div></div>
              <div className="benefit-item"><div className="benefit-icon"><i className="fas fa-graduation-cap"></i></div><div className="benefit-text"><strong>Tài nguyên học tập</strong><br />Truy cập khóa học, code library và documentation</div></div>
              <div className="benefit-item"><div className="benefit-icon"><i className="fas fa-briefcase"></i></div><div className="benefit-text"><strong>Cơ hội nghề nghiệp</strong><br />Nhận thông báo việc làm và dự án freelance</div></div>
            </div>
            <div className="google-signin-container">
              <div id="gsiContainer" aria-label="Đăng nhập với Google"></div>
            </div>
            <div className="login-footer">
              <p>Bằng việc đăng nhập, bạn đồng ý với <a href="#" style={{ color: 'var(--accent)' }}>Điều khoản sử dụng</a> và <a href="#" style={{ color: 'var(--accent)' }}>Chính sách bảo mật</a> của chúng tôi.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


