// Placeholder — organization setup is restricted to Admin role only.
// Role enforcement is done at the router level via RoleProtectedRoute.
export default function Organization() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Organization Setup</h1>
      <p className="text-slate-400">Department, user management, and org configuration will appear here.</p>
    </div>
  );
}
