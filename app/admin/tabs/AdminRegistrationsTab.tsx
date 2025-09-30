"use client";

import { useState } from "react";
import { useRegistrations, useEvents } from "@/lib/hooks/useData";

export default function AdminRegistrationsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const { registrations, loading, updateRegistration, deleteRegistration } = useRegistrations();
  const { events } = useEvents();

  const filteredRegistrations = registrations.filter(reg => {
    const org = (reg.organization || '').toLowerCase();
    const matchesSearch = reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEvent === "all" || reg.eventId === selectedEvent;
    return matchesSearch && matchesEvent;
  });

  const getEventTitle = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.title : "Unknown Event";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="status-badge status-confirmed">Đã xác nhận</span>;
      case 'pending':
        return <span className="status-badge status-pending">Chờ xác nhận</span>;
      case 'cancelled':
        return <span className="status-badge status-cancelled">Đã hủy</span>;
      default:
        return <span className="status-badge status-pending">Chờ xử lý</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (registrationId: string) => {
    (window as any).showNotification('Đang tải chi tiết đăng ký...', 'info');
  };

  const handleUpdateStatus = async (registrationId: string, newStatus: string) => {
    try {
      await updateRegistration(registrationId, { status: newStatus as any });
      (window as any).showNotification('Cập nhật trạng thái thành công!', 'success');
    } catch (error) {
      (window as any).showNotification('Lỗi khi cập nhật trạng thái!', 'error');
    }
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) {
      try {
        await deleteRegistration(registrationId);
        (window as any).showNotification('Đăng ký đã được xóa!', 'success');
      } catch (error) {
        (window as any).showNotification('Lỗi khi xóa đăng ký!', 'error');
      }
    }
  };

  const handleExportRegistrations = () => {
    try {
      // Check if XLSX is available
      if (typeof window === 'undefined' || !(window as any).XLSX) {
        (window as any).showNotification('Thư viện XLSX chưa được tải. Vui lòng thử lại!', 'error');
        return;
      }

      const XLSX = (window as any).XLSX;
      
      // Prepare data for export
      const exportData = filteredRegistrations.map(registration => ({
        'Sự kiện': getEventTitle(registration.eventId),
        'Họ tên': registration.fullName,
        'Email': registration.email,
        'Số điện thoại': registration.phone || '',
        'Tổ chức': registration.organization || '',
        'Kinh nghiệm': registration.experience || '',
        'Mong đợi': registration.expectation || '',
        'Trạng thái': registration.status === 'confirmed' ? 'Đã xác nhận' : 
                    registration.status === 'pending' ? 'Chờ xác nhận' : 
                    registration.status === 'cancelled' ? 'Đã hủy' : 'Chờ xử lý',
        'Ngày đăng ký': registration.registeredAt ? formatDate(registration.registeredAt) : ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = [
        { wch: 30 }, // Sự kiện
        { wch: 20 }, // Họ tên
        { wch: 25 }, // Email
        { wch: 15 }, // Số điện thoại
        { wch: 20 }, // Tổ chức
        { wch: 25 }, // Kinh nghiệm
        { wch: 25 }, // Mong đợi
        { wch: 15 }, // Trạng thái
        { wch: 20 }  // Ngày đăng ký
      ];
      ws['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách đăng ký');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const eventFilter = selectedEvent === "all" ? "tatca" : getEventTitle(selectedEvent).replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `danh_sach_dang_ky_${eventFilter}_${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      
      (window as any).showNotification(`Đã xuất ${exportData.length} đăng ký thành công!`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      (window as any).showNotification('Có lỗi xảy ra khi xuất file Excel!', 'error');
    }
  };

  return (
    <div className="admin-registrations">
      <div className="table-container">
        <div className="table-header">
          <div className="table-title">
            <h2>Danh sách đăng ký sự kiện</h2>
            <p>Quản lý và theo dõi các đăng ký tham gia sự kiện</p>
          </div>
          <div className="table-actions">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm đăng ký..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tất cả sự kiện</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.title}</option>
              ))}
            </select>
            <button 
              className="btn btn-success"
              onClick={handleExportRegistrations}
            >
              <i className="fas fa-download"></i>
              Xuất Excel
            </button>
          </div>
        </div>
        <div className="table-content">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sự kiện</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Tổ chức</th>
                <th>Ngày đăng ký</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                    <i className="fas fa-spinner fa-spin"></i> Đang tải...
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                    Không có đăng ký nào
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((registration) => (
                  <tr key={registration.id}>
                    <td>{getEventTitle(registration.eventId)}</td>
                    <td>{registration.fullName}</td>
                    <td>{registration.email}</td>
                    <td>{registration.phone}</td>
                    <td>{registration.organization}</td>
                    <td>{registration.registeredAt ? formatDate(registration.registeredAt) : ''}</td>
                    <td>{getStatusBadge(registration.status)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleViewDetails(registration.id)}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handleUpdateStatus(registration.id, 'confirmed')}
                          title="Xác nhận"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-warning"
                          onClick={() => handleUpdateStatus(registration.id, 'cancelled')}
                          title="Hủy"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteRegistration(registration.id)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
