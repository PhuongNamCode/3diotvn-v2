export type EventItem = {
  id: number;
  title: string;
  date: string; // ISO date string
  time: string;
  location: string;
  description: string;
  registered: number;
  capacity: number;
  image: string; // icon class for now
  status: "upcoming" | "past";
};

export const eventsData: EventItem[] = [
  { id: 1, title: "IoT Security Workshop", date: "2025-10-15", time: "09:00 - 17:00", location: "HCMC Tech Hub", description: "Tìm hiểu về bảo mật trong hệ thống IoT và cách phòng chống các lỗ hổng thường gặp.", registered: 45, capacity: 60, image: "fas fa-shield-alt", status: "upcoming" },
  { id: 2, title: "ESP32 Advanced Programming", date: "2025-09-28", time: "14:00 - 18:00", location: "Online via Zoom", description: "Khóa học nâng cao về lập trình ESP32, wifi mesh và bluetooth.", registered: 120, capacity: 100, image: "fas fa-microchip", status: "past" },
  { id: 3, title: "AI on Edge Devices", date: "2025-10-22", time: "13:00 - 16:00", location: "RMIT University", description: "Triển khai mô hình AI trên thiết bị nhúng với TensorFlow Lite.", registered: 25, capacity: 40, image: "fas fa-brain", status: "upcoming" },
  { id: 4, title: "PCB Design Fundamentals", date: "2025-09-20", time: "09:00 - 12:00", location: "FPT University", description: "Cơ bản về thiết kế PCB với Altium Designer.", registered: 85, capacity: 80, image: "fas fa-project-diagram", status: "past" },
  { id: 5, title: "3DIoT Hackathon 2025", date: "2025-11-05", time: "08:00 - 22:00", location: "HCMC University of Technology", description: "Cuộc thi hackathon 48h với chủ đề Smart City Solutions.", registered: 150, capacity: 200, image: "fas fa-trophy", status: "upcoming" },
  { id: 6, title: "Embedded Linux Workshop", date: "2025-10-08", time: "10:00 - 16:00", location: "VNU-HCM", description: "Tìm hiểu về Embedded Linux và Yocto Project.", registered: 35, capacity: 50, image: "fab fa-linux", status: "upcoming" }
];


