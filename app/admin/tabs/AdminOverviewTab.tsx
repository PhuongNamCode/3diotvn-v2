"use client";

import { useEffect, useRef } from "react";
import { useEvents, useNews, useContacts, useStats } from "@/lib/hooks/useData";

export default function AdminOverviewTab() {
  const chartRef1 = useRef<HTMLCanvasElement>(null);
  const chartRef2 = useRef<HTMLCanvasElement>(null);
  const { stats, loading: statsLoading } = useStats();
  const { events } = useEvents();
  const { news } = useNews();
  const { contacts } = useContacts();

  useEffect(() => {
    // Initialize charts when component mounts
    const initCharts = () => {
      // Registration Chart
      if (chartRef1.current) {
        const ctx1 = chartRef1.current.getContext('2d');
        if (ctx1) {
          new (window as any).Chart(ctx1, {
            type: 'line',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              datasets: [{
                label: 'Đăng ký',
                data: [65, 78, 90, 145, 120, 180, 160, 195, 220],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
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

      // Event Distribution Chart
      if (chartRef2.current) {
        const ctx2 = chartRef2.current.getContext('2d');
        if (ctx2) {
          new (window as any).Chart(ctx2, {
            type: 'doughnut',
            data: {
              labels: ['Workshop', 'Seminar', 'Hackathon', 'Conference'],
              datasets: [{
                data: [12, 8, 3, 1],
                backgroundColor: [
                  'rgb(59, 130, 246)',
                  'rgb(6, 182, 212)',
                  'rgb(16, 185, 129)',
                  'rgb(245, 158, 11)'
                ]
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    padding: 20,
                    usePointStyle: true
                  }
                }
              }
            }
          });
        }
      }
    };

    // Wait for Chart.js to load
    const timer = setInterval(() => {
      if ((window as any).Chart) {
        initCharts();
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="admin-overview">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="stat-trend up">
              <i className="fas fa-arrow-up"></i>
              12%
            </div>
          </div>
          <div className="stat-number">{stats?.totalEvents || 0}</div>
          <div className="stat-label">Tổng sự kiện</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-trend up">
              <i className="fas fa-arrow-up"></i>
              8%
            </div>
          </div>
          <div className="stat-number">{stats?.totalRegistrations || 0}</div>
          <div className="stat-label">Đăng ký tham gia</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-handshake"></i>
            </div>
            <div className="stat-trend up">
              <i className="fas fa-arrow-up"></i>
              25%
            </div>
          </div>
          <div className="stat-number">{stats?.totalContacts || 0}</div>
          <div className="stat-label">Đối tác hợp tác</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <i className="fas fa-newspaper"></i>
            </div>
            <div className="stat-trend up">
              <i className="fas fa-arrow-up"></i>
              15%
            </div>
          </div>
          <div className="stat-number">{stats?.publishedNews || 0}</div>
          <div className="stat-label">Tin tức đã đăng</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3 className="chart-title">Đăng ký theo tháng</h3>
          <canvas ref={chartRef1} width="400" height="200"></canvas>
        </div>
        <div className="chart-container">
          <h3 className="chart-title">Phân bố sự kiện</h3>
          <canvas ref={chartRef2} width="300" height="200"></canvas>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Hoạt động gần đây</h3>
          <div className="table-actions">
            <button className="btn btn-secondary">
              <i className="fas fa-refresh"></i>
              Refresh
            </button>
          </div>
        </div>
        <div className="table-content">
          <table className="data-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Hoạt động</th>
                <th>Người dùng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2 phút trước</td>
                <td>Đăng ký sự kiện "IoT Security Workshop"</td>
                <td>Nguyễn Văn A</td>
                <td><span className="status-badge status-confirmed">Xác nhận</span></td>
              </tr>
              <tr>
                <td>5 phút trước</td>
                <td>Liên hệ hợp tác mới</td>
                <td>Tech Corp Ltd</td>
                <td><span className="status-badge status-pending">Chờ xử lý</span></td>
              </tr>
              <tr>
                <td>10 phút trước</td>
                <td>Tạo sự kiện mới "AI Workshop"</td>
                <td>Admin</td>
                <td><span className="status-badge status-confirmed">Hoàn thành</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
