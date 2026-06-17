import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "C&B Mart | ঘর সাজাতে আপনার সাথে",
  description: "Shop premium home decor, luxury bedding, and essentials at C&B Mart. ঘর সাজাতে আপনার সাথে। Express shipping, Cash on Delivery, and 100% security guaranteed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
      </head>
      <body className={`${openSans.variable} font-sans bg-zinc-50 text-zinc-900 min-h-screen flex flex-col`}>
        <AuthProvider>
          <CartProvider>
            <main className="flex-1 flex flex-col">{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
