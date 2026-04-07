import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Shield, Key, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const SecuritySettings = () => {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verifyCode, setVerifyCode] = useState('');

  useEffect(() => {
    fetch2FAStatus();
  }, []);

  const fetch2FAStatus = async () => {
    try {
      const response = await authAPI.get2FAStatus();
      setTwoFactorEnabled(response.data.twoFactorEnabled);
    } catch (error) {
      console.error('Error fetching 2FA status:', error);
    }
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      const response = await authAPI.enable2FA();
      setSecret(response.data.secret);
      setQrCodeUrl(response.data.qrCodeUrl);
      setShowSetup(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enable 2FA');
    }
    setLoading(false);
  };

  const handleVerifyAndEnable = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await authAPI.confirm2FA(verifyCode);
      toast.success('2FA enabled successfully!');
      setTwoFactorEnabled(true);
      setShowSetup(false);
      setVerifyCode('');
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid code');
    }
    setLoading(false);
  };

  const handleDisable2FA = async () => {
    const code = prompt('Enter your 2FA code to disable:');
    if (!code) return;
    
    setLoading(true);
    try {
      await authAPI.disable2FA(code);
      toast.success('2FA disabled successfully!');
      setTwoFactorEnabled(false);
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid code');
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-3">
          <Shield className="text-purple-600" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Security Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your account security</p>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Key className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
              </div>
            </div>
            {twoFactorEnabled ? (
              <span className="flex items-center text-green-600 text-sm font-medium">
                <CheckCircle size={16} className="mr-1" /> Enabled
              </span>
            ) : (
              <span className="flex items-center text-orange-600 text-sm font-medium">
                <AlertTriangle size={16} className="mr-1" /> Not Enabled
              </span>
            )}
          </div>

          {!showSetup ? (
            <div className="pt-4 border-t">
              {twoFactorEnabled ? (
                <button
                  onClick={handleDisable2FA}
                  disabled={loading}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  onClick={handleEnable2FA}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Enable 2FA
                </button>
              )}
            </div>
          ) : (
            <div className="pt-4 border-t space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Scan this QR code with your authenticator app</p>
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-lg" />
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Or enter this code manually:</p>
                <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded text-center font-mono">{secret}</code>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Enter verification code
                </label>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-2 border-2 border-gray-100 dark:border-gray-700 rounded-lg text-center text-lg font-mono tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSetup(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyAndEnable}
                  disabled={loading || verifyCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Verify & Enable
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Session Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Clock className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Session Information</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your current session details</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Status</span>
              <span className="text-green-600 font-medium flex items-center">
                <CheckCircle size={16} className="mr-1" /> Active
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Role</span>
              <span className="text-gray-800 dark:text-white capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">2FA</span>
              <span className={twoFactorEnabled ? 'text-green-600' : 'text-orange-600'}>
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Tips */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Security Tips</h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• Use a strong, unique password</li>
            <li>• Enable two-factor authentication</li>
            <li>• Never share your login credentials</li>
            <li>• Log out when using shared devices</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default SecuritySettings;