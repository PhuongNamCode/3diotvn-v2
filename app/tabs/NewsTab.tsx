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
      <div className="news-header">
        <h2>📰 Bản tin công nghệ tuần {weekRange}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Cập nhật những tin tức mới nhất từ các trang báo uy tín</p>
      </div>

      <div className="news-filters">
        {(["all", "Communications", "IoT", "Embedded", "AI", "Hardware"])?.map(key => (
          <button key={key} className={`filter-btn ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
            {key === 'all' ? 'Tất cả' : String(key).toUpperCase()}
          </button>
        ))}
      </div>

      {loading && (
        <div className="news-grid"><div className="loading"><i className="fas fa-spinner"></i><p>Đang tải tin tức mới nhất...</p></div></div>
      )}
      {error && (
        <div className="news-grid"><p style={{ color: "var(--danger)" }}>{error}</p></div>
      )}
      {!loading && !error && (
        <div className="news-grid">
          {filtered.map((news, idx) => (
            <div className="news-card" data-category={news.category} key={idx}>
              <div className="news-card-header">
                <span className="news-meta">{formatDate(news.date)}</span>
                <span className="news-badge">{news.source}</span>
              </div>
              <div className="news-card-body">
                <a href={news.link} target="_blank" className="news-title" rel="noreferrer">{news.title}</a>
                <div className="news-summary">{news.summary}</div>
              </div>
              <div className="news-card-footer">
                <span className="news-meta">Chủ đề: {news.category}</span>
                <a href={news.link} target="_blank" className="btn-primary" style={{ padding: "6px 12px", fontSize: "0.85rem" }} rel="noreferrer">
                  <i className="fas fa-external-link-alt"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


