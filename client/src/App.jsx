import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [status, setStatus] = useState('Checking...');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${apiUrl}/health`);
      setStatus(response.data.status || 'ok');
    } catch (err) {
      setError(err.message || 'Failed to connect to the server');
      setStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center">
          {/* Logo / Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-200">
            AssetFlow
          </h1>
          <p className="text-slate-400 text-sm mt-1 mb-8">System Integration Skeleton</p>

          {/* Connection Card */}
          <div className="w-full bg-slate-950/50 rounded-xl p-6 border border-slate-800/80 mb-6 flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">
              API Connection Status
            </span>

            {loading ? (
              <div className="flex flex-col items-center">
                {/* Loader animation */}
                <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-3"></div>
                <span className="text-slate-300 font-medium">Connecting to backend...</span>
              </div>
            ) : error ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 text-red-500 mb-3 border border-red-500/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="text-red-400 font-semibold mb-1">Connection Failed</div>
                <div className="text-slate-500 text-xs max-w-xs break-all mb-4">{error}</div>
                <button
                  onClick={checkHealth}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-all border border-slate-700 hover:border-slate-600 active:scale-95 animate-pulse"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <div className="text-center flex flex-col items-center">
                <div className="relative mb-3">
                  {/* Pulsing indicator */}
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="absolute top-0 right-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="text-emerald-400 font-semibold text-lg mb-1">Successfully Connected!</div>
                <div className="text-slate-400 text-sm">
                  Backend responded with status: <code className="bg-slate-800 px-2 py-0.5 rounded text-violet-300 font-mono">"{status}"</code>
                </div>
              </div>
            )}
          </div>

          {/* Integration Checklist */}
          <div className="w-full space-y-3 text-sm">
            <div className="flex items-center text-slate-400 bg-slate-950/20 rounded-lg p-3 border border-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mr-3 text-xs">✓</span>
              <span>Vite + React Client Scaffolded</span>
            </div>
            <div className="flex items-center text-slate-400 bg-slate-950/20 rounded-lg p-3 border border-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mr-3 text-xs">✓</span>
              <span>Express server + CORS configured</span>
            </div>
            <div className="flex items-center text-slate-400 bg-slate-950/20 rounded-lg p-3 border border-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mr-3 text-xs">✓</span>
              <span>Tailwind CSS v3 configured</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer info */}
      <div className="mt-8 text-xs text-slate-600 flex items-center gap-4 relative z-10">
        <span>Vite: {import.meta.env.DEV ? 'Development' : 'Production'}</span>
        <span>•</span>
        <span>API: {import.meta.env.VITE_API_URL}</span>
      </div>
    </div>
  );
}

export default App;
