import { NavLink } from "react-router-dom";
import {
  faBars,
  faTimes,
  faTachometerAlt,
  faUsers,
  faBox,
  faStore,
  faStar,
  faLayerGroup,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <div
      className="h-screen fixed top-0 left-0 z-50 bg-slate-900 dark:bg-slate-900 text-white flex flex-col shadow-xl transition-all duration-300 overflow-hidden border-r border-slate-700 dark:border-slate-800"
      style={{ width: isOpen ? "16rem" : "4rem" }}
    >
      {/* Header - Fixed 64px height to match Navbar line */}
      <div className="flex justify-between items-center px-6 h-[64px] border-b border-slate-700 dark:border-slate-800 shrink-0">
        {isOpen && (
          <h2 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
            Admin Panel
          </h2>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col mt-6 space-y-1 flex-1 px-2">
        <SidebarItem
          to="/dashboard"
          icon={faTachometerAlt}
          label="Overview"
          isOpen={isOpen}
          end
        />
        <SidebarItem
          to="/dashboard/users"
          icon={faUsers}
          label="Users"
          isOpen={isOpen}
        />
        <SidebarItem
          to="/dashboard/products"
          icon={faBox}
          label="Products"
          isOpen={isOpen}
        />
        <SidebarItem
          to="/dashboard/payments"
          icon={faBox}
          label="Payment"
          isOpen={isOpen}
        />
        <SidebarItem
          to="/dashboard/retailers"
          icon={faStore}
          label="Retailers"
          isOpen={isOpen}
        />
        <SidebarItem
          to="/dashboard/categories"
          icon={faLayerGroup}
          label="Categories"
          isOpen={isOpen}
        />
        <SidebarItem
          to="/dashboard/reviews"
          icon={faStar}
          label="Reviews"
          isOpen={isOpen}
        />
      </nav>
    </div>
  );
}

function SidebarItem({ to, icon, label, isOpen, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
        ${
          isActive
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <div className="w-5 flex justify-center">
        <FontAwesomeIcon icon={icon} className="text-sm" />
      </div>
      {isOpen && (
        <span className="text-xs font-bold uppercase tracking-wider">
          {label}
        </span>
      )}
    </NavLink>
  );
}
