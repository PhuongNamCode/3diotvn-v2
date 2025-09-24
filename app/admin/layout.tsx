import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - 3DIoT Community",
  description: "Quản lý hệ thống 3DIoT Community",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
