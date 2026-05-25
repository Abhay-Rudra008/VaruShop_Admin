import { useState, useEffect, useMemo } from "react";
import { BACKEND_URL } from "../api/adminAPI";
import { API_ROUTES } from "../utils/apiRoutes";
import useAdminTable from "../hooks/useAdminTable";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  UserCheck,
  UserX,
  RefreshCcw,
  ShieldCheck,
  ShieldAlert,
  X,
} from "lucide-react";

export default function Retailers() {
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageRetailer, setImageRetailer] = useState(null);
  const [selectedRetailer, setSelectedRetailer] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 1. Determine Endpoint based on Tab
  const currentEndpoint =
    tab === "active"
      ? API_ROUTES.ADMIN_RETAILERS.GET_ACTIVE
      : API_ROUTES.ADMIN_RETAILERS.GET_TRASH;

  // 2. Use Custom Hook for Retailers
  const { data: currentData = [], loading, executeAction } = useAdminTable(currentEndpoint);

  // 3. Reset Pagination automatically on any filter or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [tab, search, statusFilter, startDate, endDate]);

  // 4. Filter the data coming from the hook
  const filteredRetailers = useMemo(() => {
    return currentData
      .filter((r) => r.name?.toLowerCase().includes(search.toLowerCase()))
      .filter((r) => {
        // 🔥 FIXED: Map the filter to the actual 'is_blocked' database field
        if (statusFilter === "all") return true;
        if (statusFilter === "active") return !r.is_blocked;
        if (statusFilter === "blocked") return r.is_blocked;
        return true;
      })
      .filter((r) => {
        if (!startDate && !endDate) return true;
        const retailerDate = new Date(r.createdAt || r.created_at);
        if (startDate && retailerDate < new Date(startDate)) return false;
        if (endDate && retailerDate > new Date(endDate)) return false;
        return true;
      });
  }, [currentData, search, statusFilter, startDate, endDate]);

  const totalItems = filteredRetailers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRetailers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const getProfileImg = (img) => {
    if (!img) return null;
    return img.startsWith("http") ? img : `${BACKEND_URL}/${img}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto p-6 pt-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase">
              Retailers
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mt-1">
              Merchant Verification & Control
            </p>
          </div>

          <div className="flex p-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border dark:border-slate-800">
            {["active", "trash"].map((t) => (
              <button
                key={t}
                className={`px-8 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                  tab === t
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap gap-6 mb-8 items-end">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 ml-1 tracking-widest">
              Search Stores
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* 🔥 FIXED: Status Dropdown added to filter active vs blocked */}
          <div className="flex gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest text-center">
                Status
              </label>
              <select
                className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-xs font-bold outline-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Retailers</option>
                <option value="active">Active Only</option>
                <option value="blocked">Blocked Only</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest text-center">
                Joined After
              </label>
              <input
                type="date"
                className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-xs font-bold outline-none cursor-pointer"
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest text-center">
                Joined Before
              </label>
              <input
                type="date"
                className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-xs font-bold outline-none cursor-pointer"
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="p-6">Store Detail</th>
                <th className="p-6">Contact Email</th>
                {tab === "active" && <th className="p-6">Account Status</th>}
                {tab === "active" && (
                  <th className="p-6 text-center">Verification</th>
                )}
                <th className="p-6">Registration</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y dark:divide-slate-800 relative">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-32 text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">
                      Syncing Retailers...
                    </p>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <ShieldAlert
                      size={48}
                      className="mx-auto text-slate-200 mb-4"
                    />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                      No matching retailers found
                    </p>
                  </td>
                </tr>
              ) : (
                currentItems.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-all"
                    onClick={() => setSelectedRetailer(r)}
                  >
                    <td className="p-6 flex items-center gap-4">
                      <div
                        className="relative group"
                        onClick={(e) => {
                          if (r.profile_image) {
                            e.stopPropagation();
                            setImageRetailer(r);
                          }
                        }}
                      >
                        {r.profile_image ? (
                          <img
                            src={getProfileImg(r.profile_image)}
                            alt=""
                            className="w-12 h-12 rounded-2xl object-cover shadow-sm ring-4 ring-white dark:ring-slate-800"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm ring-4 ring-white dark:ring-slate-800 uppercase">
                            {r.name?.charAt(0) || "M"}
                          </div>
                        )}
                        {r.profile_image && (
                          <div className="absolute inset-0 bg-indigo-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Search size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                      <span className="font-black text-slate-800 dark:text-slate-100 uppercase text-sm">
                        {r.name}
                      </span>
                    </td>
                    <td className="p-6 text-sm font-semibold text-slate-500 dark:text-slate-400 lowercase">
                      {r.email}
                    </td>

                    {tab === "active" && (
                      <td className="p-6">
                        {/* 🔥 FIXED: Uses actual 'is_blocked' from DB schema */}
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            r.is_blocked
                              ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30"
                              : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                          }`}
                        >
                          {r.is_blocked ? "Suspended" : "Active"}
                        </span>
                      </td>
                    )}

                    {tab === "active" && (
                      <td className="p-6 text-center">
                        {r.is_approved ? (
                          <span className="text-emerald-500 text-[10px] font-black uppercase flex items-center justify-center gap-1">
                            <ShieldCheck size={14} /> Verified
                          </span>
                        ) : (
                          <span className="text-amber-500 text-[10px] font-black uppercase flex items-center justify-center gap-1 animate-pulse">
                            Pending
                          </span>
                        )}
                      </td>
                    )}

                    <td className="p-6 text-[11px] font-bold text-slate-400">
                      {new Date(r.createdAt || r.created_at).toLocaleDateString(
                        "en-GB",
                      )}
                    </td>

                    <td
                      className="p-6 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-3">
                        {tab === "active" ? (
                          <>
                            {!r.is_approved && (
                              <button
                                onClick={() =>
                                  executeAction(API_ROUTES.ADMIN_RETAILERS.APPROVE(r.id), "PUT")
                                }
                                className="group relative p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                              >
                                <UserCheck size={16} />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                  Approve
                                </span>
                              </button>
                            )}
                            <button
                              onClick={() =>
                                executeAction(
                                  API_ROUTES.ADMIN_RETAILERS.BLOCK(r.id), 
                                  "PUT", 
                                  { is_blocked: !r.is_blocked } // 🔥 FIXED: Pass the toggled value safely to backend!
                                )
                              }
                              className={`group relative p-2 rounded-xl transition-all ${
                                r.is_blocked ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 hover:bg-emerald-600 hover:text-white" : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 hover:bg-amber-600 hover:text-white"
                              }`}
                            >
                              {r.is_blocked ? (
                                <UserCheck size={16} />
                              ) : (
                                <UserX size={16} />
                              )}
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {r.is_blocked ? "Unblock" : "Block"}
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                executeAction(
                                  API_ROUTES.ADMIN_RETAILERS.SOFT_DELETE(r.id),
                                  "DELETE",
                                  {},
                                  "Soft delete this merchant?"
                                )
                              }
                              className="group relative p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                            >
                              <Trash2 size={16} />
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Delete
                              </span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                executeAction(API_ROUTES.ADMIN_RETAILERS.RESTORE(r.id), "PUT")
                              }
                              className="group relative p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                            >
                              <RefreshCcw size={16} />
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Restore
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                executeAction(
                                  API_ROUTES.ADMIN_RETAILERS.PERMANENT_DELETE(r.id),
                                  "DELETE",
                                  {},
                                  "This will wipe all merchant data forever. Proceed?"
                                )
                              }
                              className="group relative p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                            >
                              <Trash2 size={16} />
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Permanent Delete
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-t dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, totalItems)} of {totalItems}
            </span>
            <div className="flex items-center gap-4">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm disabled:opacity-20 transition-all hover:scale-110 active:scale-95 border border-slate-100 dark:border-slate-700"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                disabled={currentPage === totalPages || totalPages === 0 || loading}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm disabled:opacity-20 transition-all hover:scale-110 active:scale-95 border border-slate-100 dark:border-slate-700"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {imageRetailer && imageRetailer.profile_image && (
        <div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[100] p-6"
          onClick={() => setImageRetailer(null)}
        >
          <button className="absolute top-8 right-8 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all">
            <X size={24} />
          </button>
          <img
            src={getProfileImg(imageRetailer.profile_image)}
            className="max-w-full max-h-[80vh] rounded-[3rem] shadow-2xl border-4 border-white/10"
            alt="Profile"
          />
        </div>
      )}

      {selectedRetailer && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={() => setSelectedRetailer(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="h-24 bg-indigo-600"></div>
            <div className="px-8 pb-8">
              <div className="relative -mt-12 mb-6 flex justify-center">
                {selectedRetailer.profile_image ? (
                  <img
                    src={getProfileImg(selectedRetailer.profile_image)}
                    className="w-24 h-24 rounded-[2rem] border-4 border-white dark:border-slate-900 object-cover shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-[2rem] border-4 border-white dark:border-slate-900 bg-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-xl uppercase">
                    {selectedRetailer.name?.charAt(0) || "M"}
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-black text-center mb-1 uppercase tracking-tighter">
                {selectedRetailer.name}
              </h3>
              <p className="text-slate-400 text-center text-xs font-bold uppercase tracking-widest mb-6 lowercase">
                {selectedRetailer.email}
              </p>

              <div className="space-y-3">
                <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Account Status
                  </span>
                  {/* 🔥 FIXED DIALOG DISPLAY TOO */}
                  <span className={`text-xs font-black uppercase ${selectedRetailer.is_blocked ? "text-rose-500" : "text-emerald-500"}`}>
                    {selectedRetailer.is_blocked ? "Suspended" : "Active"}
                  </span>
                </div>
                <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    KYC Verification
                  </span>
                  <span
                    className={`text-xs font-black uppercase ${selectedRetailer.is_approved ? "text-emerald-500" : "text-amber-500"}`}
                  >
                    {selectedRetailer.is_approved ? "Verified" : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Onboarding Date
                  </span>
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300">
                    {new Date(
                      selectedRetailer.createdAt || selectedRetailer.created_at,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedRetailer(null)}
                className="mt-8 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-transform active:scale-95"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}