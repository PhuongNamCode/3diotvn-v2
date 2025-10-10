# Hướng Dẫn Sử Dụng QR Code Thanh Toán

## 🎯 Tổng Quan
Hệ thống đã được tích hợp QR code cho thanh toán VNPay và MoMo, giúp người dùng dễ dàng thanh toán chỉ với một lần quét mã.

## 📱 Tính Năng QR Code

### 1. **QR Code VNPay (Ngân hàng)**
- **Format**: `VNPay://transfer?account=ACCOUNT&amount=AMOUNT&note=NOTE`
- **Kích hoạt**: Tự động tạo khi mở form đăng ký sự kiện có phí
- **Cách sử dụng**: 
  - Mở app VNPay
  - Quét QR code
  - Xác nhận thông tin thanh toán
  - Hoàn tất giao dịch

### 2. **QR Code MoMo**
- **Format**: `momo://transfer?phone=PHONE&amount=AMOUNT&note=NOTE`
- **Kích hoạt**: Tự động tạo khi mở form đăng ký sự kiện có phí
- **Cách sử dụng**:
  - Mở app MoMo
  - Quét QR code
  - Xác nhận thông tin thanh toán
  - Hoàn tất giao dịch

## 🎨 Giao Diện QR Code

### 1. **Hiển thị tổng quan**
- 2 QR code hiển thị cạnh nhau (VNPay và MoMo)
- Kích thước: 120x120px
- Nền trắng với viền bo tròn
- Hướng dẫn rõ ràng cho từng phương thức

### 2. **Hiển thị chi tiết**
- QR code lớn hơn (150x150px) khi chọn phương thức cụ thể
- Thông tin thanh toán đầy đủ
- Hướng dẫn từng bước

## 🔧 Cấu Hình Kỹ Thuật

### 1. **Thư viện sử dụng**
```bash
npm install qrcode @types/qrcode
```

### 2. **Component QRCodeGenerator**
- Sử dụng Canvas để render QR code
- Hỗ trợ tùy chỉnh kích thước và style
- Tự động xử lý lỗi

### 3. **Utility Functions**
```typescript
// Tạo QR VNPay
generateVNPayQR(accountNumber, amount, note)

// Tạo QR MoMo  
generateMoMoQR(phoneNumber, amount, note)

// Tạo cả 2 QR code
generatePaymentQRCodes(bankAccount, momoPhone, amount, eventTitle, participantName)
```

## 📋 Quy Trình Thanh Toán

### 1. **Người dùng đăng ký sự kiện có phí**
1. Chọn sự kiện có giá > 0
2. Nhấn "Đăng ký tham gia"
3. Hệ thống tự động tạo QR code

### 2. **Hiển thị QR code**
1. 2 QR code hiển thị (VNPay + MoMo)
2. Thông tin thanh toán chi tiết
3. Hướng dẫn chuyển khoản thủ công

### 3. **Chọn phương thức thanh toán**
1. Chọn phương thức từ dropdown
2. QR code tương ứng hiển thị lớn hơn
3. Thông tin chi tiết cho phương thức đã chọn

### 4. **Hoàn tất thanh toán**
1. Quét QR code bằng app tương ứng
2. Xác nhận giao dịch
3. Nhập mã giao dịch vào form
4. Hoàn tất đăng ký

## 🎯 Lợi Ích

### 1. **Cho người dùng**
- ✅ Thanh toán nhanh chóng chỉ với 1 lần quét
- ✅ Không cần nhập thông tin thủ công
- ✅ Giảm thiểu lỗi nhập liệu
- ✅ Hỗ trợ cả VNPay và MoMo

### 2. **Cho quản trị viên**
- ✅ Theo dõi thanh toán dễ dàng
- ✅ Mã giao dịch được lưu tự động
- ✅ Giảm công việc xử lý thủ công
- ✅ Tăng tỷ lệ thanh toán thành công

## 🔄 Cập Nhật Tương Lai

### 1. **Tính năng có thể thêm**
- QR code cho ZaloPay
- QR code cho ViettelPay
- Tự động xác nhận thanh toán qua webhook
- Thông báo email/SMS khi thanh toán thành công

### 2. **Cải tiến UX**
- Animation khi tạo QR code
- Preview QR code trước khi hiển thị
- Copy link thanh toán
- Lưu lịch sử thanh toán

## 🛠️ Troubleshooting

### 1. **QR code không hiển thị**
- Kiểm tra thư viện qrcode đã được cài đặt
- Kiểm tra console để xem lỗi
- Đảm bảo dữ liệu đầu vào hợp lệ

### 2. **App không nhận diện QR code**
- Kiểm tra format QR code có đúng không
- Đảm bảo app được cập nhật phiên bản mới nhất
- Thử quét lại với khoảng cách phù hợp

### 3. **Thanh toán không thành công**
- Kiểm tra số dư tài khoản
- Kiểm tra thông tin người nhận
- Liên hệ hỗ trợ của app thanh toán

---

**🎉 Hệ thống QR code thanh toán đã sẵn sàng sử dụng!**
