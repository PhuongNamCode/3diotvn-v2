"use client";

import { useEffect, useMemo, useState } from "react";
import { useCourses, useCourseEnrollments } from "@/lib/hooks/useData";
import { calculateFakeEnrollmentCount } from "@/lib/utils/enrollmentUtils";

export default function AdminCoursesTab() {
  const { courses, loading, error, createCourse, updateCourse, deleteCourse, refetch } = useCourses();
  const { enrollments, refetch: refetchEnrollments, updateEnrollment, deleteEnrollment } = useCourseEnrollments();
  
  // State management
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  
  // Enrollment editing state
  
  // Form state with discount fields
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    level: "beginner",
    price: 0,
    status: "published",
    category: "IoT",
    lessonsCount: 0,
    durationMinutes: 0,
    tags: "",
    // Discount fields
    discountPercentage: 0,
    discountAmount: 0,
    discountStartDate: "",
    discountEndDate: "",
    isDiscountActive: false,
    // Enhanced fields
    overview: "",
    curriculum: "",
    instructorName: "",
    instructorBio: "",
    instructorImage: "",
    instructorEmail: "",
    requirements: "",
    whatYouWillLearn: "",
  });

  // Lessons state for curriculum
  const [lessons, setLessons] = useState([
    { id: 1, title: "", duration: "", type: "youtube", url: "" }
  ]);

  // Lessons management functions
  const addLesson = () => {
    const newId = Math.max(...lessons.map(l => l.id), 0) + 1;
    setLessons([...lessons, { id: newId, title: "", duration: "", type: "youtube", url: "" }]);
  };

  const removeLesson = (id: number) => {
    if (lessons.length > 1) {
      setLessons(lessons.filter(l => l.id !== id));
    }
  };

  const updateLesson = (id: number, field: string, value: string) => {
    setLessons(lessons.map(l => 
      l.id === id ? { ...l, [field]: value } : l
    ));
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || course.category === filterCategory;
      const matchesStatus = !filterStatus || course.status === filterStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [courses, searchTerm, filterCategory, filterStatus]);

  // Calculate final price with discount
  const calculateFinalPrice = (course: any) => {
    if (!course.isDiscountActive) return course.price;
    
    const now = new Date();
    const startDate = course.discountStartDate ? new Date(course.discountStartDate) : null;
    const endDate = course.discountEndDate ? new Date(course.discountEndDate) : null;
    
    // Check if discount is within date range
    if (startDate && now < startDate) return course.price;
    if (endDate && now > endDate) return course.price;
    
    if (course.discountPercentage > 0) {
      return Math.max(0, course.price - (course.price * course.discountPercentage / 100));
    }
    
    if (course.discountAmount > 0) {
      return Math.max(0, course.price - course.discountAmount);
    }
    
    return course.price;
  };

  // Upload handler
  async function handleUpload(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data?.success && data?.data?.url) {
        setForm({ ...form, image: data.data.url });
        (window as any).showNotification?.('Tải ảnh thành công', 'success');
      } else {
        throw new Error(data?.error || 'Upload failed');
      }
    } catch (e) {
      (window as any).showNotification?.('Lỗi tải ảnh', 'error');
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => { refetch(); }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Convert lessons to curriculum format
      const curriculum = lessons
        .filter(lesson => lesson.title.trim() !== "")
        .map(lesson => ({
          title: lesson.title,
          duration: lesson.duration,
          type: lesson.type,
          url: lesson.url
        }));

      // Parse whatYouWillLearn JSON safely
      let whatYouWillLearn = [];
      try {
        whatYouWillLearn = form.whatYouWillLearn ? JSON.parse(form.whatYouWillLearn) : [];
      } catch (e) {
        console.warn('Invalid whatYouWillLearn JSON, using empty array');
      }

      const courseData = {
        title: form.title,
        description: form.description,
        image: form.image,
        level: form.level,
        price: Number(form.price),
        status: form.status,
        category: form.category,
        lessonsCount: Number(form.lessonsCount),
        durationMinutes: Number(form.durationMinutes),
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
        // Discount fields
        discountPercentage: Number(form.discountPercentage),
        discountAmount: Number(form.discountAmount),
        discountStartDate: form.discountStartDate ? new Date(form.discountStartDate) : null,
        discountEndDate: form.discountEndDate ? new Date(form.discountEndDate) : null,
        isDiscountActive: form.isDiscountActive,
        // Enhanced fields
        overview: form.overview,
        curriculum: curriculum,
        instructorName: form.instructorName,
        instructorBio: form.instructorBio,
        instructorImage: form.instructorImage,
        instructorEmail: form.instructorEmail,
        requirements: form.requirements,
        whatYouWillLearn: whatYouWillLearn,
      };

      if (editingId) {
        await updateCourse(editingId, courseData as any);
      } else {
        await createCourse(courseData as any);
      }
      
      setFormOpen(false);
      setEditingId(null);
      resetForm();
      (window as any).showNotification?.('Lưu khóa học thành công', 'success');
    } catch (err) {
      (window as any).showNotification?.('Lỗi lưu khóa học', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "", description: "", image: "", level: "beginner", price: 0, status: "published",
      category: "IoT", lessonsCount: 0, durationMinutes: 0, tags: "",
      discountPercentage: 0, discountAmount: 0, discountStartDate: "", discountEndDate: "", isDiscountActive: false,
      overview: "", curriculum: "", instructorName: "", instructorBio: "",
      instructorImage: "", instructorEmail: "", requirements: "", whatYouWillLearn: ""
    });
    setLessons([{ id: 1, title: "", duration: "", type: "youtube", url: "" }]);
  };

  const onEdit = (id: string) => {
    const c = courses.find(x => x.id === id);
    if (!c) return;
    setEditingId(id);
    setFormOpen(true);
    setForm({
      title: c.title,
      description: c.description,
      image: c.image || "",
      level: c.level,
      price: c.price,
      status: c.status,
      category: c.category,
      lessonsCount: c.lessonsCount,
      durationMinutes: c.durationMinutes,
      tags: (c.tags || []).join(', '),
      // Discount fields
      discountPercentage: c.discountPercentage || 0,
      discountAmount: c.discountAmount || 0,
      discountStartDate: c.discountStartDate ? new Date(c.discountStartDate as string).toISOString().split('T')[0] : "",
      discountEndDate: c.discountEndDate ? new Date(c.discountEndDate as string).toISOString().split('T')[0] : "",
      isDiscountActive: c.isDiscountActive || false,
      // Enhanced fields
      overview: c.overview || "",
      curriculum: Array.isArray(c.curriculum) ? JSON.stringify(c.curriculum, null, 2) : (c.curriculum || ""),
      instructorName: c.instructorName || "",
      instructorBio: c.instructorBio || "",
      instructorImage: c.instructorImage || "",
      instructorEmail: c.instructorEmail || "",
      requirements: c.requirements || "",
      whatYouWillLearn: Array.isArray(c.whatYouWillLearn) ? JSON.stringify(c.whatYouWillLearn, null, 2) : (c.whatYouWillLearn || ""),
    });

    // Load lessons from curriculum
    if (Array.isArray(c.curriculum) && c.curriculum.length > 0) {
      const loadedLessons = c.curriculum.map((lesson: any, index: number) => ({
        id: index + 1,
        title: lesson.title || "",
        duration: lesson.duration || "",
        type: lesson.type || "youtube",
        url: lesson.url || ""
      }));
      setLessons(loadedLessons);
    } else {
      setLessons([{ id: 1, title: "", duration: "", type: "youtube", url: "" }]);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Xóa khóa học này?')) return;
    try {
      await deleteCourse(id);
      (window as any).showNotification?.('Đã xóa khóa học', 'success');
    } catch {
      (window as any).showNotification?.('Lỗi xóa khóa học', 'error');
    }
  };

  const openEnrollmentsForCourse = (id: string) => {
    setSelectedCourseId(id);
    refetchEnrollments(id);
    (window as any).showNotification?.('Đang tải danh sách đăng ký...', 'info');
  };

  const toggleDiscount = async (courseId: string, currentStatus: boolean) => {
    try {
      await updateCourse(courseId, { isDiscountActive: !currentStatus });
      (window as any).showNotification?.('Đã cập nhật trạng thái giảm giá', 'success');
    } catch {
      (window as any).showNotification?.('Lỗi cập nhật trạng thái giảm giá', 'error');
    }
  };


  return (
    <div className="admin-courses">
      {/* Header Section */}
      <div className="courses-header">
        <div className="header-content">
          <div className="header-info">
            <h2 className="page-title">
              <i className="fas fa-graduation-cap"></i>
              Quản lý khóa học
            </h2>
            <p className="page-subtitle">
              Quản lý khóa học, giảm giá và đăng ký học viên
            </p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-book"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">{courses.length}</div>
                <div className="stat-label">Tổng khóa học</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {courses.reduce((sum, course) => sum + calculateFakeEnrollmentCount(course.enrolledCount || 0, course.createdAt || course.updatedAt || new Date()), 0)}
                </div>
                <div className="stat-label">Học viên đã đăng ký</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-percentage"></i>
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {courses.filter(c => c.isDiscountActive).length}
                </div>
                <div className="stat-label">Đang giảm giá</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="courses-filters">
        <div className="filters-left">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả danh mục</option>
            <option value="IoT">IoT</option>
            <option value="Embedded">Embedded</option>
            <option value="AI">AI</option>
            <option value="Hardware">Hardware</option>
            <option value="Communications">Communications</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
        <div className="filters-right">
          <button className="btn-secondary" onClick={() => refetch()}>
            <i className="fas fa-rotate"></i>
            Làm mới
          </button>
          <button className="btn-primary" onClick={() => { setEditingId(null); setFormOpen(true); resetForm(); }}>
            <i className="fas fa-plus"></i>
            Thêm khóa học
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="courses-table-container">
        <table className="courses-table">
          <thead>
            <tr>
              <th className="col-title">Khóa học</th>
              <th className="col-enrollment">Học viên</th>
              <th className="col-pricing">Giá</th>
              <th className="col-discount">Giảm giá</th>
              <th className="col-actions">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map(course => {
              const finalPrice = calculateFinalPrice(course);
              const discountAmount = course.price - finalPrice;
              const hasActiveDiscount = course.isDiscountActive && discountAmount > 0;
              
              return (
                <tr key={course.id} className="course-row">
                  <td className="course-info">
                    <div className="course-details">
                      <h4 className="course-title">{course.title}</h4>
                      <div className="course-lessons">
                        <i className="fas fa-play-circle"></i>
                        {course.lessonsCount} bài học
                      </div>
                    </div>
                  </td>
                  
                  <td className="course-enrollment">
                    <div className="enrollment-info">
                      <div className="real-count">
                        <i className="fas fa-user"></i>
                        {course.enrolledCount || 0}
                      </div>
                      <div className="display-count">
                        <i className="fas fa-users"></i>
                        {calculateFakeEnrollmentCount(course.enrolledCount || 0, course.createdAt || course.updatedAt || new Date())}
                      </div>
                    </div>
                  </td>
                  
                  <td className="course-pricing">
                    <div className="pricing-info">
                      <div className="current-price">
                        {finalPrice.toLocaleString('vi-VN')}₫
                      </div>
                      {course.price === 0 && (
                        <div className="free-badge">Miễn phí</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="course-discount">
                    {course.isDiscountActive ? (
                      <div className="discount-info">
                        <div className="discount-badge active">
                          <i className="fas fa-tag"></i>
                          {(course.discountPercentage || 0) > 0 ? `${course.discountPercentage}%` : 
                           (course.discountAmount || 0) > 0 ? `${(course.discountAmount || 0).toLocaleString('vi-VN')}₫` : 'Giảm giá'}
                        </div>
                        {hasActiveDiscount && course.price > 0 && (
                          <div className="discount-amount">
                            Giảm {discountAmount.toLocaleString('vi-VN')}₫
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="discount-info">
                        <div className="discount-badge inactive">
                          <i className="fas fa-tag"></i>
                          Không giảm giá
                        </div>
                      </div>
                    )}
                  </td>
                  
                  <td className="course-actions">
                    <div className="action-buttons">
                      <button 
                        className="btn-icon btn-edit" 
                        title="Chỉnh sửa"
                        onClick={() => onEdit(course.id)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      
                      <button 
                        className={`btn-icon ${course.isDiscountActive ? 'btn-discount-active' : 'btn-discount'}`}
                        title={course.isDiscountActive ? 'Tắt giảm giá' : 'Bật giảm giá'}
                        onClick={() => toggleDiscount(course.id, course.isDiscountActive || false)}
                      >
                        <i className="fas fa-percentage"></i>
                      </button>
                      
                      <button 
                        className="btn-icon btn-enrollments" 
                        title="Xem đăng ký"
                        onClick={() => openEnrollmentsForCourse(course.id)}
                      >
                        <i className="fas fa-user-check"></i>
                      </button>
                      
                      
                      <button 
                        className="btn-icon btn-delete" 
                        title="Xóa"
                        onClick={() => onDelete(course.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredCourses.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3>Không tìm thấy khóa học</h3>
            <p>Thử thay đổi bộ lọc hoặc tạo khóa học mới</p>
          </div>
        )}
      </div>

      {/* Course Form Modal */}
      {formOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}>
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>
                <i className="fas fa-graduation-cap"></i>
                {editingId ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
              </h2>
              <button className="modal-close" onClick={() => setFormOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={onSubmit} className="course-form">
                {/* Basic Information */}
                <div className="form-section">
                  <h3 className="section-title">
                    <i className="fas fa-info-circle"></i>
                    Thông tin cơ bản
                  </h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tiêu đề khóa học *</label>
                      <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="VD: Arduino Programming từ Zero đến Hero"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Mô tả khóa học *</label>
                    <textarea
                      required
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Mô tả ngắn gọn về khóa học..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Ảnh khóa học</label>
                    <div className="image-upload-section">
                      <input
                        type="text"
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        placeholder="https://... hoặc /uploads/..."
                        className="image-url-input"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
                        className="image-file-input"
                      />
                      {uploading && (
                        <div className="upload-status">
                          <i className="fas fa-spinner fa-spin"></i>
                          Đang tải lên...
                        </div>
                      )}
                      {form.image && (
                        <div className="image-preview">
                          <img src={form.image} alt="Preview" />
                          <a href={form.image} target="_blank" rel="noreferrer" className="preview-link">
                            <i className="fas fa-external-link-alt"></i>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Cấp độ</label>
                      <select
                        value={form.level}
                        onChange={(e) => setForm({ ...form, level: e.target.value })}
                      >
                        <option value="beginner">Cơ bản</option>
                        <option value="intermediate">Trung bình</option>
                        <option value="advanced">Nâng cao</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Danh mục</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      >
                        <option value="IoT">IoT</option>
                        <option value="Embedded">Embedded</option>
                        <option value="AI">AI</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Communications">Communications</option>
                        <option value="Programming">Programming</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Trạng thái</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      >
                        <option value="published">Đã xuất bản</option>
                        <option value="draft">Bản nháp</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Giá khóa học (VNĐ)</label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Số bài học</label>
                      <input
                        type="number"
                        value={form.lessonsCount}
                        onChange={(e) => setForm({ ...form, lessonsCount: Number(e.target.value) })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Thời lượng (phút)</label>
                      <input
                        type="number"
                        value={form.durationMinutes}
                        onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Tags (phân tách bằng dấu phẩy)</label>
                    <input
                      type="text"
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      placeholder="Arduino, IoT, C++, Electronics"
                    />
                  </div>
                </div>

                {/* Discount Section */}
                <div className="form-section">
                  <h3 className="section-title">
                    <i className="fas fa-percentage"></i>
                    Cài đặt giảm giá
                  </h3>
                  
                  <div className="discount-toggle">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={form.isDiscountActive}
                        onChange={(e) => setForm({ ...form, isDiscountActive: e.target.checked })}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">Kích hoạt giảm giá</span>
                    </label>
                  </div>
                  
                  {form.isDiscountActive && (
                    <div className="discount-settings">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Giảm giá theo phần trăm (%)</label>
                          <input
                            type="number"
                            value={form.discountPercentage}
                            onChange={(e) => setForm({ ...form, discountPercentage: Number(e.target.value) })}
                            placeholder="20"
                            min="0"
                            max="100"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Hoặc giảm giá cố định (VNĐ)</label>
                          <input
                            type="number"
                            value={form.discountAmount}
                            onChange={(e) => setForm({ ...form, discountAmount: Number(e.target.value) })}
                            placeholder="100000"
                            min="0"
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Ngày bắt đầu giảm giá</label>
                          <input
                            type="date"
                            value={form.discountStartDate || ""}
                            onChange={(e) => setForm({ ...form, discountStartDate: e.target.value })}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Ngày kết thúc giảm giá</label>
                          <input
                            type="date"
                            value={form.discountEndDate || ""}
                            onChange={(e) => setForm({ ...form, discountEndDate: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="discount-preview">
                        <h4>Xem trước giá:</h4>
                        <div className="price-preview">
                          <div className="original-price">
                            Giá gốc: {form.price.toLocaleString('vi-VN')}₫
                          </div>
                          {form.discountPercentage > 0 && (
                            <div className="discount-info">
                              Giảm {form.discountPercentage}% = {Math.round(form.price * form.discountPercentage / 100).toLocaleString('vi-VN')}₫
                            </div>
                          )}
                          {form.discountAmount > 0 && (
                            <div className="discount-info">
                              Giảm {form.discountAmount.toLocaleString('vi-VN')}₫
                            </div>
                          )}
                          <div className="final-price">
                            Giá cuối: {Math.max(0, form.price - (form.discountPercentage > 0 ? form.price * form.discountPercentage / 100 : form.discountAmount)).toLocaleString('vi-VN')}₫
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Course Information */}
                <div className="form-section">
                  <h3 className="section-title">
                    <i className="fas fa-info-circle"></i>
                    Thông tin chi tiết khóa học
                  </h3>

                  <div className="form-group">
                    <label>Tổng quan khóa học</label>
                    <textarea
                      value={form.overview}
                      onChange={(e) => setForm({ ...form, overview: e.target.value })}
                      placeholder="Mô tả chi tiết về khóa học, mục tiêu, và những gì học viên sẽ đạt được..."
                      rows={4}
                    />
                  </div>

                  <div className="form-group">
                    <label>Yêu cầu đầu vào</label>
                    <textarea
                      value={form.requirements}
                      onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                      placeholder="Kiến thức, kỹ năng, hoặc công cụ cần thiết trước khi tham gia khóa học..."
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label>Những gì bạn sẽ học (JSON array)</label>
                    <textarea
                      value={form.whatYouWillLearn}
                      onChange={(e) => setForm({ ...form, whatYouWillLearn: e.target.value })}
                      placeholder='["Học lập trình Arduino", "Làm việc với cảm biến", "Xây dựng dự án IoT"]'
                      rows={3}
                      className="json-textarea"
                    />
                    <small className="form-help">
                      Định dạng: JSON array, mỗi item là một chuỗi mô tả kỹ năng sẽ học
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Chương trình học</label>
                    <div className="curriculum-container">
                      {lessons.map((lesson, index) => (
                        <div key={lesson.id} className="lesson-item">
                          <div className="lesson-header">
                            <span className="lesson-number">Buổi {index + 1}</span>
                            {lessons.length > 1 && (
                              <button
                                type="button"
                                className="remove-lesson-btn"
                                onClick={() => removeLesson(lesson.id)}
                                title="Xóa buổi học"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                          <div className="lesson-fields">
                            <div className="lesson-field">
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => updateLesson(lesson.id, 'title', e.target.value)}
                                placeholder="Nhập tiêu đề buổi học..."
                                className="form-input lesson-title"
                              />
                            </div>
                            <div className="lesson-field-row">
                              <div className="lesson-field">
                                <input
                                  type="text"
                                  value={lesson.duration}
                                  onChange={(e) => updateLesson(lesson.id, 'duration', e.target.value)}
                                  placeholder="Thời lượng (VD: 30 phút)"
                                  className="form-input lesson-duration"
                                />
                              </div>
                              <div className="lesson-field">
                                <select
                                  value={lesson.type}
                                  onChange={(e) => updateLesson(lesson.id, 'type', e.target.value)}
                                  className="form-input lesson-type"
                                >
                                  <option value="youtube">YouTube Video</option>
                                  <option value="online-meeting">Online Meeting</option>
                                </select>
                              </div>
                            </div>
                            <div className="lesson-field">
                              <input
                                type="url"
                                value={lesson.url}
                                onChange={(e) => updateLesson(lesson.id, 'url', e.target.value)}
                                placeholder={lesson.type === 'youtube' ? 'https://www.youtube.com/watch?v=VIDEO_ID' : 'https://meet.google.com/xxx-xxxx-xxx'}
                                className="form-input lesson-url"
                              />
                              <small className="lesson-url-help">
                                {lesson.type === 'youtube' 
                                  ? 'Nhập URL video YouTube (private video)' 
                                  : 'Nhập link tham gia Online Meeting'
                                }
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="add-lesson-btn"
                        onClick={addLesson}
                      >
                        <i className="fas fa-plus"></i>
                        Thêm buổi học
                      </button>
                    </div>
                    <small className="form-help">
                      Thêm các buổi học cho khóa học. Mỗi buổi có thể là video, bài tập, dự án hoặc quiz.
                    </small>
                  </div>
                </div>

                {/* Instructor Information */}
                <div className="form-section">
                  <h3 className="section-title">
                    <i className="fas fa-user-tie"></i>
                    Thông tin giảng viên
                  </h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tên giảng viên</label>
                      <input
                        type="text"
                        value={form.instructorName}
                        onChange={(e) => setForm({ ...form, instructorName: e.target.value })}
                        placeholder="VD: Nguyễn Văn A"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Email giảng viên</label>
                      <input
                        type="email"
                        value={form.instructorEmail}
                        onChange={(e) => setForm({ ...form, instructorEmail: e.target.value })}
                        placeholder="instructor@example.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Ảnh giảng viên</label>
                    <div className="instructor-image-section">
                      <input
                        type="text"
                        value={form.instructorImage}
                        onChange={(e) => setForm({ ...form, instructorImage: e.target.value })}
                        placeholder="URL ảnh giảng viên"
                        className="instructor-image-input"
                      />
                      {form.instructorImage && (
                        <div className="instructor-preview">
                          <img
                            src={form.instructorImage}
                            alt="Instructor preview"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tiểu sử giảng viên</label>
                    <textarea
                      value={form.instructorBio}
                      onChange={(e) => setForm({ ...form, instructorBio: e.target.value })}
                      placeholder="Kinh nghiệm, chuyên môn, thành tích của giảng viên..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)}>
                    <i className="fas fa-times"></i>
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    <i className="fas fa-save"></i>
                    {submitting ? 'Đang lưu...' : 'Lưu khóa học'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enrollments Panel */}
      {selectedCourseId && (
        <div className="enrollments-panel">
          <div className="panel-header">
            <h3>
              <i className="fas fa-user-check"></i>
              Đăng ký khóa học
            </h3>
            <div className="panel-actions">
              <button className="btn-secondary" onClick={() => refetchEnrollments(selectedCourseId!)}>
                <i className="fas fa-rotate"></i>
                Làm mới
              </button>
              <button className="btn-secondary" onClick={() => setSelectedCourseId(null)}>
                <i className="fas fa-times"></i>
                Đóng
              </button>
            </div>
          </div>
          
          <div className="enrollments-table-container">
            <table className="enrollments-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>STT</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                  <th>Ngày đăng ký</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment, index) => (
                  <tr key={enrollment.id}>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {index + 1}
                    </td>
                    <td>{enrollment.fullName}</td>
                    <td>{enrollment.email}</td>
                    <td>{enrollment.phone || '-'}</td>
                    <td>
                      <select
                        defaultValue={enrollment.status}
                        onChange={async (e) => {
                          await updateEnrollment(enrollment.id, { status: e.target.value });
                          (window as any).showNotification?.('Đã cập nhật trạng thái', 'success');
                        }}
                        className="status-select"
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </td>
                    <td>
                      <span className={`payment-status ${enrollment.paymentStatus}`}>
                        {enrollment.paymentStatus === 'paid' ? 'Đã thanh toán' :
                         enrollment.paymentStatus === 'pending' ? 'Chờ thanh toán' :
                         enrollment.paymentStatus === 'failed' ? 'Thanh toán thất bại' : 'Chưa xác định'}
                      </span>
                    </td>
                    <td>{new Date(enrollment.createdAt as string).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button
                        className="btn-icon btn-delete"
                        title="Xóa đăng ký"
                        onClick={async () => {
                          if (!confirm('Xóa đăng ký này?')) return;
                          await deleteEnrollment(enrollment.id);
                          (window as any).showNotification?.('Đã xóa đăng ký', 'success');
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}