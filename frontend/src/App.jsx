import { useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Navbar from "./components/navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { attachUser } from "./lib/store";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import About from "./pages/About";
import Interviews from "./pages/Interviews";
import NewSession from "./pages/NewSession";
import Session from "./pages/Session";
import Report from "./pages/Report";

// Shared shell for authenticated pages: navbar + syncs the tracker store to the user.
function Layout() {
  const { user } = useAuth();
  useEffect(() => { attachUser(user); }, [user]);
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/about" element={<About />} />
        <Route path="/interviews" element={<Interviews />} />
        <Route path="/interviews/new" element={<NewSession />} />
        <Route path="/interviews/:id" element={<Session />} />
        <Route path="/interviews/:id/report" element={<Report />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}