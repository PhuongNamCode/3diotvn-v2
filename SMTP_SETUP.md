# 📧 Hướng Dẫn Cấu Hình SMTP

## 🎯 Cách Hoạt Động

Hệ thống email sử dụng **2 cấp độ cấu hình**:

1. **📁 File .env** - Cấu hình mặc định (ưu tiên thấp)
2. **⚙️ Admin Panel** - Override tạm thời (ưu tiên cao)

## 🔧 Cấu Hình Mặc Định (.env)

### Bước 1: Tạo file .env
```bash
cp env.example .env
```

### Bước 2: Cấu hình SMTP trong .env
```bash
# SMTP Email Configuration (Default)
SMTP_HOST="smtp.gmail.com"
SMTP_USERNAME="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_PORT="587"
SMTP_SECURE="false"
```

### Bước 3: Tạo Gmail App Password
1. Vào [Google Account](https://myaccount.google.com/)
2. **Security** → **2-Step Verification** (bật)
3. **Security** → **App passwords**
4. **Mail** → **Other** → "3DIoT Web App"
5. Copy 16 ký tự App Password
6. Paste vào `SMTP_PASSWORD` trong .env

## ⚙️ Override Tạm Thời (Admin Panel)

### Khi nào dùng:
- Test với SMTP khác
- Thay đổi nhanh không muốn restart server
- Debug email issues

### Cách dùng:
1. Vào `http://localhost:3000/admin`
2. Tab **Settings** → **SMTP Settings (Override .env)**
3. Điền thông tin override (để trống = dùng .env)
4. Click **Lưu Override**

## 🔄 Thứ Tự Ưu Tiên

```
Admin Panel Override > .env Variables > Error
```

- Nếu Admin Panel có giá trị → Dùng Admin Panel
- Nếu Admin Panel trống → Dùng .env
- Nếu cả hai trống → Báo lỗi

## 🧪 Test Cấu Hình

### Test 1: Kiểm tra .env
```bash
# Xem logs khi start server
npm run dev

# Sẽ thấy:
# 📧 Using SMTP: smtp.gmail.com (Environment)
```

### Test 2: Test đăng ký sự kiện
1. Vào `http://localhost:3000`
2. Tab **Events** → Đăng ký sự kiện
3. Kiểm tra email confirmation

### Test 3: Test override
1. Vào Admin Panel
2. Điền SMTP khác
3. Test đăng ký → Sẽ dùng SMTP mới

## 🛠️ Troubleshooting

### Email không gửi được?
1. **Check .env**: Đảm bảo có đủ `SMTP_HOST`, `SMTP_USERNAME`, `SMTP_PASSWORD`
2. **Check App Password**: Gmail yêu cầu App Password, không phải password thường
3. **Check logs**: Xem console để biết đang dùng config nào

### Reset về .env?
1. Vào Admin Panel
2. Click **Reset về .env**
3. Hoặc xóa hết giá trị trong Admin Panel

## 📋 Các SMTP Provider

### Gmail
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
```

### Outlook/Hotmail
```bash
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
```

### Yahoo
```bash
SMTP_HOST="smtp.mail.yahoo.com"
SMTP_PORT="587"
SMTP_SECURE="false"
```

## 🎉 Kết Quả

Sau khi cấu hình đúng:
- ✅ Email tự động gửi khi đăng ký sự kiện/khóa học
- ✅ Template email đẹp, professional
- ✅ Có thể override tạm thời qua Admin Panel
- ✅ Logs rõ ràng để debug
