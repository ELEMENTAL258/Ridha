import { SpeedInsights } from "@vercel/speed-insights/react";
import { Instagram, Youtube, Twitter, Phone } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const ProfilePage = () => {
  const [showButtons, setShowButtons] = useState(false);
  const buttonsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShowButtons(true);
        }
      },
      { threshold: 0.3 }
    );

    if (buttonsRef.current) {
      observer.observe(buttonsRef.current);
    }

    return () => {
      if (buttonsRef.current) {
        observer.unobserve(buttonsRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-red-800 via-red-600 to-red-400 pb-32">
      <SpeedInsights /> 

      <main className="max-w-3xl mx-auto px-4 py-16 relative z-10">
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 bg-red-300 rounded-full blur-md animate-pulse" />
            <img
              src="https://qu.ax/bQEdt.jpg"
              alt="Profile Picture"
              className="relative rounded-full shadow-lg border-4 border-white w-48 h-48 object-cover"
            />
          </div>
        </div>

        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold mb-4 text-white">RIDHA SUKA HUTAO</h1>
          <p className="text-xl text-red-100 mb-6">
            Web Developer & Digital Creator
          </p>
          <p className="text-red-100 leading-relaxed max-w-2xl mx-auto">
            Hai! Namaku Ridha, dan aku adalah seorang web developer dan pengembang bot WhatsApp pemula.
          </p>
        </div>

        {/* Social Media Links with Animation */}
        <div ref={buttonsRef} className="space-y-4 max-w-md mx-auto">
          {[
            { href: "https://instagram.com/fathy_847", icon: Instagram, text: "Follow on Instagram" },
            { href: "https://youtube.com/@ELEMENTALGOO", icon: Youtube, text: "Subscribe on YouTube" },
            { href: "https://x.com/ElementalGoo?t=P-6WPtrV75ZiKZDt-4y_Mg&s=09", icon: Twitter, text: "Follow on Twitter or X" },
            { href: "https://wa.me/6287870946702", icon: Phone, text: "Owner Ridha" },
            { href: "https://wa.me/6287757267678", icon: Phone, text: "Bot WhatsApp" },
          ].map((button, index) => (
            <a
              key={index}
              href={button.href}
              className={`flex items-center p-4 bg-white/10 backdrop-blur-sm text-white rounded-lg shadow-md transition-all duration-500 ease-out ${
                showButtons ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <button.icon className="w-6 h-6 mr-3" />
              <span className="font-medium">{button.text}</span>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;