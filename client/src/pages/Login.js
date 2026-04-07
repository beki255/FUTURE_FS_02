import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Mail, Lock, LogIn, Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (requiresTwoFactor) {
      try {
        const response = await authAPI.verify2FA(email, password, twoFactorCode);
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          toast.success('Login successful!');
          navigate('/dashboard');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Invalid 2FA code');
      }
      setLoading(false);
      return;
    }
    
    const success = await login(email, password);
    setLoading(false);
    
    if (success === 'requires2fa') {
      setRequiresTwoFactor(true);
    } else if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Large Image (60%) - Desktop only */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="CRM Dashboard"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/85 via-purple-900/60 to-transparent"></div>
        
        {/* Decorative blur elements */}
        <div className="absolute top-20 left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/40">
              <span className="text-xl font-bold text-white">M</span>
            </div>
            <span className="text-2xl font-bold text-white">Mini CRM</span>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl xl:text-6xl font-bold text-white leading-tight">
                Manage Your<br />
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Leads
                </span><br />
                Effectively
              </h1>
              <p className="text-lg text-gray-200 max-w-lg leading-relaxed">
                The complete solution for tracking leads and managing your sales pipeline.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-8 pt-6 border-t border-white/20">
              <div className="space-y-1">
                <div className="text-4xl xl:text-5xl font-bold text-white">500+</div>
                <div className="text-sm text-gray-300">Active Teams</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl xl:text-5xl font-bold text-white">15k+</div>
                <div className="text-sm text-gray-300">Leads Tracked</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl xl:text-5xl font-bold text-white">98%</div>
                <div className="text-sm text-gray-300">Success Rate</div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            © 2026 Mini CRM. Empowering businesses worldwide.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (40%) - Full width on mobile */}
      <div className="w-full lg:w-[40%] min-h-screen flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-y-auto">
        {/* Outer circular container with border */}
        <div className="w-full max-w-sm sm:max-w-md flex flex-col justify-center py-4">
          {/* Mobile Logo - Show on mobile */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">M</span>
            </div>
            <span className="text-xl font-bold text-white">Mini CRM</span>
          </div>

          {/* Outer circular border container */}
          <div className="border-4 border-white/30 rounded-[3rem] p-2 sm:p-3">
            {/* Inner transparent glassmorphism form */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] shadow-2xl p-5 sm:p-7">
              <div className="text-center mb-5 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {requiresTwoFactor ? 'Two-Factor Auth' : 'Welcome back'}
                </h2>
                <p className="text-sm text-white/70 mt-1">
                  {requiresTwoFactor ? 'Enter your authentication code' : 'Sign in to access your dashboard'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {!requiresTwoFactor ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-white/90">
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-white/50 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 sm:pl-12 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all duration-300 text-sm sm:text-base backdrop-blur-sm"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-white/90">
                          Password
                        </label>
                        <Link to="/forgot-password" className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors">
                          Forgot?
                        </Link>
                      </div>
                      <div className="relative group">
                        <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-white/50 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all duration-300 text-sm sm:text-base backdrop-blur-sm"
                          placeholder="••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setRememberMe(!rememberMe)}
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-all ${
                          rememberMe 
                            ? 'bg-white' 
                            : 'bg-white/10 border border-white/30 hover:border-white/50'
                        }`}
                      >
                        {rememberMe && (
                          <svg className="w-2 h-2 sm:w-3 sm:h-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-white/70">Remember me</span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-white/90">
                      Authentication Code
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white/50 group-focus-within:text-white transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full pl-10 sm:pl-12 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all duration-300 text-sm sm:text-base backdrop-blur-sm text-center tracking-widest font-mono"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>
                    <p className="text-xs text-white/60 text-center">Enter 6-digit code from your authenticator app</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3 sm:py-4 bg-white text-indigo-600 font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <span>{requiresTwoFactor ? 'Verify' : 'Sign In'}</span>
                      <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 sm:mt-6 pt-4 border-t border-white/20">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <Link to="/" className="text-white/70 hover:text-white text-sm flex items-center">
                    ← Back to Contact
                  </Link>
                  <p className="text-white/70 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-white font-bold hover:underline transition-colors">
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-white/50 text-xs sm:text-sm mt-4">
            © 2026 Mini CRM
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
