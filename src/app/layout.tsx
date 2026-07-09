import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'ヘアーサロンSHINSEI | さいたま市見沼区七里のプライベート理容室',
  description: 'さいたま市見沼区七里にある完全プライベート空間の理容室。熟練のオーナーがマンツーマンで丁寧なカットと癒やしの時間を提供します。24時間WEB予約受付中。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <header className="header">
          <div className="container header-content">
            <div className="logo">
              <a href="/">SHINSEI</a>
            </div>
            <nav className="nav">
              <a href="/#concept">こだわり</a>
              <a href="/#menu">メニュー</a>
              <a href="/#access">アクセス</a>
              <div id="google_translate_element" style={{ display: 'inline-block', marginLeft: '15px' }}></div>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <div className="container">
            <p>&copy; 2026 ヘアーサロンSHINSEI. All rights reserved.</p>
          </div>
        </footer>
        
        <Script id="google-translate-init" strategy="beforeInteractive">
          {`
            function googleTranslateElementInit() {
              new window.google.translate.TranslateElement({
                pageLanguage: 'ja',
                includedLanguages: 'en',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="lazyOnload" />
      </body>
    </html>
  );
}
