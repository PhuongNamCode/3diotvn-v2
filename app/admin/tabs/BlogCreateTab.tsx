'use client';

import { useState, useEffect } from 'react';

const BLOG_CATEGORIES = [
  'Tutorial',
  'Review', 
  'News',
  'Tips & Tricks',
  'Case Study',
  'Industry Insights'
];

const DEFAULT_TAGS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js',
  'Database', 'API', 'Security', 'Performance', 'DevOps',
  'AI/ML', 'IoT', 'Mobile', 'Web Design', 'Testing',
  'Arduino', 'ESP32', 'STM32', 'Raspberry Pi', 'Embedded'
];

interface BlogCreateTabProps {
  onTabChange: (tab: 'overview' | 'events' | 'registrations' | 'contacts' | 'users' | 'settings' | 'blog') => void;
}

export default function BlogCreateTab({ onTabChange }: BlogCreateTabProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_TAGS);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: 'Tutorial',
    tags: [] as string[],
    featured: false,
    published: false,
    image: '',
    seoTitle: '',
    seoDescription: ''
  });

  // Fetch available tags from API
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/admin/tags');
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          const tags = result.data.map((item: any) => item.tag);
          setAvailableTags(tags);
        }
      } catch (err) {
        console.log('Using default tags');
      }
    };
    fetchTags();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Bài viết đã được tạo thành công!');
        setTimeout(() => {
          onTabChange('blog');
        }, 1500);
      } else {
        setError(result.error || 'Có lỗi xảy ra khi tạo bài viết');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tạo bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>📝 Tạo bài viết mới</h2>
        <p>Tạo bài viết blog mới cho cộng đồng 3DIoT</p>
      </div>

      <form className="admin-blog-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Tiêu đề bài viết *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Nhập tiêu đề bài viết..."
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="author">Tác giả *</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Tên tác giả..."
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Danh mục *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              {BLOG_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="image">URL hình ảnh</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="excerpt">Tóm tắt bài viết *</label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            placeholder="Mô tả ngắn gọn về nội dung bài viết..."
            rows={3}
            required
          />
        </div>

        <div className="form-group">
          <label>Nội dung bài viết * (Markdown)</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Viết nội dung bài viết bằng Markdown..."
            rows={15}
            required
          />
          <small className="form-help">
            Bạn có thể sử dụng Markdown để định dạng bài viết. 
            <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer">
              Hướng dẫn Markdown
            </a>
          </small>
        </div>

        <div className="form-group">
          <label>Thẻ (Tags)</label>
                 <div className="tags-selector">
                   {availableTags.map(tag => (
              <button
                key={tag}
                type="button"
                className={`tag-option ${formData.tags.includes(tag) ? 'selected' : ''}`}
                onClick={() => handleTagToggle(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
          <small className="form-help">
            Chọn các thẻ phù hợp để giúp người đọc dễ dàng tìm thấy bài viết
          </small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="seoTitle">SEO Title</label>
            <input
              type="text"
              id="seoTitle"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleInputChange}
              placeholder="Tiêu đề SEO (tùy chọn)"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="seoDescription">SEO Description</label>
            <input
              type="text"
              id="seoDescription"
              name="seoDescription"
              value={formData.seoDescription}
              onChange={handleInputChange}
              placeholder="Mô tả SEO (tùy chọn)"
            />
          </div>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
            />
            <span className="checkbox-text">Đánh dấu bài viết nổi bật</span>
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleInputChange}
            />
            <span className="checkbox-text">Xuất bản ngay lập tức</span>
          </label>
        </div>

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

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onTabChange('blog')}
          >
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </button>
          
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Đang tạo...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Tạo bài viết
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
