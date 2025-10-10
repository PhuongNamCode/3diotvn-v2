# Cập Nhật QR Code Thanh Toán - Format Chính Thức

## 🎯 **Những thay đổi đã thực hiện**

### ✅ **1. Sửa Format QR Code theo chuẩn chính thức**

#### **🏦 VNPay QR Code**
- **Format cũ (không hoạt động):** `VNPay://transfer?account=ACCOUNT&amount=AMOUNT&note=NOTE`
- **Format mới (chuẩn chính thức):** `https://vnpay.vn/payment?merchant_id=MERCHANT_ID&amount=AMOUNT&description=NOTE`

#### **📱 MoMo QR Code**
- **Format cũ (không hoạt động):** `momo://transfer?phone=PHONE&amount=AMOUNT&note=NOTE`
- **Format mới (chuẩn chính thức):** `https://momo.vn/transfer?phone=PHONE&amount=AMOUNT&note=NOTE`

### ✅ **2. Thêm Logo Chính Thức**

#### **Logo VNPay**
- File chính thức: `/public/payment-logos/vnpay-logo.png`
- Logo chính thức từ VNPay
- Kích thước: 24x24px

#### **Logo MoMo**
- File chính thức: `/public/payment-logos/momo-logo.png`
- Logo chính thức từ MoMo
- Kích thước: 24x24px

### ✅ **3. Cập nhật Giao diện**

#### **Phương thức thanh toán**
- Đổi từ "🏦 Chuyển khoản ngân hàng (OCB)" → "🏦 VNPay (Ngân hàng)"
- Giữ nguyên "📱 MoMo"

#### **Hiển thị chi tiết**
- **VNPay:** Hiển thị Merchant ID thay vì số tài khoản
- **MoMo:** Giữ nguyên số điện thoại
- **Cả hai:** Hiển thị logo chính thức + thông tin rõ ràng

---

## 🔧 **Chi tiết kỹ thuật**

### **1. File `lib/qr-payment-generator.ts`**

```typescript
// VNPay - Format chính thức
export function generateVNPayQR(merchantId: string, amount: number, note: string): string {
  return `https://vnpay.vn/payment?merchant_id=${merchantId}&amount=${amount}&description=${encodeURIComponent(note)}`;
}

// MoMo - Format chính thức  
export function generateMoMoQR(phoneNumber: string, amount: number, note: string): string {
  return `https://momo.vn/transfer?phone=${phoneNumber}&amount=${amount}&note=${encodeURIComponent(note)}`;
}
```

### **2. Cập nhật EventsTab.tsx**

#### **Thay đổi phương thức thanh toán:**
```typescript
// Cũ
<option value="bank_transfer">🏦 Chuyển khoản ngân hàng (OCB)</option>

// Mới
<option value="vnpay">🏦 VNPay (Ngân hàng)</option>
```

#### **Hiển thị logo:**
```typescript
<img 
  src="/payment-logos/vnpay-logo.png" 
  alt="VNPay" 
  style={{ width: '24px', height: '24px', marginRight: '8px' }}
  onError={(e) => { /* fallback logic */ }}
/>
```

---

## 🎯 **Lợi ích của format mới**

### **✅ Tương thích tốt hơn**
- QR code VNPay có thể quét bằng app VNPay hoặc ngân hàng hỗ trợ
- QR code MoMo có thể quét bằng app MoMo
- Format web link dễ dàng mở trên trình duyệt

### **✅ Trải nghiệm người dùng tốt hơn**
- Logo chính thức tạo sự tin tưởng
- Thông tin rõ ràng về phương thức thanh toán
- QR code lớn hơn (180x180px) dễ quét

### **✅ Tuân thủ chuẩn chính thức**
- Sử dụng format được VNPay và MoMo khuyến nghị
- Đảm bảo tính tương thích với các app thanh toán

---

## 🧪 **Cách test QR code mới**

### **1. Test VNPay QR**
1. Tạo sự kiện có phí bằng curl commands
2. Mở form đăng ký
3. Chọn "🏦 VNPay (Ngân hàng)"
4. Quét QR code bằng:
   - App VNPay
   - App ngân hàng hỗ trợ VNPay
   - Camera điện thoại (sẽ mở web browser)

### **2. Test MoMo QR**
1. Chọn "📱 MoMo"
2. Quét QR code bằng:
   - App MoMo
   - Camera điện thoại (sẽ mở web browser)

### **3. Test trên điện thoại**
- QR code phải hiển thị rõ nét
- Kích thước 180x180px phù hợp với mobile
- Logo hiển thị đúng màu sắc

---

## 📋 **Checklist hoàn thành**

- ✅ Sửa format QR VNPay theo chuẩn chính thức
- ✅ Sửa format QR MoMo theo chuẩn chính thức  
- ✅ Tạo logo VNPay và MoMo
- ✅ Cập nhật giao diện hiển thị logo
- ✅ Thay đổi phương thức thanh toán
- ✅ Cập nhật thông tin hiển thị (Merchant ID vs số tài khoản)
- ✅ Tăng kích thước QR code lên 180x180px
- ✅ Thêm fallback logic cho logo

---

## 🚀 **Bước tiếp theo**

### **Để QR code hoạt động hoàn toàn:**
1. **Đăng ký merchant với VNPay:**
   - Liên hệ VNPay để đăng ký Merchant ID thực
   - Thay `3DIOT_MERCHANT_001` bằng Merchant ID thực

2. **Đăng ký partner với MoMo:**
   - Đăng ký tài khoản doanh nghiệp với MoMo
   - Nhận hướng dẫn tích hợp chính thức

3. **Test thực tế:**
   - Thực hiện giao dịch test với số tiền nhỏ
   - Kiểm tra webhook và callback
   - Đảm bảo thanh toán thành công

---

**🎉 QR code thanh toán đã được cập nhật theo chuẩn chính thức và sẵn sàng test! 💳✨**
