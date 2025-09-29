'use client';

import { useState, useEffect } from 'react';
import { BlogPost } from '@/lib/hooks/useData';

interface BlogManagementProps {
  onTabChange: (tab: 'overview' | 'events' | 'registrations' | 'contacts' | 'users' | 'settings' | 'blog') => void;
}

export default function BlogManagementTab({ onTabChange }: BlogManagementProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, published, pending
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [processingPosts, setProcessingPosts] = useState<Set<string>>(new Set());

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (statusFilter !== 'all') {
        params.append('published', statusFilter === 'published' ? 'true' : 'false');
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/blog?${params}`);
      const result = await response.json();

      if (result.success) {
        setPosts(result.data);
        setTotalPages(result.pagination.pages);
      } else {
        setError(result.error || 'Lỗi khi tải danh sách bài viết');
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, statusFilter, searchQuery]);

  const handlePublish = async (postId: string) => {
    try {
      setProcessingPosts(prev => new Set(prev).add(postId));
      
      const response = await fetch(`/api/blog/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: true })
      });

      if (response.ok) {
        // Force refresh the posts list
        await fetchPosts();
        console.log('Post published successfully');
      } else {
        const error = await response.json();
        console.error('Error publishing post:', error);
        alert('Lỗi khi xuất bản bài viết: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error publishing post:', err);
      alert('Lỗi khi xuất bản bài viết');
    } finally {
      setProcessingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleUnpublish = async (postId: string) => {
    try {
      setProcessingPosts(prev => new Set(prev).add(postId));
      
      const response = await fetch(`/api/blog/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: false })
      });

      if (response.ok) {
        await fetchPosts();
        console.log('Post unpublished successfully');
      } else {
        const error = await response.json();
        console.error('Error unpublishing post:', error);
        alert('Lỗi khi ẩn bài viết: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error unpublishing post:', err);
      alert('Lỗi khi ẩn bài viết');
    } finally {
      setProcessingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    try {
      const response = await fetch(`/api/blog/${postId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedPosts.length === 0) return;

    try {
      for (const postId of selectedPosts) {
        if (action === 'publish') {
          await handlePublish(postId);
        } else if (action === 'unpublish') {
          await handleUnpublish(postId);
        } else if (action === 'delete') {
          await handleDelete(postId);
        }
      }
      setSelectedPosts([]);
    } catch (err) {
      console.error('Error performing bulk action:', err);
    }
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(post => post.id));
    }
  };

  const handleSelectPost = (postId: string) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (post: BlogPost) => {
    if (post.published) {
      return <span className="status-badge published">Đã xuất bản</span>;
    } else {
      return <span className="status-badge pending">Chờ duyệt</span>;
    }
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải danh sách bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>📝 Quản lý Blog</h2>
        <p>Duyệt và quản lý các bài viết blog</p>
      </div>

      {/* Search and Filter */}
      <div className="admin-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={`filter-tab ${statusFilter === 'published' ? 'active' : ''}`}
            onClick={() => setStatusFilter('published')}
          >
            Đã xuất bản
          </button>
          <button
            className={`filter-tab ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Chờ duyệt
          </button>
        </div>

        <button
          className="btn-primary"
          onClick={() => onTabChange('blog-create')}
        >
          <i className="fas fa-plus"></i>
          Tạo bài viết mới
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedPosts.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedPosts.length} bài viết đã chọn</span>
          <div className="bulk-buttons">
            <button
              className="btn-secondary"
              onClick={() => handleBulkAction('publish')}
            >
              <i className="fas fa-check"></i>
              Xuất bản
            </button>
            <button
              className="btn-secondary"
              onClick={() => handleBulkAction('unpublish')}
            >
              <i className="fas fa-eye-slash"></i>
              Ẩn
            </button>
            <button
              className="btn-danger"
              onClick={() => handleBulkAction('delete')}
            >
              <i className="fas fa-trash"></i>
              Xóa
            </button>
          </div>
        </div>
      )}

      {/* Posts Table */}
      <div className="admin-table-container">
        <div className="table-header">
          <div className="table-title">
            <h3>Danh sách bài viết</h3>
            <span className="table-count">{posts.length} bài viết</span>
          </div>
          <div className="table-actions">
            <button className="btn-refresh" onClick={fetchPosts}>
              <i className="fas fa-sync-alt"></i>
              Làm mới
            </button>
          </div>
        </div>
        
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedPosts.length === posts.length && posts.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="title-col">Tiêu đề</th>
                <th className="author-col">Tác giả</th>
                <th className="category-col">Danh mục</th>
                <th className="status-col">Trạng thái</th>
                <th className="date-col">Ngày tạo</th>
                <th className="views-col">Lượt xem</th>
                <th className="actions-col">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center">
                    <div className="no-data">
                      <i className="fas fa-file-alt"></i>
                      <p>Chưa có bài viết nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="table-row">
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.id)}
                        onChange={() => handleSelectPost(post.id)}
                      />
                    </td>
                    <td className="title-col">
                      <div className="post-title">
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          {post.title}
                        </a>
                        {post.featured && (
                          <span className="featured-badge">
                            <i className="fas fa-star"></i>
                            Nổi bật
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="author-col">
                      <div className="author-info">
                        <i className="fas fa-user"></i>
                        <span>{post.author}</span>
                      </div>
                    </td>
                    <td className="category-col">
                      <span className="category-badge">{post.category}</span>
                    </td>
                    <td className="status-col">{getStatusBadge(post)}</td>
                    <td className="date-col">
                      <div className="date-info">
                        <i className="fas fa-calendar"></i>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </td>
                    <td className="views-col">
                      <div className="views-info">
                        <i className="fas fa-eye"></i>
                        <span>{post.views}</span>
                      </div>
                    </td>
                    <td className="actions-col">
                      <div className="action-buttons">
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-icon"
                          title="Xem"
                        >
                          <i className="fas fa-eye"></i>
                        </a>
                        <button
                          className="btn-icon"
                          onClick={() => onTabChange('blog-edit')}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        {post.published ? (
                          <button
                            className="btn-icon"
                            onClick={() => handleUnpublish(post.id)}
                            title="Ẩn bài viết"
                            disabled={processingPosts.has(post.id)}
                          >
                            {processingPosts.has(post.id) ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-eye-slash"></i>
                            )}
                          </button>
                        ) : (
                          <button
                            className="btn-icon"
                            onClick={() => handlePublish(post.id)}
                            title="Xuất bản"
                            disabled={processingPosts.has(post.id)}
                          >
                            {processingPosts.has(post.id) ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-check"></i>
                            )}
                          </button>
                        )}
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDelete(post.id)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <i className="fas fa-chevron-left"></i>
            Trước
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Sau
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
    </div>
  );
}
