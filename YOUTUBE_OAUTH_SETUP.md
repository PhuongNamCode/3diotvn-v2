# 🔐 YouTube OAuth Setup Guide

## 📋 Tổng quan

Hệ thống YouTube OAuth cho phép học viên đăng nhập YouTube để xem private videos một cách bảo mật. Đây là giải pháp tối ưu nhất cho việc bảo vệ video content.

## 🛠️ Setup YouTube API

### **Bước 1: Tạo Google Cloud Project**

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable các APIs sau:
   - **YouTube Data API v3**
   - **Google+ API** (for user info)

### **Bước 2: Tạo OAuth 2.0 Credentials**

1. Vào **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Chọn **Web application**
4. Thêm **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/youtube/callback
   https://3diot.vn/api/auth/youtube/callback
   ```

### **Bước 3: Cấu hình Environment Variables**

Thêm vào `.env.local`:

```bash
# YouTube API Configuration
YOUTUBE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
YOUTUBE_CLIENT_SECRET="your-client-secret"
YOUTUBE_API_KEY="your-youtube-api-key"
YOUTUBE_REDIRECT_URI="http://localhost:3000/api/auth/youtube/callback"

# JWT Secret
JWT_SECRET="your-jwt-secret-key"

# Google OAuth Scopes
GOOGLE_SCOPES="https://www.googleapis.com/auth/youtube.readonly,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/userinfo.profile"

# YouTube Channel ID
YOUTUBE_CHANNEL_ID="your-channel-id"
```

### **Bước 4: Tạo YouTube API Key**

1. Vào **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy API key và thêm vào `YOUTUBE_API_KEY`

## 🎯 Cách hoạt động

### **Luồng xác thực:**

1. **Học viên click "Xem trên YouTube"**
2. **System kiểm tra enrollment**
3. **Nếu chưa có YouTube OAuth → Redirect đến Google**
4. **Học viên đăng nhập Google/YouTube**
5. **System lưu credentials vào database**
6. **Redirect về course với quyền truy cập**

### **Luồng xem video:**

1. **Học viên click video**
2. **System kiểm tra YouTube OAuth credentials**
3. **Nếu có credentials → Mở YouTube video**
4. **Nếu không có → Yêu cầu xác thực**

## 🔒 Bảo mật

### **Các lớp bảo mật:**

1. **Enrollment Check**: Chỉ học viên đã đăng ký
2. **YouTube OAuth**: Xác thực danh tính
3. **JWT Tokens**: Secure access tokens
4. **Database Logging**: Track mọi access attempt

### **Private Videos:**

- Videos phải được set là **Private** trên YouTube
- Chỉ channel owner và authorized users mới xem được
- System tự động grant access cho enrolled students

## 📊 Database Schema

### **UserYouTubeCredentials**
```sql
model UserYouTubeCredentials {
  id            String    @id @default(cuid())
  email         String    @unique
  accessToken   String
  refreshToken  String
  expiryDate    DateTime
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### **VideoAccessLog**
```sql
model VideoAccessLog {
  id            String   @id @default(cuid())
  videoId       String
  courseId      String
  email         String
  userId        String?
  action        String   // 'access_granted', 'viewed', 'error'
  status        String?  // 'granted', 'failed', 'revoked'
  error         String?
  ipAddress     String?
  userAgent     String?
  metadata      Json?
  timestamp     DateTime @default(now())
}
```

## 🚀 API Endpoints

### **Authentication**
- `POST /api/auth/youtube/authorize` - Generate auth URL
- `GET /api/auth/youtube/callback` - Handle OAuth callback

### **Video Access**
- `POST /api/videos/secure-access` - Verify access & generate token
- `GET /api/videos/secure-access` - Validate existing token

### **Enrollment**
- `POST /api/enrollments/youtube-auth` - Trigger OAuth for enrollment

## 🎨 UI Components

### **YouTubeOAuthButton**
```tsx
<YouTubeOAuthButton
  courseId="course-123"
  videoId="video-456"
  email="user@example.com"
  onSuccess={() => console.log('Success')}
  onError={(error) => console.error(error)}
>
  Đăng nhập YouTube
</YouTubeOAuthButton>
```

### **LessonPlayer**
- Tự động hiển thị OAuth button khi cần
- Error handling với retry mechanism
- Loading states và user feedback

## 🔧 Troubleshooting

### **Common Issues:**

1. **"YouTube authentication required"**
   - User chưa đăng nhập YouTube
   - Click "Đăng nhập YouTube để xem video"

2. **"Access denied"**
   - User không enrolled trong course
   - Video không tồn tại hoặc không active

3. **"Invalid redirect URI"**
   - Check OAuth credentials trong Google Console
   - Ensure redirect URI matches exactly

4. **"Token expired"**
   - System tự động refresh token
   - Nếu vẫn lỗi → User cần đăng nhập lại

### **Debug Steps:**

1. Check browser console for errors
2. Verify environment variables
3. Check database for credentials
4. Test OAuth flow manually
5. Check YouTube API quotas

## 📈 Monitoring

### **Metrics to Track:**

- OAuth success/failure rates
- Video access attempts
- Token refresh frequency
- Error patterns

### **Logs:**

- All OAuth attempts logged
- Video access logged with metadata
- Error details captured
- IP addresses and user agents tracked

## 🔄 Maintenance

### **Regular Tasks:**

1. **Monitor API quotas**
2. **Check token expiry**
3. **Review access logs**
4. **Update OAuth scopes if needed**

### **Security Updates:**

1. **Rotate JWT secrets**
2. **Update OAuth credentials**
3. **Review access patterns**
4. **Audit user permissions**

---

## ✅ Checklist

- [ ] Google Cloud Project created
- [ ] YouTube Data API enabled
- [ ] OAuth 2.0 credentials configured
- [ ] Environment variables set
- [ ] Database schema updated
- [ ] API endpoints tested
- [ ] UI components integrated
- [ ] Error handling implemented
- [ ] Monitoring setup
- [ ] Documentation updated

**🎉 YouTube OAuth system is ready for production!**
