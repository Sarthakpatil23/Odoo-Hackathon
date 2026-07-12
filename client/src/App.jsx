import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
<<<<<<< HEAD
import Maintenance from './pages/Maintenance';
=======
import Login from './pages/Login';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import OrganizationSetup from './pages/OrganizationSetup';
import { ProtectedRoute, RoleProtectedRoute } from './components/ProtectedRoute';
import Assets from './pages/Assets';

// Standard Under-Construction Placeholder for other operations
const Placeholder = ({ name }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-[480px] mx-auto select-none">
    <div className="text-sm font-medium text-foreground mb-1">{name}</div>
    <div className="text-xs text-muted-foreground-2">This module is under active development. Keep scanning other sections.</div>
  </div>
);
>>>>>>> df78c75a55f9b963f0b8815f7f473203cb774c04

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Landing />} />

<<<<<<< HEAD
        {/* Maintenance Management — Kanban board (Screen 7) */}
        <Route path="/maintenance" element={<Maintenance />} />

        {/* All other routes will be added here as pages are rebuilt */}
        <Route path="*" element={<Landing />} />
=======
        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard & Operations */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin-only: Organization Setup */}
            <Route element={<RoleProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/organization" element={<OrganizationSetup />} />
            </Route>

            <Route path="/assets" element={<Assets />} />
            <Route path="/allocations" element={<Placeholder name="Allocation & Transfer" />} />
            <Route path="/bookings" element={<Placeholder name="Resource Booking" />} />
            <Route path="/maintenance" element={<Placeholder name="Maintenance Tickets" />} />
            <Route path="/audits" element={<Placeholder name="Audit Cycle Verification" />} />
            <Route path="/reports" element={<Placeholder name="Reports & Analytics" />} />
            <Route path="/notifications" element={<Placeholder name="Activity Logs & Notifications" />} />
          </Route>
        </Route>

        {/* Fallback to Dashboard (will auto-redirect to Login if unauthenticated) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
>>>>>>> df78c75a55f9b963f0b8815f7f473203cb774c04
      </Routes>
    </BrowserRouter>
  );
}
