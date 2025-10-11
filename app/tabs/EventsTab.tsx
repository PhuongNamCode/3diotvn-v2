"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useEvents, useRegistrations } from "@/lib/hooks/useData";
import { paymentMethods, generatePaymentInstructions } from "@/lib/payment-config";
// Removed QRCodeGenerator import - using static QR codes instead

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
  paymentMethod?: string;
  transactionId?: string;
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
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [showEventDetails, setShowEventDetails] = useState<boolean>(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<EventItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('payment-dropdown');
      const selector = document.getElementById('payment-selector');
      if (dropdown && selector && 
          !selector.contains(event.target as Node) && 
          !dropdown.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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

  // Filter events based on status
  const filteredEvents = useMemo(() => {
    if (!items) return [];
    
    switch (statusFilter) {
      case 'upcoming':
        return items.filter(event => new Date(event.date) > now);
      case 'past':
        return items.filter(event => new Date(event.date) <= now || event.status === 'past');
      default:
        return items;
    }
  }, [items, statusFilter, now]);

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
    
    // No need to generate QR codes - using static QR codes from public folder
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
      paymentMethod: String(formData.get("paymentMethod") || ""),
      transactionId: String(formData.get("transactionId") || ""),
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
        status: "pending" as const,
        paymentStatus: selected.price && selected.price > 0 ? "pending" : "paid",
        paymentMethod: payload.paymentMethod || null,
        transactionId: payload.transactionId || null,
        amount: selected.price || null
      };
      
      const response = await createRegistration(registrationData);
      setSuccess(true);
      setPaymentStatus(response.paymentStatus || '');
      
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
              <button 
                className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <i className="fas fa-calendar-alt"></i>
                Tất cả sự kiện
              </button>
              <button 
                className={`filter-tab ${statusFilter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setStatusFilter('upcoming')}
              >
                <i className="fas fa-clock"></i>
                Sắp diễn ra
              </button>
              <button 
                className={`filter-tab ${statusFilter === 'past' ? 'active' : ''}`}
                onClick={() => setStatusFilter('past')}
              >
                <i className="fas fa-history"></i>
                Đã hoàn thành
              </button>
            </div>
          </div>

          {/* Events Grid */}
          <div className="events-grid">
            {filteredEvents.map(event => {
              const eventDate = new Date(event.date);
              const isUpcoming = eventDate > now;
              const progress = Math.min(
                (event.status === 'past' && event.actualParticipants !== undefined 
                  ? event.actualParticipants 
                  : event.registered) / event.capacity * 100, 
                100
              );
              return (
                <div className="event-card" key={event.id} style={{
                  background: 'var(--surface)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '2px solid transparent',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  backgroundClip: 'padding-box'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = `
                    0 16px 48px rgba(0, 0, 0, 0.15),
                    0 0 20px rgba(59, 130, 246, 0.4),
                    0 0 40px rgba(59, 130, 246, 0.2)
                  `;
                  e.currentTarget.style.border = '2px solid var(--accent)';
                  e.currentTarget.style.background = `
                    linear-gradient(var(--surface), var(--surface)) padding-box,
                    linear-gradient(135deg, var(--accent), var(--accent-secondary), #8b5cf6, var(--accent)) border-box
                  `;
                  e.currentTarget.style.animation = 'glow-pulse 2s ease-in-out infinite';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.border = '2px solid transparent';
                  e.currentTarget.style.background = 'var(--surface)';
                  e.currentTarget.style.animation = 'none';
                }}>
                  
                  {/* Status Tag - Only keep "Sắp diễn ra" on top */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    zIndex: 10
                  }}>
                    <span style={{
                      background: isUpcoming 
                        ? 'linear-gradient(135deg, #10b981, #34d399)' 
                        : 'linear-gradient(135deg, #6b7280, #9ca3af)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '25px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <i className={`fas ${isUpcoming ? 'fa-clock' : 'fa-check-circle'}`} style={{ fontSize: '12px' }}></i>
                      {isUpcoming ? "Sắp diễn ra" : "Đã diễn ra"}
                    </span>
                  </div>

                  <div className="event-image" style={{
                    position: 'relative',
                    height: '200px',
                    overflow: 'hidden'
                  }}>
                    {event.image ? (
                      <Image src={event.image} alt={event.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="event-image-placeholder" style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px',
                        color: 'white'
                      }}>
                        <i className="fas fa-calendar-alt"></i>
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '60px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))'
                    }}></div>
                  </div>
                  <div className="event-content" style={{
                    padding: '24px'
                  }}>
                    {/* Tags and Price Section - Before Title */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginBottom: '16px',
                      alignItems: 'center'
                    }}>
                      {/* Category Tag */}
                      {event.category && (
                        <span style={{
                          background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                          color: 'white',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 3px 12px rgba(59, 130, 246, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)'
                        }}>
                          <i className="fas fa-tag" style={{ fontSize: '10px' }}></i>
                          {event.category}
                        </span>
                      )}

                      {/* Price Tag - Professional Gold for Free */}
                      <span style={{
                        background: event.price && event.price > 0 
                          ? 'linear-gradient(135deg, #f59e0b, #d97706, #b45309)' 
                          : 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)',
                        color: event.price && event.price > 0 ? 'white' : '#1f2937',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: event.price && event.price > 0 
                          ? '0 3px 12px rgba(245, 158, 11, 0.4)' 
                          : '0 3px 12px rgba(251, 191, 36, 0.5)',
                        border: event.price && event.price > 0 
                          ? '1px solid rgba(255, 255, 255, 0.2)' 
                          : '1px solid rgba(31, 41, 55, 0.1)',
                        backdropFilter: 'blur(10px)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {/* Shine effect for free tag */}
                        {!(event.price && event.price > 0) && (
                          <div style={{
                            position: 'absolute',
                            top: '-50%',
                            left: '-50%',
                            width: '200%',
                            height: '200%',
                            background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                            animation: 'shine 2s infinite',
                            pointerEvents: 'none'
                          }}></div>
                        )}
                        <i className={`fas ${event.price && event.price > 0 ? 'fa-dollar-sign' : 'fa-gift'}`} style={{ fontSize: '10px', position: 'relative', zIndex: 1 }}></i>
                        <span style={{ position: 'relative', zIndex: 1 }}>
                          {event.price && event.price > 0 
                            ? `${event.price.toLocaleString('vi-VN')}₫`
                            : 'Miễn phí'
                          }
                        </span>
                      </span>
                    </div>

                    <div className="event-header" style={{
                      marginBottom: '16px'
                    }}>
                      <h3 className="event-title" style={{
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        color: 'var(--primary)',
                        margin: '0 0 8px 0',
                        lineHeight: '1.4'
                      }}>{event.title}</h3>
                    </div>
                    
                    <div className="event-meta" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div className="event-meta-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: 'var(--text-secondary)'
                      }}>
                        <i className="fas fa-calendar" style={{
                          color: 'var(--accent)',
                          width: '16px',
                          textAlign: 'center'
                        }}></i>
                        <span>{formatDate(event.date)} | {event.time}</span>
                      </div>
                      <div className="event-meta-item" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: 'var(--text-secondary)'
                      }}>
                        <i className="fas fa-map-marker-alt" style={{
                          color: 'var(--accent)',
                          width: '16px',
                          textAlign: 'center'
                        }}></i>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    
                    <p className="event-description" style={{
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      margin: '0 0 20px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>{event.description}</p>
                    
                    <div 
                      className="event-participants"
                      style={{
                        marginBottom: '20px'
                      }}
                    >
                      <div className="participant-info" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span className="participant-label" style={{
                          fontSize: '14px',
                          color: 'var(--text-secondary)',
                          fontWeight: '500'
                        }}>
                          {event.status === 'past' && event.actualParticipants !== undefined 
                            ? 'Đã tham gia:' 
                            : 'Đã đăng ký:'
                          }
                        </span>
                        <span className="participant-count" style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--primary)'
                        }}>
                          {event.status === 'past' && event.actualParticipants !== undefined 
                            ? `${event.actualParticipants}/${event.capacity}` 
                            : `${event.registered}/${event.capacity}`
                          }
                        </span>
                      </div>
                      <div className="participant-progress" style={{
                        height: '8px',
                        background: 'var(--surface-variant)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div className="participant-progress-bar" style={{ 
                          width: `${Math.round(progress)}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--accent), var(--accent-secondary))',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                    
                    {isUpcoming && (
                      <button 
                        className="btn-register" 
                        onClick={() => handleViewEventDetails(event)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                          color: 'white',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                        }}
                      >
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
        <div className="modal" style={{ display: "block", zIndex: 1000, backgroundColor: "rgba(0,0,0,0.7)" }} onClick={(e) => { if (e.target === e.currentTarget) handleCloseEventDetails(); }}>
          <div className="modal-content" style={{ 
            maxWidth: '900px', 
            width: '90%', 
            maxHeight: '90vh', 
            overflow: 'auto',
            borderRadius: '20px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            border: 'none',
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--background) 100%)'
          }}>
            {/* Close Button */}
            <button 
              onClick={handleCloseEventDetails}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '18px',
                cursor: 'pointer',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
            >
              ×
            </button>

            {/* Event Header Section */}
            {selectedEventDetails.image ? (
              /* With Image */
              <>
                <div style={{ 
                  position: 'relative', 
                  height: '300px', 
                  borderRadius: '20px 20px 0 0',
                  overflow: 'hidden',
                  background: 'linear-gradient(45deg, var(--accent), var(--accent-secondary))'
                }}>
                  <Image 
                    src={selectedEventDetails.image} 
                    alt={selectedEventDetails.title} 
                    fill 
                    sizes="900px" 
                    style={{ objectFit: 'cover' }} 
                  />
                  
                  {/* Price tag on image */}
                  <div style={{ 
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    fontSize: '1.1rem', 
                    fontWeight: '600',
                    background: selectedEventDetails.price && selectedEventDetails.price > 0 ? 'var(--warning)' : 'var(--success)',
                    padding: '8px 20px',
                    borderRadius: '50px',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.2)'
                  }}>
                    {typeof selectedEventDetails.price === 'number' && selectedEventDetails.price > 0
                      ? `${selectedEventDetails.price.toLocaleString('vi-VN')} VNĐ`
                      : '🎉 Miễn phí'
                    }
                  </div>
                </div>
                
                {/* Title below image */}
                <div style={{ 
                  padding: '30px 40px 20px',
                  textAlign: 'center',
                  borderBottom: '1px solid var(--border)'
                }}>
                  <h1 style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: '700', 
                    margin: '0',
                    color: 'var(--primary)'
                  }}>
                    {selectedEventDetails.title}
                  </h1>
                </div>
              </>
            ) : (
              /* Without Image - Beautiful gradient header */
              <div style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                padding: '60px 40px',
                borderRadius: '20px 20px 0 0',
                textAlign: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Decorative elements */}
                <div style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '200px',
                  height: '200px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '150px',
                  height: '150px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '50%'
                }}></div>
                
                {/* Event icon */}
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '30px'
                }}>
                  <i className="fas fa-calendar-alt"></i>
                </div>
                
                <h1 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '700', 
                  margin: '0 0 15px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  position: 'relative',
                  zIndex: 2
                }}>
                  {selectedEventDetails.title}
                </h1>
                <div style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: '600',
                  background: selectedEventDetails.price && selectedEventDetails.price > 0 ? 'rgba(255,193,7,1)' : 'rgba(16,185,129,1)',
                  display: 'inline-block',
                  padding: '10px 25px',
                  borderRadius: '50px',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  position: 'relative',
                  zIndex: 2
                }}>
                  {typeof selectedEventDetails.price === 'number' && selectedEventDetails.price > 0
                    ? `${selectedEventDetails.price.toLocaleString('vi-VN')} VNĐ`
                    : '🎉 Miễn phí'
                  }
            </div>
                  </div>
                )}

            {/* Content Body */}
            <div style={{ padding: '40px' }}>
                
              {/* Event Meta Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
              }}>
                <div style={{
                  background: 'var(--surface)',
                  padding: '25px',
                  borderRadius: '15px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                    <i className="fas fa-calendar-alt" style={{ 
                      fontSize: '20px', 
                      color: 'var(--accent)', 
                      marginRight: '12px',
                      width: '24px'
                    }}></i>
                    <span style={{ fontWeight: '600', color: 'var(--primary)' }}>Thời gian</span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.5' }}>
                    {formatDate(selectedEventDetails.date)}<br />
                    <strong>{selectedEventDetails.time}</strong>
                  </p>
                </div>

                <div style={{
                  background: 'var(--surface)',
                  padding: '25px',
                  borderRadius: '15px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                    <i className="fas fa-map-marker-alt" style={{ 
                      fontSize: '20px', 
                      color: 'var(--accent)', 
                      marginRight: '12px',
                      width: '24px'
                    }}></i>
                    <span style={{ fontWeight: '600', color: 'var(--primary)' }}>Địa điểm</span>
                    </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '15px' }}>
                    {selectedEventDetails.location}
                  </p>
                    </div>

                <div style={{
                  background: 'var(--surface)',
                  padding: '25px',
                  borderRadius: '15px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                    <i className="fas fa-users" style={{ 
                      fontSize: '20px', 
                      color: 'var(--accent)', 
                      marginRight: '12px',
                      width: '24px'
                    }}></i>
                    <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                        {selectedEventDetails.status === 'past' && selectedEventDetails.actualParticipants !== undefined 
                        ? 'Đã tham gia' 
                        : 'Đã đăng ký'
                        }
                      </span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '15px' }}>
                    <strong style={{ color: 'var(--accent)', fontSize: '18px' }}>
                        {selectedEventDetails.status === 'past' && selectedEventDetails.actualParticipants !== undefined 
                        ? selectedEventDetails.actualParticipants
                        : selectedEventDetails.registered
                        }
                    </strong>
                    <span style={{ color: 'var(--text-muted)' }}>
                      /{selectedEventDetails.capacity} người
                      </span>
                  </p>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '35px' }}>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: 'var(--primary)', 
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <i className="fas fa-info-circle" style={{ marginRight: '12px', color: 'var(--accent)' }}></i>
                  Mô tả sự kiện
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.7', 
                  fontSize: '16px',
                  background: 'var(--surface)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)'
                }}>
                  {selectedEventDetails.description}
                </p>
              </div>

              {/* Speakers */}
              {selectedEventDetails.speakers && selectedEventDetails.speakers.length > 0 && (
                <div style={{ marginBottom: '35px' }}>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '600', 
                    color: 'var(--primary)', 
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <i className="fas fa-microphone" style={{ marginRight: '12px', color: 'var(--accent)' }}></i>
                    Diễn giả
                  </h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '15px' 
                  }}>
                    {selectedEventDetails.speakers.map((speaker, index) => (
                      <div key={index} style={{
                        background: 'var(--surface)',
                        padding: '15px 20px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          background: 'var(--accent)',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '15px'
                        }}>
                          <i className="fas fa-user" style={{ color: 'white', fontSize: '16px' }}></i>
                    </div>
                        <span style={{ fontWeight: '500', color: 'var(--primary)' }}>{speaker}</span>
                      </div>
                    ))}
                  </div>
                    </div>
                  )}

              {/* Requirements */}
                  {selectedEventDetails.requirements && (
                <div style={{ marginBottom: '35px' }}>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '600', 
                    color: 'var(--primary)', 
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <i className="fas fa-clipboard-check" style={{ marginRight: '12px', color: 'var(--warning)' }}></i>
                    Yêu cầu tham gia
                  </h3>
                  <div style={{
                    background: 'var(--warning)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    lineHeight: '1.6'
                  }}>
                    {selectedEventDetails.requirements}
                  </div>
                    </div>
                  )}

              {/* Agenda */}
                  {selectedEventDetails.agenda && (
                <div style={{ marginBottom: '35px' }}>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '600', 
                    color: 'var(--primary)', 
                    marginBottom: '15px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <i className="fas fa-list-ul" style={{ marginRight: '12px', color: 'var(--accent)' }}></i>
                    Chương trình
                  </h3>
                  <div style={{
                    background: 'var(--surface)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedEventDetails.agenda}
                    </div>
                </div>
              )}

              {/* Registration Button */}
              <div style={{ textAlign: 'center', paddingTop: '20px' }}>
              <button 
                onClick={() => {
                  if (!ensureLoggedInOrRedirect()) return;
                  setSelected(selectedEventDetails);
                  setSuccess(false);
                  setPaymentStatus('');
                  setShowEventDetails(false);
                }}
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                    color: 'white',
                    border: 'none',
                    padding: '18px 40px',
                    borderRadius: '50px',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    margin: '0 auto',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)';
                }}
              >
                <i className="fas fa-user-plus"></i>
                  Đăng ký tham gia ngay
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal" style={{ 
          display: "block", 
          zIndex: 1000, 
          backgroundColor: "rgba(0,0,0,0.8)" 
        }} onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal-content" style={{
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            borderRadius: '20px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            border: 'none',
            background: 'var(--surface)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setSelected(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(0,0,0,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '18px',
                cursor: 'pointer',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                color: 'var(--text-primary)'
              }}
            >
              ×
            </button>

              {!success ? (
              <>
                {/* Header */}
                <div style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                  color: 'white',
                  padding: '40px 40px 30px',
                  borderRadius: '20px 20px 0 0',
                  textAlign: 'center'
                }}>
                  <h2 style={{ 
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    margin: '0 0 15px',
                    color: '#ffffff',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    Đăng ký tham gia
                  </h2>
                  <p style={{ 
                    fontSize: '1.1rem', 
                    margin: '0',
                    color: 'rgba(255,255,255,0.95)',
                    fontWeight: '500'
                  }}>
                    {selected.title}
                  </p>
                  <div style={{ 
                    marginTop: '15px',
                    fontSize: '1.1rem', 
                    fontWeight: '600',
                    background: 'rgba(255,255,255,0.25)',
                    display: 'inline-block',
                    padding: '10px 25px',
                    borderRadius: '50px',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.3)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}>
                    {selected.price && selected.price > 0 
                      ? `${(selected.price ?? 0).toLocaleString('vi-VN')} VNĐ`
                      : '🎉 Miễn phí'
                    }
                  </div>
                </div>
                {/* Form */}
                <div style={{ padding: '40px' }}>
                <form onSubmit={(e) => { e.preventDefault(); submitRegistration(new FormData(e.currentTarget)); }}>
                    {/* Personal Info */}
                    <div style={{ marginBottom: '30px' }}>
                      <h3 style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: '600', 
                        color: 'var(--primary)', 
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <i className="fas fa-user" style={{ marginRight: '10px', color: 'var(--accent)' }}></i>
                        Thông tin cá nhân
                      </h3>
                      <div style={{ display: 'grid', gap: '20px' }}>
                        <div>
                          <label htmlFor="fullName" style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600', 
                            color: 'var(--primary)' 
                          }}>
                            Họ và tên *
                          </label>
                          <input 
                            type="text" 
                            id="fullName" 
                            name="fullName" 
                            required 
                            style={{
                              width: '100%',
                              padding: '15px 20px',
                              border: '2px solid var(--border)',
                              borderRadius: '12px',
                              fontSize: '16px',
                              background: 'var(--background)'
                            }}
                            placeholder="Nhập họ và tên của bạn"
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          <div>
                            <label htmlFor="email" style={{ 
                              display: 'block', 
                              marginBottom: '8px', 
                              fontWeight: '600', 
                              color: 'var(--primary)' 
                            }}>
                              Email *
                            </label>
                            <input 
                              type="email" 
                              id="email" 
                              name="email" 
                              required 
                              style={{
                                width: '100%',
                                padding: '15px 20px',
                                border: '2px solid var(--border)',
                                borderRadius: '12px',
                                fontSize: '16px',
                                background: 'var(--background)'
                              }}
                              placeholder="email@example.com"
                            />
                          </div>
                          <div>
                            <label htmlFor="phone" style={{ 
                              display: 'block', 
                              marginBottom: '8px', 
                              fontWeight: '600', 
                              color: 'var(--primary)' 
                            }}>
                              Số điện thoại *
                            </label>
                            <input 
                              type="tel" 
                              id="phone" 
                              name="phone" 
                              required 
                              style={{
                                width: '100%',
                                padding: '15px 20px',
                                border: '2px solid var(--border)',
                                borderRadius: '12px',
                                fontSize: '16px',
                                background: 'var(--background)'
                              }}
                              placeholder="0901234567"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Professional Info */}
                    <div style={{ marginBottom: '30px' }}>
                      <h3 style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: '600', 
                        color: 'var(--primary)', 
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <i className="fas fa-briefcase" style={{ marginRight: '10px', color: 'var(--accent)' }}></i>
                        Thông tin nghề nghiệp
                      </h3>
                      <div style={{ display: 'grid', gap: '20px' }}>
                        <div>
                          <label htmlFor="organization" style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600', 
                            color: 'var(--primary)' 
                          }}>
                            Đơn vị/Trường học
                          </label>
                          <input 
                            type="text" 
                            id="organization" 
                            name="organization" 
                            style={{
                              width: '100%',
                              padding: '15px 20px',
                              border: '2px solid var(--border)',
                              borderRadius: '12px',
                              fontSize: '16px',
                              background: 'var(--background)'
                            }}
                            placeholder="Tên công ty hoặc trường học"
                          />
                        </div>
                        <div>
                          <label htmlFor="experience" style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600', 
                            color: 'var(--primary)' 
                          }}>
                            Mức độ kinh nghiệm *
                          </label>
                          <select 
                            id="experience" 
                            name="experience" 
                            required 
                            style={{
                              width: '100%',
                              padding: '15px 20px',
                              border: '2px solid var(--border)',
                              borderRadius: '12px',
                              fontSize: '16px',
                              background: 'var(--background)',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="">Chọn mức độ kinh nghiệm</option>
                            <option value="beginner">🌱 Mới bắt đầu</option>
                            <option value="intermediate">⚡ Trung bình</option>
                            <option value="advanced">🚀 Nâng cao</option>
                            <option value="expert">👑 Chuyên gia</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Expectations */}
                    <div style={{ marginBottom: '30px' }}>
                      <h3 style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: '600', 
                        color: 'var(--primary)', 
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <i className="fas fa-star" style={{ marginRight: '10px', color: 'var(--accent)' }}></i>
                        Kỳ vọng từ sự kiện
                      </h3>
                      <textarea 
                        id="expectation" 
                        name="expectation" 
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '15px 20px',
                          border: '2px solid var(--border)',
                          borderRadius: '12px',
                          fontSize: '16px',
                          background: 'var(--background)',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                        placeholder="Chia sẻ kỳ vọng của bạn về sự kiện này..."
                      />
                    </div>

                    {/* Payment Information - Only show if event has price > 0 */}
                    {(selected.price ?? 0) > 0 && (
                      <div style={{ marginBottom: '30px' }}>

                        {/* Payment Method Selection */}
                        <div style={{ marginBottom: '20px' }}>
                          <label htmlFor="paymentMethod" style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600', 
                            color: 'var(--primary)' 
                          }}>
                            Phương thức thanh toán *
                          </label>
                          
                          {/* Custom Payment Method Selector */}
                          <div style={{ position: 'relative' }}>
                            <div 
                              id="payment-selector"
                              style={{
                                width: '100%',
                                padding: '15px 20px',
                                border: '2px solid var(--border)',
                                borderRadius: '12px',
                                fontSize: '16px',
                                background: 'var(--background)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                              onClick={() => {
                                setIsDropdownOpen(!isDropdownOpen);
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {selectedPaymentMethod === 'ocb' ? (
                                  <>
                                    <img 
                                      src="/payment-logos/ocb-logo.png" 
                                      alt="OCB" 
                                      style={{ width: '20px', height: '20px', marginRight: '8px' }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                    <span>OCB (Ngân hàng)</span>
                                  </>
                                ) : selectedPaymentMethod === 'momo' ? (
                                  <>
                                    <img 
                                      src="/payment-logos/momo-logo.png" 
                                      alt="MoMo" 
                                      style={{ width: '20px', height: '20px', marginRight: '8px' }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                    <span>MoMo</span>
                                  </>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>Chọn phương thức thanh toán</span>
                                )}
                              </div>
                              <i className="fas fa-chevron-down" style={{ fontSize: '12px', color: 'var(--text-muted)' }}></i>
                            </div>
                            
                            {/* Dropdown Options */}
                            {isDropdownOpen && (
                              <div 
                                id="payment-dropdown"
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: '0',
                                  right: '0',
                                  background: 'var(--background)',
                                  border: '2px solid var(--border)',
                                  borderTop: 'none',
                                  borderRadius: '0 0 12px 12px',
                                  zIndex: 1000
                                }}
                              >
                              <div 
                                style={{
                                  padding: '12px 20px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  borderBottom: '1px solid var(--border)'
                                }}
                                onClick={() => {
                                  setSelectedPaymentMethod('ocb');
                                  setIsDropdownOpen(false);
                                }}
                              >
                                <img 
                                  src="/payment-logos/ocb-logo.png" 
                                  alt="OCB" 
                                  style={{ width: '20px', height: '20px', marginRight: '8px' }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                                <span>OCB (Ngân hàng)</span>
                              </div>
                              
                              <div 
                                style={{
                                  padding: '12px 20px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                onClick={() => {
                                  setSelectedPaymentMethod('momo');
                                  setIsDropdownOpen(false);
                                }}
                              >
                                <img 
                                  src="/payment-logos/momo-logo.png" 
                                  alt="MoMo" 
                                  style={{ width: '20px', height: '20px', marginRight: '8px' }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                                <span>MoMo</span>
                              </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Hidden input for form submission */}
                          <input 
                            type="hidden" 
                            name="paymentMethod" 
                            value={selectedPaymentMethod}
                            required 
                          />
                        </div>

                        {/* Selected Payment Method Details */}
                        {selectedPaymentMethod && (
                          <div style={{ marginBottom: '20px' }}>
                            <div style={{
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              borderRadius: '12px',
                              padding: '20px',
                              fontSize: '14px'
                            }}>
                              {selectedPaymentMethod === 'ocb' ? (
                                <>
                                  <h4 style={{ margin: '0 0 15px', color: 'var(--primary)', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                    <img 
                                      src="/payment-logos/ocb-logo.png" 
                                      alt="OCB" 
                                      style={{ width: '24px', height: '24px', marginRight: '8px' }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.setAttribute('style', 'margin-right: 8px;');
                                      }}
                                    />
                                    <span></span> OCB - Ngân hàng TMCP Phương Đông
                                  </h4>
                                  
                                  {/* OCB QR Code - Static */}
                                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <img 
                                      src="/payment-logos/ocb-qr.jpg" 
                                      alt="OCB QR Code" 
                                      style={{ 
                                        width: '320px', 
                                        height: '320px', 
                                        margin: '0 auto',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                      }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                          parent.innerHTML = '<p style="color: var(--text-muted); padding: 20px;">QR Code không khả dụng</p>';
                                        }
                                      }}
                                    />
                                    <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                      Quét mã bằng app OCB hoặc ngân hàng hỗ trợ
                                    </p>
                                  </div>

                                  <div style={{ marginBottom: '10px' }}>
                                    <strong>Ngân hàng:</strong> TMCP Phương Đông (OCB)
                                  </div>
                                  <div style={{ marginBottom: '10px' }}>
                                    <strong>Số tài khoản:</strong> <span style={{ fontFamily: 'monospace', background: 'var(--surface-variant)', padding: '4px 8px', borderRadius: '4px' }}>0004100026206005</span>
                                  </div>
                                  <div style={{ marginBottom: '10px' }}>
                                    <strong>Chủ tài khoản:</strong> Nguyễn Phương Nam
                                  </div>
                                  <div style={{ marginBottom: '10px' }}>
                                    <strong>Số tiền:</strong> <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{(selected.price ?? 0).toLocaleString('vi-VN')} VNĐ</span>
                                  </div>
                                  <div style={{ marginBottom: '10px' }}>
                                    <strong>Nội dung:</strong> <span style={{ fontFamily: 'monospace', background: 'var(--surface-variant)', padding: '4px 8px', borderRadius: '4px' }}>DK {selected.title.substring(0, 20)}...</span>
                                  </div>
                                </>
                              ) : selectedPaymentMethod === 'momo' ? (
                                <>
                                  <h4 style={{ margin: '0 0 15px', color: 'var(--primary)', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                                    <img 
                                      src="/payment-logos/momo-logo.png" 
                                      alt="MoMo" 
                                      style={{ width: '24px', height: '24px', marginRight: '8px' }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.setAttribute('style', 'margin-right: 8px;');
                                      }}
                                    />
                                    <span></span> MoMo - Ví điện tử
                                  </h4>
                                  
                                  {/* MoMo QR Code - Static */}
                                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <img 
                                      src="/payment-logos/momo-qr.jpg" 
                                      alt="MoMo QR Code" 
                                      style={{ 
                                        width: '320px', 
                                        height: '320px', 
                                        margin: '0 auto',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                      }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent) {
                                          parent.innerHTML = '<p style="color: var(--text-muted); padding: 20px;">QR Code không khả dụng</p>';
                                        }
                                      }}
                                    />
                                    <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                      Quét mã bằng app MoMo
                                    </p>
                                  </div>

                                  <div style={{ marginBottom: '10px' }}>
                                    <strong>Số điện thoại:</strong> <span style={{ fontFamily: 'monospace', background: 'var(--surface-variant)', padding: '4px 8px', borderRadius: '4px' }}>0339830128</span>
                                  </div>
                                  <div style={{ marginBottom: '10px' }}>
                                    <strong>Số tiền:</strong> <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{(selected.price ?? 0).toLocaleString('vi-VN')} VNĐ</span>
                                  </div>
                                  <div style={{ marginBottom: '10px' }}>
                                    <strong>Nội dung:</strong> <span style={{ fontFamily: 'monospace', background: 'var(--surface-variant)', padding: '4px 8px', borderRadius: '4px' }}>DK {selected.title.substring(0, 20)}...</span>
                                  </div>
                                </>
                              ) : null}
                              <div style={{ marginTop: '15px', padding: '10px', background: 'var(--warning)', color: 'white', borderRadius: '8px', fontSize: '13px' }}>
                                <strong>⚠️ Lưu ý:</strong> Sau khi thanh toán thành công, vui lòng nhập mã giao dịch vào form bên dưới để hoàn tất đăng ký.
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Transaction ID Input */}
                        <div>
                          <label htmlFor="transactionId" style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600', 
                            color: 'var(--primary)' 
                          }}>
                            Mã giao dịch *
                          </label>
                          <input 
                            type="text" 
                            id="transactionId" 
                            name="transactionId" 
                            required 
                            style={{
                              width: '100%',
                              padding: '15px 20px',
                              border: '2px solid var(--border)',
                              borderRadius: '12px',
                              fontSize: '16px',
                              background: 'var(--background)'
                            }}
                            placeholder="Nhập mã giao dịch (VD: 1234567890)"
                          />
                          <p style={{ 
                            fontSize: '12px', 
                            color: 'var(--text-muted)', 
                            margin: '8px 0 0',
                            lineHeight: '1.4'
                          }}>
                            💡 Mã giao dịch có thể tìm thấy trong tin nhắn SMS hoặc email xác nhận từ ngân hàng
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      disabled={submitting}
                      style={{
                        width: '100%',
                        background: submitting 
                          ? 'var(--text-muted)' 
                          : 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                        color: 'white',
                        border: 'none',
                        padding: '18px 20px',
                        borderRadius: '12px',
                        fontSize: '18px',
                        fontWeight: '600',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: submitting ? 'none' : '0 10px 30px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      {submitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check"></i>
                          Xác nhận đăng ký
                        </>
                      )}
                  </button>
                </form>
                </div>
              </>
            ) : (
              /* Success State */
              <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                {paymentStatus === 'pending_verification' ? (
                  <>
                    <div style={{
                      background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                      borderRadius: '50%',
                      width: '100px',
                      height: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 30px',
                      color: 'white',
                      fontSize: '40px'
                    }}>
                      <i className="fas fa-clock"></i>
                    </div>
                    <h3 style={{ 
                      fontSize: '2rem', 
                      fontWeight: '700', 
                      color: '#f59e0b', 
                      margin: '0 0 15px' 
                    }}>
                      ⏳ Đang xử lý thanh toán
                    </h3>
                    <p style={{ 
                      fontSize: '1.1rem', 
                      color: 'var(--text-secondary)', 
                      lineHeight: '1.6',
                      margin: '0 0 20px'
                    }}>
                      Cảm ơn bạn đã đăng ký <strong>{selected.title}</strong>!<br />
                      Chúng tôi đã nhận được thông tin đăng ký và mã giao dịch của bạn.
                    </p>
                    <div style={{
                      background: '#fef3c7',
                      border: '1px solid #f59e0b',
                      borderRadius: '12px',
                      padding: '20px',
                      margin: '20px 0',
                      textAlign: 'left'
                    }}>
                      <h4 style={{ margin: '0 0 10px', color: '#92400e' }}>📋 Thông tin xử lý:</h4>
                      <ul style={{ margin: '0', paddingLeft: '20px', color: '#92400e' }}>
                        <li>Chúng tôi đang xác thực thông tin thanh toán</li>
                        <li>Thời gian xử lý: 24-48 giờ</li>
                        <li>Bạn sẽ nhận email xác nhận sau khi hoàn tất</li>
                        <li>Vui lòng kiểm tra email thường xuyên</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{
                      background: 'linear-gradient(135deg, var(--success), #22c55e)',
                      borderRadius: '50%',
                      width: '100px',
                      height: '100px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 30px',
                      color: 'white',
                      fontSize: '40px'
                    }}>
                      <i className="fas fa-check"></i>
                    </div>
                    <h3 style={{ 
                      fontSize: '2rem', 
                      fontWeight: '700', 
                      color: 'var(--success)', 
                      margin: '0 0 15px' 
                    }}>
                      🎉 Đăng ký thành công!
                    </h3>
                    <p style={{ 
                      fontSize: '1.1rem', 
                      color: 'var(--text-secondary)', 
                      lineHeight: '1.6',
                      margin: '0 0 30px'
                    }}>
                      Cảm ơn bạn đã đăng ký tham gia <strong>{selected.title}</strong>!<br />
                      Chúng tôi sẽ gửi thông tin chi tiết qua email trong thời gian sớm nhất.
                    </p>
                  </>
                )}
                <button 
                  onClick={() => setSelected(null)}
                  style={{
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                    color: 'white',
                    border: 'none',
                    padding: '15px 40px',
                    borderRadius: '50px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  Đóng
                </button>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}


