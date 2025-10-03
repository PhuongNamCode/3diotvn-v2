"use client";

import { useEffect, useMemo, useState } from "react";
import { useCourses, useCourseEnrollments } from "@/lib/hooks/useData";

export default function AdminCoursesTab() {
  const { courses, loading, error, createCourse, updateCourse, deleteCourse, refetch } = useCourses();
  const { enrollments, refetch: refetchEnrollments, updateEnrollment, deleteEnrollment } = useCourseEnrollments();
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
  });
  const [uploading, setUploading] = useState(false);

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
      if (editingId) {
        await updateCourse(editingId, {
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
        } as any);
      } else {
        await createCourse({
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
        } as any);
      }
      setFormOpen(false);
      setEditingId(null);
      setForm({ title: "", description: "", image: "", level: "beginner", price: 0, status: "published", category: "IoT", lessonsCount: 0, durationMinutes: 0, tags: "" });
      (window as any).showNotification?.('Lưu khóa học thành công', 'success');
    } catch (err) {
      (window as any).showNotification?.('Lỗi lưu khóa học', 'error');
    } finally {
      setSubmitting(false);
    }
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
    });
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

  function openEnrollmentsForCourse(id: string) {
    refetchEnrollments(id);
    setEditingId(id);
    setFormOpen(false);
    (window as any).showNotification?.('Đang tải danh sách đăng ký...', 'info');
  }

  return (
    <div className="admin-courses">
      <div className="table-header">
        <div className="table-title"><h3>Khóa học</h3><span className="table-count">({courses.length})</span></div>
        <div className="table-actions">
          <button className="btn-refresh" onClick={() => refetch()}><i className="fas fa-rotate"></i>Làm mới</button>
          <button className="btn-refresh" onClick={() => { setEditingId(null); setFormOpen(true); }}><i className="fas fa-plus"></i>Thêm khóa học</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Cấp độ</th>
              <th>Bài học</th>
              <th>Thời lượng</th>
              <th>Giá</th>
              <th>Đăng ký</th>
              <th className="actions-col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id} className="table-row">
                <td className="title-col">
                  <div className="post-title">
                    <a href="#">{c.title}</a>
                    <div className="author-info"><i className="fas fa-tag"></i><span>{c.status}</span></div>
                  </div>
                </td>
                <td>{c.category}</td>
                <td>{c.level}</td>
                <td>{c.lessonsCount}</td>
                <td>{Math.floor(c.durationMinutes / 60)}h {c.durationMinutes % 60}m</td>
                <td>{c.price > 0 ? `${c.price.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'}</td>
                <td>{c.enrolledCount}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Sửa" onClick={() => onEdit(c.id)}><i className="fas fa-edit"></i></button>
                    <button className="btn-icon" title="Đăng ký" onClick={() => openEnrollmentsForCourse(c.id)}><i className="fas fa-user-check"></i></button>
                    <button className="btn-icon danger" title="Xóa" onClick={() => onDelete(c.id)}><i className="fas fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="modal" style={{ display: 'block' }} onClick={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}>
          <div className="modal-content" style={{ maxWidth: 720 }}>
            <div className="modal-header"><h2>{editingId ? 'Cập nhật khóa học' : 'Thêm khóa học'}</h2></div>
            <div className="modal-body">
              <form onSubmit={onSubmit}>
                <div className="form-group"><label>Tiêu đề *</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                <div className="form-group"><label>Mô tả *</label><textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <div className="form-group"><label>Ảnh</label>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://... hoặc /uploads/..." />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                      {uploading && <span style={{ color: 'var(--text-secondary)' }}><i className="fas fa-spinner fa-spin"></i> Đang tải...</span>}
                    </div>
                    {form.image && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={form.image} alt="Preview" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                        <a href={form.image} target="_blank" rel="noreferrer" className="btn-secondary"><i className="fas fa-external-link-alt"></i> Mở ảnh</a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Cấp độ</label>
                    <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                      <option value="beginner">beginner</option>
                      <option value="intermediate">intermediate</option>
                      <option value="advanced">advanced</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Danh mục</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option>IoT</option>
                      <option>Embedded</option>
                      <option>AI</option>
                      <option>Hardware</option>
                      <option>Communications</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Giá (VNĐ)</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} /></div>
                  <div className="form-group"><label>Số bài học</label><input type="number" value={form.lessonsCount} onChange={e => setForm({ ...form, lessonsCount: Number(e.target.value) })} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Thời lượng (phút)</label><input type="number" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></div>
                  <div className="form-group"><label>Trạng thái</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      <option value="published">published</option>
                      <option value="draft">draft</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Tags (phân tách bằng dấu phẩy)</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)}><i className="fas fa-times"></i>Hủy</button>
                  <button type="submit" className="btn-primary" disabled={submitting}><i className="fas fa-save"></i>{submitting ? 'Đang lưu...' : 'Lưu'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enrollments panel */}
      {editingId && (
        <div className="admin-card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <h3>Đăng ký khóa học</h3>
            <div className="table-actions">
              <button className="btn-refresh" onClick={() => refetchEnrollments(editingId!)}><i className="fas fa-rotate"></i>Làm mới</button>
              <button className="btn-refresh" onClick={() => setEditingId(null)}><i className="fas fa-times"></i>Đóng</button>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Trạng thái</th>
                  <th className="actions-col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td>{r.fullName}</td>
                    <td>{r.email}</td>
                    <td>{r.phone || '-'}</td>
                    <td>
                      <select defaultValue={r.status} onChange={async (e) => { await updateEnrollment(r.id, { status: e.target.value }); (window as any).showNotification?.('Đã cập nhật trạng thái', 'success'); }}>
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon danger" title="Xóa" onClick={async () => { if (!confirm('Xóa đăng ký này?')) return; await deleteEnrollment(r.id); (window as any).showNotification?.('Đã xóa đăng ký', 'success'); }}><i className="fas fa-trash"></i></button>
                      </div>
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


