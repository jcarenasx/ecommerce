import LoginForm from "./components/LoginForm";
import Navbar from "./components/Navbar";
import AdminLayout from "./layouts/AdminLayout";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import Home from "./pages/Home";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

function AdminRoute() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

function LoginRoute() {
  return <LoginForm />;
}

function App() {
  const { isLoading } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {!isAdminRoute && <Navbar />}
      {isLoading ? (
        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-10">
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            Revisando sesion...
          </p>
        </main>
      ) : (
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
