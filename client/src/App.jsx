import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import AppLayout from './layouts/AppLayout';
import { ProtectedRoute, RoleProtectedRoute } from './components/ProtectedRoute';
import OrganizationSetup from './pages/OrganizationSetup';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Landing />} />

        {/* Protected app shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Admin-only: Organization Setup */}
            <Route element={<RoleProtectedRoute allowedRoles={['Admin']} />}>
              <Route path="/organization" element={<OrganizationSetup />} />
            </Route>
          </Route>
        </Route>

        {/* All other routes will be added here as pages are rebuilt */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}
