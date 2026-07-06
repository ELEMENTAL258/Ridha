import '../styles/globals.css'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Register Service Worker untuk PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Detect jika app diinstall sebagai PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('Running as PWA');
    }

    // Handle before install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Bisa tampilkan install button kalau mau
      console.log('PWA install available');
    });
  }, []);

  return <Component {...pageProps} />
}

export default MyApp