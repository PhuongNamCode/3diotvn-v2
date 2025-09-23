export type NewsItem = {
  date: string; // ISO date string
  title: string;
  source: string;
  category: "embedded" | "iot" | "hardware" | string;
  summary: string;
  link: string;
};

export const newsData: NewsItem[] = [
  { date: "2025-09-17", title: "RISC-V processors gaining momentum in IoT applications", source: "Electronics Weekly", category: "embedded", summary: "Bộ xử lý RISC-V đang được ứng dụng rộng rãi trong các thiết bị IoT nhờ tính mở và hiệu quả năng lượng.", link: "https://electronicsweekly.com/risc-v-iot-momentum-2025" },
  { date: "2025-09-16", title: "Matter 1.3 standard released with enhanced device interoperability", source: "The Verge", category: "iot", summary: "Tiêu chuẩn Matter 1.3 được phát hành với khả năng tương tác thiết bị được cải thiện đáng kể.", link: "https://theverge.com/matter-1-3-standard-release-2025" },
  { date: "2025-09-15", title: "Samsung announces new Exynos chip with built-in AI accelerator", source: "Android Authority", category: "hardware", summary: "Samsung ra mắt chip Exynos mới tích hợp bộ gia tốc AI chuyên dụng cho các ứng dụng IoT và mobile.", link: "https://androidauthority.com/samsung-exynos-ai-accelerator-2025" }
];


