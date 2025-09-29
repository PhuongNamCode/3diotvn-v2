# Hướng dẫn Setup News Scheduler

## Tổng quan
Hệ thống tin tức hiện đã hỗ trợ cập nhật tự động theo tần suất đã cấu hình. Có 4 tần suất:
- **Thủ công**: Không tự động cập nhật
- **Hàng ngày**: Cập nhật lúc 8:00 sáng mỗi ngày
- **Hàng tuần**: Cập nhật lúc 8:00 sáng thứ 2 hàng tuần
- **Hàng tháng**: Cập nhật lúc 8:00 sáng ngày 1 hàng tháng

## Setup Cron Job

### 1. Cài đặt script scheduler
```bash
# Đảm bảo script có quyền thực thi
chmod +x /home/phuongnam/web/scripts/news-scheduler.js
```

### 2. Cấu hình cron job
```bash
# Mở crontab editor
crontab -e

# Thêm một trong các dòng sau tùy theo tần suất mong muốn:

# Hàng ngày lúc 8:00 sáng
0 8 * * * cd /home/phuongnam/web && node scripts/news-scheduler.js >> /var/log/news-scheduler.log 2>&1

# Hàng tuần (thứ 2) lúc 8:00 sáng
0 8 * * 1 cd /home/phuongnam/web && node scripts/news-scheduler.js >> /var/log/news-scheduler.log 2>&1

# Hàng tháng (ngày 1) lúc 8:00 sáng
0 8 1 * * cd /home/phuongnam/web && node scripts/news-scheduler.js >> /var/log/news-scheduler.log 2>&1
```

### 3. Kiểm tra cron job
```bash
# Xem danh sách cron jobs
crontab -l

# Kiểm tra log
tail -f /var/log/news-scheduler.log
```

## API Endpoints

### 1. Kiểm tra trạng thái scheduler
```bash
curl -X GET "http://localhost:3001/api/news/scheduler"
```

### 2. Chạy cập nhật thủ công
```bash
curl -X POST "http://localhost:3001/api/news/scheduler"
```

### 3. Cập nhật tin tức trực tiếp
```bash
curl -X POST "http://localhost:3001/api/news/refresh"
```

### 4. Kiểm tra tin tức cũ (cleanup)
```bash
curl -X GET "http://localhost:3001/api/news/cleanup"
```

### 5. Dọn dẹp tin tức cũ thủ công
```bash
curl -X POST "http://localhost:3001/api/news/cleanup"
```

## Cấu hình trong Admin Panel

1. Vào **Admin Panel** → **Cài đặt**
2. Cuộn xuống phần **"Tin tức IoT/Tech mới nhất"**
3. Chọn **"Tần suất cập nhật"** từ dropdown
4. Hệ thống sẽ tự động lưu cấu hình

## Monitoring

### 1. Kiểm tra trạng thái trong Admin Panel
- **Tần suất hiện tại**: Hiển thị tần suất đã cấu hình
- **Lần cập nhật gần nhất**: Thời gian cập nhật cuối cùng
- **Lịch cập nhật tự động**: Trạng thái và thời gian cập nhật tiếp theo
- **Dọn dẹp tin tức cũ**: Thống kê và nút dọn dẹp thủ công

### 2. Kiểm tra log
```bash
# Xem log gần nhất
tail -20 /var/log/news-scheduler.log

# Theo dõi log real-time
tail -f /var/log/news-scheduler.log
```

## Troubleshooting

### 1. Scheduler không chạy
- Kiểm tra cron job: `crontab -l`
- Kiểm tra log: `tail /var/log/news-scheduler.log`
- Kiểm tra quyền file: `ls -la scripts/news-scheduler.js`

### 2. API không hoạt động
- Kiểm tra server: `curl http://localhost:3001/api/news/scheduler`
- Kiểm tra database connection
- Kiểm tra Perplexity API key

### 3. Tin tức không được cập nhật
- Kiểm tra tần suất cấu hình
- Kiểm tra thời gian cập nhật cuối cùng
- Chạy cập nhật thủ công để test

## Lưu ý quan trọng

1. **Perplexity API Key**: Phải được cấu hình đúng trong Admin Panel
2. **Database**: Đảm bảo database hoạt động bình thường
3. **Server**: Server phải chạy 24/7 để cron job hoạt động
4. **Log**: Theo dõi log để phát hiện lỗi sớm
5. **Backup**: Thường xuyên backup database

## Test Scheduler

```bash
# Test scheduler ngay lập tức
cd /home/phuongnam/web
node scripts/news-scheduler.js

# Kiểm tra kết quả
curl -X GET "http://localhost:3001/api/news" | jq '.data | length'
```
