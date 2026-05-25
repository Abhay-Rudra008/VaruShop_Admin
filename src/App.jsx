import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Retailers from "./pages/Retailers";
import Reviews from "./pages/Reviews";
import Payment from "./pages/Payment";
import Categories from "./pages/Categories";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Toaster position="top-right" />

      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<Navigate to="/dashboard" />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="payments" element={<Payment />} />
            <Route path="products" element={<Products />} />
            <Route path="retailers" element={<Retailers />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="categories" element={<Categories />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
