import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function RevenueChart({ data, loading }) {
  if (loading)
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold uppercase text-[10px] tracking-widest animate-pulse">
        Analyzing Profit Margins...
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          {/* Emerald Gradient for Profit */}
          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f1f5f9"
          vertical={false}
        />

        <XAxis
          dataKey="label"
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          dy={15}
          fontWeight="bold"
        />

        <YAxis
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => `₹${val}`}
        />

        <Tooltip
          cursor={{ stroke: "#10b981", strokeWidth: 2 }}
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "none",
            borderRadius: "16px",
            padding: "12px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
          }}
          itemStyle={{ fontWeight: "bold", fontSize: "12px", color: "#10b981" }}
          labelStyle={{
            color: "#94a3b8",
            marginBottom: "4px",
            fontSize: "10px",
            fontWeight: "900",
            textTransform: "uppercase",
          }}
          formatter={(value) => [
            `₹${parseFloat(value).toLocaleString()}`,
            "Platform Profit",
          ]}
        />

        <Area
          type="monotone"
          dataKey="value"
          stroke="#10b981"
          strokeWidth={4}
          fillOpacity={1}
          fill="url(#colorProfit)"
          animationDuration={1500}
        />

        {data[0]?.users !== undefined && (
          <Area
            type="monotone"
            dataKey="users"
            name="New Users"
            stroke="#6366f1"
            strokeWidth={2}
            fill="none"
            strokeDasharray="5 5"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
