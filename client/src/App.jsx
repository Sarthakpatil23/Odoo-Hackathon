import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import OrganizationSetup from './pages/OrganizationSetup';
import Allocations from './pages/Allocations';
import Assets from './pages/Assets';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import { ProtectedRoute, RoleProtectedRoute } from './components/ProtectedRoute';

// Standard Under-Construction Placeholder for other operations
const Placeholder = ({ name }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-[480px] mx-auto select-none">
    <div className="text-sm font-medium text-foreground mb-1">{name}</div>
    <div className="text-xs text-muted-foreground-2">This module is under active development. Keep scanning other sections.</div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Landing />} />

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
            <Route path="/allocations" element={<Allocations />} />
            <Route path="/bookings" element={<Placeholder name="Resource Booking" />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/audits" element={<Placeholder name="Audit Cycle Verification" />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Placeholder name="Activity Logs & Notifications" />} />
          </Route>
        </Route>

        {/* Fallback to Dashboard (will auto-redirect to Login if unauthenticated) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
