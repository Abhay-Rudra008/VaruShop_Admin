import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/dashboard/StatCard";
import RevenueChart from "../components/dashboard/RevenueChart";
import adminAPI from "../api/adminAPI";
import { API_ROUTES } from "../utils/apiRoutes";
import { Users, Store, IndianRupee, TrendingUp, Clock } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRetailers: 0,
    grossSales: 0,
    adminProfit: 0,
    pendingDues: 0,
    totalPaidOut: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [timeFilter, setTimeFilter] = useState("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const endpoint = `${API_ROUTES.ADMIN_DASHBOARD.REVENUE}?filter=${timeFilter}`;
        const res = await adminAPI.get(endpoint);

        if (res.data.success) {
          setStats(res.data.data.summary);
          setChartData(res.data.data.chartData);
        }
      } catch (err) {
        console.error("Dashboard Sync Failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [timeFilter]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
            Admin Overview
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Platform performance & commission tracking.
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-2xl flex items-center gap-2 border border-emerald-100 dark:border-emerald-800">
          <TrendingUp size={16} className="text-emerald-500" />
          <span className="text-xs font-black text-emerald-600 uppercase tracking-tighter">
            Live Status: Sync Active
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          title="Platform Profit"
          value={loading ? "..." : formatCurrency(stats.adminProfit)}
          icon={<TrendingUp size={20} className="text-emerald-600" />}
          subtitle="Total 10% Commission"
        />
        
        {/* WRAPPED IN A DIV TO MAKE IT CLICKABLE */}
        <div 
          onClick={() => navigate("/admin/payouts")} // Adjust this route to match your actual payouts route!
          className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <StatCard
            title="Outstanding Dues"
            value={loading ? "..." : formatCurrency(stats.pendingDues)}
            icon={<Clock size={20} className="text-amber-600" />}
            subtitle="Click to settle dues →"
          />
        </div>

        <StatCard
          title="Gross Sales"
          value={loading ? "..." : formatCurrency(stats.grossSales)}
          icon={<IndianRupee size={20} className="text-blue-600" />}
        />
        <StatCard
          title="Total Users"
          value={loading ? "..." : stats.totalUsers.toLocaleString()}
          icon={<Users size={20} className="text-indigo-600" />}
        />
        <StatCard
          title="Retailers"
          value={loading ? "..." : stats.totalRetailers.toLocaleString()}
          icon={<Store size={20} className="text-slate-600" />}
        />
      </div>

      {/* Analytics Chart */}
      <div className="mt-8 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-widest">
              Profit Analytics
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
              Platform Commission Growth Trend
            </p>
          </div>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 text-xs font-black p-3 px-5 rounded-2xl border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-white"
          >
            <option value="week">Weekly View</option>
            <option value="month">Monthly View</option>
            <option value="year">Yearly View</option>
          </select>
        </div>
        <div className="h-[380px] w-full">
          <RevenueChart data={chartData} loading={loading} />
        </div>
      </div>
    </div>
  );
}