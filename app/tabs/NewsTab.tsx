"use client";

import { useEffect, useMemo, useState } from "react";
import { useNews } from "@/lib/hooks/useData";

type NewsItem = {
  id: string | number;
  date: string;
  title: string;
  source: string;
  category: string;
  summary: string;
  link: string;
};

export default function NewsTab() {
  const { news: apiNews, loading: apiLoading } = useNews();
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const weekRange = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun,1=Mon,...6=Sat
    const diffToMonday = (day + 6) % 7; // days since Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    const fmt = (d: Date) => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${fmt(monday)} - ${fmt(sunday)}`;
  }, []);

  useEffect(() => {
    // Use API data if available, otherwise fallback to static data
    if (apiNews && apiNews.length > 0) {
      // Convert API news to NewsItem format
      const convertedNews: NewsItem[] = apiNews.map(news => ({
        id: news.id,
        title: news.title,
        content: news.content,
        excerpt: news.excerpt,
        author: news.author,
        source: news.source,
        category: news.category,
        importance: news.importance,
        published: news.published,
        publishedAt: news.publishedAt,
        image: news.image || "",
        tags: news.tags,
        date: news.publishedAt || news.createdAt || new Date().toISOString(),
        summary: news.excerpt,
        link: news.link || "#"
      }));
      setItems(convertedNews);
      setLoading(false);
    } else if (!apiLoading) {
      // Fallback to static data if API is not loading and no data
      setItems([]);
      setLoading(false);
    }
  }, [apiNews, apiLoading]);

  const filtered = useMemo(() => {
    if (!items) return [] as NewsItem[];
    const base = filter === "all" ? items : items.filter(n => n.category === filter);
    // sort newest first by date
    return [...base].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, filter]);

  function formatDate(dateString: string) {
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  }

  return (
    <div className="container">
      {/* Hero Banner Section */}
      <section className="news-hero">
        <div className="news-hero-content">
          <div className="news-hero-text">
            <h1>
              <span style={{ color: 'var(--accent)' }}>Tin tức</span> công nghệ
            </h1>
            <p className="news-hero-description">
              Cập nhật những tin tức mới nhất từ các trang báo uy tín về IoT, Embedded, AI và công nghệ. 
              Khám phá xu hướng mới và cơ hội phát triển trong lĩnh vực công nghệ.
            </p>
          </div>
          <div className="news-hero-visual">
            <div className="news-categories">
              <div className="category-card">
                <i className="fas fa-wifi"></i>
                <h4>IoT</h4>
                <p>Internet of Things</p>
              </div>
              <div className="category-card">
                <i className="fas fa-microchip"></i>
                <h4>Embedded</h4>
                <p>Hệ thống nhúng</p>
              </div>
              <div className="category-card">
                <i className="fas fa-robot"></i>
                <h4>AI</h4>
                <p>Trí tuệ nhân tạo</p>
              </div>
              <div className="category-card">
                <i className="fas fa-satellite-dish"></i>
                <h4>Communications</h4>
                <p>Viễn thông</p>
              </div>
              <div className="category-card">
                <i className="fas fa-cogs"></i>
                <h4>Hardware</h4>
                <p>Phần cứng</p>
              </div>
              <div className="category-card">
                <i className="fas fa-chart-line"></i>
                <h4>Trends</h4>
                <p>Xu hướng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Filter Section */}
      <div className="news-filter-section">
        <div className="filter-tabs">
          {(["all", "Communications", "IoT", "Embedded", "AI", "Hardware"])?.map(key => (
            <button 
              key={key} 
              className={`filter-tab ${filter === key ? 'active' : ''}`} 
              onClick={() => setFilter(key)}
            >
              <i className={`fas ${
                key === 'all' ? 'fa-globe' :
                key === 'Communications' ? 'fa-satellite-dish' :
                key === 'IoT' ? 'fa-wifi' :
                key === 'Embedded' ? 'fa-microchip' :
                key === 'AI' ? 'fa-robot' :
                key === 'Hardware' ? 'fa-cogs' : 'fa-newspaper'
              }`}></i>
              {key === 'all' ? 'Tất cả' : String(key).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="news-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="news-card" key={`sk-${i}`} aria-hidden="true">
              <div className="news-content">
                <div className="skeleton h-4 w-1/3" style={{ height: 16, width: '33%', borderRadius: 6, marginBottom: 12 }} />
                <div className="skeleton h-6 w-3/4" style={{ height: 24, width: '75%', borderRadius: 8, marginBottom: 8 }} />
                <div className="skeleton h-4 w-1/2" style={{ height: 16, width: '50%', borderRadius: 6, marginBottom: 12 }} />
                <div className="skeleton h-16 w-full" style={{ height: 64, width: '100%', marginTop: 12, borderRadius: 10 }} />
                <div className="skeleton h-10 w-1/4" style={{ height: 40, width: '25%', marginTop: 12, borderRadius: 8, marginLeft: 'auto' }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="news-grid">
          <div className="news-error">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Lỗi tải tin tức</h3>
            <p>{error}</p>
          </div>
        </div>
      )}
      {!loading && !error && (
        <div className="news-grid">
          {filtered.map((news, idx) => (
            <div className="news-card" data-category={news.category} key={idx}>
              <div className="news-content">
                <div className="news-header">
                  <div className="news-badges">
                    <span className="news-category-badge">
                      {news.category}
                    </span>
                    <span className="news-source-badge">
                      {news.source}
                    </span>
                  </div>
                  <h3 className="news-title">
                    <a href={news.link} target="_blank" rel="noreferrer">
                      {news.title}
                    </a>
                  </h3>
                  <div className="news-date">
                    <i className="fas fa-calendar"></i>
                    {formatDate(news.date)}
                  </div>
                </div>
                
                <p className="news-summary">{news.summary}</p>
                
                <div className="news-actions">
                  <a 
                    href={news.link} 
                    target="_blank" 
                    className="btn-read-more" 
                    rel="noreferrer"
                  >
                    <i className="fas fa-external-link-alt"></i>
                    Đọc thêm
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


