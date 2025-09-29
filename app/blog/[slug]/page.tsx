'use client';

import { useState } from 'react';
import { useBlogPost, useBlogComments } from '@/lib/hooks/useData';
import { useParams } from 'next/navigation';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const { post, loading, error } = useBlogPost(slug);
  const { comments, createComment } = useBlogComments(post?.id);
  
  const [commentForm, setCommentForm] = useState({
    author: '',
    email: '',
    content: '',
    parentId: ''
  });
  const [submittingComment, setSubmittingComment] = useState(false);

  // Social sharing functions
  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post?.title || '');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post?.title || '');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post?.title || '');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=400');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép liên kết!');
    } catch (err) {
      alert('Không thể sao chép liên kết');
    }
  };

  // Newsletter subscription
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    
    if (!email) return;
    
    try {
      // Here you would typically send to your newsletter API
      alert('Cảm ơn bạn đã đăng ký nhận tin!');
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      alert('Có lỗi xảy ra khi đăng ký');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentForm.author || !commentForm.email || !commentForm.content) return;

    try {
      setSubmittingComment(true);
      await createComment({
        postId: post.id,
        author: commentForm.author,
        email: commentForm.email,
        content: commentForm.content,
        parentId: commentForm.parentId || undefined
      });
      
      setCommentForm({ author: '', email: '', content: '', parentId: '' });
      alert('Bình luận đã được gửi và đang chờ duyệt!');
    } catch (error) {
      alert('Có lỗi xảy ra khi gửi bình luận!');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="blog-post-page">
        <section className="blog-post-hero">
          <div className="container">
            <div className="blog-post-loading">
              <div className="loading-skeleton">
                <div className="skeleton-breadcrumb"></div>
                <div className="skeleton-title"></div>
                <div className="skeleton-meta">
                  <div className="skeleton-meta-item"></div>
                  <div className="skeleton-meta-item"></div>
                  <div className="skeleton-meta-item"></div>
                  <div className="skeleton-meta-item"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container">
        <div className="blog-post-error">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Không tìm thấy bài viết</h2>
          <p>{error || 'Bài viết không tồn tại hoặc đã bị xóa.'}</p>
          <a href="/" className="btn btn-primary">
            <i className="fas fa-home"></i>
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-page">
      {/* Hero Section */}
      <section className="blog-post-hero">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="blog-breadcrumb">
            <a href="/" className="breadcrumb-link">
              <i className="fas fa-home"></i>
              Trang chủ
            </a>
            <i className="fas fa-chevron-right breadcrumb-separator"></i>
            <a href="/#blog" className="breadcrumb-link">Blog</a>
            <i className="fas fa-chevron-right breadcrumb-separator"></i>
            <span className="breadcrumb-current">{post.category}</span>
          </nav>

          {/* Featured Badge */}
          {post.featured && (
            <div className="blog-featured-badge">
              <i className="fas fa-star"></i>
              <span>Bài viết nổi bật</span>
            </div>
          )}

          {/* Title */}
          <h1 className="blog-post-title">{post.title}</h1>

          {/* Meta Information */}
          <div className="blog-post-meta">
            <div className="meta-item">
              <div className="author-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="meta-content">
                <span className="meta-label">Tác giả</span>
                <span className="meta-value">{post.author}</span>
              </div>
            </div>
            
            <div className="meta-item">
              <i className="fas fa-calendar-alt"></i>
              <div className="meta-content">
                <span className="meta-label">Ngày đăng</span>
                <span className="meta-value">{formatDate(post.publishedAt || post.createdAt || '')}</span>
              </div>
            </div>
            
            <div className="meta-item">
              <i className="fas fa-clock"></i>
              <div className="meta-content">
                <span className="meta-label">Thời gian đọc</span>
                <span className="meta-value">{post.readingTime} phút</span>
              </div>
            </div>
            
            <div className="meta-item">
              <i className="fas fa-eye"></i>
              <div className="meta-content">
                <span className="meta-label">Lượt xem</span>
                <span className="meta-value">{post.views}</span>
              </div>
            </div>
          </div>

          {/* Category Badge */}
          <div className="blog-category-badge">
            <i className="fas fa-folder"></i>
            <span>{post.category}</span>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.image && (
        <section className="blog-post-image-section">
          <div className="container">
            <div className="blog-post-image">
              <img src={post.image} alt={post.title} />
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="blog-post-main">
        <div className="container">
          <div className="blog-layout">
            {/* Article Content */}
            <article className="blog-article">
              {/* Excerpt */}
              <div className="blog-excerpt">
                <p>{post.excerpt}</p>
              </div>
              
              {/* Content */}
              <div className="blog-content">
                <div 
                  className="blog-content-body"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="blog-tags-section">
                  <h4>Thẻ liên quan</h4>
                  <div className="blog-tags-list">
                    {post.tags.map((tag, index) => (
                      <a key={index} href={`/#blog?tag=${tag}`} className="blog-tag">
                        #{tag}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Share */}
              <div className="blog-social-share">
                <h4>Chia sẻ bài viết</h4>
                <div className="social-buttons">
                  <button className="social-btn facebook" title="Chia sẻ trên Facebook" onClick={shareOnFacebook}>
                    <i className="fab fa-facebook-f"></i>
                  </button>
                  <button className="social-btn twitter" title="Chia sẻ trên Twitter" onClick={shareOnTwitter}>
                    <i className="fab fa-twitter"></i>
                  </button>
                  <button className="social-btn linkedin" title="Chia sẻ trên LinkedIn" onClick={shareOnLinkedIn}>
                    <i className="fab fa-linkedin-in"></i>
                  </button>
                  <button className="social-btn copy" title="Sao chép liên kết" onClick={copyLink}>
                    <i className="fas fa-link"></i>
                  </button>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="blog-sidebar">
              {/* Table of Contents */}
              <div className="sidebar-widget toc-widget">
                <h4>Mục lục</h4>
                <div className="toc-content">
                  <p>Nội dung bài viết sẽ được cập nhật...</p>
                </div>
              </div>

              {/* Related Posts */}
              <div className="sidebar-widget related-posts-widget">
                <h4>Bài viết liên quan</h4>
                <div className="related-posts">
                  <div className="related-post">
                    <div className="related-post-image">
                      <i className="fas fa-image"></i>
                    </div>
                    <div className="related-post-content">
                      <h5>Hướng dẫn lập trình IoT</h5>
                      <span className="related-post-date">2 ngày trước</span>
                    </div>
                  </div>
                  <div className="related-post">
                    <div className="related-post-image">
                      <i className="fas fa-image"></i>
                    </div>
                    <div className="related-post-content">
                      <h5>Review ESP32 Development</h5>
                      <span className="related-post-date">1 tuần trước</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Newsletter */}
              <div className="sidebar-widget newsletter-widget">
                <h4>Đăng ký nhận tin</h4>
                <p>Nhận thông báo về bài viết mới nhất</p>
                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <input type="email" name="email" placeholder="Email của bạn" required />
                  <button type="submit">Đăng ký</button>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Comments Section */}
      <section className="blog-comments-section">
        <div className="container">
          <div className="comments-header">
            <h3>
              <i className="fas fa-comments"></i>
              Bình luận ({comments.length})
            </h3>
          </div>
          
          {/* Comment Form */}
          <div className="comment-form-container">
            <h4>Viết bình luận</h4>
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Tên của bạn *</label>
                  <input
                    type="text"
                    value={commentForm.author}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Nhập tên của bạn"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={commentForm.email}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Nhập email của bạn"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Nội dung bình luận *</label>
                <textarea
                  value={commentForm.content}
                  onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  placeholder="Viết bình luận của bạn..."
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="comment-submit-btn"
                disabled={submittingComment}
              >
                {submittingComment ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Gửi bình luận
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Comments List */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">
                <i className="fas fa-comment-slash"></i>
                <h4>Chưa có bình luận nào</h4>
                <p>Hãy là người đầu tiên bình luận về bài viết này!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// Comment Item Component
function CommentItem({ comment }: { comment: any }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comment-item">
      <div className="comment-avatar">
        <i className="fas fa-user-circle"></i>
      </div>
      
      <div className="comment-body">
        <div className="comment-header">
          <div className="comment-author">
            <h5>{comment.author}</h5>
            <span className="comment-date">
              <i className="fas fa-clock"></i>
              {formatDate(comment.createdAt || '')}
            </span>
          </div>
          <div className="comment-actions">
            <button className="comment-action-btn" title="Thích">
              <i className="far fa-heart"></i>
            </button>
            <button className="comment-action-btn" title="Trả lời">
              <i className="far fa-reply"></i>
            </button>
          </div>
        </div>
        
        <div className="comment-content">
          <p>{comment.content}</p>
        </div>
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((reply: any) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
