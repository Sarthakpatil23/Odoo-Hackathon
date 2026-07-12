import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Landing />} />

        {/* All other routes will be added here as pages are rebuilt */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}
