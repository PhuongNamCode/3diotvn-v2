# YouTube Private Videos Setup Guide

## Vấn đề hiện tại

Hệ thống hiện tại đã được fix để:
1. ✅ Sử dụng **email từ form đăng ký** thay vì email đăng nhập
2. ✅ Fix enrollment status mismatch (`confirmed`/`enrolled` thay vì `active`)
3. ✅ Log video access attempts cho analytics

## Cách setup YouTube Private Videos

### Option 1: Sử dụng Unlisted Videos (Khuyến nghị)

**Unlisted videos** có thể được truy cập bởi bất kỳ ai có link, nhưng không hiển thị trong search results.

```bash
# Trong admin, khi tạo curriculum lesson:
Type: YouTube Video
URL: https://www.youtube.com/watch?v=VIDEO_ID
```

**Ưu điểm:**
- Dễ setup
- Không cần cấp quyền cho từng email
- Học viên có link có thể xem được

**Nhược điểm:**
- Ít bảo mật hơn Private videos
- Link có thể bị share

### Option 2: Sử dụng Private Videos + Manual Access

**Private videos** chỉ có thể được truy cập bởi:
1. Chủ sở hữu kênh
2. Những người được mời trực tiếp qua YouTube Studio

**Cách setup:**
1. Upload video lên YouTube với privacy = "Private"
2. Vào YouTube Studio > Video details > Visibility
3. Thêm email của học viên vào "Share privately"
4. Học viên sẽ nhận email invitation từ YouTube

### Option 3: Automated Access Management (Advanced)

Có thể implement YouTube API để tự động manage access:

```javascript
// Future implementation
const youtubeService = new YouTubeService();
await youtubeService.addViewerAccess(videoId, email);
```

## Testing

1. **Tạo khóa học test** với curriculum chứa YouTube video
2. **Đăng ký khóa học** với email khác với email đăng nhập
3. **Vào "Khóa học của tôi"** và click "Vào học ngay"
4. **Click vào lesson YouTube** và kiểm tra:
   - Console log có hiển thị enrollment email đúng không
   - Video có mở được không
   - Access log có được ghi không

## Debug Commands

```bash
# Check enrollment status
curl "http://localhost:3001/api/user/dashboard?email=test@example.com"

# Check video access log
tail -f logs/video-access.log

# Test video access API
curl -X POST "http://localhost:3001/api/videos/access-log" \
  -H "Content-Type: application/json" \
  -d '{"videoId":"test","courseId":"test","email":"test@example.com","accessType":"youtube"}'
```

## Recommendations

1. **Sử dụng Unlisted videos** cho production
2. **Thêm email validation** khi đăng ký khóa học
3. **Implement rate limiting** cho video access
4. **Add analytics dashboard** để track video views
5. **Consider using Vimeo** hoặc custom video hosting cho better access control
