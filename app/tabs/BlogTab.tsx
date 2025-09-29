'use client';

import { useState, useMemo, useEffect } from 'react';
import { useBlogPosts, BlogPost } from '@/lib/hooks/useData';

const BLOG_CATEGORIES = [
  'Tất cả',
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
  'AI/ML', 'IoT', 'Mobile', 'Web Design', 'Testing'
];

export default function BlogTab() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeatured, setShowFeatured] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_TAGS);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsUpdated, setTagsUpdated] = useState(false);

  // Fetch available tags from API
  const fetchTags = async () => {
    try {
      setTagsLoading(true);
      const response = await fetch('/api/admin/tags');
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        const tags = result.data.map((item: any) => item.tag);
        setAvailableTags(tags);
        setTagsUpdated(true);
        // Hide the updated indicator after 2 seconds
        setTimeout(() => setTagsUpdated(false), 2000);
      }
    } catch (err) {
      console.log('Using default tags');
    } finally {
      setTagsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    
    // Refresh tags every 30 seconds to keep them updated
    const interval = setInterval(fetchTags, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const { posts, loading, error, pagination } = useBlogPosts({
    page: currentPage,
    limit: 9,
    category: selectedCategory === 'Tất cả' ? undefined : selectedCategory,
    tag: selectedTag || undefined,
    search: searchQuery || undefined,
    featured: showFeatured || undefined,
    published: true
  });

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts;
  }, [posts]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleTagChange = (tag: string) => {
    setSelectedTag(selectedTag === tag ? '' : tag);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Tutorial': 'bg-blue-100 text-blue-800',
      'Review': 'bg-green-100 text-green-800',
      'News': 'bg-red-100 text-red-800',
      'Tips & Tricks': 'bg-yellow-100 text-yellow-800',
      'Case Study': 'bg-purple-100 text-purple-800',
      'Industry Insights': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="blog-header">
          <h2>📝 Blog Kỹ Thuật</h2>
          <p>Chia sẻ kiến thức và kinh nghiệm về công nghệ</p>
        </div>
        <div className="blog-grid">
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Đang tải bài viết...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="blog-header">
          <h2>📝 Blog Kỹ Thuật</h2>
          <p>Chia sẻ kiến thức và kinh nghiệm về công nghệ</p>
        </div>
        <div className="blog-grid">
          <p style={{ color: 'var(--danger)' }}>Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Hero Banner Section */}
      <section className="blog-hero">
        <div className="blog-hero-content">
          <div className="blog-hero-text">
            <h1>
              <span style={{ color: 'var(--accent)' }}>Blog</span> kỹ thuật
            </h1>
            <p className="blog-hero-description">
              Chia sẻ kiến thức và kinh nghiệm về công nghệ từ cộng đồng 3DIoT. 
              Khám phá các bài viết chuyên sâu về IoT, Embedded, AI và các xu hướng công nghệ mới nhất.
            </p>
          </div>
          <div className="blog-hero-visual">
            <div className="blog-categories">
              <div className="category-card">
                <i className="fas fa-graduation-cap"></i>
                <h4>Tutorial</h4>
                <p>Hướng dẫn chi tiết</p>
              </div>
              <div className="category-card">
                <i className="fas fa-star"></i>
                <h4>Review</h4>
                <p>Đánh giá sản phẩm</p>
              </div>
              <div className="category-card">
                <i className="fas fa-newspaper"></i>
                <h4>News</h4>
                <p>Tin tức công nghệ</p>
              </div>
              <div className="category-card">
                <i className="fas fa-lightbulb"></i>
                <h4>Tips & Tricks</h4>
                <p>Mẹo hay</p>
              </div>
              <div className="category-card">
                <i className="fas fa-chart-line"></i>
                <h4>Case Study</h4>
                <p>Nghiên cứu thực tế</p>
              </div>
              <div className="category-card">
                <i className="fas fa-industry"></i>
                <h4>Insights</h4>
                <p>Phân tích chuyên sâu</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <div className="blog-filter-section">
        <div className="search-container">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          <div className="filter-options">
            <a href="/blog/create" className="btn-create-post">
              <i className="fas fa-plus"></i>
              Tạo bài viết
            </a>
            <button
              className={`filter-btn ${showFeatured ? 'active' : ''}`}
              onClick={() => setShowFeatured(!showFeatured)}
            >
              <i className="fas fa-star"></i>
              Nổi bật
            </button>
          </div>
        </div>

        {/* Categories Filter */}
        <div className="filter-tabs">
          {BLOG_CATEGORIES.map(category => (
            <button
              key={category}
              className={`filter-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              <i className={`fas ${
                category === 'Tất cả' ? 'fa-globe' :
                category === 'Tutorial' ? 'fa-graduation-cap' :
                category === 'Review' ? 'fa-star' :
                category === 'News' ? 'fa-newspaper' :
                category === 'Tips & Tricks' ? 'fa-lightbulb' :
                category === 'Case Study' ? 'fa-chart-line' :
                category === 'Industry Insights' ? 'fa-industry' : 'fa-tag'
              }`}></i>
              {category}
            </button>
          ))}
        </div>

        {/* Popular Tags */}
        <div className="blog-tags">
          <div className="blog-tags-header">
            <h4>
              Thẻ phổ biến:
              {tagsUpdated && (
                <span className="tags-updated-indicator">
                  <i className="fas fa-check-circle"></i>
                  Đã cập nhật
                </span>
              )}
            </h4>
            <button 
              className="tags-refresh-btn"
              onClick={fetchTags}
              disabled={tagsLoading}
              title="Làm mới tags"
            >
              <i className={`fas ${tagsLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
            </button>
          </div>
          <div className="tags-list">
            {tagsLoading ? (
              <div className="tags-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Đang tải tags...</span>
              </div>
            ) : (
              availableTags.map(tag => (
                <button
                  key={tag}
                  className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
                  onClick={() => handleTagChange(tag)}
                >
                  #{tag}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="blog-grid">
        {filteredPosts.length === 0 ? (
          <div className="no-posts">
            <i className="fas fa-file-alt"></i>
            <h3>Chưa có bài viết nào</h3>
            <p>Hãy quay lại sau để xem những bài viết mới nhất!</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
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
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
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
            disabled={currentPage === pagination.pages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Sau
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}

// Blog Post Card Component
function BlogPostCard({ post }: { post: BlogPost }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Tutorial': 'bg-blue-100 text-blue-800',
      'Review': 'bg-green-100 text-green-800',
      'News': 'bg-red-100 text-red-800',
      'Tips & Tricks': 'bg-yellow-100 text-yellow-800',
      'Case Study': 'bg-purple-100 text-purple-800',
      'Industry Insights': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <article className="blog-card">
      <div className="blog-card-header">
        {post.featured && (
          <div className="featured-badge">
            <i className="fas fa-star"></i>
            Nổi bật
          </div>
        )}
        
        {post.image ? (
          <div className="blog-card-image">
            <img src={post.image} alt={post.title} />
          </div>
        ) : (
          <div className="blog-card-image-placeholder">
            <i className="fas fa-file-alt"></i>
          </div>
        )}
        
        <div className="blog-category-badge">
          {post.category}
        </div>
      </div>
      
      <div className="blog-card-content">
        <div className="blog-card-meta">
          <div className="blog-meta-item">
            <i className="fas fa-user"></i>
            <span>{post.author}</span>
          </div>
          <div className="blog-meta-item">
            <i className="fas fa-clock"></i>
            <span>{post.readingTime} phút</span>
          </div>
          <div className="blog-meta-item">
            <i className="fas fa-calendar"></i>
            <span>{formatDate(post.publishedAt || post.createdAt || '')}</span>
          </div>
        </div>
        
        <h3 className="blog-card-title">
          <a href={`/blog/${post.slug}`}>{post.title}</a>
        </h3>
        
        <p className="blog-card-excerpt">{post.excerpt}</p>
        
        <div className="blog-card-tags">
          {post.tags && post.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">
              #{tag}
            </span>
          ))}
        </div>
        
        <div className="blog-card-footer">
          <div className="post-stats">
            <span className="stat-item">
              <i className="fas fa-eye"></i>
              {post.views}
            </span>
            <span className="stat-item">
              <i className="fas fa-heart"></i>
              {post.likes}
            </span>
            {post._count && (
              <span className="stat-item">
                <i className="fas fa-comment"></i>
                {post._count.comments}
              </span>
            )}
          </div>
          
          <a href={`/blog/${post.slug}`} className="btn-read-more">
            <i className="fas fa-arrow-right"></i>
            Đọc thêm
          </a>
        </div>
      </div>
    </article>
  );
}
