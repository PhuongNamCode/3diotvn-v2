export default function HomeTab() {
  return (
    <div className="container">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              Kết nối <span style={{ color: 'var(--accent)' }}>đam mê</span><br />
              Chia sẻ <span style={{ color: 'var(--accent)' }}>tri thức</span><br />
              Làm chủ <span style={{ color: 'var(--accent)' }}>công nghệ</span>
            </h1>
            <p className="hero-description">🚀 3DIoT - Cộng đồng lập trình nhúng và IoT hàng đầu Việt Nam. Đồng hành cùng bạn trên hành trình khám phá và làm chủ công nghệ tương lai.</p>
            <div className="hero-stats">
              <div className="stat-item"><span className="stat-number">30K+</span><span className="stat-label">Thành viên</span></div>
              <div className="stat-item"><span className="stat-number">20+</span><span className="stat-label">Sự kiện</span></div>
              <div className="stat-item"><span className="stat-number">1200+</span><span className="stat-label">Tài liệu kỹ thuật</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="tech-stack">
              <div className="tech-card"><i className="fas fa-code"></i><h4>Arduino</h4></div>
              <div className="tech-card"><i className="fas fa-wifi"></i><h4>ESP32</h4></div>
              <div className="tech-card"><i className="fas fa-microchip"></i><h4>STM32</h4></div>
              <div className="tech-card"><i className="fab fa-raspberry-pi"></i><h4>Raspberry Pi</h4></div>
              <div className="tech-card"><i className="fas fa-cloud"></i><h4>IoT Cloud</h4></div>
              <div className="tech-card"><i className="fas fa-robot"></i><h4>AI/ML</h4></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


