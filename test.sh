#!/bin/bash

# 3DIoT Comprehensive Test Script
# Test toàn diện các chức năng chính

BASE_URL="http://localhost:3000"
EMAIL="chinhphucvatly@gmail.com"
YOUTUBE_VIDEO="https://www.youtube.com/watch?v=LpUWKnEguB0&t"

echo "🚀 3DIoT Comprehensive Test"
echo "==========================="

# Kiểm tra server
echo "🔍 Checking server..."
if ! curl -s -f "$BASE_URL" > /dev/null; then
    echo "❌ Server not running. Start with: ./start.sh"
    exit 1
fi
echo "✅ Server is running!"

echo ""
echo "📋 Choose test:"
echo "1. Events only (4 events: future, past, paid, free)"
echo "2. Courses only (2 courses: YouTube type, online link type)"
echo "3. Contact + News (support contact + news testing)"
echo ""

read -p "Choose (1-3): " choice

case $choice in
    1)
        echo "📅 Testing Events Only..."
        echo "Creating 4 different events..."
        
        # 1. Event tương lai - miễn phí
        echo "🆓 Creating future free event..."
        FUTURE_FREE=$(curl -s -X POST "$BASE_URL/api/events" \
          -H "Content-Type: application/json" \
          -d '{
            "title": "Workshop 3D IoT Tương Lai - Miễn Phí",
            "description": "Sự kiện workshop về 3D IoT sẽ diễn ra trong tương lai, hoàn toàn miễn phí",
            "date": "2026-03-15T18:00:00.000Z",
            "time": "18:00",
            "location": "Online - Zoom Meeting",
            "capacity": 100,
            "price": 0,
            "category": "workshop",
            "status": "active"
          }')
        
        FUTURE_FREE_ID=$(echo $FUTURE_FREE | jq -r '.data.id' 2>/dev/null || echo "failed")
        echo "✅ Future free event: $FUTURE_FREE_ID"
        
        # 2. Event tương lai - có phí
        echo "💰 Creating future paid event..."
        FUTURE_PAID=$(curl -s -X POST "$BASE_URL/api/events" \
          -H "Content-Type: application/json" \
          -d '{
            "title": "Khóa học 3D IoT Premium - Có Phí",
            "description": "Khóa học 3D IoT cao cấp với chứng chỉ, có phí tham gia",
            "date": "2026-04-20T09:00:00.000Z",
            "time": "09:00",
            "location": "Trung tâm Hội nghị TP.HCM",
            "capacity": 50,
            "price": 500000,
            "category": "training",
            "status": "active"
          }')
        
        FUTURE_PAID_ID=$(echo $FUTURE_PAID | jq -r '.data.id' 2>/dev/null || echo "failed")
        echo "✅ Future paid event: $FUTURE_PAID_ID"
        
        # 3. Event quá khứ - miễn phí
        echo "📅 Creating past free event..."
        PAST_FREE=$(curl -s -X POST "$BASE_URL/api/events" \
          -H "Content-Type: application/json" \
          -d '{
            "title": "Hội thảo 3D IoT Quá Khứ - Miễn Phí",
            "description": "Hội thảo 3D IoT đã diễn ra trong quá khứ, hoàn toàn miễn phí",
            "date": "2024-12-15T14:00:00.000Z",
            "time": "14:00",
            "location": "Online - Microsoft Teams",
            "capacity": 200,
            "price": 0,
            "category": "seminar",
            "status": "completed"
          }')
        
        PAST_FREE_ID=$(echo $PAST_FREE | jq -r '.data.id' 2>/dev/null || echo "failed")
        echo "✅ Past free event: $PAST_FREE_ID"
        
        # 4. Event quá khứ - có phí
        echo "💸 Creating past paid event..."
        PAST_PAID=$(curl -s -X POST "$BASE_URL/api/events" \
          -H "Content-Type: application/json" \
          -d '{
            "title": "Khóa đào tạo 3D IoT Quá Khứ - Có Phí",
            "description": "Khóa đào tạo 3D IoT đã hoàn thành, có phí tham gia",
            "date": "2024-11-10T10:00:00.000Z",
            "time": "10:00",
            "location": "Viện Công nghệ TP.HCM",
            "capacity": 30,
            "price": 750000,
            "category": "training",
            "status": "completed"
          }')
        
        PAST_PAID_ID=$(echo $PAST_PAID | jq -r '.data.id' 2>/dev/null || echo "failed")
        echo "✅ Past paid event: $PAST_PAID_ID"
        
        # Đăng ký cho event tương lai miễn phí
        if [ "$FUTURE_FREE_ID" != "failed" ] && [ "$FUTURE_FREE_ID" != "null" ]; then
            echo "🎫 Registering for future free event..."
            REG_RESPONSE=$(curl -s -X POST "$BASE_URL/api/registrations" \
              -H "Content-Type: application/json" \
              -d "{
                \"eventId\": \"$FUTURE_FREE_ID\",
                \"email\": \"$EMAIL\",
                \"name\": \"Nguyễn Văn Test\",
                \"phone\": \"0123456789\",
                \"company\": \"Công ty Test\",
                \"position\": \"Developer\",
                \"experience\": \"2 năm\",
                \"expectations\": \"Học hỏi về 3D IoT\"
              }")
            
            REG_ID=$(echo $REG_RESPONSE | jq -r '.data.id' 2>/dev/null || echo "failed")
            echo "✅ Registration created: $REG_ID"
        fi
        ;;

    2)
        echo "📚 Testing Courses Only..."
        echo "Creating 2 different courses..."
        
        # 1. Course với YouTube video
        echo "🎥 Creating YouTube video course..."
        YOUTUBE_COURSE=$(curl -s -X POST "$BASE_URL/api/courses" \
          -H "Content-Type: application/json" \
          -d "{
            \"title\": \"Khóa học 3D IoT với YouTube Video\",
            \"description\": \"Khóa học sử dụng video YouTube để học 3D IoT\",
            \"instructorName\": \"Giảng viên YouTube\",
            \"durationMinutes\": 180,
            \"lessonsCount\": 5,
            \"level\": \"beginner\",
            \"price\": 0,
            \"status\": \"published\",
            \"curriculum\": [
              {
                \"title\": \"Bài 1: Giới thiệu 3D IoT\",
                \"description\": \"Tìm hiểu cơ bản về 3D IoT\",
                \"duration\": 45,
                \"type\": \"video\",
                \"youtubeId\": \"LpUWKnEguB0\",
                \"youtubeUrl\": \"$YOUTUBE_VIDEO\"
              },
              {
                \"title\": \"Bài 2: Thực hành cơ bản\",
                \"description\": \"Thực hành các kỹ năng cơ bản\",
                \"duration\": 40,
                \"type\": \"video\",
                \"youtubeId\": \"LpUWKnEguB0\",
                \"youtubeUrl\": \"$YOUTUBE_VIDEO\"
              },
              {
                \"title\": \"Bài 3: Ứng dụng thực tế\",
                \"description\": \"Áp dụng vào các dự án thực tế\",
                \"duration\": 50,
                \"type\": \"video\",
                \"youtubeId\": \"LpUWKnEguB0\",
                \"youtubeUrl\": \"$YOUTUBE_VIDEO\"
              }
            ]
          }")
        
        YOUTUBE_COURSE_ID=$(echo $YOUTUBE_COURSE | jq -r '.data.id' 2>/dev/null || echo "failed")
        echo "✅ YouTube course: $YOUTUBE_COURSE_ID"
        
        # 2. Course với online link
        echo "🔗 Creating online link course..."
        ONLINE_COURSE=$(curl -s -X POST "$BASE_URL/api/courses" \
          -H "Content-Type: application/json" \
          -d "{
            \"title\": \"Khóa học 3D IoT Online Link\",
            \"description\": \"Khóa học sử dụng online link để học 3D IoT\",
            \"instructorName\": \"Giảng viên Online\",
            \"durationMinutes\": 240,
            \"lessonsCount\": 6,
            \"level\": \"intermediate\",
            \"price\": 300000,
            \"status\": \"published\",
            \"curriculum\": [
              {
                \"title\": \"Bài 1: Tổng quan Online Learning\",
                \"description\": \"Giới thiệu về học tập online\",
                \"duration\": 60,
                \"type\": \"link\",
                \"onlineLink\": \"$YOUTUBE_VIDEO\"
              },
              {
                \"title\": \"Bài 2: Kỹ thuật nâng cao\",
                \"description\": \"Học các kỹ thuật nâng cao\",
                \"duration\": 50,
                \"type\": \"link\",
                \"onlineLink\": \"$YOUTUBE_VIDEO\"
              },
              {
                \"title\": \"Bài 3: Dự án cuối khóa\",
                \"description\": \"Thực hiện dự án cuối khóa\",
                \"duration\": 90,
                \"type\": \"link\",
                \"onlineLink\": \"$YOUTUBE_VIDEO\"
              }
            ]
          }")
        
        ONLINE_COURSE_ID=$(echo $ONLINE_COURSE | jq -r '.data.id' 2>/dev/null || echo "failed")
        echo "✅ Online link course: $ONLINE_COURSE_ID"
        
        # Đăng ký cho course YouTube (miễn phí)
        if [ "$YOUTUBE_COURSE_ID" != "failed" ] && [ "$YOUTUBE_COURSE_ID" != "null" ]; then
            echo "📖 Enrolling in YouTube course..."
            ENROLL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/course-enrollments" \
              -H "Content-Type: application/json" \
              -d "{
                \"courseId\": \"$YOUTUBE_COURSE_ID\",
                \"email\": \"$EMAIL\",
                \"name\": \"Nguyễn Văn Test\",
                \"phone\": \"0123456789\"
              }")
            
            ENROLL_ID=$(echo $ENROLL_RESPONSE | jq -r '.data.id' 2>/dev/null || echo "failed")
            echo "✅ YouTube course enrollment: $ENROLL_ID"
        fi
        
        # Đăng ký cho course online link (có phí - sẽ pending)
        if [ "$ONLINE_COURSE_ID" != "failed" ] && [ "$ONLINE_COURSE_ID" != "null" ]; then
            echo "📖 Enrolling in online link course (will be pending)..."
            ENROLL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/course-enrollments" \
              -H "Content-Type: application/json" \
              -d "{
                \"courseId\": \"$ONLINE_COURSE_ID\",
                \"email\": \"$EMAIL\",
                \"name\": \"Nguyễn Văn Test\",
                \"phone\": \"0123456789\"
              }")
            
            ENROLL_ID=$(echo $ENROLL_RESPONSE | jq -r '.data.id' 2>/dev/null || echo "failed")
            echo "✅ Online course enrollment (pending): $ENROLL_ID"
        fi
        ;;

    3)
        echo "📞 Testing Contact + News..."
        
        # Test liên hệ hỗ trợ
        echo "📧 Testing contact support..."
        CONTACT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/contacts" \
          -H "Content-Type: application/json" \
          -d "{
            \"name\": \"Nguyễn Văn Test\",
            \"email\": \"$EMAIL\",
            \"phone\": \"0123456789\",
            \"message\": \"Đây là tin nhắn test từ script curl để kiểm tra chức năng liên hệ hỗ trợ của hệ thống 3DIoT\",
            \"type\": \"support\"
          }")
        
        CONTACT_ID=$(echo $CONTACT_RESPONSE | jq -r '.data.id' 2>/dev/null || echo "failed")
        echo "✅ Contact support: $CONTACT_ID"
        echo "Contact response: $CONTACT_RESPONSE"
        
        # Test tạo tin tức
        echo "📰 Testing news creation..."
        NEWS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/news" \
          -H "Content-Type: application/json" \
          -d '{
            "title": "Tin tức test từ script curl",
            "content": "Đây là nội dung tin tức test được tạo từ script curl để kiểm tra chức năng tin tức của hệ thống 3DIoT",
            "author": "Script Test",
            "category": "technology",
            "status": "published",
            "featured": false,
            "tags": ["test", "3diot", "curl", "automation"]
          }')
        
        NEWS_ID=$(echo $NEWS_RESPONSE | jq -r '.data.id' 2>/dev/null || echo "failed")
        echo "✅ News created: $NEWS_ID"
        echo "News response: $NEWS_RESPONSE"
        
        # Test newsletter subscription
        echo "📬 Testing newsletter subscription..."
        NEWSLETTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/newsletter" \
          -H "Content-Type: application/json" \
          -d "{
            \"email\": \"$EMAIL\",
            \"name\": \"Nguyễn Văn Test\"
          }")
        
        NEWSLETTER_ID=$(echo $NEWSLETTER_RESPONSE | jq -r '.data.id' 2>/dev/null || echo "failed")
        echo "✅ Newsletter subscription: $NEWSLETTER_ID"
        echo "Newsletter response: $NEWSLETTER_RESPONSE"
        
        # Test lấy danh sách tin tức
        echo "📋 Testing news list..."
        NEWS_LIST=$(curl -s -X GET "$BASE_URL/api/news")
        echo "News list: $NEWS_LIST"
        ;;

    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Test completed!"
echo "🌐 Check your app at: http://localhost:3000"
echo "📱 My Events: http://localhost:3000/my-events"
echo "👨‍💼 Admin: http://localhost:3000/admin"
