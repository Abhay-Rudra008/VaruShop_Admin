
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
  },
  ADMIN_DASHBOARD: {
    REVENUE: "/admin/finance/revenue-report",
  },
  ADMIN_USERS: {
    GET_ACTIVE: "/admin/users",
    GET_TRASH: "/admin/users/trash",
    BLOCK: (id) => `/admin/users/block/${id}`,
    SOFT_DELETE: (id) => `/admin/users/soft/${id}`,
    RESTORE: (id) => `/admin/users/restore/${id}`,
    PERMANENT_DELETE: (id) => `/admin/users/permanent/${id}`, 
  },
  ADMIN_CATEGORIES: {
    GET_ALL: "/admin/categories",
    CREATE: "/admin/categories",
    UPDATE: (id) => `/admin/categories/${id}`,
    DELETE: (id) => `/admin/categories/${id}`,
  },
  ADMIN_PRODUCTS: {
    GET_ACTIVE: "/admin/products", 
    GET_TRASH: "/admin/products/trash",
    SOFT_DELETE: (id) => `/admin/products/soft/${id}`,
    RESTORE: (id) => `/admin/products/restore/${id}`,
    PERMANENT_DELETE: (id) => `/admin/products/permanent/${id}`,
  },
  ADMIN_RETAILERS: {
    GET_ACTIVE: "/admin/retailers", 
    GET_TRASH: "/admin/retailers/trash",
    APPROVE: (id) => `/admin/retailers/approve/${id}`,
    BLOCK: (id) => `/admin/retailers/block/${id}`,
    SOFT_DELETE: (id) => `/admin/retailers/soft/${id}`,
    RESTORE: (id) => `/admin/retailers/restore/${id}`,
    PERMANENT_DELETE: (id) => `/admin/retailers/permanent/${id}`,
  },
  ADMIN_REVIEWS: {
    GET_ALL: "/admin/reviews", 
    DELETE: (id) => `/admin/reviews/${id}`,
  },
  ADMIN_PAYOUTS: {
    GET_ALL: "/admin/payouts", 
    SETTLE: (id) => `/admin/payouts/settle/${id}`, 
  },
};