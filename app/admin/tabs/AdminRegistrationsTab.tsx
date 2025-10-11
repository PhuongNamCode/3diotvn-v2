"use client";

import React, { useState, useEffect } from 'react';
import { useRegistrations, useEvents } from "@/lib/hooks/useData";
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import PaymentActionButtons from '../components/PaymentActionButtons';
import RegistrationDetailsModal from '../components/RegistrationDetailsModal';

export default function AdminRegistrationsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending_verification' | 'paid' | 'failed' | 'pending'>('all');
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  
  const { registrations, loading, updateRegistration, deleteRegistration, refetch } = useRegistrations();
  const { events } = useEvents();

  const filteredRegistrations = registrations.filter(reg => {
    const org = (reg.organization || '').toLowerCase();
    const matchesSearch = reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEvent === "all" || reg.eventId === selectedEvent;
    const matchesPayment = paymentFilter === 'all' || reg.paymentStatus === paymentFilter;
    return matchesSearch && matchesEvent && matchesPayment;
  });

  const getEventTitle = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.title : "Unknown Event";
  };

  const getEventPrice = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.price : 0;
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

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' VNĐ';
  };

  const updatePaymentStatus = async (registrationId: string, paymentStatus: 'paid' | 'failed') => {
    try {
      setProcessing(registrationId);
      
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentStatus,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        await updateRegistration(registrationId, {
          paymentStatus,
          status: paymentStatus === 'paid' ? 'confirmed' : 'pending'
        });
        
        (window as any).showNotification(
          `Đã ${paymentStatus === 'paid' ? 'xác nhận' : 'từ chối'} thanh toán thành công!`, 
          'success'
        );
      } else {
        (window as any).showNotification('Có lỗi xảy ra khi cập nhật trạng thái thanh toán', 'error');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      (window as any).showNotification('Có lỗi xảy ra khi cập nhật trạng thái thanh toán', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleViewDetails = (registrationId: string) => {
    const registration = registrations.find(reg => reg.id === registrationId);
    if (registration) {
      setSelectedRegistration(registration);
    }
  };

  const handleDelete = async (registrationId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) {
      try {
        await deleteRegistration(registrationId);
        (window as any).showNotification?.('Đã xóa đăng ký thành công!', 'success');
        refetch(); // Refresh data after deletion
      } catch (error) {
        console.error('Error deleting registration:', error);
        (window as any).showNotification?.('Có lỗi xảy ra khi xóa đăng ký.', 'error');
      }
    }
  };

  const handleExport = () => {
    try {
      if (typeof window === 'undefined' || !(window as any).XLSX) {
        (window as any).showNotification?.('Thư viện XLSX chưa được tải. Vui lòng thử lại!', 'error');
        return;
      }
      const XLSX = (window as any).XLSX;
      const exportData = filteredRegistrations.map(r => ({
        'Sự kiện': getEventTitle(r.eventId),
        'Họ tên': r.fullName,
        'Email': r.email,
        'Số điện thoại': r.phone || '',
        'Tổ chức': r.organization || '',
        'Trạng thái': r.status,
        'Trạng thái thanh toán': r.paymentStatus || 'pending',
        'Mã giao dịch': r.transactionId || '',
        'Phương thức': r.paymentMethod || '',
        'Số tiền': r.amount || 0,
        'Ngày đăng ký': r.updatedAt ? new Date(r.updatedAt).toLocaleString('vi-VN') : ''
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      ws['!cols'] = [ 
        { wch: 30 }, { wch: 22 }, { wch: 28 }, { wch: 16 }, 
        { wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, 
        { wch: 12 }, { wch: 12 }, { wch: 22 } 
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'Dang ky su kien');
      const currentDate = new Date().toISOString().split('T')[0];
      const eventFilter = selectedEvent === 'all' ? 'tatca' : getEventTitle(selectedEvent).replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `dang_ky_su_kien_${eventFilter}_${currentDate}.xlsx`;
      XLSX.writeFile(wb, filename);
      (window as any).showNotification?.(`Đã xuất ${exportData.length} đăng ký thành công!`, 'success');
    } catch (e) {
      (window as any).showNotification?.('Có lỗi khi xuất Excel!', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: 'var(--text-secondary)'
      }}>
        <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          marginBottom: '10px',
          color: 'var(--primary)'
        }}>
          📋 Quản lý Đăng ký Sự kiện
        </h2>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.1rem',
          marginBottom: '20px'
        }}>
          Quản lý và xác thực các đăng ký tham gia sự kiện, bao gồm xác thực thanh toán
        </p>
      </div>

      {/* Filters and Export */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {/* Search */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                🔍 Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tên, email, tổ chức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'var(--background)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Event Filter */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                📅 Sự kiện
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'var(--background)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="all">Tất cả sự kiện</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                💳 Trạng thái Thanh toán
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'var(--background)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="all">Tất cả</option>
                <option value="pending_verification">Chờ xác thực</option>
                <option value="paid">Đã thanh toán</option>
                <option value="failed">Thất bại</option>
                <option value="pending">Chờ thanh toán</option>
              </select>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div style={{ display: 'flex', alignItems: 'end' }}>
          <button
            onClick={handleExport}
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-secondary)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <i className="fas fa-file-excel"></i>
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '30px'
      }}>
        {[
          { key: 'all', label: 'Tổng đăng ký', count: filteredRegistrations.length, color: '#3b82f6' },
          { key: 'pending_verification', label: 'Chờ xác thực', count: filteredRegistrations.filter(r => r.paymentStatus === 'pending_verification').length, color: '#f59e0b' },
          { key: 'paid', label: 'Đã thanh toán', count: filteredRegistrations.filter(r => r.paymentStatus === 'paid').length, color: '#22c55e' },
          { key: 'failed', label: 'Thất bại', count: filteredRegistrations.filter(r => r.paymentStatus === 'failed').length, color: '#ef4444' }
        ].map(({ key, label, count, color }) => (
          <div key={key} style={{
            background: 'var(--surface)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color, marginBottom: '8px' }}>
              {count}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Registrations Table */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border)'
      }}>
        {filteredRegistrations.length === 0 ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
            <p style={{ fontSize: '18px', margin: '0' }}>
              Không có đăng ký nào phù hợp với bộ lọc
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-variant)' }}>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', width: '50px' }}>STT</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Thông tin người dùng</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Sự kiện</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Trạng thái</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Ngày đăng ký</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg, index) => (
                  <tr key={reg.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{reg.fullName}</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{reg.email}</div>
                        {reg.phone && (
                          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{reg.phone}</div>
                        )}
                        {reg.organization && (
                          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>🏢 {reg.organization}</div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{getEventTitle(reg.eventId)}</div>
                        <div style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: '600' }}>
                          {formatPrice(getEventPrice(reg.eventId))}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <PaymentStatusBadge status={reg.paymentStatus || 'pending'} size="sm" />
                      </div>
                      {reg.transactionId && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          <strong>Mã GD:</strong> {reg.transactionId}
                        </div>
                      )}
                      {reg.paymentMethod && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <strong>PT:</strong> {
                            reg.paymentMethod === 'ocb' ? 'OCB' :
                            reg.paymentMethod === 'momo' ? 'MoMo' :
                            reg.paymentMethod
                          }
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {formatDate(reg.updatedAt || '')}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <PaymentActionButtons
                          registrationId={reg.id}
                          paymentStatus={reg.paymentStatus || 'pending'}
                          processing={processing}
                          onUpdatePaymentStatus={updatePaymentStatus}
                          size="sm"
                        />
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleViewDetails(reg.id)}
                            style={{
                              background: 'var(--accent)',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            👁️ Chi tiết
                          </button>
                          <button
                            onClick={() => handleDelete(reg.id)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registration Details Modal */}
      <RegistrationDetailsModal
        registration={selectedRegistration}
        onClose={() => setSelectedRegistration(null)}
      />
    </div>
  );
}