# Lệnh CURL để Test Tính Năng Thanh Toán

## 🎯 Tổng Quan
Các lệnh curl này sẽ giúp bạn tạo sự kiện và khóa học có phí để test tính năng thanh toán QR code.

## 📋 Chuẩn Bị
Đảm bảo server đang chạy:
```bash
npm run dev
# Hoặc
docker-compose up
```

Server sẽ chạy tại: `http://localhost:3000`

---

## 🎪 **TẠO SỰ KIỆN CÓ PHÍ**

### 1. **Workshop IoT - 500,000 VNĐ**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Workshop IoT: Xây dựng hệ thống nhà thông minh",
    "description": "Tham gia workshop thực hành xây dựng hệ thống nhà thông minh sử dụng Arduino và ESP32. Học viên sẽ được cung cấp kit thực hành và hướng dẫn chi tiết từ chuyên gia.",
    "date": "2024-02-15T09:00:00.000Z",
    "location": "Tòa nhà 3DIoT, 123 Nguyễn Huệ, Q1, TP.HCM",
    "price": 500000,
    "maxParticipants": 30,
    "registrationDeadline": "2024-02-10T23:59:59.000Z",
    "requirements": "Kiến thức cơ bản về lập trình, mang theo laptop",
    "schedule": "09:00 - 17:00 (có nghỉ trưa 12:00-13:00)",
    "instructor": "Nguyễn Văn A - Chuyên gia IoT với 5 năm kinh nghiệm",
    "contactInfo": "hotline: 0123456789, email: workshop@3diot.vn"
  }'
```

### 2. **Hội thảo AI & Machine Learning - 750,000 VNĐ**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hội thảo AI & Machine Learning trong IoT",
    "description": "Khám phá cách ứng dụng AI và Machine Learning trong các hệ thống IoT. Bao gồm demo thực tế và case study từ các dự án lớn.",
    "date": "2024-02-20T18:00:00.000Z",
    "location": "Trung tâm Hội nghị Sài Gòn, 123 Lê Duẩn, Q1, TP.HCM",
    "price": 750000,
    "maxParticipants": 50,
    "registrationDeadline": "2024-02-18T23:59:59.000Z",
    "requirements": "Kiến thức cơ bản về lập trình Python",
    "schedule": "18:00 - 21:00 (có tiệc nhẹ)",
    "instructor": "Dr. Trần Thị B - Tiến sĩ AI, Google Research",
    "contactInfo": "hotline: 0987654321, email: ai@3diot.vn"
  }'
```

### 3. **Bootcamp Embedded Programming - 1,200,000 VNĐ**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bootcamp Embedded Programming 3 ngày",
    "description": "Khóa học intensive 3 ngày về lập trình embedded systems. Từ cơ bản đến nâng cao, thực hành với nhiều loại vi điều khiển khác nhau.",
    "date": "2024-03-01T08:00:00.000Z",
    "location": "Lab 3DIoT, 456 Võ Văn Tần, Q3, TP.HCM",
    "price": 1200000,
    "maxParticipants": 20,
    "registrationDeadline": "2024-02-25T23:59:59.000Z",
    "requirements": "Kiến thức C/C++ cơ bản, laptop Windows/Linux",
    "schedule": "08:00 - 17:00 (3 ngày liên tiếp)",
    "instructor": "Thầy Lê Văn C - 10 năm kinh nghiệm embedded",
    "contactInfo": "hotline: 0369852147, email: bootcamp@3diot.vn"
  }'
```

### 4. **Sự kiện MIỄN PHÍ để so sánh**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Seminar: Xu hướng IoT 2024 (MIỄN PHÍ)",
    "description": "Tham gia seminar miễn phí về xu hướng IoT năm 2024. Cơ hội networking với các chuyên gia trong ngành.",
    "date": "2024-02-10T14:00:00.000Z",
    "location": "Hội trường 3DIoT, 789 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM",
    "price": 0,
    "maxParticipants": 100,
    "registrationDeadline": "2024-02-08T23:59:59.000Z",
    "requirements": "Không yêu cầu kiến thức trước",
    "schedule": "14:00 - 17:00",
    "instructor": "Các chuyên gia từ 3DIoT Community",
    "contactInfo": "hotline: 0912345678, email: free@3diot.vn"
  }'
```

---

## 🎓 **TẠO KHÓA HỌC CÓ PHÍ**

### 1. **Khóa học Arduino Cơ Bản - 800,000 VNĐ**
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Khóa học Arduino từ A-Z",
    "description": "Khóa học toàn diện về Arduino, từ cơ bản đến nâng cao. Bao gồm 12 bài học thực hành với kit Arduino Uno.",
    "price": 800000,
    "duration": "8 tuần",
    "schedule": "Thứ 7 & CN, 9:00-12:00",
    "level": "Cơ bản",
    "instructor": "Nguyễn Thị D - Chuyên gia Arduino",
    "requirements": "Không yêu cầu kinh nghiệm",
    "maxStudents": 25,
    "startDate": "2024-02-17T09:00:00.000Z",
    "endDate": "2024-04-07T12:00:00.000Z",
    "registrationDeadline": "2024-02-15T23:59:59.000Z",
    "location": "Phòng lab 3DIoT",
    "contactInfo": "hotline: 0123456789, email: arduino@3diot.vn"
  }'
```

### 2. **Khóa học ESP32 Nâng Cao - 1,500,000 VNĐ**
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "ESP32 & WiFi IoT Projects",
    "description": "Khóa học chuyên sâu về ESP32, xây dựng các dự án IoT thực tế với WiFi, Bluetooth, sensors và cloud connectivity.",
    "price": 1500000,
    "duration": "10 tuần",
    "schedule": "Thứ 3,5,7, 19:00-21:00",
    "level": "Nâng cao",
    "instructor": "Trần Văn E - Senior IoT Engineer",
    "requirements": "Kiến thức Arduino cơ bản",
    "maxStudents": 15,
    "startDate": "2024-03-01T19:00:00.000Z",
    "endDate": "2024-05-10T21:00:00.000Z",
    "registrationDeadline": "2024-02-28T23:59:59.000Z",
    "location": "Lab IoT 3DIoT",
    "contactInfo": "hotline: 0987654321, email: esp32@3diot.vn"
  }'
```

### 3. **Khóa học MIỄN PHÍ để so sánh**
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Giới thiệu IoT cho người mới bắt đầu (MIỄN PHÍ)",
    "description": "Khóa học miễn phí giới thiệu về IoT, các khái niệm cơ bản và xu hướng phát triển.",
    "price": 0,
    "duration": "2 tuần",
    "schedule": "CN, 14:00-16:00",
    "level": "Cơ bản",
    "instructor": "Mentor 3DIoT Community",
    "requirements": "Không yêu cầu kiến thức trước",
    "maxStudents": 50,
    "startDate": "2024-02-11T14:00:00.000Z",
    "endDate": "2024-02-25T16:00:00.000Z",
    "registrationDeadline": "2024-02-09T23:59:59.000Z",
    "location": "Online qua Zoom",
    "contactInfo": "hotline: 0912345678, email: free@3diot.vn"
  }'
```

---

## 🧪 **TEST ĐĂNG KÝ VỚI THANH TOÁN**

### 1. **Đăng ký sự kiện có phí**
```bash
curl -X POST http://localhost:3000/api/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "EVENT_ID_TỪ_SỰ_KIỆN_TRÊN",
    "fullName": "Nguyễn Văn Test",
    "email": "test@example.com",
    "phone": "0123456789",
    "organization": "Công ty ABC",
    "experience": "2 năm lập trình web",
    "expectation": "Muốn học IoT để phát triển sản phẩm",
    "paymentMethod": "bank_transfer",
    "transactionId": "1234567890",
    "amount": 500000,
    "paymentStatus": "pending"
  }'
```

### 2. **Đăng ký khóa học có phí**
```bash
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE_ID_TỪ_KHÓA_HỌC_TRÊN",
    "fullName": "Trần Thị Test",
    "email": "test2@example.com",
    "phone": "0987654321",
    "paymentMethod": "momo",
    "transactionId": "MOMO123456789",
    "amount": 800000,
    "paymentStatus": "pending"
  }'
```

---

## 🔍 **KIỂM TRA KẾT QUẢ**

### 1. **Xem danh sách sự kiện**
```bash
curl -X GET http://localhost:3000/api/events
```

### 2. **Xem danh sách khóa học**
```bash
curl -X GET http://localhost:3000/api/courses
```

### 3. **Xem danh sách đăng ký**
```bash
curl -X GET http://localhost:3000/api/registrations
```

### 4. **Xem danh sách ghi danh**
```bash
curl -X GET http://localhost:3000/api/enrollments
```

---

## 💡 **HƯỚNG DẪN TEST**

### 1. **Tạo dữ liệu test**
1. Chạy các lệnh curl tạo sự kiện/khóa học ở trên
2. Lưu lại ID của các sự kiện/khóa học được tạo
3. Sử dụng ID này để test đăng ký

### 2. **Test QR Code**
1. Mở website tại `http://localhost:3000`
2. Đăng nhập (nếu cần)
3. Chọn tab "Sự kiện" hoặc "Khóa học"
4. Click vào sự kiện/khóa học có phí
5. Nhấn "Đăng ký tham gia"
6. Kiểm tra QR code hiển thị đúng không

### 3. **Test thanh toán**
1. Chọn phương thức thanh toán (VNPay/MoMo)
2. Kiểm tra QR code tương ứng hiển thị
3. Test đăng ký với mã giao dịch giả
4. Kiểm tra dữ liệu được lưu vào database

### 4. **So sánh sự kiện miễn phí**
1. Đăng ký sự kiện có price = 0
2. Kiểm tra không hiển thị phần thanh toán
3. Đăng ký thành công mà không cần QR code

---

## 🎯 **CÁC TRƯỜNG HỢP TEST QUAN TRỌNG**

### ✅ **Test Cases**
1. **Sự kiện có phí** → Hiển thị QR code + form thanh toán
2. **Sự kiện miễn phí** → Không hiển thị phần thanh toán
3. **Chọn VNPay** → Hiển thị QR VNPay lớn
4. **Chọn MoMo** → Hiển thị QR MoMo lớn
5. **Đăng ký thành công** → Lưu mã giao dịch vào DB
6. **Responsive** → QR code hiển thị đúng trên mobile

### ❌ **Test Cases lỗi**
1. **Thiếu mã giao dịch** → Hiển thị lỗi validation
2. **Mã giao dịch không hợp lệ** → Hiển thị lỗi format
3. **Số tiền không đúng** → Kiểm tra validation

---

**🎉 Chúc bạn test thành công tính năng QR code thanh toán! 💳✨**
