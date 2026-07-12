import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Maintenance from './pages/Maintenance';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Landing />} />

        {/* Maintenance Management — Kanban board (Screen 7) */}
        <Route path="/maintenance" element={<Maintenance />} />

        {/* All other routes will be added here as pages are rebuilt */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}
