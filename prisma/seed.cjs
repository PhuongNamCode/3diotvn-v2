/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function readJson(filePath) {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, 'utf8');
  return JSON.parse(raw);
}

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  const data = readJson(path.join(process.cwd(), 'data', 'app-data.json'));

  const events = Array.isArray(data.events) ? data.events : [];
  const news = Array.isArray(data.news) ? data.news : [];
  const contacts = Array.isArray(data.contacts) ? data.contacts : [];
  const users = Array.isArray(data.users) ? data.users : [];
  const registrations = Array.isArray(data.registrations) ? data.registrations : [];

  console.log('Seeding start:', {
    events: events.length,
    news: news.length,
    contacts: contacts.length,
    users: users.length,
    registrations: registrations.length,
  });

  // Upsert Events
  for (const e of events) {
    await prisma.event.upsert({
      where: { id: String(e.id || '') },
      create: {
        id: String(e.id || ''),
        title: e.title || '',
        description: e.description || '',
        date: toDate(e.date) || new Date(),
        time: e.time || '',
        location: e.location || '',
        capacity: typeof e.capacity === 'number' ? e.capacity : 0,
        price: typeof e.price === 'number' ? e.price : 0,
        speakers: Array.isArray(e.speakers) ? e.speakers : [],
        requirements: e.requirements || null,
        agenda: e.agenda || null,
        image: e.image || null,
        category: e.category || 'workshop',
        status: e.status || 'upcoming',
        actualParticipants: typeof e.actualParticipants === 'number' ? e.actualParticipants : null,
        createdAt: toDate(e.createdAt) || undefined,
        updatedAt: toDate(e.updatedAt) || undefined,
      },
      update: {
        title: e.title || '',
        description: e.description || '',
        date: toDate(e.date) || new Date(),
        time: e.time || '',
        location: e.location || '',
        capacity: typeof e.capacity === 'number' ? e.capacity : 0,
        price: typeof e.price === 'number' ? e.price : 0,
        speakers: Array.isArray(e.speakers) ? e.speakers : [],
        requirements: e.requirements || null,
        agenda: e.agenda || null,
        image: e.image || null,
        category: e.category || 'workshop',
        status: e.status || 'upcoming',
        actualParticipants: typeof e.actualParticipants === 'number' ? e.actualParticipants : null,
      },
    });
  }

  // Upsert News
  for (const n of news) {
    await prisma.news.upsert({
      where: { id: String(n.id || '') },
      create: {
        id: String(n.id || ''),
        title: n.title || '',
        content: n.content || '',
        excerpt: n.excerpt || '',
        author: n.author || '',
        source: n.source || '',
        category: n.category || '',
        importance: n.importance || 'low',
        published: Boolean(n.published),
        publishedAt: toDate(n.publishedAt),
        image: n.image || null,
        tags: Array.isArray(n.tags) ? n.tags : [],
        link: n.link || null,
        createdAt: toDate(n.createdAt) || undefined,
        updatedAt: toDate(n.updatedAt) || undefined,
      },
      update: {
        title: n.title || '',
        content: n.content || '',
        excerpt: n.excerpt || '',
        author: n.author || '',
        source: n.source || '',
        category: n.category || '',
        importance: n.importance || 'low',
        published: Boolean(n.published),
        publishedAt: toDate(n.publishedAt),
        image: n.image || null,
        tags: Array.isArray(n.tags) ? n.tags : [],
        link: n.link || null,
      },
    });
  }

  // Upsert Contacts
  for (const c of contacts) {
    await prisma.contact.upsert({
      where: { id: String(c.id || '') },
      create: {
        id: String(c.id || ''),
        name: c.name || '',
        email: c.email || '',
        phone: c.phone || '',
        company: c.company || '',
        role: c.role || 'Contact',
        message: c.message || '',
        type: c.type || 'general',
        status: c.status || 'new',
        priority: c.priority || 'medium',
        notes: Array.isArray(c.notes) ? c.notes : [],
        createdAt: toDate(c.createdAt) || undefined,
        updatedAt: toDate(c.updatedAt) || undefined,
      },
      update: {
        name: c.name || '',
        email: c.email || '',
        phone: c.phone || '',
        company: c.company || '',
        role: c.role || 'Contact',
        message: c.message || '',
        type: c.type || 'general',
        status: c.status || 'new',
        priority: c.priority || 'medium',
        notes: Array.isArray(c.notes) ? c.notes : [],
      },
    });
  }

  // Upsert Users
  for (const u of users) {
    await prisma.user.upsert({
      where: { id: String(u.id || '') },
      create: {
        id: String(u.id || ''),
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        company: u.company || '',
        role: u.role || '',
        status: u.status || 'active',
        joinDate: toDate(u.joinDate) || new Date(),
        lastActive: u.lastActive || '',
      },
      update: {
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        company: u.company || '',
        role: u.role || '',
        status: u.status || 'active',
        joinDate: toDate(u.joinDate) || new Date(),
        lastActive: u.lastActive || '',
      },
    });
  }

  // Upsert Registrations
  for (const r of registrations) {
    const eventId = String(r.eventId || '');
    // Ensure event exists (already upserted above)
    const exists = await prisma.event.findUnique({ where: { id: eventId } });
    if (!exists) {
      console.warn(`Skipping registration ${r.id} due to missing event ${eventId}`);
      continue;
    }
    await prisma.registration.upsert({
      where: { id: String(r.id || '') },
      create: {
        id: String(r.id || ''),
        eventId,
        fullName: r.fullName || '',
        email: r.email || '',
        phone: r.phone || null,
        organization: r.organization || null,
        experience: r.experience || null,
        expectation: r.expectation || null,
        status: r.status || 'pending',
        createdAt: toDate(r.registeredAt) || undefined,
        updatedAt: toDate(r.updatedAt) || undefined,
      },
      update: {
        eventId,
        fullName: r.fullName || '',
        email: r.email || '',
        phone: r.phone || null,
        organization: r.organization || null,
        experience: r.experience || null,
        expectation: r.expectation || null,
        status: r.status || 'pending',
      },
    });
  }

  // Recalculate registrationsCount per event
  const allEvents = await prisma.event.findMany({ select: { id: true } });
  for (const e of allEvents) {
    const count = await prisma.registration.count({ where: { eventId: e.id, NOT: { status: 'cancelled' } } });
    await prisma.event.update({ where: { id: e.id }, data: { registrationsCount: count } });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

