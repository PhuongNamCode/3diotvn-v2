'use client';

import { useState, useEffect } from 'react';
import { useContacts } from '@/lib/hooks/useData';

export default function AdminContactsTab() {
  const { contacts, loading, deleteContact, updateContact, refetch } = useContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [lastContactCount, setLastContactCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  // Auto-refresh every 30 seconds to get new contacts (much reduced frequency)
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(async () => {
      if (!isRefreshing && !loading) {
        setIsRefreshing(true);
        try {
          await refetch();
        } finally {
          setIsRefreshing(false);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch, isRefreshing, loading, autoRefresh]);

  // Check for new contacts and show notification
  useEffect(() => {
    if (contacts.length > lastContactCount && lastContactCount > 0) {
      const newContactsCount = contacts.length - lastContactCount;
      (window as any).showNotification?.(`Có ${newContactsCount} liên hệ mới!`, 'success');
    }
    setLastContactCount(contacts.length);
  }, [contacts.length, lastContactCount]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.type.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleViewDetails = (contact: any) => {
    setSelectedContact(contact);
    setShowDetails(true);
  };

  const handleUpdateStatus = async (contactId: string, newStatus: string) => {
    try {
      await updateContact(contactId, { status: newStatus });
      (window as any).showNotification?.(`Trạng thái đã cập nhật thành ${newStatus}`, 'success');
    } catch (error) {
      (window as any).showNotification?.('Có lỗi xảy ra khi cập nhật trạng thái', 'error');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
      setDeletingContactId(contactId);
      try {
        const result = await deleteContact(contactId);
        if (result && result.success) {
          (window as any).showNotification?.('Liên hệ đã được xóa thành công', 'success');
        } else {
          (window as any).showNotification?.('Có lỗi xảy ra khi xóa liên hệ', 'error');
        }
      } catch (error) {
        console.error('Delete contact error:', error);
        (window as any).showNotification?.('Có lỗi xảy ra khi xóa liên hệ', 'error');
      } finally {
        setDeletingContactId(null);
      }
    }
  };

  const handleExportContacts = () => {
    try {
      // Check if XLSX is available
      if (typeof window === 'undefined' || !(window as any).XLSX) {
        (window as any).showNotification('Thư viện XLSX chưa được tải. Vui lòng thử lại!', 'error');
        return;
      }

      const XLSX = (window as any).XLSX;
      
      // Prepare data for export
      const exportData = filteredContacts.map(contact => ({
        'Tên': contact.name,
        'Email': contact.email,
        'Số điện thoại': contact.phone,
        'Công ty': contact.company,
        'Chức vụ': contact.role,
        'Loại liên hệ': contact.type === 'partnership' ? 'Hợp tác' : 
                       contact.type === 'support' ? 'Hỗ trợ' :
                       contact.type === 'sponsorship' ? 'Tài trợ' :
                       contact.type === 'collaboration' ? 'Cộng tác' : 'Chung',
        'Trạng thái': contact.status === 'new' ? 'Mới' :
                     contact.status === 'in-progress' ? 'Đang xử lý' :
                     contact.status === 'in_negotiation' ? 'Đang thương lượng' :
                     contact.status === 'resolved' ? 'Đã giải quyết' :
                     contact.status === 'closed' ? 'Đã đóng' : contact.status,
        'Độ ưu tiên': contact.priority === 'high' ? 'Cao' :
                     contact.priority === 'medium' ? 'Trung bình' : 'Thấp',
        'Nội dung': contact.message,
        'Danh mục hỗ trợ': contact.type === 'support' && contact.notes && contact.notes.length > 0 ? 
          contact.notes.map(note => {
            const noteLabels: { [key: string]: string } = {
              'iot-deployment': 'Triển khai IoT',
              'hardware-design': 'Thiết kế phần cứng',
              'software-design': 'Thiết kế phần mềm',
              'technical-issues': 'Vấn đề kỹ thuật',
              'other': 'Khác'
            };
            return noteLabels[note] || note;
          }).join(', ') : 
          (contact.notes && contact.notes.length > 0 ? contact.notes.join(', ') : ''),
        'Ngày tạo': contact.createdAt ? new Date(contact.createdAt).toLocaleDateString('vi-VN') : '',
        'Ngày cập nhật': contact.updatedAt ? new Date(contact.updatedAt).toLocaleDateString('vi-VN') : ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = [
        { wch: 20 }, // Tên
        { wch: 25 }, // Email
        { wch: 15 }, // Số điện thoại
        { wch: 20 }, // Công ty
        { wch: 15 }, // Chức vụ
        { wch: 15 }, // Loại liên hệ
        { wch: 15 }, // Trạng thái
        { wch: 12 }, // Độ ưu tiên
        { wch: 40 }, // Nội dung
        { wch: 25 }, // Danh mục hỗ trợ
        { wch: 15 }, // Ngày tạo
        { wch: 15 }  // Ngày cập nhật
      ];
      ws['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách liên hệ');

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `danh_sach_lien_he_${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      
      (window as any).showNotification(`Đã xuất ${exportData.length} liên hệ thành công!`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      (window as any).showNotification('Có lỗi xảy ra khi xuất file Excel!', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { class: string; text: string } } = {
      'new': { class: 'badge-warning', text: 'Mới' },
      'in-progress': { class: 'badge-info', text: 'Đang xử lý' },
      'in_negotiation': { class: 'badge-info', text: 'Đang thương lượng' },
      'resolved': { class: 'badge-success', text: 'Đã giải quyết' },
      'closed': { class: 'badge-secondary', text: 'Đã đóng' }
    };
    
    const statusInfo = statusMap[status] || { class: 'badge-secondary', text: status };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getTypeBadge = (type: string) => {
    const typeMap: { [key: string]: { class: string; text: string } } = {
      'partnership': { class: 'badge-success', text: 'Hợp tác' },
      'support': { class: 'badge-info', text: 'Hỗ trợ' },
      'sponsorship': { class: 'badge-warning', text: 'Tài trợ' },
      'collaboration': { class: 'badge-primary', text: 'Cộng tác' },
      'general': { class: 'badge-secondary', text: 'Chung' }
    };
    
    const typeInfo = typeMap[type] || { class: 'badge-secondary', text: type };
    return <span className={`badge ${typeInfo.class}`}>{typeInfo.text}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu liên hệ...</p>
      </div>
    );
  }


  return (
    <div className="admin-tab-content">
      <div className="tab-header">
        <h2>Quản lý Liên hệ & Hợp tác</h2>
        <p>Quản lý thông tin liên hệ và yêu cầu hợp tác từ khách hàng</p>
      </div>

      {/* Search and Actions */}
      <div className="tab-actions">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, công ty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="action-buttons">
          <button 
            className="btn btn-sm btn-outline" 
            onClick={async () => {
              setIsRefreshing(true);
              try {
                await refetch();
              } finally {
                setIsRefreshing(false);
              }
            }}
            disabled={isRefreshing}
            title="Làm mới dữ liệu"
          >
            <i className={`fas ${isRefreshing ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleExportContacts}
          >
            <i className="fas fa-download"></i>
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Công ty</th>
              <th>Loại</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  <div className="empty-state">
                    <i className="fas fa-inbox"></i>
                    <p>Chưa có liên hệ nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id}>
                  <td>
                    <div className="contact-info">
                      <strong>{contact.name}</strong>
                    </div>
                  </td>
                  <td>{contact.email}</td>
                  <td>{contact.phone}</td>
                  <td>{contact.company}</td>
                  <td>{getTypeBadge(contact.type)}</td>
                  <td>{getStatusBadge(contact.status)}</td>
                  <td>{contact.createdAt ? new Date(contact.createdAt).toLocaleDateString('vi-VN') : ''}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleViewDetails(contact)}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleUpdateStatus(contact.id, 'in-progress')}
                        title="Đang xử lý"
                      >
                        <i className="fas fa-clock"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleUpdateStatus(contact.id, 'resolved')}
                        title="Đã giải quyết"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteContact(contact.id)}
                        disabled={deletingContactId === contact.id}
                        title="Xóa"
                      >
                        <i className={`fas ${deletingContactId === contact.id ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Contact Details Modal */}
      {showDetails && selectedContact && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content contact-details-modal">
            <div className="modal-header">
              <h3>Chi tiết liên hệ</h3>
              <button 
                className="btn-close"
                onClick={() => setShowDetails(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="contact-details">
                <div className="detail-section">
                  <h4>Thông tin cơ bản</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Tên:</label>
                      <span>{selectedContact.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedContact.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Số điện thoại:</label>
                      <span>{selectedContact.phone}</span>
                    </div>
                    <div className="detail-item">
                      <label>Công ty:</label>
                      <span>{selectedContact.company}</span>
                    </div>
                    <div className="detail-item">
                      <label>Loại:</label>
                      <span>{getTypeBadge(selectedContact.type)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Trạng thái:</label>
                      <span>{getStatusBadge(selectedContact.status)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Nội dung liên hệ</h4>
                  <div className="message-content">
                    <p>{selectedContact.message}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Thông tin bổ sung</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Ngày tạo:</label>
                      <span>{new Date(selectedContact.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="detail-item">
                      <label>Ngày cập nhật:</label>
                      <span>{new Date(selectedContact.updatedAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="detail-item">
                      <label>Độ ưu tiên:</label>
                      <span className={`badge ${selectedContact.priority === 'high' ? 'badge-danger' : selectedContact.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                        {selectedContact.priority === 'high' ? 'Cao' : selectedContact.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedContact.notes && selectedContact.notes.length > 0 && (
                  <div className="detail-section">
                    <h4>
                      {selectedContact.type === 'support' ? 'Danh mục hỗ trợ' : 'Ghi chú'}
                    </h4>
                    <div className="notes-list">
                      {selectedContact.notes.map((note: any, index: number) => {
                        if (selectedContact.type === 'support') {
                          const noteLabels: { [key: string]: string } = {
                            'iot-deployment': 'Triển khai giải pháp IoT',
                            'hardware-design': 'Thiết kế phần cứng',
                            'software-design': 'Thiết kế phần mềm',
                            'technical-issues': 'Vấn đề kỹ thuật',
                            'other': 'Khác'
                          };
                          const displayText = noteLabels[note] || note;
                          return (
                            <div key={index} className="note-item support-category">
                              <i className="fas fa-tag"></i>
                              <span>{displayText}</span>
                            </div>
                          );
                        } else {
                          return (
                            <div key={index} className="note-item">
                              <i className="fas fa-sticky-note"></i>
                              <span>{note}</span>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDetails(false)}
              >
                Đóng
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleUpdateStatus(selectedContact.id, 'in-progress')}
              >
                <i className="fas fa-clock"></i>
                Đang xử lý
              </button>
              <button 
                className="btn btn-success"
                onClick={() => handleUpdateStatus(selectedContact.id, 'resolved')}
              >
                <i className="fas fa-check"></i>
                Đã giải quyết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
