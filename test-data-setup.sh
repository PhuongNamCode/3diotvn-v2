#!/bin/bash

# 3DIoT Test Data Setup Script
# Tạo sự kiện, khóa học và đăng ký để test nhanh

BASE_URL="http://localhost:3000"
EMAIL="chinhphucvatly@gmail.com"

echo "🚀 Setting up test data for 3DIoT..."

# 1. Tạo sự kiện test
echo "📅 Creating test event..."
EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/events" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sự kiện Test 3D IoT",
    "description": "Sự kiện test để kiểm tra hệ thống đăng ký",
    "date": "2025-02-15T18:00:00.000Z",
    "time": "18:00",
    "location": "Online - Zoom Meeting",
    "capacity": 100,
    "price": 0,
    "category": "workshop",
    "status": "active"
  }')

EVENT_ID=$(echo $EVENT_RESPONSE | jq -r '.data.id' 2>/dev/null || echo "failed")
echo "✅ Event created with ID: $EVENT_ID"
echo "Event response: $EVENT_RESPONSE"

# 2. Tạo khóa học test
echo "📚 Creating test course..."
COURSE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/courses" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Khóa học Test 3D IoT",
    "description": "Khóa học test để kiểm tra hệ thống học tập",
    "instructorName": "Giảng viên Test",
    "durationMinutes": 120,
    "lessonsCount": 3,
    "level": "beginner",
    "price": 0,
    "status": "published",
    "curriculum": [
      {
        "title": "Bài 1: Giới thiệu",
        "description": "Bài học đầu tiên",
        "duration": 30,
        "type": "video",
        "youtubeId": "dQw4w9WgXcQ"
      },
      {
        "title": "Bài 2: Thực hành",
        "description": "Bài học thực hành",
        "duration": 45,
        "type": "video", 
        "youtubeId": "dQw4w9WgXcQ"
      },
      {
        "title": "Bài 3: Tổng kết",
        "description": "Bài học cuối cùng",
        "duration": 45,
        "type": "video",
        "youtubeId": "dQw4w9WgXcQ"
      }
    ]
  }')

COURSE_ID=$(echo $COURSE_RESPONSE | jq -r '.data.id' 2>/dev/null || echo "failed")
echo "✅ Course created with ID: $COURSE_ID"
echo "Course response: $COURSE_RESPONSE"

# 3. Đăng ký sự kiện
echo "🎫 Registering for event..."
REGISTRATION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/registrations" \
  -H "Content-Type: application/json" \
  -d "{
    \"eventId\": \"$EVENT_ID\",
    \"email\": \"$EMAIL\",
    \"name\": \"Nguyễn Văn Test\",
    \"phone\": \"0123456789\",
    \"company\": \"Công ty Test\",
    \"position\": \"Developer\",
    \"experience\": \"2 năm\",
    \"expectations\": \"Học hỏi về 3D IoT\"
  }")

REGISTRATION_ID=$(echo $REGISTRATION_RESPONSE | jq -r '.data.id' 2>/dev/null || echo "failed")
echo "✅ Event registration created with ID: $REGISTRATION_ID"
echo "Registration response: $REGISTRATION_RESPONSE"

# 4. Đăng ký khóa học
echo "📖 Enrolling in course..."
ENROLLMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/course-enrollments" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": \"$COURSE_ID\",
    \"email\": \"$EMAIL\",
    \"name\": \"Nguyễn Văn Test\",
    \"phone\": \"0123456789\"
  }")

ENROLLMENT_ID=$(echo $ENROLLMENT_RESPONSE | jq -r '.data.id' 2>/dev/null || echo "failed")
echo "✅ Course enrollment created with ID: $ENROLLMENT_ID"

# 5. Kiểm tra dashboard user
echo "👤 Checking user dashboard..."
curl -s -X GET "$BASE_URL/api/user/dashboard?email=$EMAIL" | jq '.' 2>/dev/null || echo "Dashboard data (jq not available for pretty print)"

echo ""
echo "🎉 Test data setup completed!"
echo "📊 Summary:"
echo "  - Event ID: $EVENT_ID"
echo "  - Course ID: $COURSE_ID" 
echo "  - Registration ID: $REGISTRATION_ID"
echo "  - Enrollment ID: $ENROLLMENT_ID"
echo "  - Email: $EMAIL"
echo ""
echo "🌐 You can now test:"
echo "  - My Events: http://localhost:3000/my-events"
echo "  - My Courses: http://localhost:3000/my-courses"
echo "  - Admin Panel: http://localhost:3000/admin"
echo ""
echo "🔍 To verify data:"
echo "  curl -s '$BASE_URL/api/events/$EVENT_ID' | jq"
echo "  curl -s '$BASE_URL/api/courses/$COURSE_ID' | jq"
echo "  curl -s '$BASE_URL/api/user/dashboard?email=$EMAIL' | jq"
