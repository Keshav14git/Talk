import React from "react";
import { MessageSquare, Headphones, Users } from "lucide-react";

const AuthImagePattern2 = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-violet-600 relative">
      {/* Background Icons Pattern */}
      <div className="absolute inset-0 flex flex-wrap items-center justify-center opacity-20 gap-10">
        <div className="w-24 h-24 flex items-center justify-center bg-white bg-opacity-40 rounded-full">
          <MessageSquare className="w-16 h-16 text-purple" />
        </div>
        <div className="w-24 h-24 flex items-center justify-center bg-white bg-opacity-40 rounded-full">
          <Headphones className="w-16 h-16 text-purple" />
        </div>
        <div className="w-24 h-24 flex items-center justify-center bg-white bg-opacity-40 rounded-full">
          <Users className="w-16 h-16 text-purple" />
        </div>
      </div>

      {/* Text positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 text-white text-center z-10 p-6 mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to TALK for "Friends"</h1>
        <p className="text-lg">Where Conversations Resonate</p>
      </div>
    </div>
  );
};

export default AuthImagePattern2;