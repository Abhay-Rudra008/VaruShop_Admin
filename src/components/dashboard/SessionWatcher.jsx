import { useState, useEffect } from "react";
import { getTokenExpiry } from "../../utils/auth";
import adminAPI from "../../api/adminAPI";
import { AlertTriangle, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function SessionWatcher() {
  const [showPopup, setShowPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const WARNING_THRESHOLD = 2 * 60 * 1000;

  const handleRefresh = async () => {
    try {
      setIsProcessing(true);

      const refreshToken = localStorage.getItem("adminRefreshToken");

      if (!refreshToken) {
        throw new Error("No refresh token found in storage.");
      }

      const res = await adminAPI.post("/auth/refresh", {
        refreshToken: refreshToken,
      });

      if (res.data.success && res.data.accessToken) {
        localStorage.setItem("adminToken", res.data.accessToken);

        setShowPopup(false);
        const newExpiry = getTokenExpiry(res.data.accessToken);
        setTimeLeft(Math.floor((newExpiry - Date.now()) / 1000));

        toast.success("Session Extended");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Refresh failed:", err);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminRefreshToken");
      window.location.href = "/login";
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const expiry = getTokenExpiry(token);
      const remaining = expiry - Date.now();

      if (remaining <= WARNING_THRESHOLD && remaining > 0) {
        setShowPopup(true);
        setTimeLeft(Math.floor(remaining / 1000));
      } else if (remaining <= 0) {
        localStorage.clear();
        window.location.href = "/login";
      }
    };

    const interval = setInterval(checkToken, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full mb-6">
            <AlertTriangle
              className="text-amber-600 dark:text-amber-400"
              size={32}
            />
          </div>

          <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">
            Session Expiring
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">
            Your admin session will expire soon due to inactivity. Would you
            like to stay logged in?
          </p>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-6 py-3 rounded-2xl mb-8">
            <Clock size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
              Expiring in ~{Math.ceil(timeLeft / 60)} minutes
            </span>
          </div>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={handleRefresh}
              disabled={isProcessing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none uppercase text-xs tracking-widest disabled:opacity-50"
            >
              {isProcessing ? "Refreshing..." : "Extend Session"}
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 font-bold py-3 rounded-2xl transition-all text-xs uppercase"
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
