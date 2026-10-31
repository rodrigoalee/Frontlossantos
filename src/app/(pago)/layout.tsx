import "bootstrap/dist/css/bootstrap.min.css";
import "./pasarela.css";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";

// Layout raíz propio: la pasarela usa Bootstrap, que choca con las clases de daisyUI del resto del sitio.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pago | Los Santos Customs",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#3e0e09",
};

export default function PagoLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={poppins.variable}>
      <body className="pasarela">{children}</body>
    </html>
  );
}
