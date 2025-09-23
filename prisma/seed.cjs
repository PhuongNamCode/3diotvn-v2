/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = [
    { title: 'IoT Security Workshop', date: new Date('2025-10-15'), time: '09:00 - 17:00', location: 'HCMC Tech Hub', description: 'Bảo mật IoT', registered: 45, capacity: 60, image: 'fas fa-shield-alt', status: 'upcoming' },
    { title: 'ESP32 Advanced Programming', date: new Date('2025-09-28'), time: '14:00 - 18:00', location: 'Online via Zoom', description: 'ESP32 nâng cao', registered: 120, capacity: 100, image: 'fas fa-microchip', status: 'past' },
  ];
  for (const e of events) await prisma.event.create({ data: e });

  const news = [
    { date: new Date('2025-09-17'), title: 'RISC-V momentum', source: 'Electronics Weekly', category: 'embedded', summary: 'RISC-V trong IoT', link: 'https://electronicsweekly.com/risc-v-iot-momentum-2025' },
  ];
  for (const n of news) await prisma.news.create({ data: n });
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });


