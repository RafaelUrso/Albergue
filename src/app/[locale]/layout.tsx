import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import "./globals.css";
import TopBar from "@/components/TopBar";
import SessionProvider from "@/components/providers/SessionProvider";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased">
        <SessionProvider>
          <NextIntlClientProvider messages={messages}>
            <TopBar />
            <div className="pt-16">
              {children}
            </div>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
