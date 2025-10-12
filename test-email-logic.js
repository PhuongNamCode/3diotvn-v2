// Test Email Logic for Event Registration
const { generateRegistrationPendingEmail } = require('./lib/email/templates/registrationPending.ts');
const { generateRegistrationConfirmEmail } = require('./lib/email/templates/registrationConfirm.ts');

// Test data for paid event with online link
const testEventData = {
  userName: "Nguyễn Văn Test",
  userEmail: "test@example.com",
  eventTitle: "Workshop ESP32 Advanced - Kết nối WiFi và Cloud",
  eventDate: "2025-12-20",
  eventTime: "14:00 - 17:00",
  eventLocation: "Online - Zoom Meeting",
  eventPrice: 200000,
  transactionId: "TXN123456789",
  onlineLink: "https://zoom.us/j/123456789"
};

console.log("=== EMAIL LOGIC TEST ===\n");

console.log("1. EMAIL CHỜ DUYỆT (KHÔNG có link online):");
console.log("==========================================");
const pendingEmail = generateRegistrationPendingEmail(testEventData);
console.log("HTML contains onlineLink:", pendingEmail.html.includes("Link online"));
console.log("Text contains onlineLink:", pendingEmail.text.includes("Link online"));
console.log("Note about link:", pendingEmail.html.includes("kèm link tham gia online"));

console.log("\n2. EMAIL XÁC NHẬN (CÓ link online):");
console.log("==================================");
const confirmEmail = generateRegistrationConfirmEmail(testEventData);
console.log("HTML contains onlineLink:", confirmEmail.html.includes("https://zoom.us/j/123456789"));
console.log("Text contains onlineLink:", confirmEmail.text.includes("https://zoom.us/j/123456789"));
console.log("Note about admin approval:", confirmEmail.html.includes("Đã được admin duyệt"));

console.log("\n=== TEST COMPLETED ===");
