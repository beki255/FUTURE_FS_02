import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Mail, ArrowLeft, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('email'); // email, reset

  const handleSendToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.forgotPassword(email);
      setResetToken(response.data.resetToken);
      setStep('reset');
      toast.success('Reset token generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate token');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(resetToken, newPassword);
      toast.success('Password reset successful! Please login.');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {step === 'email' ? 'Forgot Password?' : 'Reset Password'}
            </h2>
            <p className="text-white/70 text-sm mt-2">
              {step === 'email' 
                ? 'Enter your email to get a reset token' 
                : 'Enter your new password'}
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendToken} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-white/90">Email Address</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-70"
              >
                {loading ? 'Sending...' : 'Send Reset Token'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-white/90">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40"
                  placeholder="New password"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-white/90">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full mt-1 py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/20 focus:border-white/40"
                  placeholder="Confirm password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-70"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-white/70 hover:text-white text-sm flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;