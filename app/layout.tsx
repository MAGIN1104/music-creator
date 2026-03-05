
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Worship Songs",
  description: "Gestión de canciones de alabanza",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
