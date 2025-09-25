import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Admin Dashboard - 3DIoT Community",
  description: "Quản lý hệ thống 3DIoT Community",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use fragment so this layout composes within RootLayout's html/body and inherits data-theme
  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/chart.js" strategy="afterInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" strategy="afterInteractive" />
      {children}
    </>
  );
}
