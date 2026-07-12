import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/shared/Card';
import { Button } from '../components/ui/button';
import { Logo } from '../components/shared/Logo';
import api from '../api/axios';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/signup', { name, email, password });
      const { token, user } = res.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-white/10 selection:text-foreground relative overflow-hidden font-sans">
      {/* Subtle radial white glow behind the content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* Top marketing nav */}
      <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-border bg-black/50 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Logo className="h-5 w-5" />
          <span className="font-medium text-sm tracking-tight text-foreground">AssetFlow</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors">Features</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Pricing</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Docs</span>
        </div>
        <div>
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main signup form card */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10">
        <div className="w-full max-w-[440px] space-y-8">
          {/* Hero text */}
          <div className="text-center space-y-2">
            <div className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
              START MANAGING ASSETS
            </div>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-foreground">
              Create your account
            </h1>
          </div>

          {/* Registration Card */}
          <Card className="bg-card/40 backdrop-blur-md p-6 border border-border rounded-lg space-y-6">
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-border focus:border-border-strong focus:ring-1 focus:ring-white/10 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground-2 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-border focus:border-border-strong focus:ring-1 focus:ring-white/10 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground-2 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="password">
                  Password (6+ characters)
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-border focus:border-border-strong focus:ring-1 focus:ring-white/10 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground-2 outline-none transition-all"
                  required
                />
              </div>

              {error && <p className="text-xs text-danger">{error}</p>}

              <Button type="submit" variant="default" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-foreground hover:underline">
                Sign in
              </Link>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-5 text-center text-xs text-muted-foreground-2 border-t border-border bg-black/30 z-10 shrink-0">
        © {new Date().getFullYear()} AssetFlow Inc. All rights reserved.
      </footer>
    </div>
  );
}
