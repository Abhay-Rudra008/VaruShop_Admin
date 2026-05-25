import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, User, LogOut, Sun, Moon, ChevronDown } from "lucide-react";
import { BACKEND_URL } from "../../api/adminAPI"; // Import your central IP config

export default function Navbar({ setIsOpen, admin }) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );
  const menuRef = useRef();

  const getProfilePic = (img) => {
    if (!img) return null;
    return img.startsWith("http") ? img : `${BACKEND_URL}/${img}`;
  };

  // Toggle dark/light mode
  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/login");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between transition-colors duration-300 sticky top-0 z-40">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={22} className="text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">
          VaruShop <span className="text-indigo-600">Admin</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition-all"
        >
          {darkMode ? (
            <Sun size={18} className="text-yellow-400" />
          ) : (
            <Moon size={18} />
          )}
        </button>

        {/* Notifications */}
        <div className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors">
          <Bell className="text-slate-600 dark:text-slate-300" size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1 pr-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
          >
            {admin?.profile_image ? (
              <img
                src={getProfilePic(admin.profile_image)}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/20"
                alt="admin"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                <User size={20} />
              </div>
            )}
            <div className="hidden lg:block text-left">
              <p className="text-xs font-black text-slate-800 dark:text-white leading-none">
                {admin?.name || "Varu Admin"}
              </p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">
                {admin?.email || "admin@varushop.com"}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b dark:border-slate-800 lg:hidden">
                <p className="text-sm font-black dark:text-white">
                  {admin?.name}
                </p>
                <p className="text-[10px] text-slate-500">{admin?.email}</p>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <User size={16} /> Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors font-bold"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
