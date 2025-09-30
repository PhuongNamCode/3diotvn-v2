# Test Chức Năng Xuất Excel - Admin Panel

## 🔧 **Các vấn đề đã được fix:**

### **1. AdminRegistrationsTab.tsx** ✅
- **Trước:** Chỉ có fake function hiển thị notification
- **Sau:** Xuất Excel thực sự với đầy đủ thông tin đăng ký
- **File xuất:** `danh_sach_dang_ky_{eventFilter}_{date}.xlsx`
- **Nội dung:** Sự kiện, Họ tên, Email, SĐT, Tổ chức, Kinh nghiệm, Mong đợi, Trạng thái, Ngày đăng ký

### **2. AdminEventsTab.tsx** ✅
- **Trước:** Chỉ có fake function hiển thị notification
- **Sau:** Xuất Excel với 2 sheet (Thông tin sự kiện + Danh sách đăng ký)
- **File xuất:** `su_kien_{eventName}_{date}.xlsx`
- **Sheet 1:** Thông tin sự kiện (tên, ngày, địa điểm, sức chứa, số đăng ký, số tham gia thực tế, trạng thái)
- **Sheet 2:** Danh sách đăng ký chi tiết

### **3. AdminContactsTab.tsx** ✅
- **Trước:** Chỉ xuất CSV
- **Sau:** Xuất Excel với đầy đủ thông tin liên hệ
- **File xuất:** `danh_sach_lien_he_{date}.xlsx`
- **Nội dung:** Tên, Email, SĐT, Công ty, Chức vụ, Loại liên hệ, Trạng thái, Độ ưu tiên, Nội dung, Ngày tạo, Ngày cập nhật

### **4. API Registrations** ✅
- **Thêm:** Hỗ trợ filter theo eventId với query parameter `?eventId={id}`
- **Endpoint:** `/api/registrations?eventId={eventId}`

## 🧪 **Hướng dẫn test:**

### **Bước 1: Truy cập Admin Panel**
```bash
# Đảm bảo server đang chạy
npm run dev

# Truy cập: http://localhost:3000/admin
```

### **Bước 2: Test Xuất Excel - Registrations**
1. Vào tab **"Quản lý đăng ký"**
2. Chọn filter sự kiện (hoặc "Tất cả sự kiện")
3. Click button **"Xuất Excel"** (màu xanh lá)
4. Kiểm tra file `danh_sach_dang_ky_*.xlsx` được download

### **Bước 3: Test Xuất Excel - Events**
1. Vào tab **"Quản lý sự kiện"**
2. Tìm sự kiện có status **"Đã diễn ra"** (past)
3. Click button **"Xuất dữ liệu"** (icon download, màu xanh lá)
4. Kiểm tra file `su_kien_*.xlsx` với 2 sheet được download

### **Bước 4: Test Xuất Excel - Contacts**
1. Vào tab **"Quản lý liên hệ"**
2. Click button **"Xuất Excel"** (màu xám)
3. Kiểm tra file `danh_sach_lien_he_*.xlsx` được download

## 🎯 **Features mới:**

### **Smart Error Handling:**
- Kiểm tra XLSX library có load chưa
- Hiển thị notification lỗi cụ thể
- Fallback graceful nếu có lỗi

### **Rich Excel Export:**
- **Column sizing** tự động
- **Multiple sheets** (cho events)
- **Vietnamese column headers**
- **Formatted data** (dates, status badges)
- **Meaningful filenames** với timestamp

### **Data Filtering:**
- Events: Xuất theo từng sự kiện cụ thể
- Registrations: Filter theo sự kiện
- Contacts: Xuất tất cả hoặc theo search

## 🐛 **Potential Issues & Solutions:**

### **Issue 1: "Thư viện XLSX chưa được tải"**
**Cause:** Script XLSX từ CDN chưa load xong
**Solution:** Đợi vài giây rồi thử lại, hoặc refresh page

### **Issue 2: "Không tìm thấy sự kiện"**
**Cause:** EventID không tồn tại
**Solution:** Kiểm tra data events trong database

### **Issue 3: File không download**
**Cause:** Browser block download hoặc popup blocker
**Solution:** Allow downloads cho localhost trong browser settings

### **Issue 4: Excel file corrupted**
**Cause:** Data encoding issues
**Solution:** Kiểm tra data có ký tự đặc biệt không

## 🔍 **Debug Commands:**

```bash
# Test API registrations
curl "http://localhost:3000/api/registrations" | jq

# Test API registrations with eventId filter
curl "http://localhost:3000/api/registrations?eventId=YOUR_EVENT_ID" | jq

# Test API events
curl "http://localhost:3000/api/events" | jq

# Test API contacts
curl "http://localhost:3000/api/contacts" | jq
```

## ✅ **Expected Results:**

1. **Registrations Export:**
   - File: `danh_sach_dang_ky_tatca_2025-01-01.xlsx`
   - Contains: 9 columns with Vietnamese headers
   - Data: All filtered registrations

2. **Events Export:**
   - File: `su_kien_EventName_2025-01-01.xlsx`
   - Sheet 1: "Thông tin sự kiện" (8 rows of event details)
   - Sheet 2: "Danh sách đăng ký" (all registrations for that event)

3. **Contacts Export:**
   - File: `danh_sach_lien_he_2025-01-01.xlsx`
   - Contains: 11 columns with comprehensive contact info
   - Data: All filtered contacts

## 🎉 **Summary:**

Chức năng xuất Excel đã được **hoàn toàn implement** và sẵn sàng sử dụng! Tất cả 3 modules (Registrations, Events, Contacts) đều có thể xuất Excel format thực sự với data đầy đủ và formatting đẹp.
