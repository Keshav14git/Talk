import React from "react";

const AuthImagePattern = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 right-margin-10px">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          className="w-3/4 h-3/4"
        >
          <defs>
            <pattern
              id="waves"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 0 10 Q 10 0 20 10 T 40 10"
                stroke="white"
                fill="transparent"
                strokeWidth="2"
              />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#waves)" />
        </svg>
      </div>

      {/* Text positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 text-white text-center z-10 p-6 mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to TALK for "Friends"</h1>
        <p className="text-lg">Where Conversations Resonate</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;