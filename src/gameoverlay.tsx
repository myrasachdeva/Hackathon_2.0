import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameOverlayProps {
  url: string | null;
  onExit: () => void;
}

const GameOverlay = ({ url, onExit }: GameOverlayProps) => {
  const [isBreakingDown, setIsBreakingDown] = useState(true);
  const [showGame, setShowGame] = useState(false);

  useEffect(() => {
    // Phase 1: Keep the breakdown visible for a longer duration to see the animation
    const timer = setTimeout(() => {
      setIsBreakingDown(false);
      setShowGame(true);
    }, 2500); // Increased to 2.5s so the 1.5s falling animation finishes

    return () => clearTimeout(timer);
  }, []);

  // Generate 250 larger "code blocks" for a chunky retro effect
  const pixels = Array.from({ length: 250 });

  return (
    <div className="fixed inset-0 z-[999] bg-[#0F011E] flex flex-col">
      {/* 1. THE PIXEL BREAKDOWN LAYER */}
      <AnimatePresence>
        {isBreakingDown && (
          <div className="absolute inset-0 z-[1000] pointer-events-none overflow-hidden">
            {pixels.map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 1, 
                  y: -100, 
                }}
                animate={{ 
                  y: 1200, 
                  rotate: [0, 90, 180, 270, 360],
                  opacity: [1, 1, 0.9, 0] 
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  width: '16px', // Much bigger blocks
                  height: '16px', // Square blocks
                  backgroundColor: Math.random() > 0.4 ? '#FFD700' : '#FFFFFF',
                  boxShadow: '4px 4px 0px rgba(0,0,0,0.3)', // Retro shadow effect
                  position: 'absolute',
                  zIndex: 1001,
                  borderRadius: '0px', // Perfect sharp squares
                  border: '2px solid rgba(0,0,0,0.1)' // Defined edges
                }}
                transition={{ 
                  duration: 1.2 + Math.random() * 0.8, 
                  delay: Math.random() * 2, 
                  ease: "linear",
                  repeat: 0
                }}
              />
            ))}
            <motion.div 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F011E] flex items-center justify-center"
            >
              <h2 className="text-[#FFD700] font-mono text-2xl animate-pulse tracking-tighter">
                REVIVING CODE...
              </h2>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. THE GAME INTERFACE */}
      <div className="flex flex-col h-full">
        <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
          <button 
            onClick={onExit}
            className="text-[#FFD700] font-mono font-bold hover:scale-105 transition-transform"
          >
            [ ESCAPE_SESSION ]
          </button>
          <div className="flex items-center gap-2 text-white/30 text-[10px] font-mono">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            LIVE_FEED: {url}
          </div>
        </div>

        <div className="flex-grow bg-black">
          {showGame && url && (
            <motion.iframe
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={url}
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin allow-forms"
              allow="autoplay; fullscreen; keyboard"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GameOverlay;
