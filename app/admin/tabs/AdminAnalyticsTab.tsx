"use client";

import { useEffect, useRef } from "react";

export default function AdminAnalyticsTab() {
  const trafficChartRef = useRef<HTMLCanvasElement>(null);
  const demographicsChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const initCharts = () => {
      // Traffic Sources Chart
      if (trafficChartRef.current) {
        const ctx = trafficChartRef.current.getContext('2d');
        if (ctx) {
          new (window as any).Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Direct', 'Social Media', 'Email', 'Referral', 'Search'],
              datasets: [{
                label: 'Traffic',
                data: [4500, 3200, 2800, 1900, 2100],
                backgroundColor: [
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(6, 182, 212, 0.8)',
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                  'rgba(139, 92, 246, 0.8)'
                ],
                borderColor: [
                  'rgb(59, 130, 246)',
                  'rgb(6, 182, 212)',
                  'rgb(16, 185, 129)',
                  'rgb(245, 158, 11)',
                  'rgb(139, 92, 246)'
                ],
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              }
            }
          });
        }
      }

      // Demographics Chart
      if (demographicsChartRef.current) {
        const ctx = demographicsChartRef.current.getContext('2d');
        if (ctx) {
          new (window as any).Chart(ctx, {
            type: 'radar',
            data: {
              labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
              datasets: [{
                label: 'Age Distribution',
                data: [35, 45, 28, 15, 8],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                pointBackgroundColor: 'rgb(59, 130, 246)'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                r: {
                  beginAtZero: true,
                  max: 50,
                  grid: {
                    color: 'rgba(148, 163, 184, 0.2)'
                  }
                }
              }
            }
          });
        }
      }
    };

    const timer = setInterval(() => {
      if ((window as any).Chart) {
        initCharts();
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const handleGenerateReport = () => {
    (window as any).showNotification('Đang tạo báo cáo...', 'info');
    setTimeout(() => {
      (window as any).showNotification('Báo cáo đã được xuất!', 'success');
    }, 3000);
  };

  const handleSendNewsletter = () => {
    const subject = prompt('Nhập tiêu đề newsletter:');
    if (subject) {
      (window as any).showNotification('Đang gửi newsletter...', 'info');
      setTimeout(() => {
        (window as any).showNotification(`Newsletter "${subject}" đã được gửi đến 5,234 subscribers!`, 'success');
      }, 4000);
    }
  };

  return (
    <div className="admin-analytics">
      <h2 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>
        📊 Phân tích chi tiết
      </h2>
      
      {/* Advanced Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-chart-area"></i>
            </div>
            <div className="stat-trend up">
              <i className="fas fa-arrow-up"></i>
              32%
            </div>
          </div>
          <div className="stat-number">87.5%</div>
          <div className="stat-label">Tỷ lệ chuyển đổi</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-user-graduate"></i>
            </div>
            <div className="stat-trend up">
              <i className="fas fa-arrow-up"></i>
              18%
            </div>
          </div>
          <div className="stat-number">4.8/5</div>
          <div className="stat-label">Đánh giá trung bình</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-trend down">
              <i className="fas fa-arrow-down"></i>
              5%
            </div>
          </div>
          <div className="stat-number">2.3 phút</div>
          <div className="stat-label">Thời gian trung bình trên trang</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-globe"></i>
            </div>
            <div className="stat-trend up">
              <i className="fas fa-arrow-up"></i>
              45%
            </div>
          </div>
          <div className="stat-number">15,248</div>
          <div className="stat-label">Lượt truy cập</div>
        </div>
      </div>

      {/* Detailed Charts */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3 className="chart-title">Traffic Sources</h3>
          <canvas ref={trafficChartRef} width="400" height="200"></canvas>
        </div>
        <div className="chart-container">
          <h3 className="chart-title">User Demographics</h3>
          <canvas ref={demographicsChartRef} width="300" height="200"></canvas>
        </div>
      </div>

      {/* Analytics Actions */}
      <div className="analytics-actions">
        <div className="table-container">
          <div className="table-header">
            <h3 className="table-title">Công cụ phân tích</h3>
            <div className="table-actions">
              <button className="btn btn-primary" onClick={handleGenerateReport}>
                <i className="fas fa-file-pdf"></i>
                Tạo báo cáo
              </button>
              <button className="btn btn-success" onClick={handleSendNewsletter}>
                <i className="fas fa-mail-bulk"></i>
                Gửi newsletter
              </button>
            </div>
          </div>
          <div className="table-content">
            <div className="analytics-tools">
              <div className="tool-card">
                <div className="tool-icon">
                  <i className="fas fa-database"></i>
                </div>
                <div className="tool-content">
                  <h4>Backup Database</h4>
                  <p>Tạo bản sao lưu dữ liệu hệ thống</p>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      if (confirm('Tạo bản sao lưu dữ liệu?')) {
                        (window as any).showNotification('Đang sao lưu cơ sở dữ liệu...', 'info');
                        setTimeout(() => {
                          (window as any).showNotification('Sao lưu hoàn tất!', 'success');
                        }, 5000);
                      }
                    }}
                  >
                    <i className="fas fa-download"></i>
                    Backup
                  </button>
                </div>
              </div>

              <div className="tool-card">
                <div className="tool-icon">
                  <i className="fas fa-tachometer-alt"></i>
                </div>
                <div className="tool-content">
                  <h4>Optimize Database</h4>
                  <p>Tối ưu hóa hiệu suất cơ sở dữ liệu</p>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      if (confirm('Tối ưu hóa cơ sở dữ liệu? Quá trình này có thể mất vài phút.')) {
                        (window as any).showNotification('Đang tối ưu hóa cơ sở dữ liệu...', 'info');
                        setTimeout(() => {
                          (window as any).showNotification('Tối ưu hóa hoàn tất! Tiết kiệm được 23% dung lượng.', 'success');
                        }, 8000);
                      }
                    }}
                  >
                    <i className="fas fa-cog"></i>
                    Optimize
                  </button>
                </div>
              </div>

              <div className="tool-card">
                <div className="tool-icon">
                  <i className="fas fa-broom"></i>
                </div>
                <div className="tool-content">
                  <h4>Clear Cache</h4>
                  <p>Xóa cache hệ thống để cải thiện hiệu suất</p>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      if (confirm('Xóa cache hệ thống?')) {
                        (window as any).showNotification('Đang xóa cache...', 'info');
                        setTimeout(() => {
                          (window as any).showNotification('Cache đã được xóa!', 'success');
                        }, 2000);
                      }
                    }}
                  >
                    <i className="fas fa-trash"></i>
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
