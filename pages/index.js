import { SpeedInsights } from "@vercel/speed-insights/react";
import { Instagram, Youtube, Twitter, Phone, Home, Music } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Sparkle Component
const Sparkle = ({ style, color }) => (
  <div
    className="absolute w-2 h-2 rounded-full animate-twinkle"
    style={{ ...style, backgroundColor: color }}
  />
);

// Music Visualizer Component (Bars only)
const MusicVisualizer = ({ isPlaying, audioRef }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const dataArrayRef = useRef(null);
  const bufferLengthRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;

    const setupAudioContext = async () => {
      try {
        // Cek jika audio context sudah ada
        if (audioContextRef.current) {
          return;
        }

        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaElementSource(audioRef.current);
        analyserRef.current = audioContextRef.current.createAnalyser();
        
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        
        analyserRef.current.fftSize = 256;
        bufferLengthRef.current = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLengthRef.current);
        
        // Resume context jika suspended
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
      } catch (error) {
        console.log('Audio context setup error:', error);
      }
    };

    if (isPlaying) {
      setupAudioContext();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, audioRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      if (!analyserRef.current || !dataArrayRef.current) {
        // Jika analyser belum siap, coba lagi
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      animationRef.current = requestAnimationFrame(draw);
      
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Clear canvas dengan efek fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLengthRef.current) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLengthRef.current; i++) {
        const barHeight = (dataArrayRef.current[i] / 255) * height;
        
        // Gradient warna berdasarkan tinggi bar
        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        gradient.addColorStop(0, '#10b981'); // green-500
        gradient.addColorStop(0.6, '#3b82f6'); // blue-500
        gradient.addColorStop(1, '#8b5cf6'); // purple-500

        ctx.fillStyle = gradient;
        
        // Draw bar dengan rounded corners
        const roundedBarHeight = Math.max(barHeight, 2); // Minimum height
        ctx.fillRect(x, height - roundedBarHeight, barWidth, roundedBarHeight);

        // Efek glow subtle
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 5;
        ctx.fillRect(x, height - roundedBarHeight, barWidth, roundedBarHeight);
        ctx.shadowBlur = 0;

        x += barWidth + 1;
      }
    };

    const drawIdle = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      // Bars kecil untuk efek standby yang lebih smooth
      const barWidth = 3;
      const gap = 1;
      let x = 0;
      const time = Date.now() * 0.002;
      
      while (x < width) {
        const wave = Math.sin(time + x * 0.1) * 0.5 + 0.5;
        const randomHeight = wave * 15 + 8;
        ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.fillRect(x, height - randomHeight, barWidth, randomHeight);
        x += barWidth + gap;
      }
    };

    if (isPlaying && analyserRef.current) {
      draw();
    } else {
      drawIdle();
      // Tetap request frame untuk idle animation
      animationRef.current = requestAnimationFrame(drawIdle);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="w-full h-32 bg-black/20 rounded-lg overflow-hidden backdrop-blur-sm border border-gray-700/30">
      <canvas
        ref={canvasRef}
        width={800}
        height={128}
        className="w-full h-full"
      />
    </div>
  );
};

// Audio Player Component (Spotify-like)
const AudioPlayer = ({ isMusicPage = false }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef(null);

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.log('Play/pause error:', error);
      // Fallback: langsung set state tanpa await
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(e => console.log('Play failed:', e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = parseFloat(e.target.value);
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const audio = audioRef.current;
    if (audio) {
      const newVolume = parseFloat(e.target.value);
      audio.volume = newVolume;
      setVolume(newVolume);
    }
  };

  // Reset audio when component mounts
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.currentTime = currentTime;
    }
  }, []);

  // Versi Mini Player (untuk beranda)
  if (!isMusicPage) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-black border-t border-gray-700 p-3 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Song Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <img
              src="/album-cover.jpg"
              alt="Album Cover"
              className="w-12 h-12 rounded-md object-cover bg-gray-700"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18V5l12-2v13'%3E%3C/path%3E%3Ccircle cx='6' cy='18' r='3'%3E%3C/circle%3E%3Ccircle cx='18' cy='16' r='3'%3E%3C/circle%3E%3C/svg%3E";
              }}
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
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
            >
              {isPlaying ? (
                <div className="w-3 h-3 bg-black"></div>
              ) : (
                <div className="w-0 h-0 border-l-[6px] border-l-black border-y-[4px] border-y-transparent ml-0.5"></div>
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
          ref={audioRef}
          id="main-audio"
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
          onLoadedMetadata={(e) => {
            setDuration(e.target.duration);
            setCurrentTime(0);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          preload="metadata"
        >
          <source src="/bgm.mp3" type="audio/mp3" />
          <source src="/bgm.ogg" type="audio/ogg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  // Versi Full Music Page (Spotify-like dengan Visualizer)
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-32">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Music Visualizer */}
        <div className="mb-8">
          <MusicVisualizer isPlaying={isPlaying} audioRef={audioRef} />
        </div>

        {/* Album Art & Info */}
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8 mb-8">
          <img
            src="/album-cover.jpg"
            alt="Album Cover"
            className="w-48 h-48 md:w-64 md:h-64 rounded-2xl shadow-2xl object-cover border-4 border-green-500/30 bg-gray-800"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18V5l12-2v13'%3E%3C/path%3E%3Ccircle cx='6' cy='18' r='3'%3E%3C/circle%3E%3Ccircle cx='18' cy='16' r='3'%3E%3C/circle%3E%3C/svg%3E";
            }}
          />
          <div className="text-center md:text-left">
            <p className="text-green-500 font-semibold mb-2">SEDANG DIPUTAR</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Mind Games</h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-6">Sicksick</p>
            <div className="flex items-center space-x-4 text-sm text-gray-400 justify-center md:justify-start">
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
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-8">
            <button 
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.max(0, currentTime - 10);
                }
              }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
              </svg>
            </button>
            
            <button
              onClick={handlePlayPause}
              className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95 hover:bg-green-400 shadow-lg"
            >
              {isPlaying ? (
                <div className="w-6 h-6 bg-black rounded-sm"></div>
              ) : (
                <div className="w-0 h-0 border-l-[12px] border-l-black border-y-[8px] border-y-transparent ml-1"></div>
              )}
            </button>

            <button 
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  setIsPlaying(false);
                }
              }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
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

        {/* Now Playing Info */}
        <div className="mt-8 text-center bg-black/30 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-green-400 font-semibold mb-2">NOW PLAYING</p>
          <p className="text-2xl font-bold">Mind Games - Sicksick</p>
          <p className="text-gray-400 mt-2">Music Visualizer Active</p>
        </div>
      </div>

      <audio
        ref={audioRef}
        id="main-audio"
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.target.duration);
          setCurrentTime(0);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        preload="metadata"
      >
        <source src="/bgm.mp3" type="audio/mp3" />
        <source src="/bgm.ogg" type="audio/ogg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

const ProfilePage = () => {
  const [sparkles, setSparkles] = useState([]);
  const [currentPage, setCurrentPage] = useState("beranda");

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