'use client';

import { useState, useEffect } from 'react';

interface TagData {
  tag: string;
  count: number;
}

interface TagsManagementTabProps {
  onTabChange: (tab: 'overview' | 'events' | 'registrations' | 'contacts' | 'users' | 'settings' | 'blog' | 'blog-create' | 'tags') => void;
}

export default function TagsManagementTab({ onTabChange }: TagsManagementTabProps) {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tags');
      const result = await response.json();

      if (result.success) {
        setTags(result.data);
      } else {
        setError(result.error || 'Lỗi khi tải danh sách tags');
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: newTag.trim() })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Tag "${newTag}" đã được thêm thành công`);
        setNewTag('');
        fetchTags();
      } else {
        setError(result.error || 'Lỗi khi thêm tag');
      }
    } catch (err) {
      setError('Lỗi khi thêm tag');
    }
  };

  const handleDeleteTag = async (tag: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tag "${tag}"?`)) return;

    try {
      const response = await fetch(`/api/admin/tags?tag=${encodeURIComponent(tag)}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message);
        fetchTags();
      } else {
        setError(result.error || 'Lỗi khi xóa tag');
      }
    } catch (err) {
      setError('Lỗi khi xóa tag');
    }
  };

  const handleEditTag = (tag: string) => {
    setEditingTag(tag);
    setEditValue(tag);
  };

  const handleSaveEdit = async () => {
    if (!editingTag || !editValue.trim() || editValue.trim() === editingTag) {
      setEditingTag(null);
      return;
    }

    try {
      // Xóa tag cũ
      await fetch(`/api/admin/tags?tag=${encodeURIComponent(editingTag)}`, {
        method: 'DELETE'
      });

      // Thêm tag mới
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: editValue.trim() })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Tag đã được cập nhật từ "${editingTag}" thành "${editValue}"`);
        setEditingTag(null);
        setEditValue('');
        fetchTags();
      } else {
        setError(result.error || 'Lỗi khi cập nhật tag');
      }
    } catch (err) {
      setError('Lỗi khi cập nhật tag');
    }
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditValue('');
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải danh sách tags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>🏷️ Quản lý Tags</h2>
        <p>Thêm, chỉnh sửa và xóa các thẻ phổ biến</p>
      </div>

      {/* Add New Tag Form */}
      <div className="admin-card">
        <div className="card-header">
          <h3>Thêm tag mới</h3>
        </div>
        <form onSubmit={handleAddTag} className="tag-form">
          <div className="form-group">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Nhập tên tag mới..."
              required
            />
            <button type="submit" className="btn-primary">
              <i className="fas fa-plus"></i>
              Thêm tag
            </button>
          </div>
        </form>
      </div>

      {/* Tags List */}
      <div className="admin-card">
        <div className="card-header">
          <h3>Danh sách tags ({tags.length})</h3>
          <button onClick={fetchTags} className="btn-refresh">
            <i className="fas fa-sync-alt"></i>
            Làm mới
          </button>
        </div>

        {tags.length === 0 ? (
          <div className="no-data">
            <i className="fas fa-tags"></i>
            <p>Chưa có tag nào</p>
          </div>
        ) : (
          <div className="tags-grid">
            {tags.map((tagData, index) => (
              <div key={tagData.tag} className="tag-item">
                {editingTag === tagData.tag ? (
                  <div className="tag-edit-form">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="tag-edit-input"
                      autoFocus
                    />
                    <div className="tag-edit-actions">
                      <button
                        onClick={handleSaveEdit}
                        className="btn-icon success"
                        title="Lưu"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="btn-icon"
                        title="Hủy"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="tag-content">
                      <span className="tag-name">#{tagData.tag}</span>
                      <span className="tag-count">{tagData.count} bài viết</span>
                    </div>
                    <div className="tag-actions">
                      <button
                        onClick={() => handleEditTag(tagData.tag)}
                        className="btn-icon"
                        title="Chỉnh sửa"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tagData.tag)}
                        className="btn-icon danger"
                        title="Xóa"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}
    </div>
  );
}
