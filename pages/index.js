import { Instagram, Youtube, Twitter, Home, Music, Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Sparkle Component
const Sparkle = ({ style, color }) => (
  <div
    className="absolute rounded-full pointer-events-none dynamic-sparkle"
    style={{
      ...style,
      backgroundColor: color,
      boxShadow: `0 0 8px ${color}`,
    }}
  />
);

// Audio Visualizer Component
const AudioVisualizer = ({ isPlaying }) => {
  return (
    <div className="flex items-end justify-center gap-1 h-8 mt-2 px-2">
      {[...Array(12)].map((_, i) => {
        const duration = 0.5 + Math.random() * 0.8;
        return (
          <div
            key={i}
            className="w-1.5 bg-gradient-to-t from-red-500 to-amber-400 rounded-t transition-all origin-bottom"
            style={{
              animation: isPlaying 
                ? `bounceVisualizer ${duration}s ease-in-out infinite alternate` 
                : 'none',
              height: isPlaying ? '100%' : '4px',
              animationDelay: `${i * 0.05}s`
            }}
          />
        );
      })}
    </div>
  );
};

// Audio Player Component - MENGGUNAKAN YOUTUBE IFRAME API RESMI (ANTI-BUG MENIT)
const AudioPlayer = ({ isMusicPage = false, currentTrack, setCurrentTrack, isPlaying, setIsPlaying }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const playerRef = useRef(null); 
  const containerId = isMusicPage ? "yt-player-main" : "yt-player-bottom";
  const YOUTUBE_API_KEY = "AIzaSyDcYX3MXSm5WLwX7Kx_klCdA2cDhvYG04U";

  // Load YouTube IFrame API Script secara global
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Inisialisasi Player saat videoId berubah
  useEffect(() => {
    let timer;

    const createPlayer = () => {
      if (!currentTrack.videoId || !window.YT || !window.YT.Player) return;

      // Hancurkan player lama jika ada sebelum membuat yang baru
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try { playerRef.current.destroy(); } catch(e) {}
      }

      playerRef.current = new window.YT.Player(containerId, {
        height: '1',
        width: '1',
        videoId: currentTrack.videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1
        },
        events: {
          onReady: (event) => {
            if (isPlaying) event.target.playVideo();
            setDuration(event.target.getDuration());
          },
          onStateChange: (event) => {
            // Jika lagu selesai, stop interval
            if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              setCurrentTime(0);
            }
          }
        }
      });

      // Polling waktu menggunakan internal API (Aman dari cross-origin block)
      timer = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const current = playerRef.current.getCurrentTime();
          const total = playerRef.current.getDuration();
          setCurrentTime(current);
          if (total && duration !== total) {
            setDuration(total);
          }
        }
      }, 500);
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      clearInterval(timer);
    };
  }, [currentTrack.videoId]);

  // Handle Play dan Pause secara realtime lewat API
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSeekChange = (e) => {
    const seekTarget = parseFloat(e.target.value);
    setCurrentTime(seekTarget);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seekTarget, true);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoCategoryId=10&maxResults=5&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();
      
      if (data && data.items) {
        const mappedResults = data.items.map(item => ({
          title: item.snippet.title,
          uploaderName: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "/album-cover.jpg",
          videoId: item.id.videoId
        }));
        setSearchResults(mappedResults);
      }
    } catch (error) {
      console.error("Gagal melakukan pencarian via YouTube API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectTrack = (item) => {
    setCurrentTrack({
      title: item.title,
      artist: item.uploaderName || "Unknown Artist",
      videoId: item.videoId,
      cover: item.thumbnail
    });
    setIsPlaying(true);
  };

  if (!isMusicPage) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-black border-t border-gray-700 p-3 z-40 shadow-xl flex flex-col gap-2">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <img 
              src={currentTrack.cover} 
              alt="Cover" 
              className="w-12 h-12 rounded-md object-cover border border-white/10"
              onError={(e) => e.target.src = "/album-cover.jpg"}
            />
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium text-sm truncate" dangerouslySetInnerHTML={{ __html: currentTrack.title }}></p>
              <p className="text-gray-400 text-xs truncate">{currentTrack.artist}</p>
            </div>
          </div>
          
          <div className="hidden md:block w-24">
            <AudioVisualizer isPlaying={isPlaying} />
          </div>

          {/* Progress Bar Mini Desktop */}
          <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 px-2">
            <span className="text-gray-400 text-xs font-mono">{formatTime(currentTime)}</span>
            <input 
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="flex-1 accent-red-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-gray-400 text-xs font-mono">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-center">
            <button onClick={handlePlayPause} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-md font-bold text-sm hover:scale-105 transition-all">
              {isPlaying ? "⏸" : "▶"}
            </button>
          </div>
        </div>

        {/* Slider Mobile (Layar HP) */}
        <div className="w-full max-w-3xl mx-auto sm:hidden flex items-center gap-2 px-1">
          <span className="text-gray-400 text-[10px] font-mono">{formatTime(currentTime)}</span>
          <input 
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeekChange}
            className="flex-1 accent-red-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-gray-400 text-[10px] font-mono">{formatTime(duration)}</span>
        </div>

        {/* Container Official API Target Element */}
        <div className="absolute opacity-0 pointer-events-none" style={{ width: '1px', height: '1px' }}>
          <div id="yt-player-bottom"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-white relative z-10">
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-6 shadow-xl">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari lagu bebas di sini..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-xl py-2 px-4 pl-10 text-sm focus:outline-none focus:border-red-500 text-white"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-700 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition-all"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari"}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Hasil Pencarian:</p>
            {searchResults.map((item, index) => (
              <div 
                key={index}
                onClick={() => selectTrack(item)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all"
              >
                <img 
                  src={item.thumbnail} 
                  alt="Thumb" 
                  className="w-10 h-10 rounded object-cover"
                  onError={(e) => e.target.src = "/album-cover.jpg"}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white" dangerouslySetInnerHTML={{ __html: item.title }}></p>
                  <p className="text-xs text-gray-400 truncate">{item.uploaderName || "Unknown"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center text-center mb-4">
          <img 
            src={currentTrack.cover} 
            alt="Track Artwork" 
            className={`w-40 h-40 rounded-xl object-cover mb-4 border-2 border-red-500/30 shadow-lg transition-transform duration-500 ${isPlaying ? 'animate-pulse scale-102' : ''}`}
            onError={(e) => e.target.src = "/album-cover.jpg"}
          />
          <h2 className="text-2xl font-bold truncate max-w-full px-4" dangerouslySetInnerHTML={{ __html: currentTrack.title }}></h2>
          <p className="text-gray-400 truncate max-w-full px-4 mb-4">{currentTrack.artist}</p>
          
          <AudioVisualizer isPlaying={isPlaying} />
        </div>

        {/* Progress Bar Utama */}
        <div className="w-full mt-6 flex flex-col gap-1 px-4">
          <input 
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeekChange}
            className="w-full accent-red-500 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs font-mono text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex justify-center items-center mt-6">
          <button onClick={handlePlayPause} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg hover:bg-red-600 hover:scale-105 transition-all">
            {isPlaying ? "⏸" : "▶"}
          </button>
        </div>
      </div>

      {/* Container Official API Target Element Main */}
      <div className="absolute opacity-0 pointer-events-none" style={{ width: '1px', height: '1px' }}>
        <div id="yt-player-main"></div>
      </div>
    </div>
  );
};

// Main Profile Page Component
const ProfilePage = () => {
  const [sparkles, setSparkles] = useState([]);
  const [currentPage, setCurrentPage] = useState("beranda");
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState({
    title: "cari lagu dipencarian",
    artist: "Fathur Ridha",
    videoId: "m2nA875fXW4", // Kita kasih default ID video biar pas dibuka langsung ada lagu valid
    cover: "/album-cover.jpg"
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  useEffect(() => {
    // Sparkle putih & biru muda, kesan kelap-kelip malam berbintang
    const colors = ["#ffffff", "#bfdbfe", "#93c5fd", "#dbeafe"];
    const generateSparkles = () => {
      const newSparkles = Array.from({ length: 45 }, (_, i) => {
        const size = Math.random() * 3 + 2;
        const moveX = (Math.random() - 0.5) * 50;
        const moveY = (Math.random() - 0.5) * 50;
        const durationFloat = 4 + Math.random() * 6;
        const durationTwinkle = 1 + Math.random() * 2;

        return {
          id: i,
          style: {
            top: `${Math.random() * 100}vh`,
            left: `${Math.random() * 100}vw`,
            width: `${size}px`,
            height: `${size}px`,
            animation: `twinkleAnimation ${durationTwinkle}s ease-in-out infinite alternate, floatAnimation ${durationFloat}s ease-in-out infinite alternate`,
            '--move-x': `${moveX}px`,
            '--move-y': `${moveY}px`,
            opacity: Math.random() * 0.7 + 0.3,
          },
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      });
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-950 via-blue-900 to-slate-800 pb-32 font-sans selection:bg-blue-500 selection:text-white">
      <style jsx global>{`
        @keyframes twinkleAnimation {
          0% { opacity: 0.2; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes floatAnimation {
          0% { translate: 0px 0px; }
          100% { translate: var(--move-x) var(--move-y); }
        }
        @keyframes bounceVisualizer {
          0% { transform: scaleY(0.1); }
          100% { transform: scaleY(1); }
        }
        .dynamic-sparkle {
          will-change: transform, opacity;
        }
      `}</style>

      <Navigation />

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {sparkles.map((sparkle) => (
          <Sparkle key={sparkle.id} style={sparkle.style} color={sparkle.color} />
        ))}
      </div>

      {currentPage === "beranda" ? (
        <main className="max-w-xl mx-auto px-4 pt-24 pb-12 relative z-10 flex flex-col items-center">
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-60 animate-pulse" />
            <img
              src="/photo-utama.jpeg"
              alt="Profile Picture"
              className="relative rounded-full shadow-2xl border-4 border-white w-40 h-40 object-cover"
            />
          </div>

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

          <div className="w-full space-y-3">
            <a href="https://www.instagram.com/fathy_847?igsh=MWQ2dWhiMWdpam5qOA==" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-xl text-white transition-all border border-white/10">
              <span className="font-medium text-sm">Follow on Instagram</span>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-xl text-white transition-all border border-white/10">
              <span className="font-medium text-sm">Subscribe on YouTube</span>
            </a>
            <a href="https://whatsapp.com/channel/0029VasouxcCnA7m0d2k9v0P" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-xl text-white transition-all border border-white/10">
              <span className="font-medium text-sm">Follow Saluran WA</span>
            </a>

            {/* Tombol PWA Unduh APK Langsung */}
            {showInstallBtn && (
              <button 
                onClick={handleInstallApp}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 p-4 rounded-xl text-white font-bold shadow-lg transition-all border border-white/25 animate-pulse mt-4"
              >
                <span>📲 Download & Instal Aplikasi Website</span>
              </button>
            )}
          </div>
        </main>
      ) : (
        <main className="pt-24 relative z-10">
          <AudioPlayer 
            isMusicPage={true}
            currentTrack={currentTrack}
            setCurrentTrack={setCurrentTrack}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        </main>
      )}

      {currentPage !== "musik" && (
        <AudioPlayer 
          isMusicPage={false}
          currentTrack={currentTrack}
          setCurrentTrack={setCurrentTrack}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />
      )}
    </div>
  );
};

export default ProfilePage;
