"use client";

import { useEffect, useMemo, useState } from "react";
import type { EventItem } from "@/data/events";

type RegistrationPayload = {
  eventId: number;
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  experience?: string;
  expectation?: string;
};

export default function EventsTab() {
  const [items, setItems] = useState<EventItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/events", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load events");
        const data = await res.json();
        if (!cancelled) setItems(data.items as EventItem[]);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Có lỗi xảy ra");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const now = useMemo(() => new Date(), []);

  function formatDate(dateString: string) {
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  }

  async function submitRegistration(formData: FormData) {
    if (!selected) return;
    const payload: RegistrationPayload = {
      eventId: selected.id,
      fullName: String(formData.get("fullName") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      organization: String(formData.get("organization") || ""),
      experience: String(formData.get("experience") || ""),
      expectation: String(formData.get("expectation") || ""),
    };
    setSubmitting(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/registrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Đăng ký thất bại");
      setSuccess(true);
    } catch (e) {
      setSuccess(false);
      alert("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="events-banner"><h2>🎯 Sự kiện sắp diễn ra</h2><p>Tham gia các workshop, seminar và hackathon cùng cộng đồng 3DIoT</p></div>

      {loading && (
        <div className="events-grid"><div className="loading"><i className="fas fa-spinner"></i><p>Đang tải sự kiện...</p></div></div>
      )}
      {error && (
        <div className="events-grid"><p style={{ color: "var(--danger)" }}>{error}</p></div>
      )}

      {!loading && !error && (
        <div className="events-grid">
          {(items || []).map(event => {
            const eventDate = new Date(event.date);
            const isUpcoming = eventDate > now;
            const progress = Math.min((event.registered / event.capacity) * 100, 100);
            return (
              <div className="event-card" key={event.id}>
                <div className="event-image">
                  <i className={event.image}></i>
                  <div className={`event-status ${isUpcoming ? "upcoming" : "past"}`}>{isUpcoming ? "Sắp diễn ra" : "Đã diễn ra"}</div>
                </div>
                <div className="event-content">
                  <h3 className="event-title">{event.title}</h3>
                  <div className="event-date"><i className="fas fa-calendar"></i>{formatDate(event.date)} | {event.time}</div>
                  <div className="event-location"><i className="fas fa-map-marker-alt"></i>{event.location}</div>
                  <p className="event-description">{event.description}</p>
                  <div className="event-participants">
                    <span className="participant-count">{event.registered}/{event.capacity}</span>
                    <div className="participant-progress"><div className="participant-progress-bar" style={{ width: `${Math.round(progress)}%` }}></div></div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{Math.round(progress)}%</span>
                  </div>
                  {isUpcoming && (
                    <button className="btn-register" onClick={() => { setSelected(event); setSuccess(false); }}>
                      <i className="fas fa-user-plus"></i> Đăng ký tham gia
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="modal" style={{ display: "block" }} onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal-content">
            <div className="modal-header"><span className="close" onClick={() => setSelected(null)}>&times;</span><h2>Đăng ký: {selected.title}</h2></div>
            <div className="modal-body">
              {!success ? (
                <form onSubmit={(e) => { e.preventDefault(); submitRegistration(new FormData(e.currentTarget)); }}>
                  <div className="form-group"><label htmlFor="fullName">Họ và tên *</label><input type="text" id="fullName" name="fullName" required defaultValue="" /></div>
                  <div className="form-group"><label htmlFor="email">Email *</label><input type="email" id="email" name="email" required defaultValue="" /></div>
                  <div className="form-group"><label htmlFor="phone">Số điện thoại *</label><input type="tel" id="phone" name="phone" required defaultValue="" /></div>
                  <div className="form-group"><label htmlFor="organization">Đơn vị/Trường học</label><input type="text" id="organization" name="organization" defaultValue="" /></div>
                  <div className="form-group"><label htmlFor="experience">Mức độ kinh nghiệm</label><select id="experience" name="experience" required defaultValue=""><option value="">Chọn mức độ</option><option value="beginner">Mới bắt đầu</option><option value="intermediate">Trung bình</option><option value="advanced">Nâng cao</option><option value="expert">Chuyên gia</option></select></div>
                  <div className="form-group"><label htmlFor="expectation">Kỳ vọng từ sự kiện</label><textarea id="expectation" name="expectation" placeholder="Chia sẻ kỳ vọng của bạn về sự kiện này..."></textarea></div>
                  <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
                    {submitting ? (<><i className="fas fa-spinner fa-spin"></i> Đang xử lý...</>) : (<><i className="fas fa-check"></i> Xác nhận đăng ký</>)}
                  </button>
                </form>
              ) : (
                <div className="success-message">
                  <h3>🎉 Đăng ký thành công!</h3>
                  <p>Chúng tôi sẽ gửi thông tin chi tiết qua email trong thời gian sớm nhất.</p>
                  <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={() => setSelected(null)}>Đóng</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


