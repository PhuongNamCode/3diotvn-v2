'use client';

import { useState, useEffect } from 'react';

interface NotificationLog {
  id: string;
  type: 'course' | 'event';
  title: string;
  description: string;
  recipientCount: number;
  successCount: number;
  failureCount: number;
  courseId?: string;
  eventId?: string;
  createdAt: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  instructor: string;
  category: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
}

export default function AdminNotificationsTab() {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [notificationType, setNotificationType] = useState<'course' | 'event'>('course');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch notifications, courses, and events in parallel
      const [notificationsRes, coursesRes, eventsRes] = await Promise.all([
        fetch('/api/notifications/send'),
        fetch('/api/courses'),
        fetch('/api/events')
      ]);

      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData.data || []);
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData.data || []);
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedItem && !customTitle) {
      alert('Vui lòng chọn khóa học/sự kiện hoặc nhập thông tin tùy chỉnh');
      return;
    }

    if (!customDescription.trim()) {
      alert('Vui lòng nhập mô tả');
      return;
    }

    try {
      setSending(true);

      let notificationData: any = {
        type: notificationType,
        title: customTitle,
        description: customDescription
      };

      // Nếu chọn từ danh sách có sẵn
      if (selectedItem) {
        if (notificationType === 'course') {
          const course = courses.find(c => c.id === selectedItem);
          if (course) {
            notificationData = {
              ...notificationData,
              courseId: course.id,
              title: course.title,
              description: course.description,
              price: course.price,
              instructor: course.instructor,
              category: course.category
            };
          }
        } else {
          const event = events.find(e => e.id === selectedItem);
          if (event) {
            notificationData = {
              ...notificationData,
              eventId: event.id,
              title: event.title,
              description: event.description,
              date: event.date,
              location: event.location,
              price: event.price
            };
          }
        }
      }

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Gửi thông báo thành công!\n\n📊 Kết quả:\n• Tổng người nhận: ${result.data.totalRecipients}\n• Thành công: ${result.data.successful}\n• Thất bại: ${result.data.failed}`);
        setShowSendModal(false);
        setCustomTitle('');
        setCustomDescription('');
        setSelectedItem('');
        fetchData(); // Refresh notifications list
      } else {
        alert(`❌ Lỗi: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('❌ Có lỗi xảy ra khi gửi thông báo');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSuccessRate = (success: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((success / total) * 100);
  };

  return (
    <div className="admin-notifications-tab">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-title">
            <h1>
              <i className="fas fa-bullhorn"></i>
              Quản lý Thông báo
            </h1>
            <p>Gửi thông báo khóa học và sự kiện mới đến người dùng</p>
          </div>
          <div className="admin-header-actions">
            <button
              className="btn-primary"
              onClick={() => setShowSendModal(true)}
            >
              <i className="fas fa-paper-plane"></i>
              Gửi thông báo mới
            </button>
            <button
              className="btn-secondary"
              onClick={fetchData}
            >
              <i className="fas fa-sync-alt"></i>
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="notification-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-bullhorn"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">{notifications.length}</div>
            <div className="stat-label">Tổng thông báo</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon course">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {notifications.filter(n => n.type === 'course').length}
            </div>
            <div className="stat-label">Khóa học</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon event">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {notifications.filter(n => n.type === 'event').length}
            </div>
            <div className="stat-label">Sự kiện</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <div className="stat-number">
              {notifications.reduce((sum, n) => sum + n.successCount, 0)}
            </div>
            <div className="stat-label">Email thành công</div>
          </div>
        </div>
      </div>

      {/* Notifications History */}
      <div className="notifications-history">
        <div className="table-container">
          <div className="table-header">
            <h3 className="table-title">Lịch sử thông báo</h3>
          </div>
          <div className="table-content">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Tiêu đề</th>
                  <th>Người nhận</th>
                  <th>Thành công</th>
                  <th>Tỷ lệ</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="loading-cell">
                      <div className="loading-spinner">
                        <i className="fas fa-spinner fa-spin"></i>
                        Đang tải...
                      </div>
                    </td>
                  </tr>
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-cell">
                      <div className="empty-state">
                        <i className="fas fa-bullhorn"></i>
                        <p>Chưa có thông báo nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  notifications.map((notification) => (
                    <tr key={notification.id}>
                      <td>
                        <span className={`type-badge ${notification.type}`}>
                          {notification.type === 'course' ? '🎓 Khóa học' : '🎉 Sự kiện'}
                        </span>
                      </td>
                      <td>
                        <div className="notification-title">
                          {notification.title}
                        </div>
                      </td>
                      <td>
                        <div className="recipient-info">
                          <i className="fas fa-users"></i>
                          {notification.recipientCount}
                        </div>
                      </td>
                      <td>
                        <div className="success-info">
                          <i className="fas fa-check-circle"></i>
                          {notification.successCount}
                        </div>
                      </td>
                      <td>
                        <div className="success-rate">
                          <div className="rate-bar">
                            <div 
                              className="rate-fill"
                              style={{ 
                                width: `${getSuccessRate(notification.successCount, notification.recipientCount)}%` 
                              }}
                            ></div>
                          </div>
                          <span className="rate-text">
                            {getSuccessRate(notification.successCount, notification.recipientCount)}%
                          </span>
                        </div>
                      </td>
                      <td>{formatDate(notification.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="modal-overlay" onClick={() => setShowSendModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-paper-plane"></i>
                Gửi thông báo mới
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowSendModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-section">
                <h4 className="section-title">
                  <i className="fas fa-cog"></i>
                  Cấu hình thông báo
                </h4>
                
                <div className="form-group">
                  <label>Loại thông báo</label>
                  <select
                    value={notificationType}
                    onChange={(e) => {
                      setNotificationType(e.target.value as 'course' | 'event');
                      setSelectedItem('');
                    }}
                    className="form-control"
                  >
                    <option value="course">🎓 Khóa học</option>
                    <option value="event">🎉 Sự kiện</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Chọn từ danh sách có sẵn (tùy chọn)</label>
                  <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    className="form-control"
                  >
                    <option value="">-- Tùy chỉnh thông báo --</option>
                    {notificationType === 'course' 
                      ? courses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))
                      : events.map(event => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))
                    }
                  </select>
                </div>

                <div className="form-group">
                  <label>Tiêu đề {selectedItem ? '(sẽ được điền tự động)' : '*'}</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Nhập tiêu đề thông báo"
                    className="form-control"
                    disabled={!!selectedItem}
                  />
                </div>

                <div className="form-group">
                  <label>Mô tả *</label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Nhập mô tả chi tiết..."
                    className="form-control"
                    rows={4}
                  />
                </div>
              </div>

              <div className="notification-preview">
                <h4 className="section-title">
                  <i className="fas fa-eye"></i>
                  Xem trước email
                </h4>
                <div className="preview-content">
                  <div className="preview-header">
                    <strong>
                      {notificationType === 'course' ? '🎓' : '🎉'} 
                      {selectedItem 
                        ? (notificationType === 'course' 
                            ? courses.find(c => c.id === selectedItem)?.title 
                            : events.find(e => e.id === selectedItem)?.title)
                        : customTitle || 'Tiêu đề thông báo'
                      }
                    </strong>
                  </div>
                  <div className="preview-body">
                    {customDescription || 'Mô tả sẽ hiển thị ở đây...'}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowSendModal(false)}
                disabled={sending}
              >
                Hủy
              </button>
              <button
                className="btn-primary"
                onClick={handleSendNotification}
                disabled={sending || (!customTitle && !selectedItem) || !customDescription.trim()}
              >
                {sending ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Gửi thông báo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
