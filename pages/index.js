import { SpeedInsights } from "@vercel/speed-insights/react";
import { Instagram, Youtube, Twitter, Phone, Home, Music } from "lucide-react";
import { useState, useEffect } from "react";

// Sparkle Component
const Sparkle = ({ style, color }) => (
  <div
    className="absolute w-2 h-2 rounded-full animate-twinkle"
    style={{ ...style, backgroundColor: color }}
  />
);

// Audio Player Component (Spotify-like)
const AudioPlayer = ({ isMusicPage = false }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handlePlayPause = () => {
    const audio = document.getElementById("main-audio");
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const audio = document.getElementById("main-audio");
    if (audio) {
      audio.currentTime = e.target.value;
      setCurrentTime(e.target.value);
    }
  };

  const handleVolumeChange = (e) => {
    const audio = document.getElementById("main-audio");
    if (audio) {
      audio.volume = e.target.value;
      setVolume(e.target.value);
    }
  };

  // Versi Mini Player (untuk beranda)
  if (!isMusicPage) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-black border-t border-gray-700 p-3 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Song Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <img
              src="/album-cover.jpg" // Ganti dengan path cover album Anda
              alt="Album Cover"
              className="w-12 h-12 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium text-sm truncate">Mind Games</p>
              <p className="text-gray-400 text-xs truncate">Sicksick</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4 flex-1 justify-center">
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <div className="w-3 h-3 bg-black"></div> // Pause icon sederhana
              ) : (
                <div className="w-0 h-0 border-l-[6px] border-l-black border-y-[4px] border-y-transparent ml-0.5"></div> // Play icon
              )}
            </button>
          </div>

          {/* Volume & Time */}
          <div className="flex items-center space-x-3 flex-1 justify-end">
            <div className="text-white text-xs hidden sm:block">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 accent-green-500 hidden md:block"
            />
          </div>
        </div>

        <audio
          id="main-audio"
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src="/bgm.mp3" type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  // Versi Full Music Page (Spotify-like)
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-32">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Album Art & Info */}
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8 mb-8">
          <img
            src="/album-cover.jpg" // Ganti dengan path cover album Anda
            alt="Album Cover"
            className="w-64 h-64 rounded-2xl shadow-2xl object-cover"
          />
          <div className="text-center md:text-left">
            <p className="text-green-500 font-semibold mb-2">SEDANG DIPUTAR</p>
            <h1 className="text-5xl font-bold mb-4">Mind Games</h1>
            <p className="text-2xl text-gray-300 mb-6">Sicksick</p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>2025</span>
              <span>•</span>
              <span>1 lagu</span>
              <span>•</span>
              <span>4:01</span>
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm">
          {/* Progress Bar */}
          <div className="mb-6">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-8">
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            
            <button
              onClick={handlePlayPause}
              className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform hover:bg-green-400"
            >
              {isPlaying ? (
                <div className="w-5 h-5 bg-black"></div> // Pause icon
              ) : (
                <div className="w-0 h-0 border-l-[10px] border-l-black border-y-[6px] border-y-transparent ml-1"></div> // Play icon
              )}
            </button>

            <button className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-32 accent-green-500"
            />
          </div>
        </div>

        {/* Song Lyrics atau Description */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 italic">
            "Nikmati momen dengan musik terbaik"
          </p>
        </div>
      </div>

      <audio
        id="main-audio"
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src="/bgm.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

const ProfilePage = () => {
  const [sparkles, setSparkles] = useState([]);
  const [currentPage, setCurrentPage] = useState("beranda"); // "beranda" atau "musik"

  useEffect(() => {
    const colors = ["white", "lightblue", "yellow"];
    const generateSparkles = () => {
      const newSparkles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        style: {
          top: `${Math.random() * 100}vh`,
          left: `${Math.random() * 100}vw`,
          animationDelay: `${Math.random() * 2}s`,
          opacity: Math.random(),
        },
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setSparkles(newSparkles);
    };

    generateSparkles();
    const interval = setInterval(generateSparkles, 5000);
    return () => clearInterval(interval);
  }, []);

  // Navigation Component
  const Navigation = () => (
    <nav className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-md z-50">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex justify-center space-x-8">
          <button
            onClick={() => setCurrentPage("beranda")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              currentPage === "beranda"
                ? "bg-red-500 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Beranda</span>
          </button>
          <button
            onClick={() => setCurrentPage("musik")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              currentPage === "musik"
                ? "bg-green-500 text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Music className="w-5 h-5" />
            <span>Musik</span>
          </button>
        </div>
      </div>
    </nav>
  );

  // Beranda Page
  if (currentPage === "beranda") {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-red-800 via-red-600 to-red-400 pb-32">
        <SpeedInsights />
        <Navigation />

        {/* Sparkle */}
        {sparkles.map((sparkle) => (
          <Sparkle key={sparkle.id} style={sparkle.style} color={sparkle.color} />
        ))}

        <main className="max-w-3xl mx-auto px-4 py-20 relative z-10">
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 bg-red-300 rounded-full blur-md animate-pulse" />
              <img
                src="https://files.catbox.moe/ul5kgd.jpg"
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
              Hai! Namaku Ridha, dan aku adalah seorang web developer dan pengembang bot WhatsApp pemula. Aku memiliki pengalaman dari teman-teman saya yang mengajarkan dan belajar otodidak. Karena rasa penasaran dan keinginan mempelajari hal baru, aku jadi semangat belajar hal baru.
            </p>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            {[
              { href: "https://instagram.com/fathy_847", icon: Instagram, text: "Follow on Instagram" },
              { href: "https://youtube.com/@ELEMENTALGOO", icon: Youtube, text: "Subscribe on YouTube" },
              { href: "https://x.com/ElementalGoo?t=P-6WPtrV75ZiKZDt-4y_Mg&s=09", icon: Twitter, text: "Follow on Twitter or X" },
              { href: "https://wa.me/6287870946702", icon: Phone, text: "Owner Ridha" },
              { href: "https://wa.me/6287757267678", icon: Phone, text: "Bot Whatsapp" },
            ].map((button, index) => (
              <a
                key={index}
                href={button.href}
                className="flex items-center p-4 bg-white/10 backdrop-blur-sm text-white rounded-lg shadow-md hover:scale-105 hover:bg-white/20 transition-all duration-300"
              >
                <button.icon className="w-6 h-6 mr-3" />
                <span className="font-medium">{button.text}</span>
              </a>
            ))}
          </div>
        </main>

        <AudioPlayer isMusicPage={false} />
      </div>
    );
  }

  // Musik Page
  return (
    <>
      <Navigation />
      <AudioPlayer isMusicPage={true} />
    </>
  );
};

export default ProfilePage;