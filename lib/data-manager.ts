// Centralized Data Management System
// This file manages all data synchronization between admin dashboard and frontend

import fs from 'fs';
import path from 'path';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  price: number;
  speakers: string[];
  requirements: string;
  agenda: string;
  image?: string;
  category: 'workshop' | 'seminar' | 'hackathon' | 'conference';
  status: 'upcoming' | 'past' | 'cancelled';
  registrations: number;
  actualParticipants?: number; // Số lượng đã tham gia thực tế (chỉ cho sự kiện đã diễn ra)
  createdAt: string;
  updatedAt: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  source: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  published: boolean;
  publishedAt?: string;
  image?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  message: string;
  type: 'partnership' | 'collaboration' | 'sponsorship' | 'general';
  status: 'new' | 'contacted' | 'in_negotiation' | 'partnered' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
  lastActive: string;
}

export interface Registration {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  experience: string;
  expectation: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  registeredAt: string;
  updatedAt: string;
}

// In-memory data store (in production, this would be a database)
class DataManager {
  private events: Event[] = [];
  private news: News[] = [];
  private contacts: Contact[] = [];
  private users: User[] = [];
  private registrations: Registration[] = [];
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    console.log('DataManager constructor called');
    this.loadData();
    // Only initialize if no data was loaded from file
    if (this.events.length === 0 && this.contacts.length === 0) {
      this.initializeData();
    }
  }

  private getDataFilePath() {
    return path.join(process.cwd(), 'data', 'app-data.json');
  }

  private loadData() {
    try {
      const dataPath = this.getDataFilePath();
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        this.events = data.events || [];
        this.news = data.news || [];
        this.contacts = data.contacts || [];
        this.users = data.users || [];
        this.registrations = data.registrations || [];
        console.log('Loaded data from file:', {
          events: this.events.length,
          registrations: this.registrations.length,
          event1Registrations: this.events.find(e => e.id === '1')?.registrations,
          event1FromFile: data.events?.find((e: any) => e.id === '1')?.registrations,
          allEvents: this.events.map(e => ({ id: e.id, registrations: e.registrations }))
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private saveData() {
    try {
      const dataPath = this.getDataFilePath();
      const dataDir = path.dirname(dataPath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const data = {
        events: this.events,
        news: this.news,
        contacts: this.contacts,
        users: this.users,
        registrations: this.registrations
      };

      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      console.log('Data saved to file:', {
        events: this.events.length,
        contacts: this.contacts.length,
        registrations: this.registrations.length
      });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  private initializeData() {
    // Initialize with sample data
    this.events = [
      {
        id: '1',
        title: 'IoT Security Workshop',
        description: 'Workshop về bảo mật trong hệ thống IoT, từ cơ bản đến nâng cao.',
        date: '2025-10-15',
        time: '09:00 - 17:00',
        location: 'HCMC Tech Hub',
        capacity: 60,
        price: 500000,
        speakers: ['Nguyễn Văn A', 'Trần Thị B'],
        requirements: 'Kiến thức cơ bản về IoT, laptop cá nhân',
        agenda: '09:00 - Check-in\n09:30 - Opening\n10:00 - Session 1',
        category: 'workshop',
        status: 'upcoming',
        registrations: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'ESP32 Advanced Programming',
        description: 'Lập trình ESP32 từ cơ bản đến nâng cao với các dự án thực tế.',
        date: '2025-09-28',
        time: '14:00 - 18:00',
        location: 'Online via Zoom',
        capacity: 100,
        price: 0,
        speakers: ['Lê Văn C'],
        requirements: 'Arduino IDE, ESP32 board',
        agenda: '14:00 - Introduction\n14:30 - Hands-on coding',
        category: 'workshop',
        status: 'past',
        registrations: 120,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.news = [
      {
        id: '1',
        title: 'Breakthrough in Edge AI Processing',
        content: 'Latest developments in edge AI processing...',
        excerpt: 'New advances in edge AI processing capabilities...',
        author: 'IEEE Spectrum',
        source: 'IEEE Spectrum',
        category: 'AI/ML',
        importance: 'high',
        published: true,
        publishedAt: new Date().toISOString(),
        tags: ['AI', 'Edge Computing', 'IoT'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.contacts = [
      {
        id: '1',
        name: 'Nguyễn Manager',
        email: 'manager@techcorp.com',
        phone: '0123456789',
        company: 'Tech Corp Ltd',
        role: 'Business Development Manager',
        message: 'Chúng tôi muốn tài trợ cho các sự kiện IoT và embedded systems.',
        type: 'sponsorship',
        status: 'in_negotiation',
        priority: 'high',
        notes: ['Đã gọi điện, họ rất quan tâm', 'Hẹn meeting vào thứ 5'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    this.users = [
      {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phone: '0123456789',
        company: 'FPT Software',
        role: 'Developer',
        status: 'active',
        joinDate: '2025-09-20',
        lastActive: '2 giờ trước'
      }
    ];
  }

  // Event Management
  getEvents(): Event[] {
    return [...this.events];
  }

  getEvent(id: string): Event | undefined {
    return this.events.find(event => event.id === id);
  }

  createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'registrations'>): Event {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
      registrations: 0,
      actualParticipants: event.status === 'past' ? event.actualParticipants || 0 : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.events.push(newEvent);
    this.saveData();
    this.notifyListeners('events', this.events);
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<Event>): Event | null {
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) return null;
    
    this.events[index] = {
      ...this.events[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    this.notifyListeners('events', this.events);
    return this.events[index];
  }

  deleteEvent(id: string): boolean {
    const index = this.events.findIndex(event => event.id === id);
    if (index === -1) return false;
    
    this.events.splice(index, 1);
    this.saveData();
    this.notifyListeners('events', this.events);
    return true;
  }

  // News Management
  getNews(): News[] {
    return [...this.news];
  }

  getPublishedNews(): News[] {
    return this.news.filter(news => news.published);
  }

  getNewsById(id: string): News | undefined {
    return this.news.find(news => news.id === id);
  }

  createNews(news: Omit<News, 'id' | 'createdAt' | 'updatedAt'>): News {
    const newNews: News = {
      ...news,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.news.push(newNews);
    this.notifyListeners('news', this.news);
    return newNews;
  }

  updateNews(id: string, updates: Partial<News>): News | null {
    const index = this.news.findIndex(news => news.id === id);
    if (index === -1) return null;
    
    this.news[index] = {
      ...this.news[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.notifyListeners('news', this.news);
    return this.news[index];
  }

  deleteNews(id: string): boolean {
    const index = this.news.findIndex(news => news.id === id);
    if (index === -1) return false;
    
    this.news.splice(index, 1);
    this.notifyListeners('news', this.news);
    return true;
  }

  // Contact Management
  getContacts(): Contact[] {
    return [...this.contacts];
  }

  getContact(id: string): Contact | undefined {
    return this.contacts.find(contact => contact.id === id);
  }

  createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact {
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.contacts.push(newContact);
    this.saveData();
    this.notifyListeners('contacts', this.contacts);
    return newContact;
  }

  updateContact(id: string, updates: Partial<Contact>): Contact | null {
    const index = this.contacts.findIndex(contact => contact.id === id);
    if (index === -1) return null;
    
    this.contacts[index] = {
      ...this.contacts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();
    this.notifyListeners('contacts', this.contacts);
    return this.contacts[index];
  }

  deleteContact(id: string): boolean {
    const index = this.contacts.findIndex(contact => contact.id === id);
    if (index === -1) return false;
    
    this.contacts.splice(index, 1);
    this.saveData();
    this.notifyListeners('contacts', this.contacts);
    return true;
  }

  // User Management
  getUsers(): User[] {
    return [...this.users];
  }

  getUser(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  createUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: Date.now().toString()
    };
    this.users.push(newUser);
    this.notifyListeners('users', this.users);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    this.users[index] = { ...this.users[index], ...updates };
    this.notifyListeners('users', this.users);
    return this.users[index];
  }

  deleteUser(id: string): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    this.notifyListeners('users', this.users);
    return true;
  }

  // Event Listeners for real-time updates
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  unsubscribe(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
    
    // Also notify WebSocket listeners for real-time updates
    if (typeof window !== 'undefined' && (window as any).websocketManager) {
      (window as any).websocketManager.send('data-update', {
        type: event,
        data: data,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Registration Management
  getRegistrations(): Registration[] {
    return [...this.registrations];
  }

  getRegistration(id: string): Registration | undefined {
    return this.registrations.find(registration => registration.id === id);
  }

  getRegistrationsByEvent(eventId: string): Registration[] {
    return this.registrations.filter(registration => registration.eventId === eventId);
  }

  createRegistration(registration: Omit<Registration, 'id' | 'registeredAt' | 'updatedAt'>): Registration {
    const newRegistration: Registration = {
      ...registration,
      id: Date.now().toString(),
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.registrations.push(newRegistration);
    
    console.log(`Created registration for event ${registration.eventId}`);
    console.log(`Total registrations now: ${this.registrations.length}`);
    
    // Update event registration count
    this.updateEventRegistrationCount(registration.eventId);
    
    this.saveData();
    this.notifyListeners('registrations', this.registrations);
    return newRegistration;
  }

  updateRegistration(id: string, updates: Partial<Registration>): Registration | null {
    const index = this.registrations.findIndex(registration => registration.id === id);
    if (index === -1) return null;
    
    this.registrations[index] = {
      ...this.registrations[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.notifyListeners('registrations', this.registrations);
    return this.registrations[index];
  }

  deleteRegistration(id: string): boolean {
    const index = this.registrations.findIndex(registration => registration.id === id);
    if (index === -1) return false;
    
    const registration = this.registrations[index];
    this.registrations.splice(index, 1);
    
    // Update event registration count
    this.updateEventRegistrationCount(registration.eventId);
    
    this.notifyListeners('registrations', this.registrations);
    return true;
  }

  private updateEventRegistrationCount(eventId: string) {
    const eventIndex = this.events.findIndex(event => event.id === eventId);
    if (eventIndex !== -1) {
      const eventRegistrations = this.registrations.filter(r => r.eventId === eventId && r.status !== 'cancelled');
      this.events[eventIndex].registrations = eventRegistrations.length;
      console.log(`Updated event ${eventId} registrations to ${eventRegistrations.length}`);
      console.log(`Total registrations: ${this.registrations.length}, Event registrations: ${eventRegistrations.length}`);
      this.notifyListeners('events', this.events);
    }
  }

  // Force update all event registration counts
  updateAllEventRegistrationCounts() {
    console.log('Updating all event registration counts...');
    console.log('Events:', this.events.map(e => ({ id: e.id, title: e.title })));
    console.log('Registrations:', this.registrations.map(r => ({ eventId: r.eventId, status: r.status })));
    
    this.events.forEach(event => {
      const eventRegistrations = this.registrations.filter(r => r.eventId === event.id && r.status !== 'cancelled');
      event.registrations = eventRegistrations.length;
      console.log(`Event ${event.id} (${event.title}): ${eventRegistrations.length} registrations`);
    });
    this.notifyListeners('events', this.events);
  }

  // Force refresh all data
  forceRefresh() {
    console.log('Force refreshing all data...');
    // Reload data from file first
    this.loadData();
    this.updateAllEventRegistrationCounts();
  }

  // Statistics
  getStats() {
    return {
      totalEvents: this.events.length,
      upcomingEvents: this.events.filter(e => e.status === 'upcoming').length,
      totalRegistrations: this.registrations.filter(r => r.status !== 'cancelled').length,
      totalNews: this.news.length,
      publishedNews: this.news.filter(n => n.published).length,
      totalContacts: this.contacts.length,
      newContacts: this.contacts.filter(c => c.status === 'new').length,
      totalUsers: this.users.length,
      activeUsers: this.users.filter(u => u.status === 'active').length
    };
  }
}

// Global singleton instance
let dataManagerInstance: DataManager | null = null;

export function getDataManager(): DataManager {
  if (!dataManagerInstance) {
    console.log('Creating new DataManager instance via getDataManager');
    dataManagerInstance = new DataManager();
  }
  return dataManagerInstance;
}

// Legacy export for backward compatibility
export const dataManager = getDataManager();

// Export types for use in components
export type { Event as EventType, News as NewsType, Contact as ContactType, User as UserType, Registration as RegistrationType };
