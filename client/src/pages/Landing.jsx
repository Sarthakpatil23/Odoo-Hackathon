import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/Hero';
import Features from '../components/Features';
import AssetLifecycle from '../components/AssetLifecycle';
import ResourceBookings from '../components/ResourceBookings';
import Maintenance from '../components/Maintenance';
import Testimonials from '../components/Testimonials';
import StatsBand from '../components/StatsBand';
import FinalCTA from '../components/FinalCTA';
import Footer from '../components/Footer';

/**
 * Landing Page
 *
 * Background sequence per design.md:
 * 1. Hero          — min-h-screen, full-bleed background image (bg-slate-950 fallback)
 * 2. Features      — bg-white
 * 3. AssetLifecycle — bg-sky-50/40
 * 4. ResourceBookings — bg-white
 * 5. Maintenance   — bg-sky-50/40
 * 6. Testimonials  — bg-sky-50/80
 * 7. StatsBand     — bg-slate-900
 * 8. FinalCTA      — bg-white
 * 9. Footer        — bg-slate-950
 *
 * The landing page deliberately does NOT inherit the dark theme.
 * font-sans and selection colour set here for the full page.
 */
export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCtaClick = () => {
    navigate('/dashboard');
  };

  return (
    /* Light base — sections control their own alternating backgrounds */
    <div className="min-h-screen font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* 1. Hero Section (includes nav internally) */}
      <Hero
        brandName="AssetFlow"
        headlinePreAccent="Turn asset chaos into"
        headlineAccent="structured flow"
        subheading="Digitize how your organization tracks, allocates, and maintains physical equipment, shared spaces, and team resources in a single centralized platform."
        ctaText={user ? 'Go to Dashboard' : 'Get started'}
        onCtaClick={handleCtaClick}
        onNavGetStartedClick={handleCtaClick}
        onLogoClick={() => navigate('/')}
      />

      {/* 2. Features — bg-white */}
      <Features />

      {/* 3. Asset Lifecycle — bg-sky-50/40 */}
      <AssetLifecycle />

      {/* 4. Resource Bookings — bg-white */}
      <ResourceBookings />

      {/* 5. Maintenance — bg-sky-50/40 */}
      <Maintenance />

      {/* 6. Testimonials — bg-sky-50/80 */}
      <Testimonials />

      {/* 7. Stats Band — bg-slate-900 */}
      <StatsBand />

      {/* 8. Final CTA — bg-white */}
      <FinalCTA onCtaClick={handleCtaClick} />

      {/* 9. Footer — bg-slate-950 */}
      <Footer onLogoClick={() => navigate('/')} />
    </div>
  );
}
