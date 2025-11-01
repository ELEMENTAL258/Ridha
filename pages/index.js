import { SpeedInsights } from "@vercel/speed-insights/react";
import { Instagram, Youtube, Twitter, Phone, Home, Music, Download, Play, Pause, SkipBack, SkipForward, ListMusic } from "lucide-react";
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

// Playlist data - kamu bisa ganti dengan lagu favoritmu
const playlist = [
  {
    id: 1,
    title: "Mind Games",
    artist: "Sicksick",
    src: "/music/mind-games.mp3",
    cover: "/covers/mind-games.jpg",
    duration: "4:01"
  },
  {
    id: 2,
    title: "Blue",
    artist: "Yung Kai",
    src: "/music/blue.mp3",
    cover: "/covers/blue.jpg",
    duration: "3:45"
  },
  {
    id: 3,
    title: "Sunset Dreams",
    artist: "Lofi Girl",
    src: "/music/sunset-dreams.mp3",
    cover: "/covers/lofi.jpg",
    duration: "2:30"
  },
  {
    id: 4,
    title: "Night Drive",
    artist: "Synthwave",
    src: "/music/night-drive.mp3",
    cover: "/covers/synthwave.jpg",
    duration: "3:15"
  },
  {
    id: 5,
    title: "Ocean Waves",
    artist: "Nature Sounds",
    src: "/music/ocean-waves.mp3",
    cover: "/covers/ocean.jpg",
    duration: "5:20"
  },
  {
    id: 6,
    title: "City Lights",
    artist: "Chill Hop",
    src: "/music/city-lights.mp3",
    cover: "/covers/chillhop.jpg",
    duration: "3:50"
  },
  {
    id: 7,
    title: "Mountain Top",
    artist: "Ambient",
    src: "/music/mountain-top.mp3",
    cover: "/covers/ambient.jpg",
    duration: "4:25"
  },
  {
    id: 8,
    title: "Digital Love",
    artist: "Daft Punk",
    src: "/music/digital-love.mp3",
    cover: "/covers/daftpunk.jpg",
    duration: "4:45"
  },
  {
    id: 9,
    title: "Summer Breeze",
    artist: "Indie Pop",
    src: "/music/summer-breeze.mp3",
    cover: "/covers/indie.jpg",
    duration: "3:20"
  },
  {
    id: 10,
    title: "Space Walk",
    artist: "Electronic",
    src: "/music/space-walk.mp3",
    cover: "/covers/electronic.jpg",
    duration: "4:10"
  }
];

// Audio Player Component dengan Playlist
const AudioPlayer = ({ isMusicPage = false }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const audioRef = useRef(null);

  const currentTrack = playlist[currentTrackIndex];

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

  const playTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    // Audio akan auto play karena src berubah dan useEffect handle play
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  // Auto play next track when current ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  // Reset audio when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      setCurrentTime(0);
      if (isPlaying) {
        audio.play().catch(e => console.log('Auto-play failed:', e));
      }
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  // Versi Mini Player (untuk beranda)
  if (!isMusicPage) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-black border-t border-gray-700 p-3 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <img
              src={currentTrack.cover || "/album-cover.jpg"}
              alt="Album Cover"
              className="w-12 h-12 rounded-md object-cover bg-gray-700"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18V5l12-2v13'%3E%3C/path%3E%3Ccircle cx='6' cy='18' r='3'%3E%3C/circle%3E%3Ccircle cx='18' cy='16' r='3'%3E%3C/circle%3E%3C/svg%3E";
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-white font-medium text-sm truncate">{currentTrack.title}</p>
              <p className="text-gray-400 text-xs truncate">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 flex-1 justify-center">
            <button
              onClick={prevTrack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-3 h-3 text-black" />
              ) : (
                <Play className="w-3 h-3 text-black ml-0.5" />
              )}
            </button>
            <button
              onClick={nextTrack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-3 flex-1 justify-end">
            <div className="text-white text-xs hidden sm:block">
              {formatTime(currentTime)} / {currentTrack.duration}
            </div>
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ListMusic className="w-5 h-5" />
            </button>
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

        {/* Playlist Modal */}
        {showPlaylist && (
          <div className="absolute bottom-16 right-4 bg-gray-800 rounded-lg shadow-2xl z-50 max-w-sm w-80 max-h-96 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-white font-semibold mb-3">Playlist</h3>
              <div className="space-y-2">
                {playlist.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      playTrack(index);
                      setShowPlaylist(false);
                    }}
                    className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-all ${
                      index === currentTrackIndex
                        ? 'bg-green-500 text-white'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <img
                      src={track.cover || "/album-cover.jpg"}
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium truncate text-sm">{track.title}</p>
                      <p className="text-xs opacity-75 truncate">{track.artist}</p>
                    </div>
                    <span className="text-xs opacity-60">{track.duration}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <audio
          ref={audioRef}
          id="main-audio"
          src={currentTrack.src}
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
          onLoadedMetadata={(e) => {
            setDuration(e.target.duration);
            setCurrentTime(0);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          preload="metadata"
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  // Versi Full Music Page (Spotify-like dengan Visualizer & Playlist)
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-32">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <MusicVisualizer isPlaying={isPlaying} audioRef={audioRef} />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8 mb-8">
          <img
            src={currentTrack.cover || "/album-cover.jpg"}
            alt="Album Cover"
            className="w-48 h-48 md:w-64 md:h-64 rounded-2xl shadow-2xl object-cover border-4 border-green-500/30 bg-gray-800"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18V5l12-2v13'%3E%3C/path%3E%3Ccircle cx='6' cy='18' r='3'%3E%3C/circle%3E%3Ccircle cx='18' cy='16' r='3'%3E%3C/circle%3E%3C/svg%3E";
            }}
          />
          <div className="text-center md:text-left flex-1">
            <p className="text-green-500 font-semibold mb-2">SEDANG DIPUTAR</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{currentTrack.title}</h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-6">{currentTrack.artist}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-400 justify-center md:justify-start">
              <span>Track {currentTrackIndex + 1} of {playlist.length}</span>
              <span>•</span>
              <span>{currentTrack.duration}</span>
            </div>
          </div>

          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
          >
            <ListMusic className="w-5 h-5" />
            <span>Playlist</span>
          </button>
        </div>

        {/* Playlist Sidebar */}
        {showPlaylist && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex justify-end">
            <div className="bg-gray-900 w-full max-w-md h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Playlist</h2>
                  <button
                    onClick={() => setShowPlaylist(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2">
                  {playlist.map((track, index) => (
                    <button
                      key={track.id}
                      onClick={() => playTrack(index)}
                      className={`w-full flex items-center space-x-4 p-3 rounded-lg transition-all ${
                        index === currentTrackIndex
                          ? 'bg-green-500 text-white'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <img
                        src={track.cover || "/album-cover.jpg"}
                        alt={track.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm opacity-75 truncate">{track.artist}</p>
                      </div>
                      <span className="text-sm opacity-60">{track.duration}</span>
                      {index === currentTrackIndex && isPlaying && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 rounded-2xl p-6 backdrop-blur-sm">
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
              <span>{currentTrack.duration}</span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8">
            <button 
              onClick={prevTrack}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <SkipBack className="w-6 h-6" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95 hover:bg-green-400 shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-black" />
              ) : (
                <Play className="w-6 h-6 text-black ml-1" />
              )}
            </button>

            <button 
              onClick={nextTrack}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

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

        <div className="mt-8 text-center bg-black/30 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-green-400 font-semibold mb-2">NOW PLAYING</p>
          <p className="text-2xl font-bold">{currentTrack.title} - {currentTrack.artist}</p>
          <p className="text-gray-400 mt-2">
            Track {currentTrackIndex + 1} of {playlist.length} • Music Visualizer Active
          </p>
        </div>
      </div>

      <audio
        ref={audioRef}
        id="main-audio"
        src={currentTrack.src}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.target.duration);
          setCurrentTime(0);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

const ProfilePage = () => {
  const [sparkles, setSparkles] = useState([]);
  const [currentPage, setCurrentPage] = useState("beranda");
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // PWA Installation Logic
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOS);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setShowInstallPrompt(false);
      setIsStandalone(true);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleIOSInstall = () => {
    setShowInstallPrompt(false);
    alert('Untuk install app di iOS:\n1. Tap share button (kotak dengan panah)\n2. Pilih "Add to Home Screen"');
  };

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
          {/* PWA Badge */}
          {isStandalone && (
            <div className="fixed top-16 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium z-30">
              📱 App
            </div>
          )}

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
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-white/10 backdrop-blur-sm text-white rounded-lg shadow-md hover:scale-105 hover:bg-white/20 transition-all duration-300"
              >
                <button.icon className="w-6 h-6 mr-3" />
                <span className="font-medium">{button.text}</span>
              </a>
            ))}
          </div>
        </main>

        {/* Install PWA Prompt */}
        {showInstallPrompt && !isStandalone && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 p-4 rounded-lg shadow-2xl z-50 max-w-sm mx-4 border-2 border-green-500">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">Install App</p>
                <p className="text-sm text-gray-600 mt-1">
                  Install aplikasi untuk experience yang lebih baik! Buka offline dan load lebih cepat.
                </p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => setShowInstallPrompt(false)}
                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Nanti
                  </button>
                  <button
                    onClick={isIOS ? handleIOSInstall : handleInstallClick}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 font-medium flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install</span>
                  </button>
                </div>
                {isIOS && (
                  <p className="text-xs text-gray-500 mt-2">
                    *Untuk iOS: Tap share → "Add to Home Screen"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

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