import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Virtual Debate: SEOUL - 서울시장 가상 토론",
  description:
    "AI 상대 후보와 가상 토론을 진행하는 서울시장 선거 시뮬레이션",
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
