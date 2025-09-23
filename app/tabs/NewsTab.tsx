"use client";

import { useEffect, useMemo, useState } from "react";
import type { NewsItem } from "@/data/news";

export default function NewsTab() {
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/news", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load news");
        const data = await res.json();
        if (!cancelled) setItems(data.items as NewsItem[]);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Có lỗi xảy ra");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [] as NewsItem[];
    if (filter === "all") return items;
    return items.filter(n => n.category === filter);
  }, [items, filter]);

  function formatDate(dateString: string) {
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  }

  return (
    <div className="container">
      <div className="news-header">
        <h2>📰 Tin tức công nghệ IoT</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Cập nhật những tin tức hot nhất về IoT, embedded systems và công nghệ</p>
      </div>

      <div className="news-filters">
        {(["all", "iot", "embedded", "ai", "hardware"])?.map(key => (
          <button key={key} className={`filter-btn ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
            {key === 'all' ? 'Tất cả' : key.toUpperCase()}
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


