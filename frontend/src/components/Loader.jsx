import React from 'react';

const Loader = ({ text = "loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-3 w-full">
            <div className="w-48 h-0.5 bg-gray-800 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full w-1/3 bg-white/50 rounded-full animate-[slide_1.5s_ease-in-out_infinite]" style={{ animation: 'slide 1.5s ease-in-out infinite' }} />
                <div className="h-full bg-white animate-pulse w-full origin-left" />
            </div>
            {text && <p className="text-gray-500 text-xs font-medium tracking-wide animate-pulse lowercase">{text}</p>}
            <style>{`
        @keyframes slide {
          0% { left: -40%; }
          100% { left: 100%; }
        }
      `}</style>
        </div>
    );
};

export default Loader;
