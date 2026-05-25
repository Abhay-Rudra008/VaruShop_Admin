import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
      <div className="flex-1 flex flex-col">
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
