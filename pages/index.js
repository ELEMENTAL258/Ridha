import { Instagram, Youtube, Twitter, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';

const Sparkle = ({ style }) => (
  <div 
    className="absolute w-2 h-2 bg-white rounded-full animate-twinkle"
    style={style}
  />
);

const ProfilePage = () => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const generateSparkles = () => {
      const newSparkles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        style: {
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          opacity: Math.random(),
        }
      }));
      setSparkles(newSparkles);
    };

    generateSparkles();
    const interval = setInterval(generateSparkles, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-red-800 via-red-600 to-red-400">
      {/* Sparkles */}
      {sparkles.map((sparkle) => (
        <Sparkle key={sparkle.id} style={sparkle.style} />
      ))}
      
      <main className="max-w-3xl mx-auto px-4 py-16 relative z-10">
        {/* Profile Image with glow effect */}
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 bg-red-300 rounded-full blur-md animate-pulse" />
            <img
              src="https://qu.ax/bQEdt.jpg"
              alt="Profile Picture"
              className="relative rounded-full shadow-lg border-4 border-white"
            />
          </div>
        </div>

        {/* Introduction with fade-in animation */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold mb-4 text-white">John Doe</h1>
          <p className="text-xl text-red-100 mb-6">
            Web Developer & Digital Creator
          </p>
          <p className="text-red-100 leading-relaxed max-w-2xl mx-auto">
            Hai! Namaku Ridha, dan aku adalah seorang web developer dan pengembang bot whatsapp pemula.
            Aku memiliki pengalaman dari teman teman saya yang mengajarkan dan belajar otodidak. karena rasa penasaran dan keinginan mempelajari hal baru, aku jadi semangat belajar hal baru.
          </p>
        </div>

        {/* Social Media Links with hover animation */}
        <div className="space-y-4 max-w-md mx-auto">
          <a
            href="https://instagram.com/fathy847"
            className="flex items-center p-4 bg-white/10 backdrop-blur-sm text-white rounded-lg shadow-md hover:scale-105 hover:bg-white/20 transition-all duration-300"
          >
            <Instagram className="w-6 h-6 mr-3" />
            <span className="font-medium">Follow on Instagram</span>
          </a>

          <a
            href="https://youtube.com/@ELEMENTALGOO"
            className="flex items-center p-4 bg-white/10 backdrop-blur-sm text-white rounded-lg shadow-md hover:scale-105 hover:bg-white/20 transition-all duration-300"
          >
            <Youtube className="w-6 h-6 mr-3" />
            <span className="font-medium">Subscribe on YouTube</span>
          </a>

          <a
            href="https://x.com/ElementalGoo?t=P-6WPtrV75ZiKZDt-4y_Mg&s=09"
            className="flex items-center p-4 bg-white/10 backdrop-blur-sm text-white rounded-lg shadow-md hover:scale-105 hover:bg-white/20 transition-all duration-300"
          >
            <Twitter className="w-6 h-6 mr-3" />
            <span className="font-medium">Follow on Twitter or X</span>
          </a>

          <a
            href="https://wa.me/6287870946702"
            className="flex items-center p-4 bg-white/10 backdrop-blur-sm text-white rounded-lg shadow-md hover:scale-105 hover:bg-white/20 transition-all duration-300"
          >
            <Phone className="w-6 h-6 mr-3" />
            <span className="font-medium">Owner Ridha</span>
          </a>

          <a
            href="https://wa.me/6287757267678"
            className="flex items-center p-4 bg-white/10 backdrop-blur-sm text-white rounded-lg shadow-md hover:scale-105 hover:bg-white/20 transition-all duration-300"
          >
            <Phone className="w-6 h-6 mr-3" />
            <span className="font-medium">Bot Whatsapp</span>
          </a>
        </div>
      </main>
    </div>
  );
};

// Add required keyframes
const styles = `
  @keyframes twinkle {
    0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
    50% { transform: scale(1) rotate(180deg); opacity: 1; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-twinkle {
    animation: twinkle 3s infinite;
  }

  .animate-fadeIn {
    animation: fadeIn 1s ease-out forwards;
  }
`;

// Add styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default ProfilePage;

