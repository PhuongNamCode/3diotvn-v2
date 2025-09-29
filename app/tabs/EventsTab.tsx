"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useEvents, useRegistrations } from "@/lib/hooks/useData";

type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  registered: number;
  capacity: number;
  image?: string;
  status: "upcoming" | "past" | string;
  actualParticipants?: number;
  price?: number;
  speakers?: string[];
  requirements?: string;
  agenda?: string;
  category?: string;
};

type RegistrationPayload = {
  eventId: string;
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  experience?: string;
  expectation?: string;
};

export default function EventsTab() {
  const { events: apiEvents, loading: apiLoading, refetch: fetchEvents } = useEvents();
  const { createRegistration } = useRegistrations();
  const [items, setItems] = useState<EventItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [showEventDetails, setShowEventDetails] = useState<boolean>(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<EventItem | null>(null);

  useEffect(() => {
    // Use API data if available, otherwise fallback to static data
    if (apiEvents && apiEvents.length > 0) {
      // Convert API events to EventItem format
      const convertedEvents: EventItem[] = apiEvents.map(event => ({
        id: String(event.id),
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        capacity: event.capacity,
        price: event.price,
        speakers: event.speakers,
        requirements: event.requirements,
        agenda: event.agenda,
        image: event.image || "",
        category: event.category,
        status: event.status === 'cancelled' ? 'past' : event.status,
        registrations: event.registrations,
        registered: event.registrations, // Use actual registration count
        actualParticipants: event.actualParticipants // Include actual participants for past events
      }));
      setItems(convertedEvents);
      setLoading(false);
    } else if (!apiLoading) {
      // Fallback to static data if API is not loading and no data
      setItems([]);
      setLoading(false);
    }
  }, [apiEvents, apiLoading]);

  const now = useMemo(() => new Date(), []);

  function formatDate(dateString: string) {
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  }

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function ensureLoggedInOrRedirect(): boolean {
    const user = getCurrentUser();
    if (!user) {
      (window as any).showNotification?.('Bạn vui lòng đăng nhập để đăng ký tham gia!', 'warning');
      (window as any).switchToTab?.('login');
      return false;
    }
    return true;
  }

  function handleViewEventDetails(event: EventItem) {
    if (!ensureLoggedInOrRedirect()) return;
    setSelectedEventDetails(event);
    setShowEventDetails(true);
  }

  function handleCloseEventDetails() {
    setShowEventDetails(false);
    setSelectedEventDetails(null);
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
    setError(null);
    try {
      const registrationData = {
        eventId: payload.eventId.toString(),
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone || "",
        organization: payload.organization || "",
        experience: payload.experience || "",
        expectation: payload.expectation || "",
        status: "pending" as const
      };
      
      await createRegistration(registrationData);
      setSuccess(true);
      
      // Refresh events data to update registration counts
      await fetchEvents();
    } catch (e: any) {
      setError(e?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      {/* Hero Banner Section */}
      <section className="events-hero">
        <div className="events-hero-content">
          <div className="events-hero-text">
            <h1>
             <span style={{ color: 'var(--accent)' }}>Sự kiện</span>
            </h1>
            <p className="events-hero-description">
              Tham gia các workshop, seminar và hackathon cùng cộng đồng 3DIoT. 
              Khám phá công nghệ mới, kết nối với chuyên gia và phát triển kỹ năng của bạn.
            </p>
            <div className="events-hero-stats">
              <div className="stat-item">
                <span className="stat-number">{items?.filter(e => new Date(e.date) > now).length || 0}</span>
                <span className="stat-label">Sự kiện sắp tới</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{items?.filter(e => e.status === 'past').length || 0}</span>
                <span className="stat-label">Đã hoàn thành</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{items?.reduce((sum, e) => sum + e.registered, 0) || 0}</span>
                <span className="stat-label">Lượt đăng ký</span>
              </div>
            </div>
          </div>
          <div className="events-hero-visual">
            <div className="event-categories">
              <div className="category-card">
                <i className="fas fa-code"></i>
                <h4>Workshop</h4>
                <p>Học thực hành</p>
              </div>
              <div className="category-card">
                <i className="fas fa-users"></i>
                <h4>Seminar</h4>
                <p>Chia sẻ kinh nghiệm</p>
              </div>
              <div className="category-card">
                <i className="fas fa-trophy"></i>
                <h4>Hackathon</h4>
                <p>Thi đấu sáng tạo</p>
              </div>
              <div className="category-card">
                <i className="fas fa-microchip"></i>
                <h4>Tech Talk</h4>
                <p>Xu hướng công nghệ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading && (
        <div className="events-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="event-card" key={`sk-${i}`} aria-hidden="true">
              <div className="event-image skeleton" />
              <div className="event-content">
                <div className="skeleton h-6 w-3/4" style={{ height: 24, width: '75%', borderRadius: 8 }} />
                <div className="skeleton h-4 w-1/2" style={{ height: 16, width: '50%', marginTop: 10, borderRadius: 6 }} />
                <div className="skeleton h-4 w-2/3" style={{ height: 16, width: '66%', marginTop: 8, borderRadius: 6 }} />
                <div className="skeleton h-16 w-full" style={{ height: 64, width: '100%', marginTop: 12, borderRadius: 10 }} />
                <div className="skeleton h-10 w-full" style={{ height: 40, width: '100%', marginTop: 12, borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="events-grid"><p style={{ color: "var(--danger)" }}>{error}</p></div>
      )}

      {!loading && !error && (
        <>
          {/* Events Filter Section */}
          <div className="events-filter-section">
            <div className="filter-tabs">
              <button className="filter-tab active">
                <i className="fas fa-calendar-alt"></i>
                Tất cả sự kiện
              </button>
              <button className="filter-tab">
                <i className="fas fa-clock"></i>
                Sắp diễn ra
              </button>
              <button className="filter-tab">
                <i className="fas fa-history"></i>
                Đã hoàn thành
              </button>
            </div>
          </div>

          {/* Events Grid */}
          <div className="events-grid">
            {(items || []).map(event => {
              const eventDate = new Date(event.date);
              const isUpcoming = eventDate > now;
              const progress = Math.min(
                (event.status === 'past' && event.actualParticipants !== undefined 
                  ? event.actualParticipants 
                  : event.registered) / event.capacity * 100, 
                100
              );
              return (
                <div className="event-card" key={event.id}>
                  <div className="event-image">
                    {event.image ? (
                      <Image src={event.image} alt={event.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="event-image-placeholder">
                        <i className="fas fa-calendar-alt"></i>
                      </div>
                    )}
                    <div className={`event-status ${isUpcoming ? "upcoming" : "past"}`}>
                      {isUpcoming ? "Sắp diễn ra" : "Đã diễn ra"}
                    </div>
                    {event.category && (
                      <div className="event-category-badge">
                        {event.category}
                      </div>
                    )}
                  </div>
                  <div className="event-content">
                    <div className="event-header">
                      <h3 className="event-title">{event.title}</h3>
                      {event.price && event.price > 0 && (
                        <div className="event-price">
                          {event.price.toLocaleString('vi-VN')} VNĐ
                        </div>
                      )}
                    </div>
                    
                    <div className="event-meta">
                      <div className="event-meta-item">
                        <i className="fas fa-calendar"></i>
                        <span>{formatDate(event.date)} | {event.time}</span>
                      </div>
                      <div className="event-meta-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    
                    <p className="event-description">{event.description}</p>
                    
                    <div 
                      className="event-participants"
                      data-type={event.status === 'past' && event.actualParticipants !== undefined ? 'actual' : 'registration'}
                    >
                      <div className="participant-info">
                        <span className="participant-label">
                          {event.status === 'past' && event.actualParticipants !== undefined 
                            ? 'Đã tham gia:' 
                            : 'Đã đăng ký:'
                          }
                        </span>
                        <span className="participant-count">
                          {event.status === 'past' && event.actualParticipants !== undefined 
                            ? `${event.actualParticipants}/${event.capacity}` 
                            : `${event.registered}/${event.capacity}`
                          }
                        </span>
                      </div>
                      <div className="participant-progress">
                        <div className="participant-progress-bar" style={{ width: `${Math.round(progress)}%` }}></div>
                      </div>
                    </div>
                    
                    {isUpcoming && (
                      <button className="btn-register" onClick={() => handleViewEventDetails(event)}>
                        <i className="fas fa-user-plus"></i> 
                        Đăng ký tham gia
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEventDetails && (
        <div className="modal" style={{ display: "block" }} onClick={(e) => { if (e.target === e.currentTarget) handleCloseEventDetails(); }}>
          <div className="modal-content event-details-modal">
            <div className="modal-header">
              <span className="close" onClick={handleCloseEventDetails}>&times;</span>
              <h2>Chi tiết sự kiện</h2>
            </div>
            <div className="modal-body">
              <div className="event-details-content">
                {selectedEventDetails.image && (
                  <div className="event-details-image" style={{ position: 'relative', width: '100%', height: 220 }}>
                    <Image src={selectedEventDetails.image} alt={selectedEventDetails.title} fill sizes="100vw" style={{ objectFit: 'cover', borderRadius: 12 }} />
                  </div>
                )}
                
                <div className="event-details-info">
                  <h2 className="event-details-title">{selectedEventDetails.title}</h2>
                  
                  <div className="event-details-meta">
                    <div className="meta-item">
                      <span className="meta-label">Thời gian: </span>
                      <span className="meta-value">{formatDate(selectedEventDetails.date)} | {selectedEventDetails.time}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Địa điểm: </span>
                      <span className="meta-value">{selectedEventDetails.location}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">
                        {selectedEventDetails.status === 'past' && selectedEventDetails.actualParticipants !== undefined 
                          ? 'Số người đã tham gia: ' 
                          : 'Số người đã đăng ký: '
                        }
                      </span>
                      <span className="meta-value">
                        {selectedEventDetails.status === 'past' && selectedEventDetails.actualParticipants !== undefined 
                          ? `${selectedEventDetails.actualParticipants}/${selectedEventDetails.capacity} người`
                          : `${selectedEventDetails.registered}/${selectedEventDetails.capacity} người`
                        }
                      </span>
                    </div>
                    {typeof selectedEventDetails.price === 'number' && selectedEventDetails.price > 0 && (
                      <div className="meta-item">
                        <span className="meta-label">Giá vé: </span>
                        <span className="meta-value">{selectedEventDetails.price.toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                    )}
                  </div>

                  <div className="event-details-description">
                    <h3>Mô tả sự kiện </h3>
                    <p>{selectedEventDetails.description}</p>
                  </div>

                  {selectedEventDetails.speakers && selectedEventDetails.speakers.length > 0 && (
                    <div className="event-details-speakers">
                      <h3>Diễn giả </h3>
                      <ul>
                        {selectedEventDetails.speakers.map((speaker, index) => (
                          <li key={index}><i className="fas fa-user"></i> {speaker}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedEventDetails.requirements && (
                    <div className="event-details-requirements">
                      <h3>Yêu cầu tham gia </h3>
                      <p>{selectedEventDetails.requirements}</p>
                    </div>
                  )}

                  {selectedEventDetails.agenda && (
                    <div className="event-details-agenda">
                      <h3>Chương trình</h3>
                      <pre>{selectedEventDetails.agenda}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <button 
                className="btn btn-primary"
                style={{ margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => {
                  if (!ensureLoggedInOrRedirect()) return;
                  setSelected(selectedEventDetails);
                  setSuccess(false);
                  setShowEventDetails(false);
                }}
              >
                <i className="fas fa-user-plus"></i>
                Đăng ký tham gia
              </button>
            </div>
          </div>
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


