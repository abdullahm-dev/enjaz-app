import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MyProjects from './pages/MyProjects';
import ProjectDetail from './pages/ProjectDetail';
import Invoices from './pages/Invoices';
import FAQ from './pages/FAQ';
import OrderFlow from './pages/OrderFlow';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import { AppProvider, useAppContext } from './context';

const ProtectedRoute: React.FC<{ children: React.ReactNode, role?: 'client' | 'admin' }> = ({ children, role }) => {
  const { user } = useAppContext();
  
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="projects" element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />
            <Route path="projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
            <Route path="invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
            <Route path="order/:packageId" element={<ProtectedRoute><OrderFlow /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
