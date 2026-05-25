import { useState, useEffect, useMemo } from "react";
import adminAPI, { BACKEND_URL } from "../api/adminAPI";
import { API_ROUTES } from "../utils/apiRoutes";
import useAdminTable from "../hooks/useAdminTable";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  RotateCcw,
  UserX,
  UserCheck,
  ShieldAlert,
  X,
} from "lucide-react";

export default function Users() {
  const [selectedTab, setSelectedTab] = useState("ACTIVE");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null); // RESTORED
  const [imageUser, setImageUser] = useState(null);       // RESTORED
  const itemsPerPage = 8;

  // 1. Determine which endpoint to call based on the tab
  const currentEndpoint =
    selectedTab === "TRASH"
      ? API_ROUTES.ADMIN_USERS.GET_TRASH
      : API_ROUTES.ADMIN_USERS.GET_ACTIVE;

  // 2. Use your custom hook!
  const { data: users, loading, executeAction } = useAdminTable(currentEndpoint);

  // 3. Reset pagination on search or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTab]);

  // 4. Filter the data coming from the hook
  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getProfileImg = (img) => {
    if (!img) return null;
    return img.startsWith("http") ? img : `${BACKEND_URL}/${img}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto p-6 pt-24">
        {/* Header (Scrolls away) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase text-slate-800 dark:text-white">
              User Directory
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mt-1">
              Platform Account Oversight
            </p>
          </div>

          <div className="flex p-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border dark:border-slate-800">
            {["ACTIVE", "TRASH"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTab(t)}
                className={`px-8 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                  selectedTab === t
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* STICKY Search Bar Wrapper */}
        <div className="sticky top-0 z-30 py-4 bg-slate-100 dark:bg-slate-900 transition-colors">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
              />
            </div>
            <div className="hidden sm:block text-right pr-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Records Found
              </span>
              <span className="text-xl font-black text-indigo-600 leading-none">
                {loading ? "..." : filteredUsers.length}
              </span>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="p-6">User Identity</th>
                  <th className="p-6">Email Address</th>
                  <th className="p-6">Account Status</th>
                  <th className="p-6">Onboarding</th>
                  <th className="p-6 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y dark:divide-slate-800 relative">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-32 text-center">
                      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">
                        Syncing Users...
                      </p>
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <ShieldAlert
                        size={48}
                        className="mx-auto text-slate-200 mb-4"
                      />
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                        No users found in directory
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-all"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div
                            className="relative group"
                            onClick={(e) => {
                              if (user.profile_image) {
                                e.stopPropagation();
                                setImageUser(user);
                              }
                            }}
                          >
                            {user.profile_image ? (
                              <img
                                src={getProfileImg(user.profile_image)}
                                alt=""
                                className="w-12 h-12 rounded-2xl object-cover shadow-sm ring-4 ring-white dark:ring-slate-800"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm ring-4 ring-white dark:ring-slate-800 uppercase">
                                {user.name?.charAt(0) || "U"}
                              </div>
                            )}
                            {user.profile_image && (
                              <div className="absolute inset-0 bg-indigo-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Search size={14} className="text-white" />
                              </div>
                            )}
                          </div>
                          <span className="font-black text-slate-800 dark:text-slate-100 uppercase text-sm">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-sm font-semibold text-slate-500 dark:text-slate-400 lowercase">
                        {user.email}
                      </td>
                      <td className="p-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            user.is_blocked
                              ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30"
                              : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                          }`}
                        >
                          {user.is_blocked ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="p-6 text-[11px] font-bold text-slate-400">
                        {new Date(
                          user.created_at || user.createdAt,
                        ).toLocaleDateString("en-GB")}
                      </td>
                      <td
                        className="p-6 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-center gap-3">
                          {selectedTab === "ACTIVE" ? (
                            <>
                              <button
                                onClick={() =>
                                  executeAction(
                                    API_ROUTES.ADMIN_USERS.BLOCK(user.id),
                                    "PUT",
                                    { is_blocked: !user.is_blocked }
                                  )
                                }
                                title={
                                  user.is_blocked
                                    ? "Unblock User"
                                    : "Block User"
                                }
                                className={`p-2 rounded-xl transition-all ${
                                  user.is_blocked
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-amber-50 text-amber-600"
                                } hover:scale-110`}
                              >
                                {user.is_blocked ? (
                                  <UserCheck size={18} />
                                ) : (
                                  <UserX size={18} />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  executeAction(
                                    API_ROUTES.ADMIN_USERS.SOFT_DELETE(user.id),
                                    "DELETE",
                                    {},
                                    "Soft delete this user?"
                                  )
                                }
                                title="Delete User"
                                className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:scale-110 transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  executeAction(
                                    API_ROUTES.ADMIN_USERS.RESTORE(user.id),
                                    "PUT"
                                  )
                                }
                                title="Restore User"
                                className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:scale-110 transition-all"
                              >
                                <RotateCcw size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  executeAction(
                                    API_ROUTES.ADMIN_USERS.PERMANENT_DELETE(user.id),
                                    "DELETE",
                                    {},
                                    "This will wipe all account data forever. Proceed?"
                                  )
                                }
                                title="Permanent Delete"
                                className="p-2 bg-slate-900 text-white rounded-xl hover:scale-110 transition-all"
                              >
                                <Trash2 size={18} />
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
          </div>

          {/* Pagination */}
          <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-t dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="flex items-center gap-4">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm disabled:opacity-20 transition-all hover:scale-110 border border-slate-100 dark:border-slate-700"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={
                  currentPage === totalPages || totalPages === 0 || loading
                }
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm disabled:opacity-20 transition-all hover:scale-110 border border-slate-100 dark:border-slate-700"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {imageUser && imageUser.profile_image && (
        <div
          onClick={() => setImageUser(null)}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[100] p-6"
        >
          <button className="absolute top-8 right-8 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all">
            <X size={24} />
          </button>
          <img
            src={getProfileImg(imageUser.profile_image)}
            alt="User Profile"
            className="max-w-full max-h-[80vh] rounded-[3rem] shadow-2xl border-4 border-white/10"
          />
        </div>
      )}

      {selectedUser && (
        <div
          onClick={() => setSelectedUser(null)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="h-24 bg-indigo-600"></div>
            <div className="px-8 pb-8 text-center">
              <div className="relative -mt-12 mb-6 flex justify-center">
                {selectedUser.profile_image ? (
                  <img
                    src={getProfileImg(selectedUser.profile_image)}
                    className="w-24 h-24 rounded-[2rem] border-4 border-white dark:border-slate-900 object-cover shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-[2rem] border-4 border-white dark:border-slate-900 bg-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-xl uppercase">
                    {selectedUser.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-black mb-1 uppercase tracking-tighter">
                {selectedUser.name}
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 lowercase">
                {selectedUser.email}
              </p>

              <div className="space-y-3 text-left">
                {[
                  { label: "Designated Role", value: selectedUser.role },
                  { label: "System ID", value: `#${selectedUser.id}` },
                  {
                    label: "Account Status",
                    value: selectedUser.is_blocked ? "Suspended" : "Active",
                  },
                  {
                    label: "Join Date",
                    value: new Date(
                      selectedUser.created_at || selectedUser.createdAt,
                    ).toLocaleDateString(),
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl"
                  >
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      {item.label}
                    </span>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="mt-8 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-transform active:scale-95"
              >
                Close Information
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}