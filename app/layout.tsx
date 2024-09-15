import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reunião de Estudo",
  description: "Vídeo conferência - Curitiba",
  robots: {
    index: false,
    follow: false
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  openGraph: {
    title: 'Reunião de Estudo',
    description: 'Vídeo conferência - Curitiba'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
