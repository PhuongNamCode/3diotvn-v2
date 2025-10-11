"use client";

import { useState } from "react";
import { useEvents } from "@/lib/hooks/useData";

export default function AdminEventsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [cropData, setCropData] = useState({ x: 0, y: 0, scale: 1 });
  const { events, loading, createEvent, updateEvent, deleteEvent } = useEvents();

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setUploadedImage(event.image || "");
    setShowEventModal(true);
    
    // Hiển thị trường "Số lượng đã tham gia" nếu sự kiện đã diễn ra
    setTimeout(() => {
      const statusSelect = document.getElementById('eventStatus') as HTMLSelectElement;
      const actualParticipantsGroup = document.getElementById('actualParticipantsGroup') as HTMLDivElement;
      const actualParticipantsField = document.getElementById('actualParticipants') as HTMLInputElement;
      
      if (statusSelect && actualParticipantsGroup && actualParticipantsField) {
        if (event.status === 'past') {
          actualParticipantsGroup.style.display = 'block';
          actualParticipantsField.required = true;
        } else {
          actualParticipantsGroup.style.display = 'none';
          actualParticipantsField.required = false;
        }
      }
    }, 100);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      try {
        await deleteEvent(eventId);
        (window as any).showNotification('Sự kiện đã được xóa!', 'success');
      } catch (error) {
        (window as any).showNotification('Lỗi khi xóa sự kiện!', 'error');
      }
    }
  };

  const handleViewRegistrations = (eventId: string) => {
    // Switch to registrations tab
    if (typeof window !== 'undefined' && (window as any).switchToRegistrationsTab) {
      (window as any).switchToRegistrationsTab();
    }
    (window as any).showNotification('Đang tải danh sách đăng ký...', 'info');
  };

  const handleExportData = async (eventId: string) => {
    try {
      // Check if XLSX is available
      if (typeof window === 'undefined' || !(window as any).XLSX) {
        (window as any).showNotification('Thư viện XLSX chưa được tải. Vui lòng thử lại!', 'error');
        return;
      }

      const XLSX = (window as any).XLSX;
      
      // Find the event
      const event = events.find(e => e.id === eventId);
      if (!event) {
        (window as any).showNotification('Không tìm thấy sự kiện!', 'error');
        return;
      }

      (window as any).showNotification('Đang tải dữ liệu đăng ký...', 'info');

      // Fetch registrations for this event
      const response = await fetch(`/api/registrations?eventId=${eventId}`);
      const result = await response.json();

      if (!result.success) {
        (window as any).showNotification('Lỗi khi tải dữ liệu đăng ký!', 'error');
        return;
      }

      const registrations = result.data || [];

      // Prepare event data
      const eventData = [{
        'Thông tin': 'Tên sự kiện',
        'Giá trị': event.title
      }, {
        'Thông tin': 'Ngày diễn ra',
        'Giá trị': formatDate(event.date)
      }, {
        'Thông tin': 'Thời gian',
        'Giá trị': event.time
      }, {
        'Thông tin': 'Địa điểm',
        'Giá trị': event.location
      }, {
        'Thông tin': 'Sức chứa',
        'Giá trị': event.capacity.toString()
      }, {
        'Thông tin': 'Số lượng đăng ký',
        'Giá trị': registrations.length.toString()
      }, {
        'Thông tin': 'Số lượng tham gia thực tế',
        'Giá trị': event.actualParticipants?.toString() || 'Chưa cập nhật'
      }, {
        'Thông tin': 'Trạng thái',
        'Giá trị': event.status === 'upcoming' ? 'Sắp diễn ra' : event.status === 'past' ? 'Đã diễn ra' : 'Đã hủy'
      }];

      // Prepare registrations data
      const registrationsData = registrations.map((reg: any) => ({
        'Họ tên': reg.fullName,
        'Email': reg.email,
        'Số điện thoại': reg.phone || '',
        'Tổ chức': reg.organization || '',
        'Kinh nghiệm': reg.experience || '',
        'Mong đợi': reg.expectation || '',
        'Trạng thái': reg.status === 'confirmed' ? 'Đã xác nhận' : 
                    reg.status === 'pending' ? 'Chờ xác nhận' : 
                    reg.status === 'cancelled' ? 'Đã hủy' : 'Chờ xử lý',
        'Ngày đăng ký': reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('vi-VN') : ''
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Add event info sheet
      const eventWs = XLSX.utils.json_to_sheet(eventData);
      eventWs['!cols'] = [{ wch: 25 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, eventWs, 'Thông tin sự kiện');

      // Add registrations sheet
      if (registrationsData.length > 0) {
        const regWs = XLSX.utils.json_to_sheet(registrationsData);
        regWs['!cols'] = [
          { wch: 20 }, // Họ tên
          { wch: 25 }, // Email
          { wch: 15 }, // Số điện thoại
          { wch: 20 }, // Tổ chức
          { wch: 25 }, // Kinh nghiệm
          { wch: 25 }, // Mong đợi
          { wch: 15 }, // Trạng thái
          { wch: 20 }  // Ngày đăng ký
        ];
        XLSX.utils.book_append_sheet(wb, regWs, 'Danh sách đăng ký');
      }

      // Generate filename
      const currentDate = new Date().toISOString().split('T')[0];
      const eventName = event.title.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `su_kien_${eventName}_${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      
      (window as any).showNotification(`Đã xuất dữ liệu sự kiện "${event.title}" thành công!`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      (window as any).showNotification('Có lỗi xảy ra khi xuất file Excel!', 'error');
    }
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setUploadedImage("");
    setShowEventModal(true);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedImage(result.data.url);
        (window as any).showNotification('Hình ảnh đã được tải lên!', 'success');
      } else {
        (window as any).showNotification(result.error || 'Lỗi khi tải lên hình ảnh!', 'error');
      }
    } catch (error) {
      (window as any).showNotification('Lỗi khi tải lên hình ảnh!', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleImageCrop = () => {
    setShowImageCropper(true);
  };

  const handleCropConfirm = () => {
    // Apply crop data to the image
    setShowImageCropper(false);
    (window as any).showNotification('Ảnh đã được căn chỉnh!', 'success');
  };

  const handleCropCancel = () => {
    setShowImageCropper(false);
    setCropData({ x: 0, y: 0, scale: 1 });
  };

  const handleCropChange = (newCropData: { x: number; y: number; scale: number }) => {
    setCropData(newCropData);
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      const finalEventData = {
        ...eventData,
        image: uploadedImage
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, finalEventData);
        (window as any).showNotification('Sự kiện đã được cập nhật!', 'success');
      } else {
        await createEvent(finalEventData);
        (window as any).showNotification('Sự kiện đã được tạo!', 'success');
      }
      setShowEventModal(false);
      setEditingEvent(null);
      setUploadedImage("");
    } catch (error) {
      (window as any).showNotification('Lỗi khi lưu sự kiện!', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return (
          <span style={{
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <i className="fas fa-clock" style={{ fontSize: '10px' }}></i>
            Sắp diễn ra
          </span>
        );
      case 'past':
        return (
          <span style={{
            background: 'linear-gradient(135deg, #6b7280, #9ca3af)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(107, 114, 128, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <i className="fas fa-check-circle" style={{ fontSize: '10px' }}></i>
            Đã diễn ra
          </span>
        );
      case 'cancelled':
        return (
          <span style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <i className="fas fa-times-circle" style={{ fontSize: '10px' }}></i>
            Đã hủy
          </span>
        );
      default:
        return (
          <span style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <i className="fas fa-hourglass-half" style={{ fontSize: '10px' }}></i>
            Chờ xử lý
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="admin-events" style={{
      padding: '24px',
      background: 'var(--background)',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          transform: 'translate(-50%, 50%)'
        }}></div>
        
        <div style={{
          position: 'relative',
          zIndex: 1
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <i className="fas fa-calendar-alt" style={{ fontSize: '2rem' }}></i>
            Quản lý sự kiện
          </h1>
          <p style={{
            fontSize: '1.1rem',
            margin: '0',
            opacity: 0.9
          }}>
            Tổng cộng {events.length} sự kiện • {events.filter(e => e.status === 'upcoming').length} sắp diễn ra
          </p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            flex: '1',
            minWidth: '300px'
          }}>
            <div style={{
              position: 'relative',
              background: 'var(--background)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              overflow: 'hidden'
            }}>
              <i className="fas fa-search" style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
                fontSize: '16px'
              }}></i>
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '16px',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={handleAddEvent}
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              color: 'white',
              border: 'none',
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              minHeight: '56px',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
            }}
          >
            <i className="fas fa-plus"></i>
            Thêm sự kiện
          </button>
        </div>
      </div>

      <div className="table-container" style={{
        background: 'var(--surface)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        {/* Table Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--surface-variant), var(--surface))',
          padding: '24px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--primary)',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <i className="fas fa-table" style={{ color: 'var(--accent)' }}></i>
              Danh sách sự kiện
            </h3>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-info-circle"></i>
              {filteredEvents.length} sự kiện
            </div>
          </div>
        </div>

        <div className="table-content" style={{
          overflow: 'auto'
        }}>
          <table className="data-table" style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'var(--surface)'
          }}>
            <thead style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'white'
            }}>
              <tr>
                <th style={{
                  padding: '20px 24px',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <i className="fas fa-calendar-alt" style={{ marginRight: '8px' }}></i>
                  Tên sự kiện
                </th>
                <th style={{
                  padding: '20px 24px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <i className="fas fa-clock" style={{ marginRight: '8px' }}></i>
                  Ngày & Thời gian
                </th>
                <th style={{
                  padding: '20px 24px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <i className="fas fa-map-marker-alt" style={{ marginRight: '8px' }}></i>
                  Địa điểm
                </th>
                <th style={{
                  padding: '20px 24px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <i className="fas fa-users" style={{ marginRight: '8px' }}></i>
                  Đăng ký
                </th>
                <th style={{
                  padding: '20px 24px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
                  Trạng thái
                </th>
                <th style={{
                  padding: '20px 24px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <i className="fas fa-cogs" style={{ marginRight: '8px' }}></i>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ 
                    textAlign: 'center', 
                    padding: '3rem',
                    color: 'var(--text-secondary)',
                    fontSize: '16px'
                  }}>
                    <i className="fas fa-spinner fa-spin" style={{ 
                      fontSize: '24px', 
                      marginRight: '12px',
                      color: 'var(--accent)'
                    }}></i> 
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ 
                    textAlign: 'center', 
                    padding: '3rem',
                    color: 'var(--text-secondary)',
                    fontSize: '16px'
                  }}>
                    <i className="fas fa-calendar-times" style={{ 
                      fontSize: '48px', 
                      marginBottom: '16px',
                      color: 'var(--text-muted)',
                      display: 'block'
                    }}></i>
                    Không có sự kiện nào
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event, index) => (
                  <tr key={event.id} style={{
                    borderBottom: '1px solid var(--border)',
                    transition: 'all 0.3s ease',
                    background: index % 2 === 0 ? 'var(--surface)' : 'var(--background)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-variant)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 ? 'var(--surface)' : 'var(--background)';
                  }}>
                    <td style={{
                      padding: '20px 24px',
                      fontWeight: '600',
                      color: 'var(--primary)',
                      fontSize: '16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: event.status === 'upcoming' 
                            ? 'linear-gradient(135deg, #10b981, #34d399)'
                            : event.status === 'past'
                            ? 'linear-gradient(135deg, #6b7280, #9ca3af)'
                            : 'linear-gradient(135deg, #ef4444, #dc2626)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}></div>
                        {event.title}
                      </div>
                    </td>
                    <td style={{
                      padding: '20px 24px',
                      textAlign: 'center',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <span style={{ fontWeight: '600' }}>{formatDate(event.date)}</span>
                        <span style={{ 
                          color: 'var(--text-secondary)',
                          fontSize: '12px'
                        }}>{event.time}</span>
                      </div>
                    </td>
                    <td style={{
                      padding: '20px 24px',
                      textAlign: 'center',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}>
                        <i className="fas fa-map-marker-alt" style={{
                          color: 'var(--accent)',
                          fontSize: '12px'
                        }}></i>
                        <span>{event.location}</span>
                      </div>
                    </td>
                    <td style={{
                      padding: '20px 24px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{
                          fontWeight: '600',
                          color: 'var(--primary)',
                          fontSize: '16px'
                        }}>
                          {event.status === 'past' && event.actualParticipants !== undefined 
                            ? `${event.actualParticipants}/${event.capacity}` 
                            : `${event.registrations}/${event.capacity}`
                          }
                        </span>
                        <div style={{
                          width: '60px',
                          height: '4px',
                          background: 'var(--surface-variant)',
                          borderRadius: '2px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${Math.min(
                              (event.status === 'past' && event.actualParticipants !== undefined 
                                ? event.actualParticipants 
                                : event.registrations) / event.capacity * 100, 
                              100
                            )}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--accent), var(--accent-secondary))',
                            borderRadius: '2px',
                            transition: 'width 0.3s ease'
                          }}></div>
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '20px 24px',
                      textAlign: 'center'
                    }}>
                      {getStatusBadge(event.status)}
                    </td>
                    <td style={{
                      padding: '20px 24px',
                      textAlign: 'center'
                    }}>
                      <div className="action-buttons" style={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'center'
                      }}>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleViewRegistrations(event.id)}
                          title="Xem đăng ký"
                          style={{
                            background: 'linear-gradient(135deg, #6b7280, #9ca3af)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(107, 114, 128, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 114, 128, 0.3)';
                          }}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEditEvent(event)}
                          title="Chỉnh sửa"
                          style={{
                            background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        {event.status === 'past' ? (
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleExportData(event.id)}
                            title="Xuất dữ liệu"
                            style={{
                              background: 'linear-gradient(135deg, #10b981, #34d399)',
                              color: 'white',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                            }}
                          >
                            <i className="fas fa-download"></i>
                          </button>
                      ) : (
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteEvent(event.id)}
                          title="Xóa"
                          style={{
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingEvent ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
              </h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form className="event-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="eventTitle">Tên sự kiện *</label>
                    <input 
                      type="text" 
                      id="eventTitle" 
                      name="title"
                      defaultValue={editingEvent?.title || ''}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="eventCategory">Danh mục</label>
                    <select id="eventCategory" name="category" defaultValue={editingEvent?.category || 'workshop'}>
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="hackathon">Hackathon</option>
                      <option value="conference">Conference</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="eventDescription">Mô tả sự kiện *</label>
                  <textarea 
                    id="eventDescription" 
                    name="description"
                    required
                    placeholder="Mô tả chi tiết về sự kiện..."
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="eventDate">Ngày diễn ra *</label>
                    <input type="date" id="eventDate" name="date" defaultValue={editingEvent?.date || ''} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="eventTime">Thời gian *</label>
                    <input 
                      type="text" 
                      id="eventTime" 
                      name="time"
                      defaultValue={editingEvent?.time || ''}
                      placeholder="09:00 - 17:00" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="eventLocation">Địa điểm *</label>
                    <input type="text" id="eventLocation" name="location" defaultValue={editingEvent?.location || ''} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="eventCapacity">Số lượng tham gia *</label>
                    <input 
                      type="number" 
                      id="eventCapacity" 
                      name="capacity"
                      defaultValue={editingEvent?.capacity || ''}
                      min="1" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="eventOnlineLink">Link tham gia online (nếu là sự kiện online)</label>
                  <input 
                    type="url" 
                    id="eventOnlineLink" 
                    name="onlineLink"
                    defaultValue={editingEvent?.onlineLink || ''}
                    placeholder="https://zoom.us/j/... hoặc https://meet.google.com/..."
                  />
                  <small style={{ color: '#666', fontSize: '0.9rem' }}>
                    Chỉ điền nếu sự kiện diễn ra online. Link này sẽ được gửi trong email xác nhận đăng ký.
                  </small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="eventPrice">Giá vé (VNĐ)</label>
                    <input 
                      type="number" 
                      id="eventPrice" 
                      name="price"
                      min="0" 
                      defaultValue={editingEvent?.price || 0}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="eventSpeakers">Diễn giả</label>
                    <input 
                      type="text" 
                      id="eventSpeakers" 
                      name="speakers"
                      defaultValue={editingEvent?.speakers?.join(', ') || ''}
                      placeholder="Tên các diễn giả, phân cách bằng dấu phẩy"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="eventRequirements">Yêu cầu tham gia</label>
                  <textarea 
                    id="eventRequirements" 
                    name="requirements"
                    defaultValue={editingEvent?.requirements || ''}
                    placeholder="Kiến thức cần có, thiết bị cần mang..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="eventAgenda">Chương trình sự kiện</label>
                  <textarea 
                    id="eventAgenda" 
                    name="agenda"
                    defaultValue={editingEvent?.agenda || ''}
                    placeholder="09:00 - Check-in&#10;09:30 - Opening..."
                  ></textarea>
                </div>

                  <div className="form-group">
                    <label htmlFor="eventStatus">Trạng thái</label>
                    <select id="eventStatus" name="status" defaultValue={editingEvent?.status || 'upcoming'} onChange={(e) => {
                      const statusField = document.getElementById('actualParticipants') as HTMLInputElement;
                      const statusGroup = document.getElementById('actualParticipantsGroup') as HTMLDivElement;
                      if (e.target.value === 'past') {
                        statusGroup.style.display = 'block';
                        statusField.required = true;
                      } else {
                        statusGroup.style.display = 'none';
                        statusField.required = false;
                        statusField.value = '';
                      }
                    }}>
                      <option value="upcoming">Sắp diễn ra</option>
                      <option value="past">Đã diễn ra</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>

                <div className="form-group" id="actualParticipantsGroup" style={{ display: 'none' }}>
                  <label htmlFor="actualParticipants">Số lượng đã tham gia *</label>
                  <input 
                    type="number" 
                    id="actualParticipants" 
                    name="actualParticipants"
                    min="0" 
                    defaultValue={editingEvent?.actualParticipants || ''}
                    placeholder="Nhập số lượng người đã tham gia thực tế"
                  />
                </div>

                <div className="form-group">
                  <label>Hình ảnh sự kiện</label>
                  {uploadedImage ? (
                    <div className="image-preview">
                      <img 
                        src={uploadedImage} 
                        alt="Event preview" 
                        style={{
                          transform: `translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.scale})`,
                          transformOrigin: 'center'
                        }}
                      />
                      <div className="image-actions">
                        <button 
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={handleImageCrop}
                        >
                          <i className="fas fa-crop"></i> Căn chỉnh ảnh
                        </button>
                        <button 
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => setUploadedImage("")}
                        >
                          <i className="fas fa-trash"></i> Xóa ảnh
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="file-upload">
                      <i className="fas fa-cloud-upload-alt file-upload-icon"></i>
                      <p className="file-upload-text">
                        {isUploading ? 'Đang tải lên...' : 'Kéo thả hình ảnh vào đây hoặc click để chọn'}
                      </p>
                      <p className="file-upload-hint">PNG, JPG, GIF up to 5MB</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        disabled={isUploading}
                        style={{ display: 'none' }}
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="file-upload-label">
                        {isUploading ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-plus"></i>
                        )}
                        {isUploading ? 'Đang tải lên...' : 'Chọn hình ảnh'}
                      </label>
                    </div>
                  )}
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                }}
              >
                Hủy
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  // Get form data
                  const form = document.querySelector('.event-form') as HTMLFormElement;
                  if (form) {
                    const formData = new FormData(form);
                    const eventData = {
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      date: formData.get('date') as string,
                      time: formData.get('time') as string,
                      location: formData.get('location') as string,
                      onlineLink: formData.get('onlineLink') as string || null,
                      capacity: parseInt(formData.get('capacity') as string),
                      price: parseInt(formData.get('price') as string),
                      speakers: (formData.get('speakers') as string).split(',').map(s => s.trim()),
                      requirements: formData.get('requirements') as string,
                      agenda: formData.get('agenda') as string,
                      category: formData.get('category') as string,
                      status: formData.get('status') as string,
                      actualParticipants: formData.get('status') === 'past' ? parseInt(formData.get('actualParticipants') as string) || 0 : undefined
                    };
                    handleSaveEvent(eventData);
                  }
                }}
              >
                <i className="fas fa-save"></i>
                Lưu sự kiện
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showImageCropper && (
        <div className="modal active">
          <div className="modal-content image-cropper-modal">
            <div className="modal-header">
              <h3 className="modal-title">Căn chỉnh hình ảnh</h3>
              <button 
                className="modal-close"
                onClick={handleCropCancel}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="image-cropper-container">
                <div className="cropper-wrapper">
                  <img 
                    src={uploadedImage} 
                    alt="Crop preview" 
                    className="cropper-image"
                    style={{
                      transform: `translate(${cropData.x}px, ${cropData.y}px) scale(${cropData.scale})`,
                      transformOrigin: 'center'
                    }}
                  />
                </div>
                <div className="cropper-controls">
                  <div className="control-group">
                    <label>Vị trí X:</label>
                    <input 
                      type="range" 
                      min="-100" 
                      max="100" 
                      value={cropData.x}
                      onChange={(e) => handleCropChange({...cropData, x: parseInt(e.target.value)})}
                    />
                    <span>{cropData.x}px</span>
                  </div>
                  <div className="control-group">
                    <label>Vị trí Y:</label>
                    <input 
                      type="range" 
                      min="-100" 
                      max="100" 
                      value={cropData.y}
                      onChange={(e) => handleCropChange({...cropData, y: parseInt(e.target.value)})}
                    />
                    <span>{cropData.y}px</span>
                  </div>
                  <div className="control-group">
                    <label>Phóng to:</label>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="2" 
                      step="0.1"
                      value={cropData.scale}
                      onChange={(e) => handleCropChange({...cropData, scale: parseFloat(e.target.value)})}
                    />
                    <span>{Math.round(cropData.scale * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={handleCropCancel}
              >
                Hủy
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCropConfirm}
              >
                <i className="fas fa-check"></i>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
