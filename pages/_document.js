import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Ridha Suka Hutao - Web Developer & Digital Creator Portfolio with Music Player" />
        <meta name="theme-color" content="#dc2626" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ridha Portfolio" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        
        {/* Preload important resources */}
        <link rel="preload" href="/bgm.mp3" as="audio" type="audio/mp3" />
        
        {/* Open Graph Tags for social sharing */}
        <meta property="og:title" content="Ridha Suka Hutao - Portfolio" />
        <meta property="og:description" content="Web Developer & Digital Creator with Spotify-like Music Player" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/icon-512.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}