import type { Metadata, Viewport } from "next";
import { Inter, Open_Sans, Poppins } from "next/font/google";
import { Provider } from "@/components/Provider";
import { Shell } from "@/components/Shell";
import "./globals.css";

const openSans = Open_Sans({ variable: "--font-open-sans", subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "RATEM Club Hub",
  description: "Frontend prototype of the RATEM Club Hub",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${openSans.variable} ${inter.variable} ${poppins.variable}`}>
      <body>
        <Provider>
          <Shell>{children}</Shell>
        </Provider>
      </body>
    </html>
  );
}
