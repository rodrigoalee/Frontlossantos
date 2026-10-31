import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Los Santos Customs",
  description: "Taller mecánico Los Santos Customs",
  appleWebApp: { title: "LS Customs", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#3e0e09",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-theme="lossantos" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-base-100 font-sans text-base-content">
        <main className="flex flex-1 flex-col">{children}</main>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
