'use client';

import React, { useState, useEffect } from 'react';
import { PrismaClient } from '@prisma/client';

interface Video {
  id: string;
  youtubeVideoId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: number;
  videoOrder: number;
  isPreview: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  course: {
    id: string;
    title: string;
    category: string;
  };
  stats?: {
    totalViews: number;
    uniqueUsers: number;
    avgDuration: number;
    completionRate: number;
  };
}

interface Course {
  id: string;
  title: string;
  category: string;
  status: string;
}

const AdminVideoTab: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  
  // New video form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVideo, setNewVideo] = useState({
    courseId: '',
    youtubeVideoId: '',
    title: '',
    description: '',
    videoOrder: 0,
    isPreview: false,
    status: 'active'
  });

  /**
   * Fetch videos with filters
   */
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        includeStats: 'true'
      });

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (courseFilter !== 'all') params.append('courseId', courseFilter);

      const response = await fetch(`/api/videos?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch videos');
      }

      setVideos(result.data.videos);
      setTotalPages(result.data.pagination.pages);
      setTotalVideos(result.data.pagination.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch courses for filter dropdown
   */
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const result = await response.json();

      if (result.success) {
        setCourses(result.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchVideos();
  }, [currentPage, statusFilter, courseFilter]);

  useEffect(() => {
    fetchCourses();
  }, []);

  /**
   * Handle add new video
   */
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/videos/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVideo)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to add video');
      }

      // Reset form and refresh list
      setNewVideo({
        courseId: '',
        youtubeVideoId: '',
        title: '',
        description: '',
        videoOrder: 0,
        isPreview: false,
        status: 'active'
      });
      setShowAddForm(false);
      fetchVideos();
    } catch (err) {
      console.error('Error adding video:', err);
      alert(err instanceof Error ? err.message : 'Failed to add video');
    }
  };

  /**
   * Handle video status change
   */
  const handleStatusChange = async (videoId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update video status');
      }

      // Update local state
      setVideos(prev => prev.map(video => 
        video.id === videoId ? { ...video, status: newStatus } : video
      ));
    } catch (err) {
      console.error('Error updating video status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update video status');
    }
  };

  /**
   * Handle delete video
   */
  const handleDeleteVideo = async (videoId: string, videoTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa video "${videoTitle}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete video');
      }

      fetchVideos();
    } catch (err) {
      console.error('Error deleting video:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete video');
    }
  };

  /**
   * Format duration from seconds to MM:SS
   */
  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Loading state
  if (loading && videos.length === 0) {
    return (
      <div className="admin-video-tab">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải danh sách video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-video-tab">
      {/* Header */}
      <div className="video-header">
        <div className="header-content">
          <h2>Quản lý Video Khóa học</h2>
          <p>Tổng số video: {totalVideos}</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <i className="fas fa-plus"></i>
          Thêm Video
        </button>
      </div>

      {/* Filters */}
      <div className="video-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Tìm kiếm video..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả khóa học</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={fetchVideos} className="retry-button">
            Thử lại
          </button>
        </div>
      )}

      {/* Videos Table */}
      <div className="video-table-container">
        <table className="video-table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Tiêu đề</th>
              <th>Khóa học</th>
              <th>Thời lượng</th>
              <th>Thứ tự</th>
              <th>Trạng thái</th>
              <th>Thống kê</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id}>
                <td>
                  <div className="video-thumbnail-cell">
                    <img
                      src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`}
                      alt={video.title}
                      className="thumbnail-image"
                    />
                    {video.isPreview && (
                      <span className="preview-badge">Preview</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="video-title-cell">
                    <h4>{video.title}</h4>
                    <p className="video-id">ID: {video.youtubeVideoId}</p>
                  </div>
                </td>
                <td>
                  <div className="course-cell">
                    <span className="course-name">{video.course.title}</span>
                    <span className="course-category">{video.course.category}</span>
                  </div>
                </td>
                <td>
                  <span className="duration">{formatDuration(video.duration)}</span>
                </td>
                <td>
                  <span className="order">{video.videoOrder}</span>
                </td>
                <td>
                  <select
                    value={video.status}
                    onChange={(e) => handleStatusChange(video.id, e.target.value)}
                    className={`status-select ${video.status}`}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </td>
                <td>
                  {video.stats && (
                    <div className="video-stats-cell">
                      <div className="stat-item">
                        <span className="stat-icon">👀</span>
                        <span className="stat-value">{video.stats.totalViews}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">👥</span>
                        <span className="stat-value">{video.stats.uniqueUsers}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">📊</span>
                        <span className="stat-value">{video.stats.completionRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  )}
                </td>
                <td>
                  <span className="date">{formatDate(video.createdAt)}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteVideo(video.id, video.title)}
                      title="Xóa video"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="page-button"
          >
            Trước
          </button>
          
          <span className="page-info">
            Trang {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="page-button"
          >
            Sau
          </button>
        </div>
      )}

      {/* Add Video Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm Video Mới</h3>
              <button 
                className="close-button"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddVideo} className="modal-body">
              <div className="form-group">
                <label>Khóa học *</label>
                <select
                  value={newVideo.courseId}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, courseId: e.target.value }))}
                  required
                  className="form-input"
                >
                  <option value="">Chọn khóa học</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>YouTube Video ID *</label>
                <input
                  type="text"
                  value={newVideo.youtubeVideoId}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, youtubeVideoId: e.target.value }))}
                  placeholder="dQw4w9WgXcQ"
                  required
                  className="form-input"
                />
                <small>ID video YouTube (11 ký tự)</small>
              </div>

              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Tên video"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={newVideo.description}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả video"
                  className="form-input"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thứ tự</label>
                  <input
                    type="number"
                    value={newVideo.videoOrder}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, videoOrder: parseInt(e.target.value) || 0 }))}
                    min="0"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    value={newVideo.status}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, status: e.target.value }))}
                    className="form-input"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newVideo.isPreview}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, isPreview: e.target.checked }))}
                  />
                  <span>Video xem trước</span>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Thêm Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVideoTab;
