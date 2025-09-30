# 📧 Hướng dẫn Setup Email Tự Động

## ✅ Đã triển khai thành công!

Tính năng gửi email tự động khi đăng ký sự kiện đã được tích hợp hoàn toàn vào hệ thống.

## 🔧 Cách Setup

### 1. Cấu hình SMTP trong Admin Panel

1. Vào `/admin` → Tab **Settings**
2. Scroll xuống phần **SMTP Settings**
3. Điền thông tin:
   - **SMTP Host**: `smtp.gmail.com` (hoặc SMTP server khác)
   - **SMTP Username**: `your-email@gmail.com`
   - **SMTP Password**: `your-app-password`
4. Click **Lưu SMTP settings**

### 2. Gmail App Password Setup (Khuyến nghị)

1. Bật 2-Factor Authentication cho Gmail
2. Vào [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Tạo App Password cho "Mail"
4. Sử dụng password này trong SMTP Settings

### 3. Các SMTP Provider khác

#### **Outlook/Hotmail:**
- Host: `smtp-mail.outlook.com`
- Port: 587
- Username: `your-email@outlook.com`

#### **Yahoo:**
- Host: `smtp.mail.yahoo.com`
- Port: 587
- Username: `your-email@yahoo.com`

## 🎯 Cách hoạt động

1. **User đăng ký sự kiện** → Form submit
2. **Registration được tạo** → Database updated
3. **Email tự động gửi** → Beautiful HTML template
4. **User nhận confirmation** → Professional email

## 📧 Email Template Features

✅ **Responsive Design** - Đẹp trên mọi thiết bị  
✅ **Professional Layout** - Header gradient, event card  
✅ **Event Details** - Ngày, giờ, địa điểm, giá vé  
✅ **Next Steps** - Hướng dẫn cho người tham gia  
✅ **Branding** - 3D IoT Community branding  
✅ **Fallback Text** - Text version cho email clients cũ  

## 🔍 Test Email Feature

### Test 1: Đăng ký sự kiện mới
1. Vào tab **Events**
2. Click **Đăng ký tham gia** cho 1 sự kiện
3. Điền form với email thật
4. Submit → Kiểm tra email

### Test 2: Check console logs
```bash
# Xem logs khi test
npm run dev

# Trong console sẽ thấy:
# "Confirmation email sent successfully to user@email.com"
# hoặc
# "Failed to send confirmation email to user@email.com"
```

## 🛠️ Troubleshooting

### Email không gửi được?

1. **Check SMTP config** - Đảm bảo host, username, password đúng
2. **Check firewall** - Port 587 có bị block không
3. **Check app password** - Gmail yêu cầu app password, không phải password thường
4. **Check console logs** - Xem error messages trong terminal

### Email vào spam?

1. **Setup SPF record** cho domain
2. **Setup DKIM** cho email authentication  
3. **Sử dụng professional email** (không phải Gmail cá nhân)

## 📁 Code Structure

```
lib/email/
├── emailService.ts              # Core email service
├── types.ts                     # TypeScript interfaces
└── templates/
    └── registrationConfirm.ts   # Thank you email template

app/api/registrations/route.ts   # Tích hợp gửi email
app/admin/tabs/AdminSettingsTab.tsx  # SMTP config UI
```

## 🚀 Next Steps

1. **Test với email thật**
2. **Customize email template** nếu cần
3. **Add more email templates** (reminder, cancellation, etc.)
4. **Setup email analytics** để track open rates

## 📋 Email Flow

```
User Registration
       ↓
   Save to DB
       ↓
   Generate Email Template
       ↓
   Send via SMTP
       ↓
   Log Success/Error
       ↓
   Return Response
```

Tính năng này sẽ tự động gửi email đẹp, professional cho mọi người đăng ký sự kiện! 🎉
