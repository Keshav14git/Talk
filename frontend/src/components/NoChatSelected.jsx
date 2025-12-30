import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-black">
      <div className="animate-fade-in opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
        <img src="/Orchestr (3).png" alt="Orchestr" className="w-24 md:w-32" />
      </div>
    </div>
  );
};
export default NoChatSelected;
