const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        {/* Image Display */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce">
          <img src="/talkw.svg" alt="logo" className="w-[124px] h-[124px] " />
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Welcome to TALK!</h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
