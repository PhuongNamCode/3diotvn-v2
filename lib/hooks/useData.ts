import { useState, useEffect } from 'react';

// Types aligned with API responses (DB-backed)
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  onlineLink?: string | null;
  capacity: number;
  price: number;
  speakers?: string[];
  requirements?: string;
  agenda?: string;
  image?: string | null;
  category: string;
  status: 'upcoming' | 'past' | 'cancelled' | string;
  registrations: number;
  actualParticipants?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  source: string;
  category: string;
  importance: 'high' | 'medium' | 'low' | string;
  published: boolean;
  publishedAt?: string | null;
  image?: string | null;
  tags?: string[];
  link?: string | null;
  createdAt?: string;
  updatedAt?: string;
}


export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  message: string;
  type: string;
  status: string;
  priority: string;
  notes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  status?: 'active' | 'inactive' | string;
  joinDate: string;
  lastActive: string;
}

export interface Registration {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  experience?: string | null;
  expectation?: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | string;
  paymentStatus?: 'pending' | 'pending_verification' | 'paid' | 'failed' | string;
  paymentMethod?: string | null;
  transactionId?: string | null;
  amount?: number | null;
  registeredAt?: string;
  updatedAt?: string;
  event?: {
    id: string;
    title: string;
    date: string;
    price: number;
  };
}

// Courses
export interface Course {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  level: string;
  price: number;
  status: string;
  category: string;
  tags?: string[];
  lessonsCount: number;
  durationMinutes: number;
  enrolledCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | string;
  paymentStatus?: 'pending' | 'pending_verification' | 'paid' | 'failed' | string;
  paymentMethod?: string | null;
  transactionId?: string | null;
  amount?: number | null;
  createdAt?: string;
  updatedAt?: string;
  course?: {
    id: string;
    title: string;
    price: number;
  };
}

// Custom hook for events
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      const result = await response.json();
      
      if (result.success) {
        setEvents(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      const result = await response.json();
      
      if (result.success) {
        setEvents(prev => [...prev, result.data]);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      throw err;
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const result = await response.json();
      
      if (result.success) {
        setEvents(prev => prev.map(event => 
          event.id === id ? result.data : event
        ));
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setEvents(prev => prev.filter(event => event.id !== id));
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      throw err;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents
  };
}

// Custom hook for news
export function useNews() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news');
      const result = await response.json();
      
      if (result.success) {
        setNews(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const createNews = async (newsData: Omit<News, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsData)
      });
      const result = await response.json();
      
      if (result.success) {
        setNews(prev => [...prev, result.data]);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create news');
      throw err;
    }
  };

  const updateNews = async (id: string, updates: Partial<News>) => {
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const result = await response.json();
      
      if (result.success) {
        setNews(prev => prev.map(item => 
          item.id === id ? result.data : item
        ));
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update news');
      throw err;
    }
  };

  const deleteNews = async (id: string) => {
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setNews(prev => prev.filter(item => item.id !== id));
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete news');
      throw err;
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return {
    news,
    loading,
    error,
    createNews,
    updateNews,
    deleteNews,
    refetch: fetchNews
  };
}

// Custom hook for contacts
export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contacts');
      const result = await response.json();
      
      if (result.success) {
        setContacts(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });
      const result = await response.json();
      
      if (result.success) {
        setContacts(prev => [...prev, result.data]);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contact');
      throw err;
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const result = await response.json();
      
      if (result.success) {
        setContacts(prev => prev.map(contact => 
          contact.id === id ? result.data : contact
        ));
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact');
      throw err;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setContacts(prev => prev.filter(contact => contact.id !== id));
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
      throw err;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts
  };
}

// Custom hook for users
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Omit<User, 'id'>) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const result = await response.json();
      
      if (result.success) {
        setUsers(prev => [...prev, result.data]);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const result = await response.json();
      
      if (result.success) {
        setUsers(prev => prev.map(user => 
          user.id === id ? result.data : user
        ));
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setUsers(prev => prev.filter(user => user.id !== id));
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers
  };
}

// Custom hook for stats
export function useStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

// Custom hook for registrations
export function useRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/registrations');
      const result = await response.json();
      
      if (result.success) {
        setRegistrations(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  const createRegistration = async (registrationData: Omit<Registration, 'id' | 'registeredAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });
      const result = await response.json();
      
      if (result.success) {
        setRegistrations(prev => [...prev, result.data]);
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create registration');
      throw err;
    }
  };

  const updateRegistration = async (id: string, updates: Partial<Registration>) => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const result = await response.json();
      
      if (result.success) {
        setRegistrations(prev => prev.map(registration => 
          registration.id === id ? result.data : registration
        ));
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update registration');
      throw err;
    }
  };

  const deleteRegistration = async (id: string) => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setRegistrations(prev => prev.filter(registration => registration.id !== id));
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete registration');
      throw err;
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  return {
    registrations,
    loading,
    error,
    createRegistration,
    updateRegistration,
    deleteRegistration,
    refetch: fetchRegistrations
  };
}

// Custom hook for courses
export function useCourses(params?: { page?: number; limit?: number; category?: string; level?: string; search?: string }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; pages: number } | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const sp = new URLSearchParams();
      if (params?.page) sp.set('page', String(params.page));
      if (params?.limit) sp.set('limit', String(params.limit));
      if (params?.category) sp.set('category', params.category);
      if (params?.level) sp.set('level', params.level);
      if (params?.search) sp.set('search', params.search);
      const response = await fetch(`/api/courses?${sp.toString()}`);
      const result = await response.json();
      if (result.success) {
        setCourses(result.data);
        setPagination(result.pagination || null);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'enrolledCount'>) => {
    try {
      const response = await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (result.success) {
        setCourses((prev) => [result.data, ...prev]);
        return result.data as Course;
      }
      throw new Error(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
      throw err;
    }
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    try {
      const response = await fetch(`/api/courses/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
      const result = await response.json();
      if (result.success) {
        setCourses((prev) => prev.map((c) => (c.id === id ? result.data : c)));
        return result.data as Course;
      }
      throw new Error(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
      throw err;
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const response = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        return true;
      }
      throw new Error(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
      throw err;
    }
  };

  useEffect(() => { fetchCourses(); }, [params?.page, params?.limit, params?.category, params?.level, params?.search]);

  return { courses, loading, error, pagination, refetch: fetchCourses, createCourse, updateCourse, deleteCourse };
}

// Custom hook for course enrollments
export function useCourseEnrollments() {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = async (courseId?: string) => {
    try {
      setLoading(true);
      const qs = courseId ? `?courseId=${encodeURIComponent(courseId)}` : '';
      const response = await fetch(`/api/course-enrollments${qs}`);
      const result = await response.json();
      if (result.success) {
        setEnrollments(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch course enrollments');
    } finally {
      setLoading(false);
    }
  };

  const createEnrollment = async (data: Omit<CourseEnrollment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/course-enrollments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (result.success) {
        setEnrollments((prev) => [result.data, ...prev]);
        return result.data as CourseEnrollment;
      }
      throw new Error(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course enrollment');
      throw err;
    }
  };

  const updateEnrollment = async (id: string, updates: Partial<CourseEnrollment>) => {
    try {
      const response = await fetch(`/api/course-enrollments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const result = await response.json();
      if (result.success) {
        setEnrollments(prev => prev.map(e => e.id === id ? result.data : e));
        return result.data as CourseEnrollment;
      }
      throw new Error(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update enrollment');
      throw err;
    }
  };

  const deleteEnrollment = async (id: string) => {
    try {
      const response = await fetch(`/api/course-enrollments/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        setEnrollments(prev => prev.filter(e => e.id !== id));
        return true;
      }
      throw new Error(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete enrollment');
      throw err;
    }
  };

  useEffect(() => { fetchEnrollments(); }, []);

  return { enrollments, loading, error, refetch: fetchEnrollments, createEnrollment, updateEnrollment, deleteEnrollment };
}

// News Management Hooks
export function useNewsManagement(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}) {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; pages: number } | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.category) searchParams.set('category', params.category);
        if (params?.search) searchParams.set('search', params.search);

        const response = await fetch(`/api/news?${searchParams.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          setNews(data.data);
          setPagination(data.pagination);
        } else {
          setError(data.error || 'Failed to fetch news');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [params?.page, params?.limit, params?.category, params?.search]);

  const deleteNews = async (id: string) => {
    try {
      const response = await fetch(`/api/news?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (data.success) {
        setNews(prev => prev.filter(item => item.id !== id));
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const deleteAllNews = async () => {
    try {
      const response = await fetch('/api/news?deleteAll=true', { method: 'DELETE' });
      const data = await response.json();
      
      if (data.success) {
        setNews([]);
        return { success: true, message: data.message, deletedCount: data.deletedCount };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return { news, loading, error, pagination, deleteNews, deleteAllNews };
}

