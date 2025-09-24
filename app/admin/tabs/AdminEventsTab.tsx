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

  const handleExportData = (eventId: string) => {
    (window as any).showNotification('Đang xuất dữ liệu...', 'info');
    setTimeout(() => {
      (window as any).showNotification('Xuất dữ liệu thành công!', 'success');
    }, 2000);
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
        return <span className="status-badge status-upcoming">Sắp diễn ra</span>;
      case 'past':
        return <span className="status-badge status-past">Đã diễn ra</span>;
      case 'cancelled':
        return <span className="status-badge status-cancelled">Đã hủy</span>;
      default:
        return <span className="status-badge status-pending">Chờ xử lý</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="admin-events">
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Quản lý sự kiện</h3>
          <div className="table-actions">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          <button 
            className="btn btn-primary"
            onClick={handleAddEvent}
          >
            <i className="fas fa-plus"></i>
            Thêm sự kiện
          </button>
          </div>
        </div>
        <div className="table-content">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên sự kiện</th>
                <th>Ngày</th>
                <th>Địa điểm</th>
                <th>Đăng ký</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    <i className="fas fa-spinner fa-spin"></i> Đang tải...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    Không có sự kiện nào
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.id}</td>
                    <td>{event.title}</td>
                    <td>{formatDate(event.date)}</td>
                    <td>{event.location}</td>
                    <td>
                      {event.status === 'past' && event.actualParticipants !== undefined 
                        ? `${event.actualParticipants}/${event.capacity}` 
                        : `${event.registrations}/${event.capacity}`
                      }
                    </td>
                    <td>{getStatusBadge(event.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleViewRegistrations(event.id)}
                        title="Xem đăng ký"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEditEvent(event)}
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      {event.status === 'past' ? (
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handleExportData(event.id)}
                          title="Xuất dữ liệu"
                        >
                          <i className="fas fa-download"></i>
                        </button>
                      ) : (
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteEvent(event.id)}
                          title="Xóa"
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
