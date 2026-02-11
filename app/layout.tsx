import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "홍봇 vs. 홍근 - 서울시장 AI 가상 토론",
  description:
    "AI 후보 홍봇과 인간 정치인 홍근의 서울시장 가상 토론 시뮬레이션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen bg-navy-950">
        {children}
      </body>
    </html>
  );
}
