import React from 'react';
import { CourseEnrollment } from '@/lib/hooks/useData';
import PaymentStatusBadge from './PaymentStatusBadge';

interface CourseEnrollmentDetailsModalProps {
  enrollment: CourseEnrollment | null;
  onClose: () => void;
}

export default function CourseEnrollmentDetailsModal({ enrollment, onClose }: CourseEnrollmentDetailsModalProps) {
  if (!enrollment) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' VNĐ';
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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--surface)',
        borderRadius: '16px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: 0,
            color: 'var(--text-primary)'
          }}>
            🎓 Chi tiết Đăng ký Khóa học
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Thông tin người dùng */}
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '16px',
                color: 'var(--text-primary)',
                borderBottom: '2px solid var(--accent)',
                paddingBottom: '8px'
              }}>
                👤 Thông tin người dùng
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Họ tên:</strong>
                  <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>{enrollment.fullName}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Email:</strong>
                  <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>{enrollment.email}</span>
                </div>
                {enrollment.phone && (
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Số điện thoại:</strong>
                    <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>{enrollment.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin khóa học */}
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '16px',
                color: 'var(--text-primary)',
                borderBottom: '2px solid var(--accent)',
                paddingBottom: '8px'
              }}>
                🎓 Thông tin khóa học
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Tên khóa học:</strong>
                  <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
                    {enrollment.course?.title || 'N/A'}
                  </span>
                </div>
                {enrollment.course?.price && (
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Học phí:</strong>
                    <span style={{ marginLeft: '8px', color: 'var(--accent)', fontWeight: '600' }}>
                      {formatPrice(enrollment.course.price)}
                    </span>
                  </div>
                )}
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Trạng thái đăng ký:</strong>
                  <span style={{ marginLeft: '8px' }}>{getStatusBadge(enrollment.status)}</span>
                </div>
              </div>
            </div>

            {/* Thông tin thanh toán */}
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '16px',
                color: 'var(--text-primary)',
                borderBottom: '2px solid var(--accent)',
                paddingBottom: '8px'
              }}>
                💳 Thông tin thanh toán
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Trạng thái:</strong>
                  <span style={{ marginLeft: '8px' }}>
                    <PaymentStatusBadge status={enrollment.paymentStatus || 'pending'} size="md" />
                  </span>
                </div>
                {enrollment.transactionId && (
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Mã giao dịch:</strong>
                    <span style={{ 
                      marginLeft: '8px', 
                      color: 'var(--text-secondary)',
                      fontFamily: 'monospace',
                      background: 'var(--surface-variant)',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {enrollment.transactionId}
                    </span>
                  </div>
                )}
                {enrollment.paymentMethod && (
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Phương thức:</strong>
                    <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
                      {enrollment.paymentMethod === 'ocb' ? 'OCB Bank' :
                       enrollment.paymentMethod === 'momo' ? 'MoMo' :
                       enrollment.paymentMethod}
                    </span>
                  </div>
                )}
                {enrollment.amount && (
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Số tiền:</strong>
                    <span style={{ marginLeft: '8px', color: 'var(--accent)', fontWeight: '600' }}>
                      {formatPrice(enrollment.amount)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin thời gian */}
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '16px',
                color: 'var(--text-primary)',
                borderBottom: '2px solid var(--accent)',
                paddingBottom: '8px'
              }}>
                ⏰ Thông tin thời gian
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Ngày đăng ký:</strong>
                  <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>
                    {formatDate(enrollment.updatedAt || '')}
                  </span>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>ID đăng ký:</strong>
                  <span style={{ 
                    marginLeft: '8px', 
                    color: 'var(--text-secondary)',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    background: 'var(--surface-variant)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {enrollment.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface-variant)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
