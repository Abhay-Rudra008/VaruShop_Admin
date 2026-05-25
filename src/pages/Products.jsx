import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import adminAPI, { BACKEND_URL } from "../api/adminAPI";
import { API_ROUTES } from "../utils/apiRoutes";
import useAdminTable from "../hooks/useAdminTable";
import {
  Search,
  Trash2,
  RefreshCcw,
  Package,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Store,
  Archive,
  X,
  Filter,
  LayoutGrid,
} from "lucide-react";

export default function Products() {
  const [tab, setTab] = useState("active");
  const [categories, setCategories] = useState([]);
  
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const DEFAULT_PRODUCT_PIC =
    "https://img.magnific.com/free-vector/illustration-gallery-icon_53876-27002.jpg?semt=ais_hybrid&w=740&q=80";

  // 1. Determine Endpoint based on Tab
  const currentEndpoint =
    tab === "active"
      ? API_ROUTES.ADMIN_PRODUCTS.GET_ACTIVE
      : API_ROUTES.ADMIN_PRODUCTS.GET_TRASH;

  // 2. Use Custom Hook for Products
  const { data: currentData = [], loading, executeAction } = useAdminTable(currentEndpoint);

  // 3. Fetch Categories once for the dropdown filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await adminAPI.get(API_ROUTES.ADMIN_CATEGORIES.GET_ALL);
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  // 4. Reset Pagination automatically on any filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, showLowStock, selectedCategory, tab]);

  const getProductImg = (img) =>
    img
      ? img.startsWith("http")
        ? img
        : `${BACKEND_URL}/${img}`
      : DEFAULT_PRODUCT_PIC;

  const getRetailerImgPath = (img) =>
    img ? (img.startsWith("http") ? img : `${BACKEND_URL}/${img}`) : null;

  // Filter Data
  const filteredData = currentData.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.retailer_name?.toLowerCase().includes(search.toLowerCase());
    const matchesLowStock = showLowStock ? p.stock < 10 : true;
    const matchesCategory =
      selectedCategory === "all" ||
      p.category_id === parseInt(selectedCategory);
    return matchesSearch && matchesLowStock && matchesCategory;
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
      <div className="min-h-screen flex flex-col gap-4 items-center justify-center font-black uppercase text-[10px] tracking-widest text-slate-400">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        Syncing Catalog...
      </div>
    );

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              Catalog
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase mt-1 tracking-widest ml-1">
              Global Product Intelligence
            </p>
          </div>
          <div className="flex p-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            {["active", "trash"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  tab === t
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row gap-4 mb-8 items-center">
          <div className="relative flex-1 w-full text-slate-400">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-14 pr-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-slate-700 dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative w-full xl:w-64">
            <LayoutGrid
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <select
              className="w-full pl-14 pr-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm appearance-none cursor-pointer text-slate-700 dark:text-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`px-8 py-4 rounded-3xl flex items-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest min-w-[200px] justify-center ${
              showLowStock
                ? "bg-rose-500 text-white shadow-xl"
                : "bg-slate-50 dark:bg-slate-800 text-slate-500"
            }`}
          >
            <Filter size={16} />{" "}
            {showLowStock ? "Stock < 10" : "Show Low Stock"}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                  <th className="p-8 text-indigo-600/50">Details</th>
                  <th className="p-8">Merchant</th>
                  <th className="p-8">Price</th>
                  <th className="p-8">Stock</th>
                  <th className="p-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-20 text-center">
                      <Package
                        size={48}
                        className="mx-auto text-slate-200 dark:text-slate-700 mb-4"
                      />
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                        No products match your filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((p) => (
                    <tr
                      key={p.id}
                      className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all cursor-pointer"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <img
                            src={getProductImg(p.images?.[0])}
                            className="w-16 h-16 rounded-2xl object-cover shadow-md ring-1 ring-slate-100 dark:ring-slate-800"
                            alt=""
                          />
                          <div>
                            <p className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-tight">
                              {p.name}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              {p.category_name || "General"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 uppercase font-black text-[10px] tracking-widest">
                          <Store size={14} className="text-indigo-500" />{" "}
                          {p.retailer_name}
                        </div>
                      </td>
                      <td className="p-8 font-black text-slate-800 dark:text-white">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="p-8">
                        <span
                          className={`font-black text-xs px-4 py-2 rounded-2xl ${
                            p.stock < 10
                              ? "bg-rose-50 text-rose-500 dark:bg-rose-900/30"
                              : "bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {p.stock} Units
                        </span>
                      </td>
                      <td
                        className="p-8 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end gap-3">
                          {tab === "active" ? (
                            <button
                              onClick={() =>
                                executeAction(
                                  API_ROUTES.ADMIN_PRODUCTS.SOFT_DELETE(p.id),
                                  "DELETE",
                                  {},
                                  "Trash this product?"
                                )
                              }
                              className="group/btn relative p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                            >
                              <Trash2 size={16} />
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                Delete
                              </span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  executeAction(
                                    API_ROUTES.ADMIN_PRODUCTS.RESTORE(p.id),
                                    "PUT",
                                    {},
                                    "Restore product?"
                                  )
                                }
                                className="group/btn relative p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                              >
                                <RefreshCcw size={16} />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                  Restore
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  executeAction(
                                    API_ROUTES.ADMIN_PRODUCTS.PERMANENT_DELETE(p.id),
                                    "DELETE",
                                    {},
                                    "Permanently delete this product forever?"
                                  )
                                }
                                className="group/btn relative p-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl hover:bg-rose-600 dark:hover:bg-rose-600 dark:hover:text-white transition-all"
                              >
                                <Archive size={16} />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                  Perm Delete
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
          </div>

          {/* Pagination */}
          <div className="p-8 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Entries: {filteredData.length}
            </p>
            <div className="flex items-center gap-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 disabled:opacity-20 transition-all hover:scale-110 active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-[10px] font-black text-indigo-600 uppercase">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 disabled:opacity-20 transition-all hover:scale-110 active:scale-95"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL DIALOG */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-md"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95 border border-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-10 pb-6 border-b dark:border-slate-800">
              <h2 className="text-3xl font-black uppercase text-slate-800 dark:text-white tracking-tighter">
                Product Audit
              </h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full hover:rotate-90 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
              <div className="space-y-4">
                <div className="aspect-video rounded-[2.5rem] overflow-hidden border-8 border-slate-50 dark:border-slate-800 shadow-inner">
                  <img
                    src={getProductImg(selectedProduct.images?.[0])}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <div className="flex gap-4 overflow-x-auto py-4">
                  {selectedProduct.images?.map((img, idx) => (
                    <img
                      key={idx}
                      src={getProductImg(img)}
                      className="w-24 h-24 rounded-2xl object-cover flex-shrink-0 border-2 border-slate-100 dark:border-slate-800 shadow-sm"
                      alt=""
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <h3 className="text-4xl font-black text-indigo-600 mb-2 uppercase tracking-tighter leading-none">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium leading-loose mt-4">
                    {selectedProduct.description ||
                      "No technical description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DataBadge
                    label="Net Price"
                    value={formatCurrency(selectedProduct.price)}
                  />
                  <DataBadge
                    label="Stock"
                    value={`${selectedProduct.stock} Units`}
                    color={selectedProduct.stock < 10 ? "text-rose-600" : ""}
                  />
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center gap-6 border border-slate-100 dark:border-slate-700">
                  {selectedProduct.retailer_image ? (
                    <img
                      src={getRetailerImgPath(selectedProduct.retailer_image)}
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-white dark:ring-slate-700 shadow-lg"
                      alt="Merchant"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-black ring-4 ring-white dark:ring-slate-700 uppercase shadow-lg shadow-indigo-500/20">
                      {selectedProduct.retailer_name?.charAt(0) || "M"}
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">
                      Authenticated Merchant
                    </p>
                    <p className="font-black text-slate-800 dark:text-white uppercase">
                      {selectedProduct.retailer_name}
                    </p>
                    <p className="text-[10px] font-bold text-indigo-500 lowercase">
                      {selectedProduct.retailer_email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function DataBadge({ label, value, color }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">
        {label}
      </p>
      <p
        className={`text-sm font-black uppercase ${color || "text-slate-700 dark:text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}