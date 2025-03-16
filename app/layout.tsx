import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Nav from "@/components/nav";
export const metadata: Metadata = {
  title: "Tool box",
  description: "Random tools you might need",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Nav />
          <main className="pt-16">{children}</main>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
