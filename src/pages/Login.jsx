import { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminAPI from "../api/adminAPI";
import { API_ROUTES } from "../utils/apiRoutes";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
} from "@mui/material";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ open: false, message: "" });
  const [form, setForm] = useState({ email: "", password: "" });

  const handleClose = () => setError({ open: false, message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await adminAPI.post(API_ROUTES.AUTH.LOGIN, form);

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      // Role authorization check
      if (data.data.user.role !== "ADMIN") {
        setError({
          open: true,
          message: "Access Denied: You are not an Admin.",
        });
        return;
      }

      // Store tokens and user data
      localStorage.setItem("adminToken", data.data.token);
      localStorage.setItem("adminRefreshToken", data.data.refresh_token);
      localStorage.setItem("adminData", JSON.stringify(data.data.user));

      navigate("/dashboard");
    } catch (err) {
      console.error("Login Error:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Server unreachable. Check if your backend is running on port 5000.";
      setError({ open: true, message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-lg w-96">
        <Typography
          variant="h5"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          VaruShop Admin
        </Typography>

        <form onSubmit={handleSubmit} className="mt-4">
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            required
            disabled={loading}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            required
            disabled={loading}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, py: 1.5, textTransform: "none" }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
        </form>
      </div>

      <Dialog open={error.open} onClose={handleClose}>
        <DialogTitle sx={{ color: "error.main" }}>Connection Error</DialogTitle>
        <DialogContent>
          <Typography>{error.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
