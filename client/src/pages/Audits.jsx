// Placeholder — audit cycles restricted to Admin and AssetManager roles.
// Role enforcement is done at the router level via RoleProtectedRoute.
// Page-level content will differ by role later.
export default function Audits() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-100 mb-2">Audit Cycles</h1>
      <p className="text-slate-400">Audit cycle management and tracking will appear here.</p>
    </div>
  );
}
