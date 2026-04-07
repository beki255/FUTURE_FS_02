import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, Eye, EyeOff, Check, Image, Upload, X } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photo, setPhoto] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Photo must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        setPhotoFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto('');
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    const result = await register(username, email, password, photo);
    setLoading(false);
    if (result === 'pending') {
      setSuccessMessage('Registration successful! Your account is pending approval. Please contact admin.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else if (result === true) {
      navigate('/dashboard');
    } else if (result === false) {
      setError('Registration failed. Please try again.');
    }
  };

  const [successMessage, setSuccessMessage] = useState('');

  const passwordRequirements = [
    { met: password.length >= 8, text: '8+ chars' },
    { met: /[A-Z]/.test(password), text: 'Uppercase' },
    { met: /[0-9]/.test(password), text: 'Number' },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Large Image (60%) - Desktop only */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Analytics Dashboard"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/85 via-teal-900/60 to-transparent"></div>
        
        {/* Decorative blur elements */}
        <div className="absolute top-20 right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <span className="text-xl font-bold text-white">M</span>
            </div>
            <span className="text-2xl font-bold text-white">Mini CRM</span>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl xl:text-6xl font-bold text-white leading-tight">
                Start Managing<br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Your Leads
                </span>
              </h1>
              <p className="text-lg text-gray-200 max-w-lg leading-relaxed">
                Join thousands of teams who trust Mini CRM to manage their leads.
              </p>
            </div>
            
            <div className="space-y-3 pt-6 border-t border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-base text-gray-200">Unlimited lead management</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-base text-gray-200">Real-time analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-base text-gray-200">Secure cloud storage</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            © 2026 Mini CRM. Trusted by businesses worldwide.
          </div>
        </div>
      </div>

      {/* Right Side - Register Form - Full width on mobile */}
      <div className="w-full lg:w-[40%] min-h-screen flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 overflow-y-auto">
        {/* Outer circular container with border */}
        <div className="w-full max-w-sm sm:max-w-md flex flex-col justify-center py-4">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-white">M</span>
            </div>
            <span className="text-xl font-bold text-white">Mini CRM</span>
          </div>

          {/* Outer circular border container */}
          <div className="border-4 border-white/30 rounded-[3rem] p-2 sm:p-3">
            {/* Inner transparent glassmorphism form */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] shadow-2xl p-4 sm:p-5">
              <div className="text-center mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Create account</h2>
                <p className="text-xs sm:text-sm text-white/70 mt-1">Start your free trial</p>
              </div>

              {error && (
                <div className="mb-3 p-2 sm:p-3 bg-red-500/20 border border-red-500/30 rounded-full">
                  <p className="text-xs sm:text-sm text-red-100 text-center font-medium">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-3 p-2 sm:p-3 bg-green-500/20 border border-green-500/30 rounded-full">
                  <p className="text-xs sm:text-sm text-green-100 text-center font-medium">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-semibold text-white/90">
                    Profile Photo (optional)
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {photo ? (
                        <div className="relative">
                          <img src={photo} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-white/30" />
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
                        >
                          <Image className="h-8 w-8 text-white/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white/80 text-sm hover:bg-white/20 transition-colors"
                      >
                        <Upload size={16} />
                        <span>Choose File</span>
                      </button>
                      <p className="text-xs text-white/50 mt-1">Max 2MB, JPG/PNG</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-semibold text-white/90">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <User className="h-4 w-4 text-white/50 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 sm:pl-11 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all duration-300 text-sm backdrop-blur-sm"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-semibold text-white/90">
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Mail className="h-4 w-4 text-white/50 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 sm:pl-11 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all duration-300 text-sm backdrop-blur-sm"
                      placeholder="john@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-semibold text-white/90">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Lock className="h-4 w-4 text-white/50 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 sm:pl-11 pr-9 sm:pr-10 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all duration-300 text-sm backdrop-blur-sm"
                      placeholder="••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {password.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-1">
                          <div className={`w-3 h-3 rounded-full flex items-center justify-center ${req.met ? 'bg-white' : 'bg-white/20'}`}>
                            {req.met && <Check className="h-2 w-2 text-emerald-600" />}
                          </div>
                          <span className={`text-[10px] ${req.met ? 'text-white' : 'text-white/50'}`}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-semibold text-white/90">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Lock className="h-4 w-4 text-white/50 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 sm:pl-11 pr-9 sm:pr-10 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all duration-300 text-sm backdrop-blur-sm"
                      placeholder="••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-2.5 sm:py-3 bg-white text-emerald-600 font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                >
                  {loading ? (
                    <svg className="animate-spin h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <UserPlus className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-3 sm:mt-4 pt-3 border-t border-white/20">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <Link to="/" className="text-white/70 hover:text-white text-sm flex items-center">
                    ← Back to Contact
                  </Link>
                  <p className="text-white/70 text-xs sm:text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-white font-bold hover:underline transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-white/50 text-xs mt-3">
            © 2026 Mini CRM
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
