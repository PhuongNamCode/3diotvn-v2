"use client";

import React, { useState, useEffect } from 'react';
import { useCourseEnrollments, useCourses } from "@/lib/hooks/useData";
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import PaymentActionButtons from '../components/PaymentActionButtons';
import CourseEnrollmentDetailsModal from '../components/CourseEnrollmentDetailsModal';

export default function AdminCourseEnrollmentsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending_verification' | 'paid' | 'failed' | 'pending'>('all');
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  
  const { enrollments, loading, updateEnrollment, deleteEnrollment, refetch } = useCourseEnrollments();
  const { courses } = useCourses();

  useEffect(() => { refetch(); }, []);

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (enrollment.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === "all" || enrollment.courseId === selectedCourse;
    const matchesPayment = paymentFilter === 'all' || enrollment.paymentStatus === paymentFilter;
    return matchesSearch && matchesCourse && matchesPayment;
  });

  const getCourseTitle = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : "Unknown Course";
  };

  const getCoursePrice = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.price : 0;
  };

  const getCourseDiscountInfo = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return null;
    
    return {
      isDiscountActive: course.isDiscountActive || false,
      discountPercentage: course.discountPercentage || 0,
      discountAmount: course.discountAmount || 0,
      discountStartDate: course.discountStartDate,
      discountEndDate: course.discountEndDate
    };
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

  const updatePaymentStatus = async (enrollmentId: string, paymentStatus: 'paid' | 'failed') => {
    try {
      setProcessing(enrollmentId);
      
      const response = await fetch(`/api/course-enrollments/${enrollmentId}`, {
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
        await updateEnrollment(enrollmentId, {
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

  const handleViewDetails = (enrollmentId: string) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (enrollment) {
      setSelectedEnrollment(enrollment);
    }
  };

  const handleDelete = async (enrollmentId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) {
      try {
        await deleteEnrollment(enrollmentId);
        (window as any).showNotification?.('Đã xóa đăng ký thành công!', 'success');
        refetch(); // Refresh data after deletion
      } catch (error) {
        console.error('Error deleting enrollment:', error);
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
      const exportData = filteredEnrollments.map(r => ({
        'Khóa học': getCourseTitle(r.courseId),
        'Họ tên': r.fullName,
        'Email': r.email,
        'Số điện thoại': r.phone || '',
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
        { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 12 }, 
        { wch: 12 }, { wch: 22 } 
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'Dang ky khoa hoc');
      const currentDate = new Date().toISOString().split('T')[0];
      const courseFilter = selectedCourse === 'all' ? 'tatca' : getCourseTitle(selectedCourse).replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `dang_ky_khoa_hoc_${courseFilter}_${currentDate}.xlsx`;
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
          🎓 Quản lý Đăng ký Khóa học
        </h2>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.1rem',
          marginBottom: '20px'
        }}>
          Quản lý và xác thực các đăng ký tham gia khóa học, bao gồm xác thực thanh toán
        </p>
      </div>

      {/* Filters */}
      <div style={{ 
        background: 'var(--surface)', 
        padding: '20px', 
        borderRadius: '12px',
        marginBottom: '20px',
        border: '1px solid var(--border)'
      }}>
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
              placeholder="Tên, email, số điện thoại..."
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

          {/* Course Filter */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              🎓 Khóa học
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
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
              <option value="all">Tất cả khóa học</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
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
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="fas fa-download"></i>
              Xuất Excel
            </button>
          </div>
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
          { key: 'all', label: 'Tổng đăng ký', count: filteredEnrollments.length, color: '#3b82f6' },
          { key: 'pending_verification', label: 'Chờ xác thực', count: filteredEnrollments.filter(e => e.paymentStatus === 'pending_verification').length, color: '#f59e0b' },
          { key: 'paid', label: 'Đã thanh toán', count: filteredEnrollments.filter(e => e.paymentStatus === 'paid').length, color: '#22c55e' },
          { key: 'failed', label: 'Thất bại', count: filteredEnrollments.filter(e => e.paymentStatus === 'failed').length, color: '#ef4444' }
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

      {/* Enrollments Table */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border)'
      }}>
        {filteredEnrollments.length === 0 ? (
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
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Khóa học</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', width: '120px' }}>Discount</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Trạng thái</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Ngày đăng ký</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment, index) => (
                  <tr key={enrollment.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{enrollment.fullName}</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{enrollment.email}</div>
                        {enrollment.phone && (
                          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{enrollment.phone}</div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{getCourseTitle(enrollment.courseId)}</div>
                        <div style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: '600' }}>
                          {formatPrice(getCoursePrice(enrollment.courseId))}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {(() => {
                        const discountInfo = getCourseDiscountInfo(enrollment.courseId);
                        if (!discountInfo || !discountInfo.isDiscountActive) {
                          return (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              background: '#f3f4f6',
                              color: '#6b7280',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              <i className="fas fa-percentage"></i>
                              0%
                            </div>
                          );
                        }

                        const now = new Date();
                        const startDate = discountInfo.discountStartDate ? new Date(discountInfo.discountStartDate) : null;
                        const endDate = discountInfo.discountEndDate ? new Date(discountInfo.discountEndDate) : null;
                        
                        // Check if discount is within date range
                        const isWithinDateRange = (!startDate || now >= startDate) && (!endDate || now <= endDate);
                        
                        if (!isWithinDateRange) {
                          return (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              background: '#fef3c7',
                              color: '#d97706',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              <i className="fas fa-clock"></i>
                              Hết hạn
                            </div>
                          );
                        }

                        const discountText = discountInfo.discountPercentage > 0 
                          ? `${discountInfo.discountPercentage}%`
                          : `${discountInfo.discountAmount.toLocaleString('vi-VN')}₫`;

                        return (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            background: '#dcfce7',
                            color: '#16a34a',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            <i className="fas fa-percentage"></i>
                            {discountText}
                          </div>
                        );
                      })()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <PaymentStatusBadge status={enrollment.paymentStatus || 'pending'} size="sm" />
                      </div>
                      {enrollment.transactionId && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          <strong>Mã GD:</strong> {enrollment.transactionId}
                        </div>
                      )}
                      {enrollment.paymentMethod && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <strong>PT:</strong> {
                            enrollment.paymentMethod === 'ocb' ? 'OCB' :
                            enrollment.paymentMethod === 'momo' ? 'MoMo' :
                            enrollment.paymentMethod
                          }
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {formatDate(enrollment.updatedAt || '')}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <PaymentActionButtons
                          registrationId={enrollment.id}
                          paymentStatus={enrollment.paymentStatus || 'pending'}
                          processing={processing}
                          onUpdatePaymentStatus={updatePaymentStatus}
                          size="sm"
                        />
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleViewDetails(enrollment.id)}
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
                            onClick={() => handleDelete(enrollment.id)}
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

      {/* Course Enrollment Details Modal */}
      <CourseEnrollmentDetailsModal
        enrollment={selectedEnrollment}
        onClose={() => setSelectedEnrollment(null)}
      />
    </div>
  );
}