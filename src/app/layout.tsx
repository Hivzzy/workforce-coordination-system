import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { MuiThemeProvider } from "./theme-provider";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kembang Tasik — Workforce Coordination System",
    template: "%s | Kembang Tasik",
  },
  description: "Sistem Koordinasi Lapangan Real-Time, Manajemen Tugas Staf, Permintaan Isi Ulang Logistik & Alarm Emergensi — Kembang Tasik Wedding & Catering Organizer",
  keywords: [
    "Kembang Tasik",
    "Workforce Coordination System",
    "Manajemen Staf Lapangan",
    "Real-time Emergency Alarm",
    "Event Organizer System",
    "Catering Workforce Management",
  ],
  authors: [{ name: "Kembang Tasik Development Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Kembang Tasik — Workforce Coordination System",
    description: "Pusat Koordinasi Operasional Lapangan & Manajemen Staf Real-Time Kembang Tasik",
    type: "website",
    locale: "id_ID",
    siteName: "Kembang Tasik Workforce System",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kembang Tasik — Workforce Coordination System",
    description: "Pusat Koordinasi Operasional Lapangan & Manajemen Staf Real-Time Kembang Tasik",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kembang Tasik System",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MuiThemeProvider>{children}</MuiThemeProvider>
      </body>
    </html>
  );
}
