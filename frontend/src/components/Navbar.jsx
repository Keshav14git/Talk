import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { LogOut, Settings } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="h-12 min-h-[3rem] bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-gray-700 text-sm font-medium">Connected</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/settings" className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500">
          <Settings className="size-4" />
        </Link>
        <button onClick={logout} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors text-gray-500">
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  );
};
export default Navbar;