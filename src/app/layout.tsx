import type { Metadata } from "next";
import { Inter, Poppins, Roboto } from 'next/font/google';
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "FileCloud",
  description: "Store and Manage Files/Folders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} ${roboto.variable} bg-surface`}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
