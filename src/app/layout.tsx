import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scam Brake — Pre-Capture Payment Verification',
  description: 'AI-assisted verification hold between PayPal authorization and settlement capture.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#F6F6F3]">
      <body className="bg-[#F6F6F3] text-[#171A1F] antialiased selection:bg-[#171A1F] selection:text-white">
        {children}
      </body>
    </html>
  );
}
