import { useState, useMemo } from "react";
import { BACKEND_URL } from "../api/adminAPI";
import { API_ROUTES } from "../utils/apiRoutes";
import useAdminTable from "../hooks/useAdminTable";
import Layout from "../components/layout/Layout";
import {
  Search,
  Star,
  Trash2,
  AlertCircle,
  X,
  MessageSquare,
  Package,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Reviews() {
  // 1. Replaced manual fetch/state with useAdminTable
  const { data: reviews = [], loading, executeAction } = useAdminTable(
    API_ROUTES.ADMIN_REVIEWS.GET_ALL
  );

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // 2. Updated handleDelete to use the hook's executeAction
  const handleDelete = async () => {
    // executeAction automatically handles the API call, error alerts, and silent table refresh!
    const success = await executeAction(
      API_ROUTES.ADMIN_REVIEWS.DELETE(reviewToDelete),
      "DELETE"
    );

    if (success) {
      toast.success("Review purged");
      setShowDeleteModal(false);
      setReviewToDelete(null);
    }
  };

  const filteredReviews = useMemo(() => {
    return reviews
      .filter(
        (r) =>
          r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
          r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
          r.comment?.toLowerCase().includes(search.toLowerCase()),
      )
      .filter((r) => (ratingFilter ? r.rating === Number(ratingFilter) : true))
      .sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [reviews, search, ratingFilter, sortOrder]);

  const getImg = (path) =>
    path ? (path.startsWith("http") ? path : `${BACKEND_URL}/${path}`) : null;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-black uppercase text-[10px] tracking-widest animate-pulse text-slate-400">
        Analyzing Feedback...
      </div>
    );

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              Reviews
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase mt-1 tracking-widest">
              Public Feedback Audit
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="text-right border-r border-slate-100 dark:border-slate-800 pr-4">
              <p className="text-[10px] font-black text-slate-400 uppercase">
                Total Entries
              </p>
              <p className="text-xl font-black text-indigo-600 leading-none">
                {reviews.length}
              </p>
            </div>
            <div className="flex text-amber-500 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" />
              ))}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 mb-8 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search user, product or content..."
              className="w-full pl-14 pr-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm outline-none cursor-pointer"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map((num) => (
              <option key={num} value={num}>
                {num} Stars
              </option>
            ))}
          </select>

          <select
            className="px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm outline-none cursor-pointer"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Reviews Feed */}
        <div className="grid grid-cols-1 gap-6">
          {filteredReviews.length === 0 ? (
            <div className="py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
              <MessageSquare
                size={48}
                className="mx-auto text-slate-200 mb-4"
              />
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">
                No feedback matches your criteria
              </p>
            </div>
          ) : (
            filteredReviews.map((r) => (
              <div
                key={r.id}
                className="group bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-10 transition-all hover:shadow-2xl"
              >
                {/* Product Section */}
                <div className="lg:w-48 shrink-0">
                  <div className="relative mb-4">
                    <img
                      src={
                        getImg(r.product_image) ||
                        "https://img.magnific.com/free-vector/illustration-gallery-icon_53876-27002.jpg?semt=ais_hybrid&w=740&q=80"
                      }
                      className="w-full aspect-square rounded-[2rem] object-cover ring-8 ring-slate-50 dark:ring-slate-800/50"
                      alt="Product"
                    />
                    <div className="absolute -bottom-3 -right-3 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl flex items-center gap-1.5 border border-slate-100 dark:border-slate-700">
                      <span className="text-xs font-black">{r.rating}</span>
                      <Star
                        size={12}
                        className="text-amber-500"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                  <p className="font-black text-slate-800 dark:text-white uppercase text-[10px] tracking-tight text-center truncate">
                    {r.product_name}
                  </p>
                </div>

                {/* Content Section */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* DYNAMIC AVATAR LOGIC */}
                      {r.user_image ? (
                        <img
                          src={getImg(r.user_image)}
                          className="w-12 h-12 rounded-2xl object-cover ring-4 ring-slate-50 dark:ring-slate-800"
                          alt=""
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg ring-4 ring-slate-50 dark:ring-slate-800 uppercase">
                          {r.user_name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-black text-slate-800 dark:text-white uppercase text-sm">
                          {r.user_name}
                        </p>
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                          <Calendar size={12} />{" "}
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setReviewToDelete(r.id);
                        setShowDeleteModal(true);
                      }}
                      className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="relative bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 italic text-slate-600 dark:text-slate-300 leading-loose">
                    <span className="absolute -top-4 -left-2 text-6xl text-slate-200 dark:text-slate-700 font-serif opacity-50">
                      “
                    </span>
                    {r.comment}
                    {r.review_image && (
                      <div className="mt-6 flex gap-2">
                        <img
                          src={getImg(r.review_image)}
                          className="h-32 rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg"
                          alt="User upload"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 border border-white/10">
            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-[2rem] flex items-center justify-center text-rose-600 mb-8 mx-auto">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-3xl font-black text-center uppercase tracking-tighter mb-2">
              Purge Feedback
            </h2>
            <p className="text-slate-500 text-center text-sm font-medium mb-10 leading-relaxed">
              This action will permanently remove this customer's feedback from
              the public catalog.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest bg-rose-600 text-white shadow-xl shadow-rose-500/20 active:scale-95 transition-all"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}