.import { SpeedInsights } from "@vercel/speed-insights/react";
import { Instagram, Youtube, Twitter, Phone, Home, Music, Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Sparkle Component
const Sparkle = ({ style, color }) => (
  <div
    className="absolute w-2 h-2 rounded-full animate-twinkle"
    style={{ ...style, backgroundColor: color }}
  />
);

// Music Visualizer Component
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
        if (audioContextRef.current) return;

        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaElementSource(audioRef.current);
        analyserRef.current = audioContextRef.current.createAnalyser();
        
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        
        analyserRef.current.fftSize = 256;
        bufferLengthRef.current = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLengthRef.current);
        
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
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
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
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, width, height);

      const barWidth = (width / bufferLengthRef.current) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLengthRef.current; i++) {
        const barHeight = (dataArrayRef.current[i] / 255) * height;
        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(0.6, '#3b82f6');
        gradient.addColorStop(1, '#8b5cf6');

        ctx.fillStyle = gradient;
        const roundedBarHeight = Math.max(barHeight, 2);
        ctx.fillRect(x, height - roundedBarHeight, barWidth, roundedBarHeight);

        x += barWidth + 1;
      }
    };

    const drawIdle = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
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
      animationRef.current = requestAnimationFrame(drawIdle);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="w-full h-32 bg-black/20 rounded-lg overflow-hidden backdrop-blur-sm border border-gray-700/30">
      <canvas ref={canvasRef} width={800} height={128} className="w-full h-full" />
    </div>
  );
};

// Audio Player Component with Search Capability
const AudioPlayer = ({ isMusicPage = false, currentTrack, setCurrentTrack, isPlaying, setIsPlaying, audioRef }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Search Logic utilizing Piped/Invidious public API instances (No API Key required)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      // Menggunakan instance PWA / alternative API publik bebas akses
      const response = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(searchQuery)}&filter=music_songs`);
      const data = await response.json();
      
      if (data && data.items) {
        setSearchResults(data.items.slice(0, 5)); // Ambil 5 hasil teratas
      }
    } catch (error) {
      console.error("Gagal melakukan pencarian musik:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectTrack = async (item) => {
    setIsLoading(true);
    try {
      // Mendapatkan stream URL langsung dari track id tanpa API Key resmi
      const res = await fetch(`https://pipedapi.kavin.rocks/streams/${item.url.split("v=")[1]}`);
      const streamData = await res.json();
      
      // Filter audio stream dengan kualitas terbaik atau ambil opsional audio teratas
      const audioStream = streamData.audioStreams?.find(stream => stream.mimeType.includes("audio/webm")) || streamData.audioStreams?.[0];

      if (audioStream && audioStream.url) {
        setCurrentTrack({
          title: item.title,
          artist: item.uploaderName || "Unknown Artist",
          src: audioStream.url,
          cover: item.thumbnail || "https://files.catbox.moe/ul5kgd.jpg"
        });
        setIsPlaying(true);
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.load();
            audioRef.current.play().catch(err => console.log("Auto-play blocked:", err));
          }
        }, 100);
      }
    } catch (error) {
      console.error("Gagal memuat stream audio:", error);
      alert("Gagal memutar lagu ini, coba lagu atau keyword lainnya.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMusicPage) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-black border-t border-gray-700 p-3 z-40 shadow-xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <img 
              src={currentTrack.cover} 
              alt="Cover" 
              className="w-12 h-12 rounded-md object-cover border border-white/10"
              onError={(e) => e.target.src = "https://files.catbox.moe/ul5kgd.jpg"}
            />
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium text-sm truncate">{currentTrack.title}</p>
              <p className="text-gray-400 text-xs truncate">{currentTrack.artist}</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <button onClick={handlePlayPause} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-md hover:scale-105 active:scale-95 transition-transform font-bold text-sm">
              {isPlaying ? "⏸" : "▶"}
            </button>
          </div>
          <div className="text-white text-xs hidden sm:block flex-1 text-right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        <audio
          ref={audioRef}
          key={currentTrack.src}
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={currentTrack.src} type="audio/mp3" />
          <source src={currentTrack.src} type="audio/webm" />
        </audio>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-white">
      <div className="mb-6">
        <MusicVisualizer isPlaying={isPlaying} audioRef={audioRef} />
      </div>

      {/* Dynamic Music Search Section */}
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari lagu bebas di sini... (Contoh: Sicksick Mind Games)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-xl py-2 px-4 pl-10 text-sm focus:outline-none focus:border-red-500 text-white placeholder-gray-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari"}
          </button>
        </form>

        {/* Search Results List */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Hasil Pencarian:</p>
            {searchResults.map((item, index) => (
              <div 
                key={index}
                onClick={() => selectTrack(item)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5"
              >
                <img 
                  src={item.thumbnail} 
                  alt="Thumb" 
                  className="w-10 h-10 rounded object-cover"
                  onError={(e) => e.target.src = "https://files.catbox.moe/ul5kgd.jpg"}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white">{item.title}</p>
                  <p className="text-xs text-gray-400 truncate">{item.uploaderName || "Unknown"}</p>
                </div>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                  {item.duration ? formatTime(item.duration) : "Song"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Stream Player Control Card */}
      <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800">
        <div className="flex flex-col items-center text-center mb-6">
          <img 
            src={currentTrack.cover} 
            alt="Track Artwork" 
            className="w-32 h-32 rounded-xl object-cover mb-4 border-2 border-red-500/30 shadow-lg"
            onError={(e) => e.target.src = "https://files.catbox.moe/ul5kgd.jpg"}
          />
          <h2 className="text-2xl font-bold truncate max-w-full px-4">{currentTrack.title}</h2>
          <p className="text-gray-400 truncate max-w-full px-4">{currentTrack.artist}</p>
        </div>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full accent-red-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer mb-2"
        />
        <div className="flex justify-between text-xs text-gray-400 mb-6">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="flex justify-center items-center">
          <button onClick={handlePlayPause} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg hover:bg-red-600 transition-colors">
            {isPlaying ? "⏸" : "▶"}
          </button>
        </div>
      </div>
      <audio
        ref={audioRef}
        key={currentTrack.src}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={currentTrack.src} type="audio/mp3" />
        <source src={currentTrack.src} type="audio/webm" />
      </audio>
    </div>
  );
};

// Main Profile Page Component
const ProfilePage = () => {
  const [sparkles, setSparkles] = useState([]);
  const [currentPage, setCurrentPage] = useState("beranda");
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  
  // Shared audio state across page views
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: "Mind Games",
    artist: "Sicksick",
    src: "/bgm.mp3",
    cover: "https://files.catbox.moe/ul5kgd.jpg"
  });
  const audioRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }
    const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(checkIOS);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowInstallPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const colors = ["white", "lightblue", "yellow"];
    const generateSparkles = () => {
      const newSparkles = Array.from({ length: 30 }, (_, i) => ({
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
  }, []);

  const Navigation = () => (
    <nav className="fixed top-0 left-0 right-0 bg-black/60 backdrop-blur-md z-50 border-b border-white/10">
      <div className="max-w-3xl mx-auto px-4 py-3 flex justify-center space-x-6">
        <button
          onClick={() => setCurrentPage("beranda")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            currentPage === "beranda" ? "bg-red-500 text-white shadow-md" : "text-gray-300 hover:text-white"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Beranda</span>
        </button>
        <button
          onClick={() => setCurrentPage("musik")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            currentPage === "musik" ? "bg-red-500 text-white shadow-md" : "text-gray-300 hover:text-white"
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Musik</span>
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-red-950 via-red-800 to-red-600 pb-32 font-sans selection:bg-red-500 selection:text-white">
      <SpeedInsights />
      <Navigation />

      {/* Sparkles Effect */}
      {sparkles.map((sparkle) => (
        <Sparkle key={sparkle.id} style={sparkle.style} color={sparkle.color} />
      ))}

      {currentPage === "beranda" ? (
        <main className="max-w-xl mx-auto px-4 pt-24 pb-12 relative z-10 flex flex-col items-center">
          {isStandalone && (
            <div className="bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full mb-4">
              📱 PWA Mode Active
            </div>
          )}

          {/* Avatar Area */}
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-opacity animate-pulse" />
            <img
              src="https://files.catbox.moe/ul5kgd.jpg"
              alt="Profile Picture"
              className="relative rounded-full shadow-2xl border-4 border-white w-40 h-40 object-cover transform hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Profile Identity */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-wide text-white mb-2 drop-shadow-md">
              RIDHA SUKA HUTAO
            </h1>
            <p className="text-sm font-semibold text-red-200 uppercase tracking-widest mb-4">
              Web Developer & Digital Creator
            </p>
            <div className="bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/10 text-red-50 text-sm leading-relaxed text-left shadow-inner">
              Hai! Namaku Ridha, dan aku adalah seorang web developer dan pengembang bot WhatsApp pemula. Aku memiliki pengalaman dari teman-teman saya yang mengajarkan dan belajar otodidak. Karena rasa penasaran dan keinginan mempelajari hal baru, aku jadi semangat belajar hal baru.
            </div>
          </div>

          {/* Navigation Links (Linktree Style) */}
          <div className="w-full space-y-3">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-xl text-white transition-all border border-white/10 shadow-sm hover:translate-x-1">
              <Instagram className="w-5 h-5 text-pink-400" />
              <span className="font-medium text-sm">Follow on Instagram</span>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-xl text-white transition-all border border-white/10 shadow-sm hover:translate-x-1">
              <Youtube className="w-5 h-5 text-red-500" />
              <span className="font-medium text-sm">Subscribe on YouTube</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-xl text-white transition-all border border-white/10 shadow-sm hover:translate-x-1">
              <Twitter className="w-5 h-5 text-sky-400" />
              <span className="font-medium text-sm">Follow on Twitter or X</span>
            </a>
            <a href="#" className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-xl text-white transition-all border border-white/10 shadow-sm hover:translate-x-1">
              <Phone className="w-5 h-5 text-green-400" />
              <span className="font-medium text-sm">Owner Ridha</span>
            </a>
            <a href="#" className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-xl text-white transition-all border border-white/10 shadow-sm hover:translate-x-1">
              <Phone className="w-5 h-5 text-emerald-400" />
              <span className="font-medium text-sm">Bot Whatsapp</span>
            </a>
          </div>
        </main>
      ) : (
        <div className="pt-20">
          <AudioPlayer 
            isMusicPage={true} 
            currentTrack={currentTrack}
            setCurrentTrack={setCurrentTrack}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            audioRef={audioRef}
          />
        </div>
      )}

      {/* Mini Music Player Sticky */}
      {currentPage === "beranda" && (
        <AudioPlayer 
          isMusicPage={false} 
          currentTrack={currentTrack}
          setCurrentTrack={setCurrentTrack}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          audioRef={audioRef}
        />
      )}
    </div>
  );
};

export default ProfilePage;
