export default function StatCard({ title, value, icon, subtitle }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-300 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest">
          {title}
        </h3>
        {icon && (
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
            {icon}
          </div>
        )}
      </div>

      <div>
        <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}