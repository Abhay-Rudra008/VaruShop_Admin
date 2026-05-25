import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import SessionWatcher from "../dashboard/SessionWatcher";
import { useAuthTimeout } from "../../hooks/useAuthTimeout";

export default function DashboardLayout() {
  useAuthTimeout();

  const [isOpen, setIsOpen] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    const savedAdmin = localStorage.getItem("adminData");
    if (savedAdmin) setAdmin(JSON.parse(savedAdmin));
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <SessionWatcher />

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} darkMode={darkMode} />

      <div
        className="flex flex-col flex-1 transition-all duration-300 ease-in-out"
        style={{ marginLeft: isOpen ? "16rem" : "4rem" }}
      >
        <header
          className="fixed top-0 z-30 transition-all duration-300 ease-in-out border-b border-slate-200 dark:border-slate-800"
          style={{ left: isOpen ? "16rem" : "4rem", right: 0 }}
        >
          <Navbar
            setIsOpen={setIsOpen}
            admin={admin}
            darkMode={darkMode}
            toggleDarkMode={() => setDarkMode(!darkMode)}
          />
        </header>

        <main className="flex-1 overflow-y-auto mt-[64px] bg-slate-100 dark:bg-slate-900 p-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
