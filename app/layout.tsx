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
      <head>
        <script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1" async />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.__onGCastApiAvailable = function(isAvailable) {
              if (isAvailable) {
                cast.framework.CastContext.getInstance().setOptions({
                  receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                  autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGINAL_SCOPE
                });
              }
            };
          `
        }} />
      </head>
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
