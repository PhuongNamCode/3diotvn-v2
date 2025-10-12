# 3DIoT API Testing với cURL

File này chứa các lệnh cURL để test API endpoints của 3DIoT platform.

## Base URL

### Cách 1: Export biến môi trường (Khuyến nghị)
```bash
export BASE_URL="http://localhost:3000"
# Hoặc cho production: export BASE_URL="https://your-domain.com"

# Kiểm tra biến đã được set
echo $BASE_URL
```

### Cách 2: Sử dụng trực tiếp trong lệnh
```bash
# Thay thế $BASE_URL bằng URL thực tế trong mỗi lệnh
curl -X GET "http://localhost:3000/api/events"
```

## 1. Test Sự kiện (Events)

### 1.1 Lấy danh sách sự kiện
```bash
# Lấy tất cả sự kiện
curl -X GET "$BASE_URL/api/events" | jq

# Lấy sự kiện với pagination
curl -X GET "$BASE_URL/api/events?page=1&limit=10" | jq

# Lọc theo category
curl -X GET "$BASE_URL/api/events?category=workshop" | jq

# Lọc theo status
curl -X GET "$BASE_URL/api/events?status=upcoming" | jq
```

### 1.2 Tạo sự kiện mới

#### Sự kiện Arduino cơ bản (miễn phí)
```bash
curl -X POST "$BASE_URL/api/events" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Workshop Arduino Cơ Bản - Làm quen với IoT",
    "description": "Khóa học giới thiệu về Arduino, cách lập trình và kết nối các cảm biến cơ bản. Phù hợp cho người mới bắt đầu.",
    "date": "2025-12-15",
    "time": "09:00 - 12:00",
    "location": "Trung tâm Công nghệ IoT Hà Nội",
    "onlineLink": "https://meet.google.com/abc-defg-hij",
    "capacity": 50,
    "price": 0,
    "speakers": ["Nguyễn Văn A", "Trần Thị B"],
    "requirements": "Laptop, Arduino Uno, breadboard, dây nối",
    "agenda": "1. Giới thiệu Arduino\n2. Cài đặt IDE\n3. Lập trình LED\n4. Kết nối cảm biến\n5. Thực hành project",
    "category": "workshop",
    "status": "upcoming"
  }' | jq
```

#### Sự kiện ESP32 nâng cao (có phí)
```bash
curl -X POST "$BASE_URL/api/events" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "ESP32 Advanced - Kết nối WiFi và Cloud",
    "description": "Học cách lập trình ESP32, kết nối WiFi, gửi dữ liệu lên cloud và xây dựng ứng dụng IoT thực tế.",
    "date": "2025-02-20",
    "time": "14:00 - 17:00",
    "location": "Online - Zoom Meeting",
    "onlineLink": "https://zoom.us/j/123456789",
    "capacity": 30,
    "price": 200000,
    "speakers": ["Phạm Văn C", "Lê Thị D"],
    "requirements": "ESP32 DevKit, laptop, tài khoản Firebase",
    "agenda": "1. Giới thiệu ESP32\n2. Lập trình WiFi\n3. Kết nối Firebase\n4. Gửi dữ liệu cảm biến\n5. Tạo dashboard",
    "category": "advanced",
    "status": "upcoming"
  }' | jq
```

#### Sự kiện STM32 cho người có kinh nghiệm
```bash
curl -X POST "$BASE_URL/api/events" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "STM32 HAL Programming - Từ cơ bản đến nâng cao",
    "description": "Khóa học chuyên sâu về lập trình STM32 sử dụng HAL library, timer, ADC, UART và các ngoại vi khác.",
    "date": "2025-03-01",
    "time": "09:00 - 16:00",
    "location": "Phòng Lab Đại học Bách Khoa Hà Nội",
    "capacity": 25,
    "price": 500000,
    "speakers": ["GS.TS Nguyễn Văn E", "ThS. Hoàng Thị F"],
    "requirements": "STM32F4 Discovery Board, STM32CubeIDE, oscilloscope",
    "agenda": "Buổi sáng:\n1. Giới thiệu STM32 architecture\n2. Cài đặt toolchain\n3. GPIO và LED control\nBuổi chiều:\n4. Timer và PWM\n5. ADC và sensor reading\n6. UART communication\n7. Project thực hành",
    "category": "advanced",
    "status": "upcoming"
  }' | jq
```

#### Sự kiện Raspberry Pi IoT
```bash
curl -X POST "$BASE_URL/api/events" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Raspberry Pi IoT Project - Smart Home System",
    "description": "Xây dựng hệ thống smart home hoàn chỉnh sử dụng Raspberry Pi, các cảm biến và Python programming.",
    "date": "2025-03-10",
    "time": "09:00 - 17:00",
    "location": "Cộng đồng 3DIoT Lab",
    "capacity": 20,
    "price": 300000,
    "speakers": ["Kỹ sư Vũ Văn G"],
    "requirements": "Raspberry Pi 4, camera module, PIR sensor, relay module",
    "agenda": "1. Setup Raspberry Pi OS\n2. Python programming basics\n3. GPIO control\n4. Camera và computer vision\n5. Sensor integration\n6. Web interface\n7. Mobile app integration",
    "category": "project",
    "status": "upcoming"
  }' | jq
```

## 2. Test Khóa học (Courses)

### 2.1 Lấy danh sách khóa học
```bash
# Lấy tất cả khóa học
curl -X GET "$BASE_URL/api/courses" | jq

# Lấy khóa học với pagination
curl -X GET "$BASE_URL/api/courses?page=1&limit=10" | jq

# Lọc theo category
curl -X GET "$BASE_URL/api/courses?category=IoT" | jq

# Lọc theo level
curl -X GET "$BASE_URL/api/courses?level=beginner" | jq

# Tìm kiếm
curl -X GET "$BASE_URL/api/courses?search=arduino" | jq
```

### 2.2 Tạo khóa học mới

#### Khóa học Arduino cơ bản (miễn phí)
```bash
curl -X POST "$BASE_URL/api/courses" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Arduino Programming - Từ Zero đến Hero",
    "description": "Khóa học toàn diện về Arduino, từ cài đặt IDE đến xây dựng các project thực tế.",
    "image": "https://example.com/images/arduino-course.jpg",
    "level": "beginner",
    "price": 0,
    "status": "published",
    "category": "Programming",
    "tags": ["Arduino", "C++", "Electronics", "IoT", "Beginner"],
    "lessonsCount": 15,
    "durationMinutes": 1200,
    "overview": "Khóa học Arduino cơ bản dành cho người mới bắt đầu. Bạn sẽ học cách lập trình Arduino, kết nối các cảm biến và xây dựng các project thú vị.",
    "curriculum": [
      {
        "module": "Module 1: Giới thiệu",
        "lessons": [
          {"title": "Arduino là gì?", "duration": "15 phút"},
          {"title": "Cài đặt Arduino IDE", "duration": "20 phút"},
          {"title": "Board Arduino Uno", "duration": "25 phút"}
        ]
      },
      {
        "module": "Module 2: Lập trình cơ bản",
        "lessons": [
          {"title": "Cú pháp C++ cơ bản", "duration": "30 phút"},
          {"title": "Biến và kiểu dữ liệu", "duration": "25 phút"},
          {"title": "Vòng lặp và điều kiện", "duration": "30 phút"}
        ]
      }
    ],
    "instructorName": "Nguyễn Văn Arduino",
    "instructorBio": "5 năm kinh nghiệm giảng dạy Arduino, tác giả của 3 cuốn sách về embedded programming.",
    "instructorImage": "https://example.com/images/instructor1.jpg",
    "instructorEmail": "instructor1@3diot.com",
    "requirements": "Laptop, Arduino Uno, breadboard, dây nối, LED, điện trở",
    "whatYouWillLearn": [
      "Lập trình Arduino từ cơ bản",
      "Kết nối và điều khiển LED",
      "Đọc dữ liệu từ cảm biến",
      "Xây dựng project thực tế",
      "Debug và troubleshoot"
    ]
  }' | jq
```

#### Khóa học ESP32 IoT (có phí)
```bash
curl -X POST "$BASE_URL/api/courses" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "ESP32 IoT Development - Complete Guide",
    "description": "Khóa học toàn diện về phát triển ứng dụng IoT sử dụng ESP32, từ cơ bản đến nâng cao.",
    "image": "https://example.com/images/esp32-course.jpg",
    "level": "intermediate",
    "price": 899000,
    "status": "published",
    "category": "IoT",
    "tags": ["ESP32", "WiFi", "Bluetooth", "IoT", "Firebase", "MQTT"],
    "lessonsCount": 25,
    "durationMinutes": 1800,
    "overview": "Khóa học ESP32 IoT Development sẽ dạy bạn cách xây dựng các ứng dụng IoT thực tế sử dụng ESP32. Từ kết nối WiFi, gửi dữ liệu lên cloud đến xây dựng dashboard monitoring.",
    "curriculum": [
      {
        "module": "Module 1: ESP32 Fundamentals",
        "lessons": [
          {"title": "Giới thiệu ESP32", "duration": "20 phút"},
          {"title": "Cài đặt ESP32 trong Arduino IDE", "duration": "25 phút"},
          {"title": "GPIO và Digital I/O", "duration": "30 phút"}
        ]
      },
      {
        "module": "Module 2: WiFi và Networking",
        "lessons": [
          {"title": "Kết nối WiFi", "duration": "35 phút"},
          {"title": "HTTP Client", "duration": "40 phút"},
          {"title": "Web Server", "duration": "45 phút"}
        ]
      },
      {
        "module": "Module 3: Cloud Integration",
        "lessons": [
          {"title": "Firebase Realtime Database", "duration": "50 phút"},
          {"title": "MQTT Protocol", "duration": "45 phút"},
          {"title": "AWS IoT Core", "duration": "60 phút"}
        ]
      }
    ],
    "instructorName": "ThS. Lê Văn ESP32",
    "instructorBio": "Chuyên gia IoT với 8 năm kinh nghiệm, đã triển khai hơn 100 dự án IoT cho các doanh nghiệp lớn.",
    "instructorImage": "https://example.com/images/instructor2.jpg",
    "instructorEmail": "instructor2@3diot.com",
    "requirements": "ESP32 DevKit, laptop, tài khoản Firebase, basic C++ knowledge",
    "whatYouWillLearn": [
      "Lập trình ESP32 từ cơ bản",
      "Kết nối WiFi và Bluetooth",
      "Gửi dữ liệu lên cloud",
      "Xây dựng web server",
      "Tích hợp MQTT",
      "Tạo dashboard monitoring",
      "Deploy project thực tế"
    ]
  }' | jq
```

#### Khóa học STM32 HAL (nâng cao)
```bash
curl -X POST "$BASE_URL/api/courses" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "STM32 HAL Programming Masterclass",
    "description": "Khóa học chuyên sâu về lập trình STM32 sử dụng HAL library, từ timer, ADC đến DMA và RTOS.",
    "image": "https://example.com/images/stm32-course.jpg",
    "level": "advanced",
    "price": 1599000,
    "status": "published",
    "category": "Embedded",
    "tags": ["STM32", "HAL", "C", "Embedded", "RTOS", "DMA", "Timer"],
    "lessonsCount": 30,
    "durationMinutes": 2400,
    "overview": "Khóa học STM32 HAL Programming Masterclass dành cho các kỹ sư embedded có kinh nghiệm. Học cách tận dụng tối đa sức mạnh của STM32 thông qua HAL library.",
    "curriculum": [
      {
        "module": "Module 1: STM32 Architecture",
        "lessons": [
          {"title": "STM32 family overview", "duration": "30 phút"},
          {"title": "Memory map và registers", "duration": "45 phút"},
          {"title": "Clock system", "duration": "40 phút"}
        ]
      },
      {
        "module": "Module 2: HAL Library Deep Dive",
        "lessons": [
          {"title": "GPIO HAL functions", "duration": "35 phút"},
          {"title": "Timer HAL programming", "duration": "60 phút"},
          {"title": "ADC và DAC HAL", "duration": "55 phút"}
        ]
      },
      {
        "module": "Module 3: Advanced Topics",
        "lessons": [
          {"title": "DMA programming", "duration": "70 phút"},
          {"title": "FreeRTOS integration", "duration": "80 phút"},
          {"title": "Low power modes", "duration": "50 phút"}
        ]
      }
    ],
    "instructorName": "GS.TS Nguyễn Văn STM32",
    "instructorBio": "Giáo sư Đại học Bách Khoa, 15 năm kinh nghiệm embedded systems, tác giả nhiều paper quốc tế.",
    "instructorImage": "https://example.com/images/instructor3.jpg",
    "instructorEmail": "instructor3@3diot.com",
    "requirements": "STM32F4 Discovery Board, STM32CubeIDE, oscilloscope, logic analyzer",
    "whatYouWillLearn": [
      "Hiểu sâu STM32 architecture",
      "Lập trình HAL library hiệu quả",
      "Sử dụng Timer và PWM",
      "ADC/DAC programming",
      "DMA optimization",
      "FreeRTOS integration",
      "Low power design",
      "Debug và profiling"
    ]
  }' | jq
```

#### Khóa học Raspberry Pi AI (nâng cao)
```bash
curl -X POST "$BASE_URL/api/courses" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Raspberry Pi AI & Computer Vision",
    "description": "Khóa học về AI và Computer Vision trên Raspberry Pi, từ OpenCV đến TensorFlow Lite và edge computing.",
    "image": "https://example.com/images/raspberry-pi-ai-course.jpg",
    "level": "advanced",
    "price": 1299000,
    "status": "published",
    "category": "AI/ML",
    "tags": ["Raspberry Pi", "AI", "Computer Vision", "OpenCV", "TensorFlow", "Python"],
    "lessonsCount": 20,
    "durationMinutes": 1500,
    "overview": "Khóa học Raspberry Pi AI & Computer Vision sẽ dạy bạn cách xây dựng các ứng dụng AI trên edge device. Từ computer vision cơ bản đến deep learning optimization.",
    "curriculum": [
      {
        "module": "Module 1: Computer Vision Basics",
        "lessons": [
          {"title": "OpenCV installation và setup", "duration": "30 phút"},
          {"title": "Image processing fundamentals", "duration": "45 phút"},
          {"title": "Face detection", "duration": "50 phút"}
        ]
      },
      {
        "module": "Module 2: Deep Learning on Edge",
        "lessons": [
          {"title": "TensorFlow Lite setup", "duration": "40 phút"},
          {"title": "Model optimization", "duration": "60 phút"},
          {"title": "Object detection", "duration": "70 phút"}
        ]
      },
      {
        "module": "Module 3: Real-world Projects",
        "lessons": [
          {"title": "Smart surveillance system", "duration": "80 phút"},
          {"title": "Autonomous robot", "duration": "90 phút"},
          {"title": "Industrial quality control", "duration": "85 phút"}
        ]
      }
    ],
    "instructorName": "TS. Trần Thị AI",
    "instructorBio": "Tiến sĩ Computer Science, chuyên gia AI/ML với 10 năm kinh nghiệm, đã phát triển nhiều sản phẩm AI thương mại.",
    "instructorImage": "https://example.com/images/instructor4.jpg",
    "instructorEmail": "instructor4@3diot.com",
    "requirements": "Raspberry Pi 4 (4GB+), Camera Module, MicroSD 32GB+, Python knowledge",
    "whatYouWillLearn": [
      "Computer Vision với OpenCV",
      "Deep Learning trên edge device",
      "TensorFlow Lite optimization",
      "Real-time object detection",
      "Face recognition system",
      "Autonomous navigation",
      "Model deployment và monitoring"
    ]
  }' | jq
```

## 3. Test các API khác

### 3.1 Lấy thống kê hệ thống
```bash
curl -X GET "$BASE_URL/api/stats" | jq
```

### 3.2 Tạo user mới
```bash
curl -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn Test",
    "email": "test@example.com",
    "company": "3DIoT Community",
    "phone": "0123456789",
    "role": "student",
    "status": "active"
  }' | jq
```

### 3.3 Tạo contact
```bash
curl -X POST "$BASE_URL/api/contacts" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lê Văn Contact",
    "email": "contact@example.com",
    "phone": "0987654321",
    "company": "ABC Company",
    "role": "Engineer",
    "message": "Tôi muốn tham gia khóa học Arduino",
    "type": "partnership",
    "status": "new",
    "priority": "medium"
  }' | jq
```

### 3.4 Đăng ký sự kiện
```bash
curl -X POST "$BASE_URL/api/registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "EVENT_ID_FROM_PREVIOUS_RESPONSE",
    "fullName": "Nguyễn Văn Đăng Ký",
    "email": "dangky@example.com",
    "phone": "0123456789",
    "organization": "3DIoT Community",
    "experience": "beginner",
    "expectation": "Học Arduino cơ bản",
    "status": "confirmed"
  }' | jq
```

### 3.5 Đăng ký khóa học
```bash
curl -X POST "$BASE_URL/api/course-enrollments" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE_ID_FROM_PREVIOUS_RESPONSE",
    "fullName": "Trần Thị Enroll",
    "email": "enroll@example.com",
    "phone": "0987654321",
    "status": "enrolled",
    "paymentStatus": "pending"
  }' | jq
```

## 4. Test với authentication (nếu cần)

### 4.1 Admin authentication
```bash
# Lấy token admin (nếu có endpoint auth)
curl -X POST "$BASE_URL/api/admin/auth" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }' | jq

# Sử dụng token trong header
TOKEN="YOUR_TOKEN_HERE"
curl -X GET "$BASE_URL/api/admin/stats" \
  -H "Authorization: Bearer $TOKEN" | jq
```

## 5. Script tự động test

### 5.1 Script bash để test tất cả
```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "Testing 3DIoT API..."

# Test events
echo "Creating test events..."
curl -X POST "$BASE_URL/api/events" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event - Arduino Workshop",
    "description": "Test event for API testing",
    "date": "2025-02-15",
    "time": "09:00 - 12:00",
    "location": "Test Location",
    "capacity": 20,
    "price": 0,
    "category": "workshop",
    "status": "upcoming"
  }' | jq

# Test courses
echo "Creating test courses..."
curl -X POST "$BASE_URL/api/courses" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Course - Arduino Basics",
    "description": "Test course for API testing",
    "level": "beginner",
    "price": 0,
    "status": "published",
    "category": "Programming",
    "lessonsCount": 5,
    "durationMinutes": 300
  }' | jq

# Test stats
echo "Getting system stats..."
curl -X GET "$BASE_URL/api/stats" | jq

echo "API testing completed!"
```

## 6. Lưu ý quan trọng

1. **Rate Limiting**: API có rate limiting, không gửi quá nhiều requests liên tiếp
2. **Validation**: Các trường bắt buộc phải có giá trị hợp lệ
3. **Date Format**: Sử dụng format ISO 8601 cho dates (YYYY-MM-DD)
4. **JSON Format**: Đảm bảo JSON được format đúng
5. **jq**: Sử dụng `jq` để format JSON output cho dễ đọc

## 7. Troubleshooting

### Lỗi thường gặp:
- **400 Bad Request**: Thiếu trường bắt buộc hoặc format sai
- **429 Too Many Requests**: Vượt quá rate limit
- **500 Internal Server Error**: Lỗi server, kiểm tra logs

### Lỗi khi chạy lệnh:
```bash
# ❌ SAI: Chạy như lệnh bash
$BASE_URL=http://localhost:3000
# bash: =http://localhost:3000: No such file or directory

# ✅ ĐÚNG: Export biến môi trường
export BASE_URL="http://localhost:3000"
echo $BASE_URL
```

### Database sync issues:
```bash
# Nếu API courses không hoạt động, sync database
npx prisma db push

# Hoặc restart server
npm run dev
```

### Courses API troubleshooting:
```bash
# Nếu gặp lỗi "Failed to create course" hoặc "Failed to fetch courses":
# 1. Sync database schema
npx prisma db push

# 2. Kiểm tra API courses có hoạt động không
curl -X GET "http://localhost:3000/api/courses" | jq

# 3. Nếu vẫn lỗi, restart server
npm run dev

# 4. Test với khóa học đơn giản trước
curl -X POST "http://localhost:3000/api/courses" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Course",
    "description": "Test course description",
    "level": "beginner",
    "price": 0,
    "status": "published",
    "category": "Test"
  }' | jq
```

### Debug commands:
```bash
# Kiểm tra server có chạy không
curl -I "$BASE_URL/api/stats"

# Test với verbose output
curl -v -X POST "$BASE_URL/api/events" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'

# Chạy script test tự động
chmod +x test-api.sh
./test-api.sh
```
