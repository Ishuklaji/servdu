import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ServdU - AI Recipes Platform",
  description:
    "AI-powered recipe platform for personalized meal planning and cooking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <footer className="py-8 px-4 border-t">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-center items-center gap-6">
            <p className="text-stone-500 text-sm">Made with 💗 by Ishuklaji</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
