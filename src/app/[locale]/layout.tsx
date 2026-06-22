import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import "./globals.css";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
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
    <SessionProvider>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <div className="min-h-screen flex flex-col">
          <TopBar />
          <div className="pt-16 flex-grow">
            {children}
          </div>
          <Footer />
        </div>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
