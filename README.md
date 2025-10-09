## 3DIoT Web – Hướng dẫn ngắn gọn (PostgreSQL + Prisma)

### Prerequisites
- Node.js 18+
- PostgreSQL instance (local or cloud)

### Quickstart (Step-by-step)
1) Khởi chạy PostgreSQL bằng Docker (khuyến nghị cho dev):
```bash
docker rm -f pg-3diot || true
docker run --name pg-3diot -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=web -p 5432:5432 -d postgres:16
until docker exec -i pg-3diot pg_isready -U postgres -d web; do sleep 1; done
```

2) Tạo file môi trường:
```bash
cd /home/phuongnam/web
printf 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/web?schema=public"\n' > .env
printf 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/web?schema=public"\nNEXT_PUBLIC_GOOGLE_CLIENT_ID="<your_gsi_client_id>"\nPERPLEXITY_API_KEY="<your_perplexity_api_key>"\nPERPLEXITY_MODEL="sonar"\n' > .env.local
```

3) Cài dependencies và generate Prisma Client + migrate DB:
```bash
npm ci
npm run prisma:generate
npx prisma migrate dev --name init | cat
```

4) Chạy môi trường dev và mở http://localhost:3000:
```bash
npm run dev
```

5) Test nhanh API (tùy chọn):
```bash
curl -sS http://localhost:3000/api/events | cat
curl -sS -X POST http://localhost:3000/api/events -H 'Content-Type: application/json' -d '{"title":"Valid","description":"D","date":"2025-12-20","time":"09:00 - 11:00","location":"Hanoi","capacity":100,"price":0,"speakers":"A, B","category":"workshop","status":"upcoming"}' | cat
curl -sS -X POST http://localhost:3000/api/users -H 'Content-Type: application/json' -d '{"name":"FromLogin","email":"fromlogin@test.com"}' | cat
```

### Environment
Tạo cả `.env.local` (Next) và `.env` (Prisma):

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/web?schema=public"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="<your_gsi_client_id>"
# Perplexity API (for news refresh)
PERPLEXITY_API_KEY="<your_perplexity_api_key>"
PERPLEXITY_MODEL="sonar" # optional; defaults to sonar
ADMIN_RESET_CODE="3DIOT2025" # Admin password reset code
```

### Start PostgreSQL (localhost:5432)
Chạy Postgres qua Docker và đợi DB sẵn sàng:

```bash
docker run --name pg-3diot -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=web -p 5432:5432 -d postgres:16
```

### Install dependencies
```bash
npm install
```

### Prisma (PostgreSQL)
Generate client và migrate schema:

```bash
npm run prisma:generate
npx prisma migrate dev --name init | cat
```

Kiểm tra bảng đã tạo:
```bash
docker exec -i pg-3diot psql -U postgres -d web -c "\dt"
```

Notes:
- IDs are preserved as strings to match the current frontend contracts.
- Arrays like `speakers`, `tags`, `notes` are stored as JSON for simplicity.

### Start the app
```bash
npm run dev
```
Mở `http://localhost:3000`.

### Test nhanh API (tùy chọn)
```bash
curl -sS http://localhost:3000/api/events | cat
curl -sS -X POST http://localhost:3000/api/events -H 'Content-Type: application/json' -d '{"title":"Valid","description":"D","date":"2025-12-20","time":"09:00 - 11:00","location":"Hanoi","capacity":100,"price":0,"speakers":"A, B","category":"workshop","status":"upcoming"}' | cat
curl -sS -X POST http://localhost:3000/api/contacts -H 'Content-Type: application/json' -d '{"name":"FromTest","email":"from@test.com","message":"Hi","type":"partnership","status":"new","priority":"medium"}' | cat
curl -sS -X POST http://localhost:3000/api/users -H 'Content-Type: application/json' -d '{"name":"FromLogin","email":"fromlogin@test.com"}' | cat
curl -sS http://localhost:3000/api/stats | cat
# Trigger a Perplexity-powered news refresh (requires PERPLEXITY_API_KEY)
curl -sS -X POST http://localhost:3000/api/news/refresh | cat
```

### Build & chạy Production (cục bộ)
- Áp dụng khi muốn chạy build production trên máy dev (DB vẫn là local hoặc managed DB).

1) Áp dụng migration trên môi trường production:
```bash
npx prisma migrate deploy | cat
```

2) Build và start production:
```bash
npm run build
npm start
```

### Lỗi thường gặp (và cách xử lý)
- P1012 (Prisma thiếu DATABASE_URL): tạo `.env` hoặc truyền biến khi chạy Prisma.
- P1001 (không kết nối DB): kiểm tra Docker DB đang chạy và đúng port 5432; khớp với `DATABASE_URL`.
- P2021 (bảng không tồn tại): chạy lại `npx prisma migrate dev`.
- 500 khi tạo sự kiện: điền đủ `title`, `date` (YYYY-MM-DD), `time` (HH:MM - HH:MM), `location`, `capacity` (số).

### Commands (summary)
```bash
export DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
npm i
npm run prisma:generate
npx prisma migrate dev --name init | cat
npm run prisma:seed
npm run dev
```

### Cleanup sau khi chuyển DB
- Đã gỡ: `lib/data-manager.ts`, `data/app-data.json`, `data/events.ts`, `data/news.ts`.
- UI lấy dữ liệu qua API/DB; types được định nghĩa inline/`lib/hooks/useData.ts`.

### Database backup/restore (tùy chọn)
Scripts trong `package.json` (sử dụng `DATABASE_URL`):

Backup DB sang `backup.dump`:
```bash
npm run db:backup
```

Restore từ `backup.dump` (sẽ clean & recreate objects):
```bash
npm run db:restore
```

### Tóm tắt lệnh chạy nhanh (copy/paste)
```bash
# 1) Env
printf 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/web?schema=public"\nADMIN_RESET_CODE="3DIOT2025"\n' > .env
printf 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/web?schema=public"\nNEXT_PUBLIC_GOOGLE_CLIENT_ID="<your_gsi_client_id>"\nPERPLEXITY_API_KEY="<your_perplexity_api_key>"\nPERPLEXITY_MODEL="sonar"\n' > .env.local

# 2) DB
docker rm -f pg-3diot || true
docker run --name pg-3diot -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=web -p 5432:5432 -d postgres:16
until docker exec -i pg-3diot pg_isready -U postgres -d web; do sleep 1; done

# 3) Migrate
npm i
npm run prisma:generate
npx prisma migrate dev --name init | cat

# 4) Start server
# Tìm process đang dùng port 3000
lsof -ti:3000
# Kill process trên port 3000
kill $(lsof -ti:3000)
# Hoặc force kill
kill -9 $(lsof -ti:3000)
fuser -k 3000/tcp || true
npm run dev
```

Ghi chú:
- Prisma CLI đọc `.env`, còn Next.js đọc `.env.local`. Nên đặt cùng `DATABASE_URL` ở cả hai.
- Không chỉnh `.env/.env.local` khi server đang chạy; nếu chỉnh, tắt server và `npm run dev` lại.

Note: Requires `pg_dump`/`pg_restore` installed (e.g., via PostgreSQL client tools). For Docker-based local DB, commands run from host using the URL.

### Production later (swap only DATABASE_URL)
- Provision a managed PostgreSQL (e.g., Supabase/Neon/RDS).
- Set `DATABASE_URL` in your production env to the new connection string.
- Run migrations once in production environment:

```bash
npx prisma migrate deploy | cat
```

- Seed: if you need to seed production from `data/app-data.json`, run:

```bash
npm run prisma:seed
```

- No frontend code changes needed. Only `DATABASE_URL` differs between local and prod.

### Admin Security
- **Reset Password**: Sử dụng mã reset trong biến môi trường `ADMIN_RESET_CODE`
- **Thay đổi mã reset**: Sửa trong file `.env` và restart server
- **Default code**: `3DIOT2025` (nên thay đổi trong production)

