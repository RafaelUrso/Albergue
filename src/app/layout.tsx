import { defaultLocale } from "@/i18n/config";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang={defaultLocale}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
