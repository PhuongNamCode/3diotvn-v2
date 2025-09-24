"use client";

import { useState } from "react";

export default function AdminUsersTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const users = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0123456789",
      company: "FPT Software",
      role: "Developer",
      status: "active",
      joinDate: "20/09/2025",
      lastActive: "2 giờ trước"
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0987654321",
      company: "Viettel",
      role: "Engineer",
      status: "active",
      joinDate: "21/09/2025",
      lastActive: "1 ngày trước"
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "0555666777",
      company: "VNPT",
      role: "Student",
      status: "inactive",
      joinDate: "22/09/2025",
      lastActive: "1 tuần trước"
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleToggleUserStatus = (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    (window as any).showNotification(
      `Người dùng đã được ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'}!`, 
      'success'
    );
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      (window as any).showNotification('Người dùng đã được xóa!', 'success');
    }
  };

  const handleSendEmail = (userId: number) => {
    (window as any).showNotification('Email đã được gửi!', 'success');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="status-badge status-confirmed">Hoạt động</span>;
      case 'inactive':
        return <span className="status-badge status-pending">Không hoạt động</span>;
      default:
        return <span className="status-badge status-pending">Chờ xử lý</span>;
    }
  };

  return (
    <div className="admin-users">
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Quản lý người dùng</h3>
          <div className="table-actions">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="btn btn-secondary"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
            <button className="btn btn-success">
              <i className="fas fa-file-excel"></i>
              Export Excel
            </button>
          </div>
        </div>
        <div className="table-content">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Công ty</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Tham gia</th>
                <th>Hoạt động cuối</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.company}</td>
                  <td>{user.role}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>{user.joinDate}</td>
                  <td>{user.lastActive}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleViewUser(user)}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className={`btn btn-sm ${user.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleUserStatus(user.id, user.status)}
                        title={user.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      >
                        <i className={`fas fa-${user.status === 'active' ? 'ban' : 'check'}`}></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleSendEmail(user.id)}
                        title="Gửi email"
                      >
                        <i className="fas fa-envelope"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Chi tiết người dùng</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="user-details">
                <div className="user-avatar-section">
                  <div className="user-avatar-large">
                    <span>{selectedUser.name.charAt(0)}</span>
                  </div>
                  <div className="user-info">
                    <h3>{selectedUser.name}</h3>
                    <p>{selectedUser.email}</p>
                    <span className={`status-badge ${selectedUser.status === 'active' ? 'status-confirmed' : 'status-pending'}`}>
                      {selectedUser.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </div>

                <div className="user-details-grid">
                  <div className="detail-item">
                    <label>Số điện thoại:</label>
                    <span>{selectedUser.phone}</span>
                  </div>
                  <div className="detail-item">
                    <label>Công ty:</label>
                    <span>{selectedUser.company}</span>
                  </div>
                  <div className="detail-item">
                    <label>Vai trò:</label>
                    <span>{selectedUser.role}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ngày tham gia:</label>
                    <span>{selectedUser.joinDate}</span>
                  </div>
                  <div className="detail-item">
                    <label>Hoạt động cuối:</label>
                    <span>{selectedUser.lastActive}</span>
                  </div>
                </div>

                <div className="user-activity">
                  <h4>Hoạt động gần đây</h4>
                  <div className="activity-list">
                    <div className="activity-item">
                      <i className="fas fa-calendar-check"></i>
                      <span>Đăng ký tham gia sự kiện "IoT Security Workshop"</span>
                      <small>2 giờ trước</small>
                    </div>
                    <div className="activity-item">
                      <i className="fas fa-user-plus"></i>
                      <span>Tham gia cộng đồng 3DIoT</span>
                      <small>1 ngày trước</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
              >
                Đóng
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleSendEmail(selectedUser.id)}
              >
                <i className="fas fa-envelope"></i>
                Gửi email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
