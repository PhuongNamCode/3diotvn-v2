"use client";

import { useEffect, useMemo, useState } from "react";
import { useCourseEnrollments, useCourses } from "@/lib/hooks/useData";

export default function AdminCourseEnrollmentsTab() {
  const { enrollments, loading, error, updateEnrollment, deleteEnrollment, refetch } = useCourseEnrollments();
  const { courses } = useCourses();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  
  const handleExport = () => {
    try {
      if (typeof window === 'undefined' || !(window as any).XLSX) {
        (window as any).showNotification?.('Thư viện XLSX chưa được tải. Vui lòng thử lại!', 'error');
        return;
      }
      const XLSX = (window as any).XLSX;
      const exportData = filtered.map(r => ({
        'Khóa học': getCourseTitle(r.courseId),
        'Họ tên': r.fullName,
        'Email': r.email,
        'Số điện thoại': r.phone || '',
        'Ngày đăng ký': r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : ''
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      ws['!cols'] = [ { wch: 30 }, { wch: 22 }, { wch: 28 }, { wch: 16 }, { wch: 22 } ];
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

  useEffect(() => { refetch(); }, []);

  const filtered = useMemo(() => {
    return enrollments.filter((r) => {
      const matchesSearch = [r.fullName, r.email, r.phone || ""].some((s) => (s || "").toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCourse = selectedCourse === 'all' || r.courseId === selectedCourse;
      return matchesSearch && matchesCourse;
    });
  }, [enrollments, searchTerm, selectedCourse]);

  const getCourseTitle = (courseId: string) => {
    const c = courses.find(x => x.id === courseId);
    return c ? c.title : 'Unknown Course';
  };

  return (
    <div className="admin-registrations">
      <div className="table-container">
        <div className="table-header">
          <div className="table-title">
            <h2>Danh sách đăng ký khóa học</h2>
            <p>Quản lý và theo dõi các đăng ký tham gia khóa học</p>
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
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="filter-select">
              <option value="all">Tất cả khóa học</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <button className="btn btn-success" onClick={handleExport}>
              <i className="fas fa-download"></i>
              Xuất Excel
            </button>
          </div>
        </div>
        <div className="table-content">
          <table className="data-table">
            <thead>
              <tr>
                <th>Khóa học</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}><i className="fas fa-spinner fa-spin"></i> Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Không có đăng ký</td></tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id}>
                    <td>{getCourseTitle(r.courseId)}</td>
                    <td>{r.fullName}</td>
                    <td>{r.email}</td>
                    <td>{r.phone || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon danger" title="Xóa" onClick={async () => { if (!confirm('Xóa đăng ký này?')) return; await deleteEnrollment(r.id); (window as any).showNotification?.('Đã xóa đăng ký', 'success'); }}><i className="fas fa-trash"></i></button>
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


