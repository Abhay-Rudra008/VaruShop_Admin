import { useState, useEffect } from "react";
import { API_ROUTES } from "../utils/apiRoutes";
import useAdminTable from "../hooks/useAdminTable";
import {
  CheckCircle,
  Clock,
  Search,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Wallet,
  Banknote,
  Landmark,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Payment() {
  // 1. Replaced fetch states with useAdminTable Hook
  const { data: payouts = [], loading, executeAction } = useAdminTable(
    API_ROUTES.ADMIN_PAYOUTS.GET_ALL
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    data: null,
  });
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // 2. Automatically reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleOpenConfirm = (payout) => {
    setAdminNotes("");
    setConfirmModal({ isOpen: true, data: payout });
  };

  // 3. Updated to use the hook's executeAction for silent refreshing
  const executeSettle = async () => {
    if (!confirmModal.data) return;
    
    setIsProcessing(true);

    const success = await executeAction(
      API_ROUTES.ADMIN_PAYOUTS.SETTLE(confirmModal.data.id),
      "PUT",
      { admin_notes: adminNotes || "Settled by Admin" }
    );

    if (success) {
      toast.success(`Funds disbursed to ${confirmModal.data.retailer_name}`);
      setConfirmModal({ isOpen: false, data: null });
    }
    
    setIsProcessing(false);
  };

  const totalPending = payouts
    .filter((p) => p.status === "REQUESTED")
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  const totalSettled = payouts
    .filter((p) => p.status === "PAID_OUT" || p.status === "APPROVED_BY_ADMIN")
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  const filteredData = payouts.filter((p) => {
    const matchesSearch =
      p.retailer_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toString().includes(search);
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-slate-400">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em]">
          Accessing Ledger...
        </p>
      </div>
    );

  return (
    <div>
      <div className="max-w-[1600px] mx-auto pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              Withdrawal Requests
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Manage and disburse retailer earnings.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <FinancialStatCard
              label="Pending Settlement"
              value={formatCurrency(totalPending)}
              icon={<Wallet size={18} />}
              color="amber"
            />
            <FinancialStatCard
              label="Total Disbursed"
              value={formatCurrency(totalSettled)}
              icon={<Banknote size={18} />}
              color="emerald"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-6 mb-8 items-center">
          <div className="relative flex-1 w-full text-slate-400">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by Retailer or Request ID..."
              className="w-full pl-14 pr-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-slate-700 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-3xl shrink-0">
            {["ALL", "REQUESTED", "PAID_OUT"].map((btn) => (
              <button
                key={btn}
                onClick={() => setStatusFilter(btn)}
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === btn
                    ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {btn === "PAID_OUT" ? "SETTLED" : btn}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                  Retailer Entity
                </th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                  Request ID
                </th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                  Requested Amount
                </th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                  Status
                </th>
                <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {currentItems.length > 0 ? (
                currentItems.map((p) => (
                  <tr
                    key={p.id}
                    className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all"
                  >
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-black text-xs text-white uppercase shadow-lg shadow-indigo-500/20">
                          {p.retailer_name?.charAt(0) || "R"}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tight">
                            {p.retailer_name || "Unknown Retailer"}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 lowercase">
                            {p.retailer_email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8 font-mono text-xs font-black text-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 px-3 py-1 rounded-lg w-fit">
                      #REQ-{p.id}
                    </td>
                    <td className="p-8">
                      <p className="font-black text-lg text-slate-800 dark:text-white">
                        {formatCurrency(p.amount)}
                      </p>
                      <p
                        className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate max-w-[150px]"
                        title={p.bank_account_details}
                      >
                        {p.bank_account_details}
                      </p>
                    </td>
                    <td className="p-8">
                      {p.status === "REQUESTED" && (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-2xl w-fit">
                          <Clock size={14} className="animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Pending
                          </span>
                        </div>
                      )}
                      {(p.status === "PAID_OUT" ||
                        p.status === "APPROVED_BY_ADMIN") && (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-2xl w-fit">
                          <CheckCircle size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Settled
                          </span>
                        </div>
                      )}
                      {p.status === "REJECTED" && (
                        <div className="flex items-center gap-2 text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-2xl w-fit">
                          <XCircle size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Rejected
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-8 text-right">
                      {p.status === "REQUESTED" ? (
                        <button
                          onClick={() => handleOpenConfirm(p)}
                          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-6 py-4 rounded-2xl uppercase hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 dark:shadow-none inline-flex items-center gap-3"
                        >
                          Disburse Funds <ArrowRight size={16} />
                        </button>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase italic tracking-widest">
                          Action Complete
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="p-32 text-center text-slate-200 dark:text-slate-800"
                  >
                    <ShieldAlert size={60} className="mx-auto mb-6" />
                    <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">
                      Zero records matching current criteria
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div className="p-8 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Entries per page: {itemsPerPage}
            </p>
            <div className="flex items-center gap-4">
              <PaginationButton
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                icon={<ChevronLeft size={20} />}
              />
              <div className="px-6 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 font-black text-xs text-indigo-600">
                Page {currentPage} of {totalPages || 1}
              </div>
              <PaginationButton
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                icon={<ChevronRight size={20} />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOM AUTHORIZATION MODAL*/}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/5">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-8 mx-auto ring-8 ring-indigo-50/50 dark:ring-indigo-900/10">
                <Banknote size={36} />
              </div>

              <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800 dark:text-white mb-2">
                Authorize Transfer
              </h2>
              <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">
                You are about to transfer{" "}
                <span className="font-black text-indigo-600">
                  {formatCurrency(confirmModal.data.amount)}
                </span>{" "}
                to{" "}
                <span className="font-black text-slate-800 dark:text-white">
                  {confirmModal.data.retailer_name}
                </span>
                .
              </p>

              {/* Bank Details Display */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl mb-6 text-left border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4 text-slate-700 dark:text-slate-200 font-bold">
                  <Landmark size={18} className="text-indigo-500" />
                  <span>Destination Bank Details</span>
                </div>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-pre-wrap break-words">
                  {confirmModal.data.bank_account_details}
                </p>
              </div>

              {/* Admin Notes Input */}
              <div className="mb-8 text-left">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-4 mb-2 block">
                  Transaction Ref / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. UPI Ref: 3123445..."
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-slate-700 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  disabled={isProcessing}
                  onClick={executeSettle}
                  className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isProcessing
                    ? "Processing Ledger..."
                    : "Confirm Transfer Sent"}
                </button>
                <button
                  onClick={() => setConfirmModal({ isOpen: false, data: null })}
                  className="w-full py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  Cancel Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*HELPER COMPONENTS */
function FinancialStatCard({ label, value, icon, color }) {
  const themes = {
    amber:
      "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800",
    emerald:
      "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800",
  };
  return (
    <div
      className={`px-8 py-5 rounded-[2rem] border shadow-sm flex items-center gap-6 ${themes[color]}`}
    >
      <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
          {label}
        </p>
        <p className="text-2xl font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function PaginationButton({ onClick, disabled, icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 disabled:opacity-20 transition-all hover:scale-110 active:scale-95"
    >
      {icon}
    </button>
  );
}