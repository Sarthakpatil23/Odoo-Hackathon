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

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCtaClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* 1. Hero Section (Includes Logo/Trust Bar internally) */}
      <Hero
        brandName="AssetFlow"
        headlinePreAccent="Turn asset chaos into"
        headlineAccent="structured flow"
        subheading="Digitize how your organization tracks, allocates, and maintains physical equipment, shared spaces, and team resources in a single centralized platform."
        ctaText={user ? "Go to Dashboard" : "Get started"}
        onCtaClick={handleCtaClick}
        onNavGetStartedClick={handleCtaClick}
        onLogoClick={() => navigate('/')}
      />

      {/* 2. Features Section */}
      <Features />

      {/* 3. Asset Lifecycle Section */}
      <AssetLifecycle />

      {/* 4. Resource Bookings Section */}
      <ResourceBookings />

      {/* 5. Maintenance Section */}
      <Maintenance />

      {/* 6. Testimonials Section */}
      <Testimonials />

      {/* 7. Stats Band */}
      <StatsBand />

      {/* 8. Final CTA Section */}
      <FinalCTA onCtaClick={handleCtaClick} />

      {/* 9. Footer */}
      <Footer onLogoClick={() => navigate('/')} />
    </div>
  );
}
